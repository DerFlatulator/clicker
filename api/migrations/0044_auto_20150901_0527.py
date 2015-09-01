# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0043_auto_20150831_1219'),
    ]

    operations = [
        migrations.AddField(
            model_name='graphparticipationrules',
            name='creator',
            field=models.ForeignKey(related_name='graph_rules', default=9, to='api.Creator'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='graphparticipationrules',
            name='description',
            field=models.TextField(default=b'', max_length=500),
        ),
        migrations.AddField(
            model_name='graphparticipationrules',
            name='interaction_type',
            field=models.OneToOneField(related_name='graph_rulesets', default=1, to='api.InteractionType'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='graphvertex',
            name='assigned_to',
            field=models.ForeignKey(related_name='graph_vertices', blank=True, to='api.RegisteredDevice', null=True),
        ),
        migrations.RemoveField(
            model_name='graphparticipationrules',
            name='begin_with_edges',
        ),
        migrations.AddField(
            model_name='graphparticipationrules',
            name='begin_with_edges',
            field=models.TextField(default=b'', help_text=b'Comma separated vertex pairs, one per line. E.g. "a,b [newline] b,c"'),
        ),
        migrations.RemoveField(
            model_name='graphparticipationrules',
            name='begin_with_vertices',
        ),
        migrations.AddField(
            model_name='graphparticipationrules',
            name='begin_with_vertices',
            field=models.TextField(default=b'', help_text=b'Comma separated list of vertex labels. E.g. "a,b,c,d"'),
        ),
        migrations.AlterField(
            model_name='graphparticipationrules',
            name='layout_type',
            field=models.CharField(default=b'cola', max_length=10, choices=[(b'const', b'Constant Edge Length'), (b'force', b'Force Layout'), (b'cola', b'Monash cola.js Layout'), (b'cluster', b'Clustered Layout')]),
        ),
    ]
