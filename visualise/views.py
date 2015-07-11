from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, HttpRequest
from django.db.models import Max, Min, Sum, Count
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

	# Filter options from the POST request
	f_interval_range	= None
	f_interval 			= None
	f_direction 		= None
	f_source_port 		= None

	# Information to populate the controls
	c_device_macs 		= []

	data = Flow.objects.all()	# Get flows in ascending order	

	# Get a List of distinct MAC addresses of incoming (or outgoing) traffic
	c_device_macs = data.filter(direction=DIRECTION.OUTGOING).values_list('mac_src', flat=True).distinct()

	context = {
				'c_device_macs': c_device_macs,
			}

	return render(request, 'visualise/index.html', context)

def get_flows_info(request):
	"""
	Returns the number of devices, the earliest timestamp and the latest timestamp of the flows to be displayed.
	If a mac address is given as a POST argument, the values returned are specific to that device.
	"""
	if request.is_ajax():
		mac = request.POST.get('mac')
		name = None
		macs = list(Flow.objects.filter(direction=DIRECTION.OUTGOING).values_list('mac_src', flat=True).distinct())
		time_earliest = None
		time_latest = None
		if mac == 'All':
			mac = ''
		if mac is not '' and mac is not None:	# Info about all flows			
			time_earliest = Flow.objects.filter(mac_src=mac).aggregate(Min('time_start', distinct=True))['time_start__min']
			time_latest = Flow.objects.filter(mac_src=mac).aggregate(Max('time_end', distinct=True))['time_end__max']				
		else:			# Info about flows specific to the device
			time_earliest = Flow.objects.aggregate(Min('time_start', distinct=True))['time_start__min']
			time_latest = Flow.objects.aggregate(Max('time_end', distinct=True))['time_end__max']
		
		try:
			host = Host.objects.get(mac=mac)
		except Host.DoesNotExist:
			name = mac
		
		ret = {
			'name': name,
			'macs': macs,
			'timestamp_earliest': time_earliest,
			'timestamp_latest': time_latest,
		}

		ret = json.dumps(ret)
		return HttpResponse(ret, content_type='application/json')

def get_usage(request):
	if request.is_ajax():
		filterValues = get_filter_values(request)
		usage = {}
		downBytes = Flow.objects.filter(direction=DIRECTION.INCOMING).aggregate(Sum('bytes_in'))
		usage["downloaded"] = downBytes["bytes_in__sum"]
		upBytes = Flow.objects.filter(direction=DIRECTION.OUTGOING).aggregate(Sum('bytes_in'))
		usage["uploaded"] = upBytes["bytes_in__sum"]
		usage = json.dumps(usage)
		return HttpResponse(usage, content_type='application/json')


# Returns 3 lists; protocols, downloaded and uploaded.
def get_protocols(request):
	if request.is_ajax():
		filterValues = get_filter_values(request)
		data = Flow.objects.filter(direction=DIRECTION.INCOMING).values_list('protocol').distinct()
		protocols = []
		bytes = []
		ret = {}

		if filterValues["direction"] == "all":
			for i in data:	# Get all rows of specified protocol
				protocols.append(i[0])
				b1 = Flow.objects.filter(protocol=i[0]).aggregate(Sum('bytes_in'))
				bytes.append(b1["bytes_in__sum"])
		elif filterValues["direction"] == "ingress":
			for i in data:	# Get only incoming rows with specified protocol
				protocols.append(i[0])
				b1 = Flow.objects.objects.filter(direction=DIRECTION.INCOMING).filter(protocol=i[0]).aggregate(Sum('bytes_in'))
				bytes.append(b1["bytes_in__sum"])
		elif filterValues["direction"] == "egress":
			for i in data:	# Get only outoging rows with specified protocol
				protocols.append(i[0])
				b1 = Flow.objects.filter(direction=DIRECTION.OUTGOING).filter(protocol=i[0]).aggregate(Sum('bytes_in'))			
				bytes.append(b1["bytes_in__sum"])
			
		ret["bytes"] = bytes
		ret["protocols"] = protocols
		ret = json.dumps(ret)
		return HttpResponse(ret, content_type='application/json')

def get_upload_timeline(request):
	if request.is_ajax():
		filterValues = get_filter_values(request)
		time_current = time.time()		# timestamp of current time
		time_earliest = ""
		data = []
		#if request.POST.get('interval') == 'hourly':
		#	ret["earliest"] = ingress_all.aggregate(Min('time_start'))["time_start__min"]
		#	ret["latest"] = ingress_all.aggregate(Max('time_end'))["time_end__max"]
		#elif request.POST.get('interval') == 'weekly':
		#elif request.POST.get('interval') == 'monthly':
		#else: # default is daily.
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
		filterValues = get_filter_values(request)
		time_current = time.time()		# timestamp of current time
		time_earliest = ""
		data = []
		#if request.POST.get('interval') == 'hourly':
		#	ret["earliest"] = ingress_all.aggregate(Min('time_start'))["time_start__min"]
		#	ret["latest"] = ingress_all.aggregate(Max('time_end'))["time_end__max"]
		#elif request.POST.get('interval') == 'weekly':
		#elif request.POST.get('interval') == 'monthly':
		#else: # default is daily.

		time_earliest = time_current - INTERVAL.DAILY
		if filterValues['direction'] == 'ingress':
			ingress_all.objects.order_by('time_start')
		time_threshold_lower = time_earliest
		time_threshold_upper = time_earliest + INTERVAL.HOURLY
		while time_threshold_upper <= time_current:
			block = Flow.objects.filter(direction=DIRECTION.OUTGOING).filter(time_start__range=[time_threshold_lower, time_threshold_upper])
			bytes = block.aggregate(Sum('bytes_in'))['bytes_in__sum']
			data.append([time_threshold_lower, bytes])		# [timeslice, bytes downloaded]
			time_threshold_lower = time_threshold_upper
			time_threshold_upper += INTERVAL.HOURLY
		data = json.dumps(data)
		return HttpResponse(data, content_type='application/json')


def get_flows(request):
	if request.is_ajax():
		amount = request.POST.get('count')
		flows = []
		flows = json.dumps(flows)
		return HttpResponse(flows, content_type='application/json')

def get_filter_values(request):
	vals = {}
	vals["device"] = request.POST.get('device')
	vals["direction"] = request.POST.get('direction')
	vals["port"] = request.POST.get('port')
	vals["application"] = request.POST.get('application')
	return vals

def save_device_name(request):
	mac = request.POST.get('mac')
	name = request.POST.get('name')
	host = Host.objects.filter(mac=mac)
	host.name = name
	host.save()

def isNum(data):
	try:
		int(data)
		return True
	except ValueError:
		return False
'''
class HostUpdate(UpdateView):
	model = Host
	fields = ['name']
	template_name_suffix = '_update_form'
'''