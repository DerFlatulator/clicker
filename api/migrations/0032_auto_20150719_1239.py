# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_auto_20150719_1146'),
    ]

    operations = [
        migrations.AlterField(
            model_name='interaction',
            name='content_type',
            field=models.OneToOneField(related_name='interaction', to='contenttypes.ContentType'),
        ),
    ]
