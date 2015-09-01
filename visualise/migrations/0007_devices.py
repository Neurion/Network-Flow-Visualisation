# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('visualise', '0006_auto_20150823_1511'),
    ]

    operations = [
        migrations.CreateModel(
            name='Devices',
            fields=[
                ('device', models.CharField(max_length=17, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=20, blank=True)),
            ],
            options={
                'db_table': 'devices',
                'managed': False,
            },
            bases=(models.Model,),
        ),
    ]
