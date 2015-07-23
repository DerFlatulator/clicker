# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0038_auto_20150723_0322'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gameoflifecell',
            name='game_of_life',
            field=models.ForeignKey(related_name='cells', editable=False, to='api.GameOfLife'),
        ),
        migrations.AlterField(
            model_name='gameoflifecell',
            name='is_ai',
            field=models.BooleanField(default=False, editable=False),
        ),
    ]
