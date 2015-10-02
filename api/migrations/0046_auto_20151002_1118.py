# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0045_auto_20150901_1254'),
    ]

    operations = [
        migrations.AddField(
            model_name='graphvertex',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='graphvertex',
            name='index',
            field=models.IntegerField(default=0),
        ),
    ]
