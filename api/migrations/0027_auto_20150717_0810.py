# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0026_auto_20150717_0753'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registereddevice',
            name='date_created',
            field=models.DateTimeField(editable=False, blank=True),
        ),
    ]
