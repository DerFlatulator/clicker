# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0035_auto_20150720_1045'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='creator',
            name='classes',
        ),
        migrations.AddField(
            model_name='clickerclass',
            name='creator',
            field=models.ForeignKey(related_name='classes', default=1, to='api.Creator'),
            preserve_default=False,
        ),
    ]
