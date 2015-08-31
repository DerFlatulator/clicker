# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0041_regression_regressionestimate_regressionplotitem'),
    ]

    operations = [
        migrations.AlterField(
            model_name='regression',
            name='stage',
            field=models.IntegerField(default=0, choices=[(0, b'Plot Item Input'), (1, b'Regression'), (2, b'Complete')]),
        ),
    ]
