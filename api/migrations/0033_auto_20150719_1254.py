# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations

#
# Tables api.gameoflife and api.bubblesort must be empty to run this migration
#

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_auto_20150719_1239'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='interaction',
            name='content_type',
        ),
        migrations.RemoveField(
            model_name='interaction',
            name='object_id',
        ),
        migrations.AddField(
            model_name='bubblesort',
            name='interaction',
            field=models.OneToOneField(to='api.Interaction'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='gameoflife',
            name='interaction',
            field=models.OneToOneField(to='api.Interaction'),
            preserve_default=False,
        ),
    ]
