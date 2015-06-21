from django.db import models
import time

class EgressFlow(models.Model):
	time_start = models.IntegerField(blank=True, null=True)
	time_end = models.IntegerField(blank=True, null=True)
	protocol = models.CharField(max_length=5, blank=True)
	inf_in = models.IntegerField(blank=True, null=True)
	mac_src = models.CharField(max_length=17, blank=True)
	ip_src = models.CharField(max_length=15, blank=True)
	ip_dst = models.CharField(max_length=15, blank=True)
	port_src = models.IntegerField(blank=True, null=True)
	port_dst = models.IntegerField(blank=True, null=True)
	packets_in = models.IntegerField(blank=True, null=True)
	bytes_in = models.IntegerField(blank=True, null=True)

	class Meta:
		managed = False
		db_table = 'egress_flow'
		#app_label = ''

	def __str__(self):
		return (
			str(self.time_start)
			+",\t"
			+str(self.time_end)
			+",\t"
			+str(self.protocol)
			+",\t"
			+str(self.inf_in)
			+":"
			+str(self.mac_src)
			+":"
			+str(self.ip_src)
			+":"
			+str(self.ip_dst)
			+",\t"
			+str(self.port_src)
			+":"
			+str(self.port_dst)			
			+",\t"
			+str(self.packets_in)
			+",\t"
			+str(self.bytes_in)			
			)

class IngressFlow(models.Model):
	time_start = models.IntegerField(blank=True, null=True)
	time_end = models.IntegerField(blank=True, null=True)
	protocol = models.CharField(max_length=5, blank=True)
	inf_in = models.IntegerField(blank=True, null=True)
	mac_dst = models.CharField(max_length=17, blank=True)
	ip_src = models.CharField(max_length=15, blank=True)
	ip_dst = models.CharField(max_length=15, blank=True)
	port_src = models.IntegerField(blank=True, null=True)
	port_dst = models.IntegerField(blank=True, null=True)
	packets_in = models.IntegerField(blank=True, null=True)
	bytes_in = models.IntegerField(blank=True, null=True)

	class Meta:
		managed = False
		db_table = 'ingress_flow'
		#app_label = ''

	def __str__(self):
		return (
			str(self.time_start)
			+",\t"
			+str(self.time_end)
			+",\t"
			+str(self.protocol)
			+",\t"
			+str(self.inf_in)
			+":"
			+str(self.mac_dst)
			+":"
			+str(self.ip_src)
			+":"
			+str(self.ip_dst)
			+",\t"
			+str(self.port_src)
			+":"
			+str(self.port_dst)			
			+",\t"
			+str(self.packets_in)
			+",\t"
			+str(self.bytes_in)			
			)