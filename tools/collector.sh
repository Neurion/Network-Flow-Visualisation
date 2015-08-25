#!/bin/bash
tools_dir='/usr/local/bin/'
nfv_dir='/opt/nfv/'
flows_dir=$nfv_dir'flows/'
valid=0
config_file=$1

ip='0.0.0.0'

if [[ ! -f $1 ]];
then
	echo config_file" does not exist."
	exit
fi

while read line; do
	if [[ "$line" != \#* ]];
	then
		a=($line)
		if [[ ${a[0]} == 'exporter_ip' ]]
		then
			if [[ ${a[1]} =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]
			then
				ip=${a[1]}
			fi
		elif [[ ${a[0]} == 'exporter_port' ]]
		then
			port=${a[1]}
		elif [[ ${a[0]} == 'device_mac' ]]
		then
			mac=${a[1]}
		fi
	fi
done < $config_file

if [ $valid -eq 0 ]
then
	echo 'Exporter MAC: '$mac
	echo 'Listening on: '$ip
	echo 'Port: '$port
	collector="nfcapd -b ${ip} -p ${port} -l ${flows_dir} -T 10,11,16 -t 60 -x \"${tools_dir}nfdump.sh %d%f $mac\" -E"
	# -D'
	echo $collector
	eval $collector
else
	echo 'Invalid configuration.'
fi
