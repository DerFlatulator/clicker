# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0042_auto_20150831_0737'),
    ]

    operations = [
        migrations.CreateModel(
            name='Graph',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('interaction', models.OneToOneField(related_name='graph', to='api.Interaction')),
            ],
        ),
        migrations.CreateModel(
            name='GraphEdge',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('weight', models.IntegerField(default=1)),
                ('line_color', models.CharField(default=b'grey', max_length=30)),
                ('label', models.CharField(max_length=30, null=True)),
                ('graph', models.ForeignKey(related_name='edges', to='api.Graph')),
            ],
        ),
        migrations.CreateModel(
            name='GraphParticipationRules',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('layout_type', models.CharField(default=b'cola', max_length=10, choices=[(b'const', b'Constant Edge Length'), (b'force', b'Forcre Layout'), (b'cola', b'Monash cola.js Layout'), (b'cluster', b'Clustered Layout')])),
                ('is_directed', models.BooleanField(default=False)),
                ('is_edge_weighted', models.BooleanField(default=False)),
                ('is_vertex_weighted', models.BooleanField(default=False)),
                ('is_multi_graph', models.BooleanField(default=False)),
                ('is_clustered', models.BooleanField(default=False)),
                ('client_can_label_vertex', models.CharField(default=b'own', max_length=5, choices=[(b'none', b'None'), (b'any', b'Any'), (b'own', b'Assigned')])),
                ('client_can_label_edge', models.CharField(default=b'none', max_length=5, choices=[(b'none', b'None'), (b'any', b'Any'), (b'own', b'Assigned')])),
                ('client_can_color_vertex', models.CharField(default=b'none', max_length=5, choices=[(b'none', b'None'), (b'any', b'Any'), (b'own', b'Assigned')])),
                ('client_can_color_edge', models.CharField(default=b'none', max_length=5, choices=[(b'none', b'None'), (b'any', b'Any'), (b'own', b'Assigned')])),
                ('edge_thickness_func', models.CharField(default=b'const', max_length=10, choices=[(b'const', b'Constant Thickness'), (b'weight', b'Scale by Weight'), (b'inv_weight', b'Scale by (1/Weight)')])),
                ('vertex_radius_func', models.CharField(default=b'const', max_length=10, choices=[(b'const', b'Constant Weight'), (b'degree', b'Scale by Degree'), (b'weight', b'Scale by Weight'), (b'inv_weight', b'Scale by (1/Weight)')])),
                ('client_can_add_vertex', models.BooleanField(default=False)),
                ('client_can_add_edge_from', models.CharField(default=b'own', max_length=5, choices=[(b'none', b'None'), (b'any', b'Any'), (b'own', b'Assigned')])),
                ('client_can_add_edge_to', models.CharField(default=b'any', max_length=5, choices=[(b'none', b'None'), (b'any', b'Any'), (b'own', b'Assigned')])),
                ('client_can_remove_vertex', models.CharField(default=b'none', max_length=5, choices=[(b'none', b'None'), (b'any', b'Any'), (b'own', b'Assigned')])),
                ('client_can_remove_edge_from', models.CharField(default=b'none', max_length=5, choices=[(b'none', b'None'), (b'any', b'Any'), (b'own', b'Assigned')])),
                ('client_can_remove_edge_to', models.CharField(default=b'none', max_length=5, choices=[(b'none', b'None'), (b'any', b'Any'), (b'own', b'Assigned')])),
                ('client_num_vertices_each', models.IntegerField(default=1)),
                ('vertex_label_format_string', models.CharField(default=b'{1}_{2}', help_text=b'Use {1} for student label and {2} for number', max_length=20)),
                ('begin_with_edges', models.ManyToManyField(default=[], related_name='rules', to='api.GraphEdge')),
            ],
        ),
        migrations.CreateModel(
            name='GraphVertex',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('is_assigned', models.BooleanField(default=False)),
                ('weight', models.IntegerField(default=1)),
                ('border_color', models.CharField(default=b'black', max_length=50)),
                ('background_color', models.CharField(default=b'grey', max_length=50)),
                ('label', models.CharField(max_length=20, null=True)),
                ('graph', models.ForeignKey(related_name='vertices', to='api.Graph')),
            ],
        ),
        migrations.AddField(
            model_name='graphparticipationrules',
            name='begin_with_vertices',
            field=models.ManyToManyField(default=[], related_name='rules', to='api.GraphVertex'),
        ),
        migrations.AddField(
            model_name='graphedge',
            name='source',
            field=models.ForeignKey(related_name='source_edges', to='api.GraphVertex'),
        ),
        migrations.AddField(
            model_name='graphedge',
            name='target',
            field=models.ForeignKey(related_name='target_edges', to='api.GraphVertex'),
        ),
        migrations.AddField(
            model_name='graph',
            name='rules',
            field=models.ForeignKey(related_name='graph', to='api.GraphParticipationRules'),
        ),
    ]
