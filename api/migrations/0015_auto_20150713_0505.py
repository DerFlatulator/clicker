# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_auto_20150713_0459'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clickerclass',
            name='class_name',
            field=models.CharField(unique=True, max_length=50),
        ),
    ]
