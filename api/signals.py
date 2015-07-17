from django.db.models.signals import post_save
from django.conf import settings
from django.dispatch import receiver

from api import models

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def user_post_save(sender, instance, created, **kwargs):
    # models.Creator(user=instance).save()
    pass