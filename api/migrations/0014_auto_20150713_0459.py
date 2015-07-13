# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_auto_20150713_0131'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gameoflifecell',
            name='cell_name',
            field=models.CharField(max_length=10, editable=False),
        ),
    ]
