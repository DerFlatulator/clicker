# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_remove_bubblesort_size'),
    ]

    operations = [
        migrations.RenameField(
            model_name='bubblesort',
            old_name='values',
            new_name='shuffled',
        ),
    ]
