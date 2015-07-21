from django.db.models.signals import post_save
from django.dispatch import receiver

import redis
import json
from rest_framework.reverse import reverse_lazy

from api.models import BubbleSortSwap, GameOfLifeCell, Interaction

r = redis.StrictRedis(host='localhost', port=6379, db=0)

@receiver(post_save, sender=BubbleSortSwap,
          dispatch_uid="observer:BubbleSortSwap#post_save")
def new_bubble_sort_swap(sender, **kwargs):
    instance = kwargs['instance']
    print "Publishing to redis:bubblesort.observer"
    r.publish('bubblesort.observer', json.dumps({
        'lower_index': instance.lower_index,
        'bubble_sort': instance.bubble_sort_id
    }))

@receiver(post_save, sender=GameOfLifeCell,
          dispatch_uid="observer:GameOfLifeCell#post_save")
def save_game_of_life_cell(sender, instance, **kwargs):
    if not instance.changed:
        return

    if instance.game_of_life.interaction.state != Interaction.ACTIVE:
        return
    url = reverse_lazy('gameoflife-detail', args=[instance.game_of_life_id])

    print "Publishing to redis:gameoflife.observer"
    r.publish('gameoflife.observer', json.dumps({
        'row': instance.row,
        'col': instance.col,
        'alive': instance.alive,
        'game_of_life': str(url),
        'event_type': 'toggle_cell'
    }))

@receiver(post_save, sender=Interaction,
          dispatch_uid="observer:Interaction#post_save")
def save_interaction(sender, instance, created, **kwargs):
    # the first save is ignored
    if created:
        return

    if instance.state != Interaction.ACTIVE:
        return

    if hasattr(instance, 'gameoflife'):
        data = json.loads(instance.data_json)
        if 'assignments' not in data:
            return

        data['event_type'] = 'new_interaction'

        print "Publishing to redis:gameoflife.observer"
        r.publish('gameoflife.observer', json.dumps(data))
