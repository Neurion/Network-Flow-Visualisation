from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, HttpRequest
from django.db.models import Max, Min, Sum, Count, Q
from django.core import serializers
from django.views.generic.edit import UpdateView
from calendar import monthrange
from visualise.models import Flow, Host
import json, time, datetime

from django.views.decorators.csrf import ensure_csrf_cookie

#data = serializers.serialize("json", ret)
#data = json.dumps(ret)

class SECONDS():
	HOURLY 	= 3600000
	DAILY 	= 86400000
	WEEKLY	= 604800000
	MONTHLY = 2628000000

class INTERVAL():
	HOURLY 	= 'hourly'
	DAILY 	= 'daily'
	MONTHLY = 'monthly'

class DIRECTION():
	INCOMING = 0
	OUTGOING = 1

def get_relevant_flows(request):
	"""
	Returns a queryset based on the filter values.
	"""

	mac = request.POST.get('mac')
	direction = request.POST.get("direction")
	port_src = int(request.POST.get("port_source"))
	port_dst = int(request.POST.get("port_destination"))
	interval_type = request.POST.get("interval_type")

	interval_start = request.POST.get("interval_start")
	if interval_start != -1:
		interval_start = int(request.POST.get("interval_start"))

	interval_end = request.POST.get("interval_end")
	if interval_end != -1:
		interval_end = int(request.POST.get("interval_end"))	
	interval_month = request.POST.get("interval_month")
	interval_day = request.POST.get("interval_day")
	interval_hour = request.POST.get("interval_hour")
	application = request.POST.get("application")

	data = Flow.objects.all()

	# Interval
	if interval_start != -1 and interval_end != -1:
		data = data.filter(time_start__gte=interval_start).filter(time_end__lte=interval_end)

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

@ensure_csrf_cookie
def index(request):
	return render(request, 'visualise/index.html')

@ensure_csrf_cookie
def get_flows_info(request):
	"""
	Returns the number of devices, the earliest timestamp and the latest timestamp of the flows to be displayed.
	If a mac address is given as a POST argument, the values returned are specific to that device.
	"""
	if request.is_ajax():
		
		time_earliest = None
		time_latest = None
		mac = request.POST.get('mac')

		if mac == 'all':
			mac = ''
		data = Flow.objects.all()

		# Names
		names = {}

		# MAC's
		macs = list(data.filter(direction=DIRECTION.OUTGOING).values_list('mac_src', flat=True).distinct())
		for m in macs:
			try:
				names[m] = Host.objects.get(mac=m).name
			except Host.DoesNotExist:
				pass

		# Interval
		time_earliest = data.aggregate(Min('time_start', distinct=True))['time_start__min']
		time_latest = data.aggregate(Max('time_end', distinct=True))['time_end__max']

		# Bytes
		bytes_downloaded = data.filter(direction=DIRECTION.INCOMING).aggregate(Sum('bytes_in'))['bytes_in__sum']
		bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING).aggregate(Sum('bytes_in'))['bytes_in__sum']

		ret = {
			'names': names,
			'macs': macs,
			'timestamp_earliest': time_earliest,
			'timestamp_latest': time_latest,
			'bytes_downloaded': bytes_downloaded,
			'bytes_uploaded': bytes_uploaded,
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

def get_devices_usage(request):
	"""
	Returns the bytes downloaded and uploaded by each device, ordered from highest to lowest.
	"""
	if request.is_ajax():
		ret = []
		ret_downloaded = []
		ret_uploaded = []
		downloaded_data = Flow.objects.all().filter(direction=DIRECTION.INCOMING).values('mac_dst').distinct().annotate(total_bytes=Sum('bytes_in')).order_by('-total_bytes')		
		uploaded_data = Flow.objects.all().filter(direction=DIRECTION.OUTGOING).values('mac_src').distinct().annotate(total_bytes=Sum('bytes_in')).order_by('-total_bytes')
		i = 0
		while i < 10:
			ret_downloaded.append([downloaded_data[i]["mac_src"], downloaded_data[i]["total_bytes"]])
			ret_uploaded.append([uploaded_data[i]["mac_src"], uploaded_data[i]["total_bytes"]])
			i += 1
		ret.append(ret_downloaded)
		ret.append(ret_uploaded)
		return HttpResponse(json.dumps(ret), content_type='application/json')		

def get_usage_timeline(request):
	if request.is_ajax():
		data = get_relevant_flows(request)
		ret = []
		ret_downloaded = []
		ret_uploaded = []
		interval_type = request.POST.get('interval_type')

		interval_year = request.POST.get('interval_year')
		if interval_year != -1:
			interval_year = int(request.POST.get('interval_year'))

		interval_month = request.POST.get('interval_month')
		if interval_month != -1:
			interval_month = int(request.POST.get('interval_month')) + 1	# Javascript month is 0-based, Python month is 1-based.

		interval_day = request.POST.get('interval_day')
		if interval_day != -1:
			interval_day = int(request.POST.get('interval_day')) + 1	# Javascript day is 0-based, Python day is 1-based.

		interval_hour = request.POST.get('interval_hour')
		if interval_hour != -1:
			interval_hour = int(request.POST.get('interval_hour'))	# Python hour is 0-based for hours.

		epoch_date = datetime.datetime(1970, 1, 1)

		if interval_type == INTERVAL.MONTHLY:		# Days: Bytes
			current_day = 1
			total_days = monthrange(interval_year, interval_month)[1]
			while current_day < total_days:
				initial_date = datetime.datetime(interval_year, interval_month, current_day)
				final_date = datetime.datetime(interval_year, interval_month, current_day + 1)
				start_ts = (initial_date - epoch_date).total_seconds()
				end_ts = (final_date - epoch_date).total_seconds()
				bytes_downloaded = data.filter(direction=DIRECTION.INCOMING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]						
				ret_downloaded.append([start_ts * 1000, bytes_downloaded])
				ret_uploaded.append([start_ts * 1000, bytes_uploaded])
				current_day += 1		
		elif interval_type == INTERVAL.DAILY:		# Hour: Bytes
			current_hour = 1
			total_hours = 23
			while current_hour < total_hours:
				initial_date = datetime.datetime(interval_year, interval_month, interval_day, current_hour)
				final_date = datetime.datetime(interval_year, interval_month, interval_day, current_hour + 1)
				start_ts = (initial_date - epoch_date).total_seconds()
				end_ts = (final_date - epoch_date).total_seconds()
				bytes_downloaded = data.filter(direction=DIRECTION.INCOMING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]										
				ret_downloaded.append([start_ts * 1000, bytes_downloaded])
				ret_uploaded.append([start_ts * 1000, bytes_uploaded])
				current_hour += 1

		#elif interval_type == INTERVAL.HOURLY:		# Minutes: Bytes

		#test = (epoch_date - datetime.datetime(interval_year, interval_month, 0)).total_seconds()

		ret.append(ret_downloaded)
		ret.append(ret_uploaded)
		return HttpResponse(json.dumps(ret), content_type='application/json')

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