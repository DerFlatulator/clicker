# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_auto_20150518_1343'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bubblesort',
            name='size',
            field=models.IntegerField(default=-1, null=True),
        ),
    ]
