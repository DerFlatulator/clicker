# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
import api.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_registereddevice_device_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client',
            name='id_code',
            field=models.CharField(default=b'N/A', max_length=20, blank=True),
        ),
        migrations.AlterField(
            model_name='client',
            name='name',
            field=models.CharField(default=b'Anonymous', max_length=100, blank=True),
        ),
        migrations.AlterField(
            model_name='registereddevice',
            name='client',
            field=models.ForeignKey(blank=True, to='api.Client', null=True),
        ),
        migrations.AlterField(
            model_name='registereddevice',
            name='date_created',
            field=models.DateTimeField(default=django.utils.timezone.now, editable=False, auto_created=True),
        ),
        migrations.AlterField(
            model_name='registereddevice',
            name='device_id',
            field=models.CharField(max_length=32, editable=False, blank=True),
        ),
        migrations.AlterField(
            model_name='registereddevice',
            name='user_agent',
            field=models.CharField(max_length=200, null=True, blank=True),
        ),
    ]
