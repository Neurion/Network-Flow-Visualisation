# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Flow',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True, serialize=False)),
                ('time_start', models.IntegerField(null=True, blank=True)),
                ('time_end', models.IntegerField(null=True, blank=True)),
                ('protocol', models.CharField(max_length=5, blank=True)),
                ('direction', models.IntegerField(null=True, blank=True)),
                ('inf_in', models.IntegerField(null=True, blank=True)),
                ('mac_src', models.CharField(max_length=17, blank=True)),
                ('mac_dst', models.CharField(max_length=17, blank=True)),
                ('ip_src', models.CharField(max_length=15, blank=True)),
                ('ip_dst', models.CharField(max_length=15, blank=True)),
                ('port_src', models.IntegerField(null=True, blank=True)),
                ('port_dst', models.IntegerField(null=True, blank=True)),
                ('packets_in', models.IntegerField(null=True, blank=True)),
                ('bytes_in', models.IntegerField(null=True, blank=True)),
            ],
            options={
                'db_table': 'flows',
                'managed': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Host',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('mac', models.CharField(max_length=17, blank=True)),
                ('name', models.CharField(max_length=20, blank=True)),
            ],
            options={
                'db_table': 'hosts',
                'managed': False,
            },
            bases=(models.Model,),
        ),
    ]
