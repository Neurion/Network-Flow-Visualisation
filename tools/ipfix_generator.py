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
MACS = '90:e2:ba:48:b8:90', '90:e2:ba:48:b8:90', '90:e2:ba:48:b8:90', '00:30:48:66:a8:ba', '00:30:48:66:a8:ba', '00:30:48:66:a8:ba', '00:30:48:66:a8:ba', '00:30:48:66:a8:ba', '68:05:ca:16:1c:f8', '68:05:ca:16:1c:f8', '00:1b:21:4b:0a:8c', '00:1b:21:4b:0a:8c', '00:19:b9:19:82:a9','00:19:b9:19:6e:0c','01:00:5e:7f:ff:fa','33:33:00:00:00:0c'

def generate(num):
	cnx = MySQLdb.connect('localhost', 'root', 'dbroot', 'flows_db')
	cursor = cnx.cursor()   # handler for inserting/updating

	min = 1433133643
	max = 1439613643

	i = 0
	while (i < int(num)):

		new_min = randint(min, max)
		new_max = randint(new_min, new_min + 3600)
		protocol = PROTOCOLS[randint(0, len(PROTOCOLS) - 1)]
		direction = DIRECTION[randint(0, 2)]
		if direction == OUTGOING:
			mac_src = MACS[randint(0, len(MACS) - 1)]
			mac_dst = "anything"
			ip_src = ""
			ip_dst = ""
		else:
			mac_src = "anything"
			mac_dst = MACS[randint(0, len(MACS) - 1)]
			ip_src = ""
			ip_dst = ""
		port_src = PORTS[randint(0, len(PORTS) - 1)]
		port_dst = PORTS[randint(0, len(PORTS) - 1)]
		if direction == 0:
			packets_in = 3727.8039
		else:
			packets_in = 8727.8039
		bytes_in = 123473.7400
		flows = randint(0, 10)
		application = APPLICATIONS[randint(0, len(APPLICATIONS) - 1)]
		
		values = (new_min, new_max, protocol, direction, mac_src, mac_dst, ip_src, ip_dst, port_src, port_dst, packets_in, bytes_in, application, flows)
		cursor.execute('INSERT INTO test (time_start, time_end, protocol, direction, mac_src, mac_dst, ip_src, ip_dst, port_src, port_dst, packets_in, bytes_in, application, flows) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', values)
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