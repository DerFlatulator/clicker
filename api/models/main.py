from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

import random
import hashlib
from rest_framework.reverse import reverse_lazy

class ClickerClass(models.Model):
    class_name = models.CharField(max_length=50, null=False, unique=True)
    long_name = models.CharField(max_length=255, null=False)
    creator = models.ForeignKey('Creator', related_name='classes')
    # # Compute this instead
    # connected_students = models.IntegerField(default=0, null=False)

    def __unicode__(self):
        return "Class: {} ({})".format(self.class_name, self.long_name)

    def get_connected_devices(self):
        return self.registereddevice_set.count()


class Creator(models.Model):
    user = models.OneToOneField(User)


class InteractionType(models.Model):
    slug_name = models.SlugField()
    long_name = models.CharField(max_length=100, default='')

    def __unicode__(self):
        return self.long_name


class Interaction(models.Model):
    READY = 'R'
    ACTIVE = 'A'
    COMPLETE = 'C'
    INTERACTION_STATES = (
        (READY, 'Ready'),
        (ACTIVE, 'Active'),
        (COMPLETE, 'Complete')
    )

    clicker_class = models.ForeignKey(ClickerClass, related_name='interactions')
    interaction_type = models.ForeignKey(InteractionType, related_name='interactions')
    data_json = models.TextField(default='{}', null=False, blank=True)
    state = models.CharField(max_length='2', choices=INTERACTION_STATES, default=READY)
    creator = models.ForeignKey(Creator, related_name='interactions', editable=False)

    @property
    def instance_url(self):
        if hasattr(self, 'gameoflife'):
            return str(reverse_lazy('gameoflife-detail', args=[self.gameoflife.id]))
        if hasattr(self, 'bubblesort'):
            return str(reverse_lazy('bubblesort-detail', args=[self.bubblesort.id]))

    @property
    def state_name(self):
        for k, v in self.INTERACTION_STATES:
            if self.state == k:
                return v

    def __unicode__(self):
        return "Interaction #{} ({}, {})".format(self.id,
                                                 self.clicker_class.class_name,
                                                 self.state_name)

        # Generic item
        # limit = models.Q(app_label='api', model='bubblesort') | \
        #     models.Q(app_label='api', model='gameoflife')
        #
        # content_type = models.ForeignKey(ContentType, limit_choices_to=limit, related_name='interaction')
        # object_id = models.PositiveIntegerField()
        # interaction_object = fields.GenericForeignKey('content_type', 'object_id')


# Registration


class Client(models.Model):
    id_code = models.CharField(max_length=20, blank=True, default='N/A')
    name = models.CharField(max_length=100, blank=True, default='Anonymous')
    classes = models.ManyToManyField(ClickerClass)


class RegisteredDevice(models.Model):
    device_id = models.CharField(max_length=32, editable=False, primary_key=True)
    date_created = models.DateTimeField(null=False, editable=False, blank=True)
    user_agent = models.CharField(max_length=200, null=True, blank=True)
    client = models.ForeignKey(Client, null=True, blank=True)
    classes = models.ManyToManyField(ClickerClass)

    @staticmethod
    def compute_hash():
        val = list(str(timezone.now()))
        random.shuffle(val)
        val = ''.join(val)
        return hashlib.md5(val).hexdigest()

    def save(self, **kwargs):
        if not self.device_id:
            self.date_created = timezone.now()
            self.device_id = RegisteredDevice.compute_hash()
            print self.device_id

        super(RegisteredDevice, self).save(kwargs)

    def __unicode__(self):
        return "Registered Device: {}".format(self.device_id)