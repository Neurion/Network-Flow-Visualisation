# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('visualise', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='IpfixFlow',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('time_start', models.IntegerField(null=True, blank=True)),
                ('time_end', models.IntegerField(null=True, blank=True)),
                ('protocol', models.CharField(max_length=5, blank=True)),
                ('direction', models.IntegerField(null=True, blank=True)),
                ('mac_src', models.CharField(max_length=17, blank=True)),
                ('mac_dst', models.CharField(max_length=17, blank=True)),
                ('ip_src', models.CharField(max_length=15, blank=True)),
                ('ip_dst', models.CharField(max_length=15, blank=True)),
                ('port_src', models.IntegerField(null=True, blank=True)),
                ('port_dst', models.IntegerField(null=True, blank=True)),
                ('packets_in', models.IntegerField(null=True, blank=True)),
                ('bytes_in', models.IntegerField(null=True, blank=True)),
                ('flows', models.IntegerField(null=True, blank=True)),
            ],
            options={
                'db_table': 'ipfix_flows',
                'managed': False,
            },
            bases=(models.Model,),
        ),
    ]
