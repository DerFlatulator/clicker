# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0037_gameoflifecell_is_ai'),
    ]

    operations = [
        migrations.AddField(
            model_name='gameoflife',
            name='buffer',
            field=models.OneToOneField(related_name='source', null=True, to='api.GameOfLife'),
        ),
        migrations.AddField(
            model_name='gameoflife',
            name='is_async',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='gameoflife',
            name='is_buffer',
            field=models.BooleanField(default=False),
        ),
    ]
