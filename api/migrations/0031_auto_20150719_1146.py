# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('api', '0030_creator_interaction'),
    ]

    operations = [
        migrations.AddField(
            model_name='interaction',
            name='content_type',
            field=models.ForeignKey(default='', to='contenttypes.ContentType'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='interaction',
            name='object_id',
            field=models.PositiveIntegerField(default=1),
            preserve_default=False,
        ),
    ]
