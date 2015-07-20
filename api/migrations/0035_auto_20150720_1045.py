# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0034_auto_20150719_1303'),
    ]

    operations = [
        migrations.CreateModel(
            name='InteractionType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('slug_name', models.SlugField()),
                ('long_name', models.CharField(default=b'', max_length=100)),
            ],
        ),
        migrations.AddField(
            model_name='interaction',
            name='interaction_type',
            field=models.ForeignKey(related_name='interactions', default=1, to='api.InteractionType'),
            preserve_default=False,
        ),
    ]
