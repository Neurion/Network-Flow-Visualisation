# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('visualise', '0004_auto_20150818_1409'),
    ]

    operations = [
        migrations.CreateModel(
            name='Test',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('time_start', models.IntegerField(null=True, blank=True)),
                ('time_end', models.IntegerField(null=True, blank=True)),
                ('protocol', models.CharField(blank=True, max_length=5)),
                ('direction', models.IntegerField(null=True, blank=True)),
                ('inf_in', models.IntegerField(null=True, blank=True)),
                ('mac_src', models.CharField(blank=True, max_length=17)),
                ('mac_dst', models.CharField(blank=True, max_length=17)),
                ('ip_src', models.CharField(blank=True, max_length=15)),
                ('ip_dst', models.CharField(blank=True, max_length=15)),
                ('port_src', models.IntegerField(null=True, blank=True)),
                ('port_dst', models.IntegerField(null=True, blank=True)),
                ('packets_in', models.IntegerField(null=True, blank=True)),
                ('bytes_in', models.IntegerField(null=True, blank=True)),
                ('application', models.CharField(blank=True, max_length=15)),
                ('flows', models.IntegerField(null=True, blank=True)),
            ],
            options={
                'managed': False,
                'db_table': 'test',
            },
            bases=(models.Model,),
        ),
    ]
