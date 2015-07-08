# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_gameoflife_gameoflifecell'),
    ]

    operations = [
        migrations.AddField(
            model_name='gameoflifecell',
            name='cell_name',
            field=models.CharField(default='??', max_length=10),
            preserve_default=False,
        ),
    ]
