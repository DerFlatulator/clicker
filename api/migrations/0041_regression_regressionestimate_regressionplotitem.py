# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0040_auto_20150724_0500'),
    ]

    operations = [
        migrations.CreateModel(
            name='Regression',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('x_label', models.TextField(max_length=100)),
                ('y_label', models.TextField(max_length=100)),
                ('chart_title', models.TextField(default=b'Linear Regression', max_length=150)),
                ('stage', models.IntegerField(default=0)),
                ('interaction', models.OneToOneField(related_name='regression', to='api.Interaction')),
            ],
        ),
        migrations.CreateModel(
            name='RegressionEstimate',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('y0', models.FloatField(default=0)),
                ('y1', models.FloatField(default=0)),
                ('regression', models.ForeignKey(related_name='estimates', to='api.Regression')),
            ],
        ),
        migrations.CreateModel(
            name='RegressionPlotItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('x_val', models.FloatField(default=0)),
                ('y_val', models.FloatField(default=0)),
                ('regression', models.ForeignKey(related_name='plot_items', to='api.Regression')),
            ],
        ),
    ]
