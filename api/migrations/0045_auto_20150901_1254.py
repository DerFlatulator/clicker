# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0044_auto_20150901_0527'),
    ]

    operations = [
        migrations.AddField(
            model_name='graphparticipationrules',
            name='title',
            field=models.TextField(default='Graph', max_length=100),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='graphparticipationrules',
            name='begin_with_edges',
            field=models.TextField(default=b'', help_text=b'Comma separated vertex pairs, one per line. E.g. "a,b [newline] b,c"', blank=True),
        ),
        migrations.AlterField(
            model_name='graphparticipationrules',
            name='begin_with_vertices',
            field=models.TextField(default=b'', help_text=b'Comma separated list of vertex labels. E.g. "a,b,c,d"', blank=True),
        ),
        migrations.AlterField(
            model_name='graphparticipationrules',
            name='description',
            field=models.TextField(default=b'', max_length=500, blank=True),
        ),
        migrations.AlterField(
            model_name='graphparticipationrules',
            name='interaction_type',
            field=models.ForeignKey(related_name='graph_rulesets', to='api.InteractionType'),
        ),
    ]
