# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_gameoflifecell_cell_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClickerClass',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('class_name', models.CharField(max_length=50)),
                ('long_name', models.CharField(max_length=255)),
            ],
        ),
    ]
