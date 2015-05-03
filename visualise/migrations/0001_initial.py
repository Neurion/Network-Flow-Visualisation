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
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('timestamp', models.FloatField(default=-1)),
                ('bytes_size', models.IntegerField(default=-1)),
                ('dir', models.SmallIntegerField(default=-1)),
                ('mac_src', models.CharField(max_length=17)),
                ('mac_dst', models.CharField(max_length=17)),
                ('ip_src', models.CharField(max_length=15)),
                ('ip_dst', models.CharField(max_length=15)),
                ('source_port', models.IntegerField(default=-1)),
                ('destination_port', models.IntegerField(default=-1)),
                ('protocol', models.IntegerField(default=-1)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
