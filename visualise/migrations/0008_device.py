# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('visualise', '0007_devices'),
    ]

    operations = [
        migrations.CreateModel(
            name='Device',
            fields=[
                ('device', models.CharField(primary_key=True, serialize=False, max_length=17)),
                ('name', models.CharField(max_length=20, blank=True)),
            ],
            options={
                'managed': False,
                'db_table': 'devices',
            },
            bases=(models.Model,),
        ),
    ]
