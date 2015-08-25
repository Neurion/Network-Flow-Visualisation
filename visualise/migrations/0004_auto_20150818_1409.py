# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('visualise', '0003_auto_20150817_1158'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='flow',
            table='flows',
        ),
    ]
