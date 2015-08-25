#!/bin/bash

if [ "$#" -ne 2 ]
then
	echo 'Usage: nfdump.sh <input file> <MAC address>'
	exit 1
fi

nfdump="nfdump -N -a -r "$1" -o \"fmt: %ts %te %pr %ismc %idmc %sa %da %sp %dp %fl %ipkt %ibyt \""

parser=" | /opt/network_flow_visualization/parse_nfdump.py "$2

# Call nfdump and pipe output into the parsing script
call=$nfdump$parser
echo $call
eval $call

# Delete the file
#echo "deleting file "$1
#eval "rm "$1

echo "done."
