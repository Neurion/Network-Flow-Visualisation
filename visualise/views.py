from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, HttpRequest
from django.db.models import Max, Min, Sum, Count, Q
from django.core import serializers
from django.views.generic.edit import UpdateView
from calendar import monthrange
from visualise.models import Flow, Host
import json, time, datetime

from django.views.decorators.csrf import ensure_csrf_cookie

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
	#interval = request.POST.get("interval")
	start_ts = request.POST.get("time_start")
	end_ts = request.POST.get("time_end")
	application = request.POST.get("application")
	data = Flow.objects.all()

	# Interval
	if start_ts != -1 and end_ts != -1:
		data = data.filter(time_start__gte=start_ts, time_end__lte=end_ts)

	# Mac
	if mac != "all":
		data = data.filter(Q(mac_src=mac) | Q(mac_dst=mac))		# OR

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
def get_meta_data(request):
	"""
	Returns the number of devices, the earliest timestamp and the latest timestamp of the flows to be displayed.
	If a mac address is given as a POST argument, the values returned are specific to that device.
	"""
	if request.is_ajax():

		data = Flow.objects.all()

		# Interval
		time_earliest = data.aggregate(Min('time_start', distinct=True))['time_start__min']
		time_latest = data.aggregate(Max('time_end', distinct=True))['time_end__max']

		# Bytes
		bytes_downloaded = data.filter(direction=DIRECTION.INCOMING).aggregate(Sum('bytes_in'))['bytes_in__sum']
		bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING).aggregate(Sum('bytes_in'))['bytes_in__sum']

		ret = {
			'time_earliest': time_earliest,
			'time_latest': time_latest,
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
		interval = request.POST.get('interval')

		year = request.POST.get('year')
		if year != -1:
			year = int(request.POST.get('year'))

		month = request.POST.get('month')
		if month != -1:
			month = int(request.POST.get('month')) + 1	# Javascript month is 0-based, Python month is 1-based.

		day = request.POST.get('day')
		if day != -1:
			day = int(request.POST.get('day')) + 1	# Javascript day is 0-based, Python day is 1-based.

		hour = request.POST.get('hour')
		if hour != -1:
			hour = int(request.POST.get('hour'))	# Python hour is 0-based for hours.

		epoch_date = datetime.datetime(1970, 1, 1)

		if interval == INTERVAL.MONTHLY:		# Days: Bytes
			current_day = 1
			total_days = monthrange(year, month)[1]
			while current_day < total_days:
				initial_date = datetime.datetime(year, month, current_day)
				final_date = datetime.datetime(year, month, current_day + 1)
				start_ts = (initial_date - epoch_date).total_seconds()
				end_ts = (final_date - epoch_date).total_seconds()
				bytes_downloaded = data.filter(direction=DIRECTION.INCOMING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]						
				ret_downloaded.append([start_ts * 1000, bytes_downloaded])
				ret_uploaded.append([start_ts * 1000, bytes_uploaded])
				current_day += 1		
		elif interval == INTERVAL.DAILY:		# Hour: Bytes
			current_hour = 1
			total_hours = 23
			while current_hour < total_hours:	# hours 00:00-01:00 to 22:00-23:00
				initial_date = datetime.datetime(year, month, day, current_hour)
				final_date = datetime.datetime(year, month, day, current_hour + 1)
				start_ts = (initial_date - epoch_date).total_seconds()
				end_ts = (final_date - epoch_date).total_seconds()
				bytes_downloaded = data.filter(direction=DIRECTION.INCOMING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]										
				ret_downloaded.append([start_ts * 1000, bytes_downloaded])
				ret_uploaded.append([start_ts * 1000, bytes_uploaded])
				current_hour += 1
			# hour 23:00 - 00:00 of next day
			initial_date = datetime.datetime(year, month, day, current_hour)
			final_date = datetime.datetime(year, month, day + 1, 0)
			start_ts = (initial_date - epoch_date).total_seconds()
			end_ts = (final_date - epoch_date).total_seconds()
			bytes_downloaded = data.filter(direction=DIRECTION.INCOMING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]
			bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]										
			ret_downloaded.append([start_ts * 1000, bytes_downloaded])
			ret_uploaded.append([start_ts * 1000, bytes_uploaded])			
		elif interval == INTERVAL.HOURLY:		# Minutes: Bytes
			current_minute = 0
			total_minutes = 59
			while current_minute < total_minutes:
				initial_date = datetime.datetime(year, month, day, hour, current_minute)
				final_date = datetime.datetime(year, month, day, hour, current_minute + 1)
				start_ts = (initial_date - epoch_date).total_seconds()
				end_ts = (final_date - epoch_date).total_seconds()
				bytes_downloaded = data.filter(direction=DIRECTION.INCOMING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING, time_start__gte=start_ts, time_end__lte=end_ts).aggregate(Sum('bytes_in'))["bytes_in__sum"]						
				ret_downloaded.append([start_ts * 1000, bytes_downloaded])
				ret_uploaded.append([start_ts * 1000, bytes_uploaded])
				current_minute += 1
		#test = (epoch_date - datetime.datetime(year, month, 0)).total_seconds()

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

def get_filter_values(request):
	ret = []	
	ret_macs = []
	ret_names = []
	ret_interval = []
	# MAC's
	ret_macs = list(Flow.objects.all().filter(direction=DIRECTION.OUTGOING).values_list('mac_src', flat=True).distinct())
	ret.append(ret_macs)
	# Names
	ret_names = {}
	for m in ret_macs:
		try:
			ret_names[m] = Host.objects.get(mac=m).name
		except Host.DoesNotExist:
			pass
	ret.append(ret_names)
	# Interval
	time_earliest = Flow.objects.all().aggregate(Min('time_start', distinct=True))['time_start__min']
	ret_interval.append(time_earliest)
	time_latest = Flow.objects.all().aggregate(Max('time_end', distinct=True))['time_end__max']
	ret_interval.append(time_latest)
	ret.append(ret_interval)
	return HttpResponse(json.dumps(ret), content_type='application/json')	

def isNum(data):
	try:
		int(data)
		return True
	except ValueError:
		return False