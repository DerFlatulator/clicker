# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0029_auto_20150718_0534'),
    ]

    operations = [
        migrations.CreateModel(
            name='Creator',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('classes', models.ManyToManyField(to='api.ClickerClass')),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Interaction',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('data_json', models.TextField(default=b'{}', blank=True)),
                ('state', models.CharField(default=b'R', max_length=b'2', choices=[(b'R', b'Ready'), (b'A', b'Active'), (b'C', b'Complete')])),
                ('clicker_class', models.ForeignKey(related_name='interactions', to='api.ClickerClass')),
                ('creator', models.ForeignKey(related_name='interactions', editable=False, to='api.Creator')),
            ],
        ),
    ]
