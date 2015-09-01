from django.db import models
import time

class Flow(models.Model):
	id = models.AutoField(primary_key=True)  # AutoField?
	time_start = models.IntegerField(blank=True, null=True)
	time_end = models.IntegerField(blank=True, null=True)
	protocol = models.CharField(max_length=5, blank=True)
	direction = models.IntegerField(blank=True, null=True)
	mac_src = models.CharField(max_length=17, blank=True)
	mac_dst = models.CharField(max_length=17, blank=True)
	ip_src = models.CharField(max_length=15, blank=True)
	ip_dst = models.CharField(max_length=15, blank=True)
	port_src = models.IntegerField(blank=True, null=True)
	port_dst = models.IntegerField(blank=True, null=True)
	packets_in = models.IntegerField(blank=True, null=True)
	bytes_in = models.IntegerField(blank=True, null=True)
	application = models.CharField(max_length=15, blank=True)
	flows = models.IntegerField(blank=True, null=True)
	class Meta:
		managed = False
		db_table = 'flows'

class IpfixFlow(models.Model):
	id = models.AutoField(primary_key=True)
	time_start = models.IntegerField(blank=True, null=True)
	time_end = models.IntegerField(blank=True, null=True)
	protocol = models.CharField(max_length=5, blank=True)
	direction = models.IntegerField(blank=True, null=True)
	mac_src = models.CharField(max_length=17, blank=True)
	mac_dst = models.CharField(max_length=17, blank=True)
	ip_src = models.CharField(max_length=15, blank=True)
	ip_dst = models.CharField(max_length=15, blank=True)
	port_src = models.IntegerField(blank=True, null=True)
	port_dst = models.IntegerField(blank=True, null=True)
	packets_in = models.IntegerField(blank=True, null=True)
	bytes_in = models.IntegerField(blank=True, null=True)
	flows = models.IntegerField(blank=True, null=True)
	class Meta:
		managed = False
		db_table = 'ipfix_flows'

class Device(models.Model):
	device = models.CharField(primary_key=True, max_length=17)
	name = models.CharField(max_length=20, blank=True)

	class Meta:
		managed = False
		db_table = 'devices'