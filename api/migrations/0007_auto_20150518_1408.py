# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_auto_20150518_1357'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bubblesort',
            name='size',
            field=models.IntegerField(default=-1, blank=True),
        ),
        migrations.AlterField(
            model_name='bubblesort',
            name='values',
            field=models.CommaSeparatedIntegerField(default=b'1,3,2', max_length=1000),
        ),
    ]
