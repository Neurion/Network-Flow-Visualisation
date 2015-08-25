#!/usr/bin/python3

# Program for receiving nfdump output and saving to database 'flows_db' in table 'flows'.

import os, MySQLdb, sys, calendar, time, re, math

def processNfdump(flow):
	flow = flow.strip()
	flow = re.split('\s+', flow)
	#print(flow)
	fields = {}
	cur = 0
	mac = sys.argv[1]
	#print('device MAC: ', mac)

	fields['time_start'] = calendar.timegm(time.strptime(flow[cur] + " " + flow[cur+1], '%Y-%m-%d %H:%M:%S.%f'))
	cur += 2
	#print('time_start: ', fields['time_start'])

	fields['time_end'] = calendar.timegm(time.strptime(flow[cur] + " " + flow[cur+1], '%Y-%m-%d %H:%M:%S.%f'))
	cur += 2
	#print('time_end: ', fields['time_end'])

	fields['protocol'] = parseString(flow[cur])
	cur += 1
	#print("protocol: ", fields['protocol'])

	fields['mac_src'] = parseString(flow[cur])
	cur += 1
	#print('mac_src: ', fields['mac_src'])

	fields['mac_dst'] = parseString(flow[cur])
	cur += 1
	#print('mac_dst', fields['mac_dst'])

	fields['ip_src'] = parseString(flow[cur])
	cur += 1
	#print('ip_src: ', fields['ip_src'])

	fields['ip_dst'] = parseString(flow[cur])
	cur += 1
	#print('ip_dst: ', fields['ip_dst'])

	fields['port_src'] = parseInt(flow[cur])
	cur += 1
	#print('port_src: ', fields['port_src'])

	fields['port_dst'] = parseInt(flow[cur])
	cur += 1
	#print('port_dst: ', fields['port_dst'])

	fields['flows'] = parseInt(flow[cur])
	cur += 1

	fields['packets_in'] = parseInt(flow[cur])
	cur += 1
	#print('packets_in: ', fields['packets_in'])

	# Get input bytes
	fields['bytes_in'] = float(flow[cur])
	cur += 1
	
	# if this is an ingress flow, save the destination MAC address and save to the ingress flows table.
	if fields['mac_src'] == mac: 
		fields['direction'] = 1
	# else this is an egress flow so save the source MAC address and save to the egress flows table.
	elif fields['mac_dst'] == mac:
		fields['direction'] = 0
	else:
		fields['direction'] = -1

	#print('ADDED FLOW.', end='\n')
	print(fields)
	saveFlow(fields)

def parseString(str):
	return str.strip()

def parseInt(str):
	return int(float(parseString(str)))

def parseFloat(str):
	return float(parseString(str))

def saveFlow(fields):
	values = (fields['time_start'], fields['time_end'], fields['protocol'], fields['direction'], fields['mac_src'], fields['mac_dst'], fields['ip_src'], fields['ip_dst'], fields['port_src'], fields['port_dst'], fields['packets_in'], fields['bytes_in'], fields['flows'])
	cursor.execute('INSERT INTO ipfix_flows (time_start, time_end, protocol, direction, mac_src, mac_dst, ip_src, ip_dst, port_src, port_dst, packets_in, bytes_in, flows) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', values)
	cnx.commit()

def readLog():
	#print("Number of arguments: ", len(sys.argv))
	#print("Argument list: ", str(sys.argv))
	line = sys.stdin.readline()
	count = 0
	while not line == "":
		if line.strip()[0].isdigit():
			processNfdump(line)
			count += 1
		line = sys.stdin.readline()
		print(count, end='\r')
	print("Inserted ", count, " flows.", end="\n")

if __name__ == '__main__':
	if(len(sys.argv) != 2):
		print('Usage: parse_nfdump <MAC address>')
		exit(1)
	print("PARSING...", end="\n")
	cnx = MySQLdb.connect('localhost', 'root', 'dbroot', 'flows_db')
	cursor = cnx.cursor()   # handler for inserting/updating
	readLog()
	cursor.close()
	cnx.close()
	print("...done.", end="\n")
