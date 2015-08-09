#!/bin/bash

one="CALLING call_nfdump.sh"
two="File:"$1
format="-o \"fmt: %ts %te %pr %in %ismc %odmc %sa %da %sp %dp %ipkt %ibyt\" -a "
nfdump="nfdump -r "$1" "$format

parser=" | /root/nfv_collector/parse_nfdump.py "

call=$nfdump$parser
echo $call
eval $call

echo "deleting file "$1
eval "rm "$1
echo "done."
