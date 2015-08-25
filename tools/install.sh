nfv_dir='/opt/nfv'
if [[ -d $nfv_dir ]];
then
	echo "Directory already exists."
	exit
fi

echo 'Creating nfv directory...'
mkdir /opt/nfv
echo "done."

echo "Creating nfv/flows directory..."
mkdir /opt/nfv/flows
echo "done."