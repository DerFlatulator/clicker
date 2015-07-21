# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0036_auto_20150721_0153'),
    ]

    operations = [
        migrations.AddField(
            model_name='gameoflifecell',
            name='is_ai',
            field=models.BooleanField(default=False),
        ),
    ]
