# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_auto_20150717_0611'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registereddevice',
            name='client',
            field=models.ForeignKey(to='api.Client', null=True),
        ),
        migrations.AlterField(
            model_name='registereddevice',
            name='user_agent',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
