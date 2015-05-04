from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, HttpRequest
from django.db.models import Max, Min, Sum

from visualise.models import Flow

import json


def index(request):

	packets_all = Flow.objects.all().order_by('timestamp')

	# Filter options from the POST request
	f_interval = ""
	f_ingress = ""
	f_egress = ""
	f_source_port = ""

	isValid = False;

	# If the filter has been applied, query flows according to filter options
	if request.method == 'POST':
		f_interval = request.POST.get("time_interval", "")
		f_ingress = request.POST.get("check_ingress", "")
		f_egress = request.POST.get("check_egress", "")
		f_source_port = request.POST.get("text_port", "")
		if isNum(f_source_port):
			isValid = True;
			# Make the filtered query
			packets_all = Flow.objects.all().order_by('timestamp').filter(source_port=f_source_port)

	# Else query all flows
	if isValid is False:
		packets_all = Flow.objects.all().order_by('timestamp')	# Get packets in ascending order

	# Get Dictionaries of min and max timestamps
	time_oldest = packets_all.aggregate(Min('timestamp'))["timestamp__min"]
	time_newest = packets_all.aggregate(Max('timestamp'))["timestamp__max"]

	bytes_downloaded = packets_all.aggregate(Sum('bytes_size'))
	bytes_uploaded = packets_all.aggregate(Sum('bytes_size'))

	# Get a List of distinct MAC source addresses of outgoing traffic	
	source_macs = packets_all.order_by().values_list('mac_src', flat=True).distinct()

	macs_bytes = [] # List of bytes sent for each source MAC

	for mac in source_macs:
		# Get Dictionary of sent bytes of each source mac address
		num = packets_all.filter(mac_src=mac).aggregate(Sum('bytes_size'))
		macs_bytes.append(num["bytes_size__sum"])

	# Protocol counts
	tcp_count = Flow.objects.extra(where=["protocol=6"]).count		
	udp_count = Flow.objects.extra(where=["protocol=17"]).count







	#if request.method == 'POST':
	#	form = TestForm(request.POST)
	#else:
	#	form = TestForm()

	context = {'packets_list': packets_all,
				'time_oldest': time_oldest,
				'time_newest': time_newest,
				'source_macs': source_macs,
				'tcp_count': tcp_count,
				'udp_count': udp_count,
				'macs_bytes': macs_bytes,
				'bytes_downloaded': bytes_downloaded,
				'bytes_uploaded': bytes_uploaded,
				#'form': form,
				'f_interval': f_interval,
				'f_ingress': f_ingress,
				'f_egress': f_egress,
				'f_source_port': f_source_port,
				}



	return render(request, 'visualise/index.html', context)	




def isNum(data):
	try:
		int(data)
		return True
	except ValueError:
		return False