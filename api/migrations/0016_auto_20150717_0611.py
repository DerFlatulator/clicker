# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_auto_20150713_0505'),
    ]

    operations = [
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('id_code', models.CharField(max_length=20, blank=True)),
                ('name', models.CharField(max_length=100, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='RegisteredDevice',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date_created', models.DateTimeField(auto_created=True)),
                ('user_agent', models.CharField(max_length=200, blank=True)),
                ('client', models.ForeignKey(to='api.Client', blank=True)),
            ],
        ),
        migrations.AddField(
            model_name='clickerclass',
            name='connected_students',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='client',
            name='classes',
            field=models.ManyToManyField(to='api.ClickerClass'),
        ),
    ]
