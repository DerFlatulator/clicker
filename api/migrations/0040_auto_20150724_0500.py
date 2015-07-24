# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0039_auto_20150723_0632'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gameoflife',
            name='interaction',
            field=models.OneToOneField(related_name='gameoflife', null=True, to='api.Interaction'),
        ),
    ]
