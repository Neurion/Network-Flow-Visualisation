# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('visualise', '0002_ipfixflow'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='flow',
            table='flows2',
        ),
    ]
