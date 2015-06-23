from django.db.models.signals import post_save
from django.dispatch import receiver

import redis
import json

from api.models import BubbleSortSwap

@receiver(post_save, sender=BubbleSortSwap, dispatch_uid="BubbleSortSwap#post_save")
def new_bubble_sort_swap(sender, **kwargs):
    instance = kwargs['instance']
    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    print "Publishing to redis:observer"
    r.publish('observer', json.dumps({
        'lower_index': instance.lower_index,
        'bubble_sort': instance.bubble_sort_id
    }))