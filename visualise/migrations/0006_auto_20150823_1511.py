# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('visualise', '0005_test'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='flow',
            table='test',
        ),
    ]
