from django.db import models
import time

class Flow(models.Model):
	timestamp = models.FloatField(default=-1)
	bytes_size = models.IntegerField(default=-1)
	dir = models.SmallIntegerField(default=-1)
	mac_src = models.CharField(max_length=17)	
	mac_dst = models.CharField(max_length=17)	
	ip_src = models.CharField(max_length=15)	
	ip_dst = models.CharField(max_length=15)
	source_port = models.IntegerField(default=-1)	
	destination_port = models.IntegerField(default=-1)
	protocol = models.IntegerField(default=-1)
	def __str__(self):
		return (
			str(self.timestamp)	
			+",\t"			
			+str(self.bytes_size)			
			+",\t"	
			+str(self.dir)			
			+",\t"				
			+str(self.mac_src)
			+":"
			+str(self.mac_dst)
			+":"								
			+str(self.ip_src)
			+":"
			+str(self.source_port)
			+",\t"
			+str(self.ip_dst)
			+":"
			+str(self.destination_port)			
			+",\t"
			+str(self.protocol)
			+"\n"
			)