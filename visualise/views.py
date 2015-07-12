from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, HttpRequest
from django.db.models import Max, Min, Sum, Count, Q
from django.core import serializers
from django.views.generic.edit import UpdateView
from visualise.models import Flow, Host
import json, time

#data = serializers.serialize("json", ret)
#data = json.dumps(ret)

class INTERVAL():
	HOURLY 	= 3600000
	DAILY 	= 86400000
	WEEKLY	= 604800000
	MONTHLY = 2628000000

class DIRECTION():
	INCOMING = 0
	OUTGOING = 1

def index(request):
	return render(request, 'visualise/index.html')

def get_flows_info(request):
	"""
	Returns the number of devices, the earliest timestamp and the latest timestamp of the flows to be displayed.
	If a mac address is given as a POST argument, the values returned are specific to that device.
	"""
	if request.is_ajax():
		
		names = {}
		macs = list(Flow.objects.filter(direction=DIRECTION.OUTGOING).values_list('mac_src', flat=True).distinct())

		for m in macs:
			try:
				names[m] = Host.objects.get(mac=m).name
			except Host.DoesNotExist:
				pass

		data = get_relevant_flows(request)

		time_earliest = None
		time_latest = None
		mac = request.POST.get('mac')

		if mac == 'all':
			mac = ''

		if mac is not '' and mac is not None:	# Info about all flows			
			time_earliest = data.filter(mac_src=mac).aggregate(Min('time_start', distinct=True))['time_start__min']
			time_latest = data.filter(mac_src=mac).aggregate(Max('time_end', distinct=True))['time_end__max']				
		else:			# Info about flows specific to the device
			time_earliest = data.aggregate(Min('time_start', distinct=True))['time_start__min']
			time_latest = data.aggregate(Max('time_end', distinct=True))['time_end__max']

		ret = {
			'names': names,
			'macs': macs,
			'timestamp_earliest': time_earliest,
			'timestamp_latest': time_latest,
		}

		return HttpResponse(json.dumps(ret), content_type='application/json')

def get_usage(request):
	if request.is_ajax():
		data = get_relevant_flows(request)
		ret = {}
		downBytes = data.filter(direction=DIRECTION.INCOMING).aggregate(Sum('bytes_in'))["bytes_in__sum"]		
		upBytes = data.filter(direction=DIRECTION.OUTGOING).aggregate(Sum('bytes_in'))["bytes_in__sum"]
		ret["downloaded"] = downBytes
		ret["uploaded"] = upBytes

		return HttpResponse(json.dumps(ret), content_type='application/json')


# Returns 3 lists; protocols, downloaded and uploaded.
def get_protocols(request):	
	if request.is_ajax():
		data = get_relevant_flows(request)		
		protocols = data.values_list('protocol').distinct()

		ret = {}
		ret["protocols"] = []
		ret["bytes"] = []

		for i in protocols:	# Get all rows of specified protocol
			ret["protocols"].append(i[0])
			b = data.filter(protocol=i[0]).aggregate(Sum('bytes_in'))["bytes_in__sum"]
			ret["bytes"].append(b)

		return HttpResponse(json.dumps(ret), content_type='application/json')

def get_upload_timeline(request):
	if request.is_ajax():
		time_current = time.time()		# timestamp of current time
		time_earliest = ""
		data = []
		time_earliest = time_current - INTERVAL.DAILY
		if filterValues['direction'] == 'ingress':
			ingress_all.objects.order_by('time_start')
		time_threshold_lower = time_earliest
		time_threshold_upper = time_earliest + INTERVAL.HOURLY
		while time_threshold_upper <= time_current:
			block = Flow.objects.filter(direction=DIRECTION.INCOMING).filter(time_start__range=[time_threshold_lower, time_threshold_upper])
			by = block.aggregate(Sum('bytes_in'))['bytes_in__sum']
			data.append([time_threshold_lower, by])		# [timeslice, bytes downloaded]
			time_threshold_lower = time_threshold_upper
			time_threshold_upper += INTERVAL.HOURLY
		data = json.dumps(data)
		return HttpResponse(data, content_type='application/json')


def get_download_timeline(request):
	if request.is_ajax():
		data = get_relevant_flows(request)
		time_earliest = time_current - INTERVAL.DAILY
		time_current = time.time()		# timestamp of current time
		ret = []

		time_threshold_lower = request.POST.get('')
		time_threshold_upper = time_earliest + INTERVAL.HOURLY
		while time_threshold_upper <= time_current:
			block = Flow.objects.filter(direction=DIRECTION.OUTGOING).filter(time_start__range=[time_threshold_lower, time_threshold_upper])
			bytes = block.aggregate(Sum('bytes_in'))['bytes_in__sum']
			ret.append([time_threshold_lower, bytes])		# [timeslice, bytes downloaded]
			time_threshold_lower = time_threshold_upper
			time_threshold_upper += INTERVAL.HOURLY
		ret = json.dumps(ret)
		return HttpResponse(ret, content_type='application/json')


def get_relevant_flows(request):
	"""
	Returns a queryset based on the filter values.
	"""

	mac = request.POST.get('mac')
	direction = request.POST.get("direction")
	port_src = int(request.POST.get("port_source"))
	port_dst = int(request.POST.get("port_destination"))
	interval_start = request.POST.get("interval_start")
	interval_end = request.POST.get("interval_end")

	data = Flow.objects

	# Mac
	if mac != "all":
		data = data.filter(Q(mac_src=mac) | Q(mac_dst=mac))

	# Direction
	if direction == "ingress":
		data = data.filter(direction=DIRECTION.INCOMING)
	elif direction == "egress":
		data = data.filter(direction=DIRECTION.OUTGOING)

	# Port
	if port_src != -1:
		data = data.filter(port_src=port_src)

	if port_dst != -1:
		data = data.filter(port_dst=port_dst)

	return data

def save_host_name(request):
	mac = request.POST.get('mac')
	name = request.POST.get('name')
	host = None
	try:
		host = Host.objects.get(mac=mac)
		host.name = name
	except Host.DoesNotExist:
		host = Host(mac=mac, name=name)
	host.save()
	return HttpResponse('')

def isNum(data):
	try:
		int(data)
		return True
	except ValueError:
		return False