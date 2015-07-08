from django.db.models.signals import post_save
from django.dispatch import receiver

import redis
import json

from api.models import BubbleSortSwap, GameOfLifeCell, GameOfLife

@receiver(post_save, sender=BubbleSortSwap, dispatch_uid="BubbleSortSwap#post_save")
def new_bubble_sort_swap(sender, **kwargs):
    instance = kwargs['instance']
    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    print "Publishing to redis:bubblesort.observer"
    r.publish('bubblesort.observer', json.dumps({
        'lower_index': instance.lower_index,
        'bubble_sort': instance.bubble_sort_id
    }))

@receiver(post_save, sender=GameOfLifeCell, dispatch_uid="GameOfLifeCell#post_save")
def save_game_of_life_cell(sender, instance, **kwargs):
    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    if not instance.changed:
        return

    print "Publishing to redis:gameoflife.observer"
    r.publish('gameoflife.observer', json.dumps({
        'row': instance.row,
        'col': instance.col,
        'alive': instance.alive,
        'game_of_life': instance.game_of_life_id
    }))
