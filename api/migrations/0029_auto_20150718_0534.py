# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_registereddevice_classes'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='clickerclass',
            name='connected_students',
        ),
        migrations.AlterField(
            model_name='bubblesortswap',
            name='bubble_sort',
            field=models.ForeignKey(related_name='swaps', to='api.BubbleSort'),
        ),
    ]
