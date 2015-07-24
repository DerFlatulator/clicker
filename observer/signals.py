from django.db.models.signals import post_save
from django.dispatch import receiver

from api import serializers

import redis
import json
from rest_framework.reverse import reverse_lazy

from api.models import BubbleSortSwap, GameOfLifeCell, Interaction, GameOfLife

r = redis.StrictRedis(host='localhost', port=6379, db=0)

@receiver(post_save, sender=BubbleSortSwap,
          dispatch_uid="observer:BubbleSortSwap#post_save")
def new_bubble_sort_swap(sender, instance, **kwargs):
    class_name = instance.bubble_sort.interaction.clicker_class.class_name
    channel = 'bubblesort.{}.observer'.format(class_name)
    url = reverse_lazy('bubblesort-detail', args=[instance.bubble_sort_id])

    print "Publishing to redis:{}".format(channel)
    r.publish(channel, json.dumps({
        'lower_index': instance.lower_index,
        'bubble_sort': str(url),
        'event_type': 'swap'
    }))

# @receiver(post_save, sender=GameOfLife, dispatch_uid="observer:GameOfLife#post_save")
# def save_game_of_life(sender, instance, **kwargs):
#
#     if instance.is_async:
#         return
#
#     if instance.is_buffer:
#         return
#
#     class_name = instance.interaction.clicker_class.class_name
#     channel = 'gameoflife.{}.observer'.format(class_name)
#     url = reverse_lazy('gameoflife-detail', args=[instance.id])
#
#     print "Publishing to redis:{}".format(channel)
#     r.publish(channel, json.dumps({
#         'game_of_life': str(url),
#         'event_type': 'next_iteration',
#         'serialized': unicode(instance)
#     }))

@receiver(post_save, sender=GameOfLifeCell, dispatch_uid="observer:GameOfLifeCell#post_save")
def save_game_of_life_cell(sender, instance, **kwargs):
    if not instance.changed:
        return

    if instance.game_of_life.is_buffer:
        return

    if instance.game_of_life.interaction.state != Interaction.ACTIVE:
        return
    url = reverse_lazy('gameoflife-detail', args=[instance.game_of_life_id])

    class_name = instance.game_of_life.interaction.clicker_class.class_name
    channel = '{}gameoflife.{}.observer'.format('async' if instance.game_of_life.is_async else '', class_name)
    # serial = serializers.GameOfLifeSerializer()

    print "Publishing to redis:{}".format(channel)
    r.publish(channel, json.dumps({
        'row': instance.row,
        'col': instance.col,
        'alive': instance.alive,
        'game_of_life': str(url),
        'event_type': 'toggle_cell'
    }))

@receiver(post_save, sender=Interaction, dispatch_uid="observer:Interaction#post_save")
def save_interaction(sender, instance, created, **kwargs):
    # the first save is ignored
    if created:
        return

    if instance.state != Interaction.ACTIVE:
        return

    class_name = instance.clicker_class.class_name

    data = {'event_type': 'new_interaction'}
    if hasattr(instance, 'gameoflife'):
        if instance.gameoflife.is_buffer:
            return

        data.update(json.loads(instance.data_json))
        if 'assignments' not in data:
            return

    if hasattr(instance, 'bubblesort'):
        data.update(json.loads(instance.data_json))
        if 'assignments' not in data:
            return

    data['instance_url'] = instance.instance_url

    channel = '{}.observer'.format(class_name)
    print "Publishing to redis:{}".format(channel)
    r.publish(channel, json.dumps(data))
