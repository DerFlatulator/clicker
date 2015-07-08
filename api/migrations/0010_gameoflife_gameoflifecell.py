# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_auto_20150622_0634'),
    ]

    operations = [
        migrations.CreateModel(
            name='GameOfLife',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('num_rows', models.IntegerField(default=3)),
                ('num_cols', models.IntegerField(default=4)),
            ],
        ),
        migrations.CreateModel(
            name='GameOfLifeCell',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('alive', models.BooleanField(default=False)),
                ('col', models.IntegerField(default=0)),
                ('row', models.IntegerField(default=0)),
                ('changed', models.NullBooleanField()),
                ('game_of_life', models.ForeignKey(to='api.GameOfLife')),
            ],
        ),
    ]
