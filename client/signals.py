from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.reverse import reverse_lazy

from api import models

import redis
import json

from api.models import BubbleSortSwap, GameOfLifeCell, Interaction, GameOfLife

r = redis.StrictRedis(host='localhost', port=6379, db=0)

# TODO make the client publishing more intelligent

@receiver(post_save, sender=BubbleSortSwap, dispatch_uid="client:BubbleSortSwap#post_save")
def new_bubble_sort_swap(sender, instance, **kwargs):
    class_name = instance.bubble_sort.interaction.clicker_class.class_name
    channel = 'bubblesort.{}.client'.format(class_name)
    url = reverse_lazy('bubblesort-detail', args=[instance.bubble_sort_id])

    print "Publishing to redis:{}".format(channel)
    r.publish(channel, json.dumps({
        'lower_index': instance.lower_index,
        'bubble_sort': str(url),
        'event_type': 'swap'
    }))

@receiver(post_save, sender=GameOfLife, dispatch_uid="client:GameOfLife#post_save")
def save_game_of_life(sender, instance, **kwargs):

    if instance.is_async:
        return

    if instance.is_buffer:
        return

    class_name = instance.interaction.clicker_class.class_name
    channel = 'gameoflife.{}.client'.format(class_name)
    url = reverse_lazy('gameoflife-detail', args=[instance.id])

    print "Publishing to redis:{}".format(channel)
    r.publish(channel, json.dumps({
        'game_of_life': str(url),
        'event_type': 'next_state',
        # 'serialized': unicode(instance)
    }))

@receiver(post_save, sender=GameOfLifeCell, dispatch_uid="client:GameOfLifeCell#post_save")
def save_game_of_life_cell(sender, instance, **kwargs):
    if instance.game_of_life.is_buffer:
        return

    if instance.game_of_life.interaction.state != Interaction.ACTIVE:
        return

    if not instance.changed:
        return

    class_name = instance.game_of_life.interaction.clicker_class.class_name
    channel = '{}gameoflife.{}.client'.format('async' if instance.game_of_life.is_async else '', class_name)
    url = reverse_lazy('gameoflife-detail', args=[instance.game_of_life_id])

    print "Publishing to redis:{}".format(channel)
    r.publish(channel, json.dumps({
        'row': instance.row,
        'col': instance.col,
        'alive': instance.alive,
        'game_of_life': str(url),
        'event_type': 'toggle_cell'
    }))

@receiver(post_save, sender=Interaction, dispatch_uid="client:Interaction#post_save")
def save_interaction(sender, instance, created, **kwargs):
    # the first save is ignored
    if created:
        return

    if instance.state != Interaction.ACTIVE:
        return

    class_name = instance.clicker_class.class_name
    channel = '{}.client'.format(class_name)

    data = {'event_type': 'new_interaction'}
    if hasattr(instance, 'gameoflife'):
        if instance.gameoflife.is_buffer:
            return

        data.update(json.loads(instance.data_json))
        if 'assignments' not in data:
            return

        # provide pks for the clients
        # data['cell_pks'] = {}
        cells = models.GameOfLifeCell.objects.filter(game_of_life_id=data['game_of_life'])
        # for device_id in data['assignments']:
        #     cell = data['assignments'][device_id]
        #     data['cell_pks'][cell_name] = cells.get(cell_name=cell_name).pk

    if hasattr(instance, 'bubblesort'):
        data.update(json.loads(instance.data_json))
        if 'assignments' not in data:
            return

    data['instance_url'] = instance.instance_url

    print "Publishing to redis:{}".format(channel)
    r.publish(channel, json.dumps(data))
