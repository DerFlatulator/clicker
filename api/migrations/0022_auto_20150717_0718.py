# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_auto_20150717_0717'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registereddevice',
            name='device_id',
            field=models.CharField(max_length=32, editable=False, blank=True),
        ),
    ]
