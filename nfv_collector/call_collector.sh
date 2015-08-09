#!/bin/bash

if [ $1 != 'nfcapd' ] && [ $1 != 'sfcapd' ]; then
	echo "Invalid collector. Please select nfcapd for Netflow or sfcapd for sFlow."
else
	collector=$1' -l /root/nfv_collector/collector_log/ -T 1,3,10 -t 3600 -x "/root/nfv_collector/call_nfdump.sh %d%f" -D'
	echo $collector
	eval $collector
fi
