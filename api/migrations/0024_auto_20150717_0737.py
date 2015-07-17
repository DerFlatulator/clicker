# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_auto_20150717_0719'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registereddevice',
            name='date_created',
            field=models.DateTimeField(editable=False, auto_created=True),
        ),
    ]
