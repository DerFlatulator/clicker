# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_auto_20150717_0650'),
    ]

    operations = [
        migrations.AddField(
            model_name='registereddevice',
            name='device_id',
            field=models.CharField(default=b'get_device_id', max_length=32),
        ),
    ]
