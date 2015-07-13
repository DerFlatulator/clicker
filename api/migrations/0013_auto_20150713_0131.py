# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_clickerclass'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gameoflifecell',
            name='cell_name',
            field=models.CharField(unique=True, max_length=10, editable=False),
        ),
        migrations.AlterField(
            model_name='gameoflifecell',
            name='col',
            field=models.IntegerField(default=0, editable=False),
        ),
        migrations.AlterField(
            model_name='gameoflifecell',
            name='game_of_life',
            field=models.ForeignKey(related_name='cells', to='api.GameOfLife'),
        ),
        migrations.AlterField(
            model_name='gameoflifecell',
            name='row',
            field=models.IntegerField(default=0, editable=False),
        ),
    ]
