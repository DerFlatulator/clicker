# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_bubblesort'),
    ]

    operations = [
        migrations.CreateModel(
            name='BubbleSortSwap',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('lower_index', models.IntegerField()),
                ('bubble_sort', models.ForeignKey(to='api.BubbleSort')),
            ],
        ),
    ]
