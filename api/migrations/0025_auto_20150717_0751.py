# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_auto_20150717_0737'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='registereddevice',
            name='id',
        ),
        migrations.AlterField(
            model_name='registereddevice',
            name='device_id',
            field=models.CharField(max_length=32, serialize=False, editable=False, primary_key=True, blank=True),
        ),
    ]
