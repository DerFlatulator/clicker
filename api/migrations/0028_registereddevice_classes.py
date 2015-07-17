# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_auto_20150717_0810'),
    ]

    operations = [
        migrations.AddField(
            model_name='registereddevice',
            name='classes',
            field=models.ManyToManyField(to='api.ClickerClass'),
        ),
    ]
