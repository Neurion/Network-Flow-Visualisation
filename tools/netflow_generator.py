#!/usr/bin/python

from __future__ import print_function
from random import randint
import sys, getopt, MySQLdb

INCOMING = 0
OUTGOING = 1

DIRECTION = INCOMING, INCOMING, OUTGOING
APPLICATIONS = 'HTTP', 'HTTP', 'HTTP', 'HTTP', 'HTTP', 'DNS', 'DNS', 'DNS', 'DNS', 'HTTPS', 'HTTPS', 'SMTP', 'SMTP', 'VoIP', 'Other';
PORTS = 0, 1, 3, 5, 8, 11, 21, 22, 23, 25, 53, 53, 53, 53, 53, 53, 53, 53, 80, 80, 80, 80, 80, 80, 80, 443, 443, 443, 443, 443
PROTOCOLS = 'TCP', 'TCP', 'TCP', 'TCP', 'TCP', 'TCP', 'TCP', 'TCP', 'UDP', 'UDP', 'UDP', 'UDP', 'UDP', 'ICMP', 'ICMP', 'ICMP6', 'IGMP', 'GRE'
MACS = '90:e2:ba:48:b8:90', '90:e2:ba:48:b8:90', '90:e2:ba:48:b8:90', '00:30:48:66:a8:ba', '00:30:48:66:a8:ba', '00:30:48:66:a8:ba', '00:30:48:66:a8:ba', '00:30:48:66:a8:ba', '68:05:ca:16:1c:f8', '68:05:ca:16:1c:f8', '00:1b:21:4b:0a:8c', '00:1b:21:4b:0a:8c', '00:19:b9:19:6e:0c','01:00:5e:00:00:0c'
EXTERNAL_IPS = '131.203.2.59', '131.203.2.59', '131.203.2.59', '157.56.172.28', '157.56.172.28', '198.41.208.137', '173.252.74.22', '173.252.74.22', '173.252.74.22', '173.252.74.22', '199.16.158.179', '130.217.226.80', '198.35.26.96', '199.16.158.168', '199.16.158.168', '204.79.197.200', '134.170.188.221', '108.160.172.232', '108.160.172.232'
BYTES_OUT = 434, 2345, 34768, 37753, 2233
BYTES_IN = 473, 1233, 23473, 12473, 123473
NUM_PACKETS = 20, 100, 500, 2000
MIN = 1433133643	# 1st June
MAX = 1439613643	# 15th August

# Downloader
#MACS = '00:19:b9:19:6e:0c',
#BYTES_OUT = 434, 2345, 2233
#BYTES_IN = 23473, 123473
#MIN = 1436493162	# 10th Jul
#MAX = 1436493162	# 10th July


# Uploader
#MACS = '00:1b:21:4b:0a:8c',
#BYTES_OUT = 34768, 37753,
#BYTES_IN = 473, 1233, 12473,
#MIN = 1435676679 	# 30th June
#MAX = 1438912362	# 7th August


#MACS = '00:30:48:66:a8:ba',			# Dave
#MACS = '68:05:ca:16:1c:f8',			# Eve
#MACS = '01:00:5e:00:00:0c',			# -



def generate(num):
	cnx = MySQLdb.connect('localhost', 'root', 'dbroot', 'flows_db')
	cursor = cnx.cursor()   # handler for inserting/updating

	i = 0
	while (i < int(num)):

		new_min = randint(MIN, MAX)
		new_max = randint(new_min, new_min + 3600)
		protocol = PROTOCOLS[randint(0, len(PROTOCOLS) - 1)]
		direction = DIRECTION[randint(0, 2)]
		if direction == OUTGOING:
			mac_src = MACS[randint(0, len(MACS) - 1)]
			mac_dst = ""
			ip_src = ""
			ip_dst = EXTERNAL_IPS[randint(0, len(EXTERNAL_IPS) - 1)]
			#bytes_in = BYTES_OUT[randint(0, len(BYTES_OUT) - 1)]
			bytes_in = BYTES_OUT[randint(0, len(BYTES_OUT) - 1)] * NUM_PACKETS[randint(0, len(NUM_PACKETS) - 1)]
		else:
			mac_src = ""
			mac_dst = MACS[randint(0, len(MACS) - 1)]
			ip_src = EXTERNAL_IPS[randint(0, len(EXTERNAL_IPS) - 1)]
			ip_dst = ""
			#bytes_in = BYTES_IN[randint(0, len(BYTES_IN) - 1)]
			bytes_in = BYTES_IN[randint(0, len(BYTES_IN) - 1)] * NUM_PACKETS[randint(0, len(NUM_PACKETS) - 1)]
		port_src = PORTS[randint(0, len(PORTS) - 1)]
		port_dst = PORTS[randint(0, len(PORTS) - 1)]
		if direction == 0:
			packets_in = 3727.8039
		else:
			packets_in = 8727
		flows = randint(0, 10)
		application = APPLICATIONS[randint(0, len(APPLICATIONS) - 1)]
		
		values = (new_min, new_max, protocol, direction, mac_src, mac_dst, ip_src, ip_dst, port_src, port_dst, packets_in, bytes_in, application, flows)
		cursor.execute('INSERT INTO flows (time_start, time_end, protocol, direction, mac_src, mac_dst, ip_src, ip_dst, port_src, port_dst, packets_in, bytes_in, application, flows) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', values)
		cnx.commit()

		#print(values)

		i += 1

	cursor.close()
	cnx.close()


if __name__ == '__main__':
	num = 0
	argv = sys.argv[1:]
	try:
		opts, args = getopt.getopt(argv, "hi:n:", ["num="])
	except getopt.GetoptError:
		print('usage: test.py -n <num>')
		sys.exit(2)
	if len(sys.argv) == 1:
		print('usage: test.py -n <num>')
		sys.exit(2)
	for opt, arg in opts:
		if opt == '-h':
			print('usage: test.py -n <num>')
			sys.exit()
		elif opt in ("-n", "--num"):
			num = arg
	if num == 0:
		sys.exit(2)
	generate(num)