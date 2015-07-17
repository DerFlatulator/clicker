# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_auto_20150717_0647'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registereddevice',
            name='date_created',
            field=models.DateTimeField(default=django.utils.timezone.now, auto_created=True),
        ),
    ]
