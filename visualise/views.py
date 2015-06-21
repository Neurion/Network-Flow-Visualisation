from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, HttpRequest
from django.db.models import Max, Min, Sum
from django.core import serializers
from visualise.models import IngressFlow, EgressFlow
import json

#data = serializers.serialize("json", ret)
#data = json.dumps(ret)

class INTERVAL():
	HOURLY = 3600000
	DAILY = 86400000
	WEEKLY = 604800000
	MONTHLY = 2628000000


def index(request):

	ingress_all = IngressFlow.objects.all().order_by('time_start')
	egress_all = EgressFlow.objects.all().order_by('time_start')

	# Filter options from the POST request
	f_interval = ""
	f_ingress = ""
	f_egress = ""
	f_source_port = ""

	# Generic network information
	n_time_oldest = ""
	n_time_newest = ""
	n_bytes_downloaded = ""
	n_bytes_uploaded = ""
	#n_device_macs = []
	n_protocols = {}

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
			ingress_all = IngressFlow.objects.all().order_by('time_start').filter(source_port=f_source_port)

	# Else query all flows
	if isValid is False:
		ingress_all = IngressFlow.objects.all()#.order_by('time_start')	# Get packets in ascending order

	n_bytes_downloaded = ingress_all.aggregate(Sum('bytes_in'))
	n_bytes_uploaded = ingress_all.aggregate(Sum('bytes_in'))

	# Get a List of distinct MAC addresses of outgoing traffic
	n_device_macs = ingress_all.order_by().values_list('mac_dst', flat=True).distinct()

	#macs_bytes = [] # List of bytes sent for each source MAC

	#for mac in n_device_macs:
		# Get Dictionary of sent bytes of each source mac address
		#num = ingress_all.filter(mac_src=mac).aggregate(Sum('bytes_in'))
		#macs_bytes.append(num["bytes_in__sum"])

	# Protocol counts
	n_protocols["TCP"] = IngressFlow.objects.extra(where=['protocol="TCP"']).count #+ EgressFlow.objects.extra(where=['protocol="TCP"']).count
	n_protocols["UDP"] = IngressFlow.objects.extra(where=['protocol="UDP"']).count #+ EgressFlow.objects.extra(where=['protocol="UDP"']).count
	n_protocols["ICMP"] = IngressFlow.objects.extra(where=['protocol="ICMP"']).count #+ EgressFlow.objects.extra(where=['protocol="ICMP"']).count

	context = {
				'n_device_macs': n_device_macs,
			}



	return render(request, 'visualise/index.html', context)


def get_usage(request):
	if request.is_ajax():
		filterValues = getFilterValues(request)
		usage = {}
		downBytes = EgressFlow.objects.aggregate(Sum('bytes_in'))
		usage["downloaded"] = downBytes["bytes_in__sum"]
		upBytes = IngressFlow.objects.aggregate(Sum('bytes_in'))
		usage["uploaded"] = upBytes["bytes_in__sum"]
		usage = json.dumps(usage)
		return HttpResponse(usage, content_type='application/json')


# Returns 3 lists; protocols, downloaded and uploaded.
def get_protocols(request):
	if request.is_ajax():
		filterValues = getFilterValues(request)
		data = IngressFlow.objects.values_list('protocol').distinct()
		protocols = []
		bytes = []
		ret = {}

		if filterValues["direction"] == "all":	
			for i in data:
				protocols.append(i[0])
				b1 = IngressFlow.objects.filter(protocol=i[0]).aggregate(Sum('bytes_in'))
				b2 = EgressFlow.objects.filter(protocol=i[0]).aggregate(Sum('bytes_in'))
				bytes.append(b1["bytes_in__sum"] + b2["bytes_in__sum"])
		elif filterValues["direction"] == "ingress":
			for i in data:
				protocols.append(i[0])
				b1 = IngressFlow.objects.filter(protocol=i[0]).aggregate(Sum('bytes_in'))
				bytes.append(b1["bytes_in__sum"])
		elif filterValues["direction"] == "egress":
			for i in data:
				protocols.append(i[0])
				b1 = EgressFlow.objects.filter(protocol=i[0]).aggregate(Sum('bytes_in'))			
				bytes.append(b1["bytes_in__sum"])
			
		ret["bytes"] = bytes
		ret["protocols"] = protocols

		ret = json.dumps(ret)
		return HttpResponse(ret, content_type='application/json')


def get_timeline(request):
	if request.is_ajax():
		filterValues = getFilterValues(request)
		ret = {}
		if request.POST.get('interval') == 'hourly':
			ret["earliest"] = ingress_all.aggregate(Min('time_start'))["time_start__min"]
			ret["latest"] = ingress_all.aggregate(Max('time_end'))["time_end__max"]		
		#elif request.POST.get('interval') == 'weekly':
		#elif request.POST.get('interval') == 'monthly':
		#else: # default is daily.
		ret = json.dumps(ret)
		return HttpResponse(ret, content_type='application/json')


def get_flows(request):
	if request.is_ajax():
		amount = request.POST.get('count')
		flows = []
		flows = json.dumps(flows)
		return HttpResponse(flows, content_type='application/json')	


def getFilterValues(request):
	vals = {}
	vals["device"] = request.POST.get('device')
	vals["direction"] = request.POST.get('direction')
	vals["port"] = request.POST.get('port')
	vals["port"] = request.POST.get('application')
	return vals


def isNum(data):
	try:
		int(data)
		return True
	except ValueError:
		return False