# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_auto_20150719_1254'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bubblesort',
            name='interaction',
            field=models.OneToOneField(related_name='bubblesort', to='api.Interaction'),
        ),
        migrations.AlterField(
            model_name='gameoflife',
            name='interaction',
            field=models.OneToOneField(related_name='gameoflife', to='api.Interaction'),
        ),
    ]
