from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, HttpRequest
from django.db.models import Max, Min, Sum, Count, Q, F
from django.core import serializers
from django.views.generic.edit import UpdateView
from calendar import monthrange
#from visualise.models import IpfixFlow as Flow, Host
from visualise.models import Flow as Flow, Device
import json, time, datetime, socket
from django.utils.html import strip_tags
from django.views.decorators.csrf import ensure_csrf_cookie

epoch_date = datetime.datetime(1970, 1, 1)

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

def get_filtered_data(request):
	"""
	Returns a queryset based on the filter values.
	If the MAC address is not empty, then it is used to filter for a device. If it is empty, the source IP address is used.
	"""

	device = request.POST.get('device')
	direction = request.POST.get("direction")
	port_src = request.POST.get("port_source")
	port_dst = request.POST.get("port_destination")
	start_ts = request.POST.get("ts_start")
	end_ts = request.POST.get("ts_end")
	application = request.POST.get("application")

	data = Flow.objects

	# Interval
	'''
	if isNum(start_ts) and isNum(end_ts):
		start_ts = int(start_ts)
		end_ts = int(end_ts)
		if start_ts > 0 and end_ts > 0:
			data = data.filter(time_start__gte=int(start_ts), time_end__lte=int(end_ts))
		else:
			return HttpResponse("Timestamps must be greater than 0.", content_type='plain/text')
	elif isNum(start_ts):
		start_ts = int(start_ts)
		if start_ts > 0:
			data = data.filter(time_start__gte=int(start_ts))
	elif isNum(end_ts):
		end_ts = int(end_ts)
		if end_ts > 0:
			data = data.filter(time_end__lte=int(end_ts))'''

	# Device
	if device != "All" and device != "" and device != None:
		data = data.filter(Q(mac_src=device) | Q(mac_dst=device))		# OR

	# Direction
	if direction == "incoming":
		data = data.filter(direction=DIRECTION.INCOMING)
	elif direction == "outgoing":
		data = data.filter(direction=DIRECTION.OUTGOING)

	# Application
	if application != "all" and application != "" and application != None:
		data = data.filter(application=application)

	# Ports
	if port_src != "" and port_src != None:
		port_src = int(port_src)
		data = data.filter(port_src=port_src)
	if port_dst != "" and port_dst != None:
		port_dst = int(port_dst)
		data = data.filter(port_dst=port_dst)

	return data

@ensure_csrf_cookie
def index(request):
	return render(request, 'visualise/index.html')

@ensure_csrf_cookie
def get_aggregate_data(request):
	#return HttpResponse('sdfsdf', content_type='plain/text')
	"""
	Returns generic network information: number of devices, bytes downloaded, bytes uploaded, start time, end time and top 10 domains.
	"""
	if request.is_ajax():

		applications = []
		ret_devices = []

		data = Flow.objects

		# Devices
		devs = get_devices();

		for device, name in devs:
			devData = data.filter(Q(mac_src=device) | Q(mac_dst=device))
			ts_start = devData.aggregate(Min('time_start'))['time_start__min']
			ts_end = devData.aggregate(Max('time_end'))['time_end__max']
			downloaded = devData.filter(direction=DIRECTION.INCOMING, mac_dst=device).aggregate(Sum('bytes_in'))['bytes_in__sum']
			uploaded = devData.filter(direction=DIRECTION.OUTGOING, mac_src=device).aggregate(Sum('bytes_in'))['bytes_in__sum']
			flows = devData.aggregate(Sum('flows'))["flows__sum"]
			ret_devices.append([ device, name, ts_start, ts_end, downloaded, uploaded, flows ])

		# Interval
		ts_earliest = data.aggregate(Min('time_start', distinct=True))['time_start__min']
		ts_latest = data.aggregate(Max('time_end', distinct=True))['time_end__max']

		# Bytes
		bytes_downloaded = data.filter(direction=DIRECTION.INCOMING).aggregate(Sum('bytes_in'))['bytes_in__sum']
		bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING).aggregate(Sum('bytes_in'))['bytes_in__sum']

		# Flows
		flows = data.aggregate(Sum('flows'))['flows__sum']

		# Application
		applications = []
		applications_data  = list(data.values_list('application', flat=True).distinct())
		for app in applications_data:
			application_downloaded = data.filter(direction=DIRECTION.INCOMING, application=app).aggregate(Sum('bytes_in'))["bytes_in__sum"]
			application_uploaded = data.filter(direction=DIRECTION.OUTGOING, application=app).aggregate(Sum('bytes_in'))["bytes_in__sum"]
			application_start = data.filter(application=app).aggregate(Min('time_start'))['time_start__min']
			application_end = data.filter(application=app).aggregate(Max('time_end'))['time_end__max']
			applications.append([app, application_downloaded, application_uploaded, application_start, application_end])

		ret = {
			'devices': ret_devices,
			'ts_earliest': ts_earliest,
			'ts_latest': ts_latest,
			'bytes_downloaded': bytes_downloaded,
			'bytes_uploaded': bytes_uploaded,
			'flows': flows,
			'applications': applications,
		}

		return HttpResponse(json.dumps(ret), content_type='application/json')

@ensure_csrf_cookie
def get_subset_data(request):
	"""
	Returns generic network information: number of devices, bytes downloaded, bytes uploaded, start time, end time and top 10 domains.
	"""
	if request.is_ajax():

		applications = []
		applications_bytes = []
		ret_devices = []

		data = get_filtered_data(request)

		# Devices
		if request.POST.get('device') == "All":
			devs = get_devices();
			for device, name in devs:
				devData = data.filter(Q(mac_src=device) | Q(mac_dst=device))
				ts_start = devData.aggregate(Min('time_start'))['time_start__min']
				ts_end = devData.aggregate(Max('time_end'))['time_end__max']
				downloaded = devData.filter(direction=DIRECTION.INCOMING, mac_dst=device).aggregate(Sum('bytes_in'))['bytes_in__sum']
				uploaded = devData.filter(direction=DIRECTION.OUTGOING, mac_src=device).aggregate(Sum('bytes_in'))['bytes_in__sum']
				flows = devData.aggregate(Sum('flows'))["flows__sum"]
				ret_devices.append([ device, name, ts_start, ts_end, downloaded, uploaded, flows ])
		else:
			device = request.POST.get('device')
			try:
				name = Device.objects.get(device=device).name
			except Device.DoesNotExist:
				name = None
				pass		
			devData = data.filter(Q(mac_src=device) | Q(mac_dst=device))
			ts_start = devData.aggregate(Min('time_start'))['time_start__min']
			ts_end = devData.aggregate(Max('time_end'))['time_end__max']
			downloaded = devData.filter(direction=DIRECTION.INCOMING, mac_dst=device).aggregate(Sum('bytes_in'))['bytes_in__sum']
			uploaded = devData.filter(direction=DIRECTION.OUTGOING, mac_src=device).aggregate(Sum('bytes_in'))['bytes_in__sum']
			flows = devData.aggregate(Sum('flows'))["flows__sum"]
			ret_devices.append([ device, name, ts_start, ts_end, downloaded, uploaded, flows ])

		# Interval
		ts_earliest = data.aggregate(Min('time_start', distinct=True))['time_start__min']
		ts_latest = data.aggregate(Max('time_end', distinct=True))['time_end__max']

		# Bytes
		bytes_downloaded = data.filter(direction=DIRECTION.INCOMING).aggregate(Sum('bytes_in'))['bytes_in__sum']
		bytes_uploaded = data.filter(direction=DIRECTION.OUTGOING).aggregate(Sum('bytes_in'))['bytes_in__sum']

		# Flows
		flows = data.aggregate(Sum('flows'))['flows__sum']

		# Application
		applications = []
		applications_data  = list(data.values_list('application', flat=True).distinct())
		for app in applications_data:
			application_downloaded = data.filter(direction=DIRECTION.INCOMING, application=app).aggregate(Sum('bytes_in'))["bytes_in__sum"]
			application_uploaded = data.filter(direction=DIRECTION.OUTGOING, application=app).aggregate(Sum('bytes_in'))["bytes_in__sum"]
			applications.append([app, application_downloaded, application_uploaded])

		ret = {
			'devices': ret_devices,
			'ts_earliest': ts_earliest,
			'ts_latest': ts_latest,
			'bytes_downloaded': bytes_downloaded,
			'bytes_uploaded': bytes_uploaded,
			'flows': flows,
			'applications': applications,
		}

		return HttpResponse(json.dumps(ret), content_type='application/json')

def get_downloaded_intervals_by_device(request):
	"""
	Returns the data for each given interval for a given device.
	"""
	if request.is_ajax():
		ret = []
		ret_downloaded = []

		data = Flow.objects

		device = request.POST.get('device')
		ts_start = request.POST.get('ts_start')
		interval = request.POST.get('interval')

		if ts_start == None or ts_start == "":
			ts_start = data.aggregate(Min('time_start'))["time_start__min"]

		if isNum(ts_start):
			ts_start = int(ts_start)
			if ts_start < 0:
				return HttpResponse('Timestamp must be greater than 0.', content_type='plain/text')
		else:
			return HttpResponse('Invalid timestamp provided.', content_type='plain/text')

		ts_start = int(ts_start)
		if device == "All" or device == "":
			return HttpResponse('A device identifier must be provided.', content_type='plain/text')

		start = datetime.datetime.utcfromtimestamp(ts_start)
		year = start.year
		month = start.month
		day = start.day
		hour = start.hour

		#return HttpResponse(start, content_type='plain/text')

		if interval == None:
			return HttpResponse('An interval must be provided.', content_type='plain/text')

		data = data.filter(mac_dst=device, direction=DIRECTION.INCOMING)		

		max = 0
		t1 = ts_start
		t2 = None

		if interval == INTERVAL.MONTHLY:
			month += 1	# necessary
			current_day = 1
			total_days = monthrange(year, month)[1]
			t2 = total_days
			while current_day < total_days:
				initial_date = datetime.datetime(year, month, current_day)
				final_date = datetime.datetime(year, month, current_day + 1)
				ts_start = (initial_date - epoch_date).total_seconds()
				ts_end = (final_date - epoch_date).total_seconds()

				b = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]				
				if b  == None:
					b = 0
				if b > max:
					max = b

				ret_downloaded.append([ts_start * 1000, b])

				current_day += 1
		elif interval == INTERVAL.DAILY:
			current_hour = 1
			total_hours = 23
			while current_hour < total_hours:	# hours 00:00-01:00 to 22:00-23:00
				initial_date = datetime.datetime(year, month, day, current_hour)
				final_date = datetime.datetime(year, month, day, current_hour + 1)
				ts_start = (initial_date - epoch_date).total_seconds()
				ts_end = (final_date - epoch_date).total_seconds()

				b = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				if b  == None:
					b = 0				
				ret_downloaded.append([ts_start * 1000, b])

				current_hour += 1
			# hour 23:00 - 00:00 of next day
			# get the first hour of the next day
			initial_date = datetime.datetime(year, month, day, current_hour)
			final_date = datetime.datetime(year, month, day + 1, 0)
			ts_start = (initial_date - epoch_date).total_seconds()
			ts_end = (final_date - epoch_date).total_seconds()
			b = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]
			ret_downloaded.append([ts_start * 1000, b])
		elif interval == INTERVAL.HOURLY:
			current_minute = 0
			total_minutes = 59
			while current_minute < total_minutes:
				initial_date = datetime.datetime(year, month, day, hour, current_minute)
				final_date = datetime.datetime(year, month, day, hour, current_minute + 1)
				ts_start = (initial_date - epoch_date).total_seconds()
				ts_end = (final_date - epoch_date).total_seconds()

				b = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				if b  == None:
					b = 0					
				ret_downloaded.append([ts_start * 1000, b])
				current_minute += 1
		
		ret = {
			'downloaded': ret_downloaded,
			'ts_start': t1,
			'ts_end': t2,
			'max': max,
		}

		return HttpResponse(json.dumps(ret), content_type='application/json')

def get_uploaded_intervals_by_device(request):
	"""
	Returns the data for each given interval for a given device.
	"""
	if request.is_ajax():
		ret = []
		ret_uploaded = []

		data = Flow.objects

		device = request.POST.get('device')
		ts_start = request.POST.get('ts_start')
		interval = request.POST.get('interval')

		if ts_start == None or ts_start == "":
			ts_start = data.aggregate(Min('time_start'))["time_start__min"]

		if isNum(ts_start):
			ts_start = int(ts_start)
			if ts_start < 0:
				return HttpResponse('Timestamp must be greater than 0.', content_type='plain/text')
		else:
			return HttpResponse('Invalid timestamp provided.', content_type='plain/text')

		ts_start = int(ts_start)
		if device == "All" or device == "":
			return HttpResponse('A device identifier must be provided.', content_type='plain/text')

		start = datetime.datetime.fromtimestamp(ts_start)
		year = start.year
		month = start.month
		day = start.day

		if interval == None:
			return HttpResponse('An interval must be provided.', content_type='plain/text')

		data = data.filter(mac_src=device, direction=DIRECTION.OUTGOING)		

		t1 = ts_start
		t2 = None

		if interval == INTERVAL.MONTHLY:
			month += 1	# necessary
			current_day = 1
			total_days = monthrange(year, month)[1]
			while current_day < total_days:
				initial_date = datetime.datetime(year, month, current_day)
				final_date = datetime.datetime(year, month, current_day + 1)
				ts_start = (initial_date - epoch_date).total_seconds()
				ts_end = (final_date - epoch_date).total_seconds()

				u = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]				
				if u  == None:
					u = 0
				ret_uploaded.append([ts_start * 1000, u])

				current_day += 1
		elif interval == INTERVAL.DAILY:
			current_hour = 1
			total_hours = 23
			while current_hour < total_hours:	# hours 00:00-01:00 to 22:00-23:00
				initial_date = datetime.datetime(year, month, day, current_hour)
				final_date = datetime.datetime(year, month, day, current_hour + 1)
				ts_start = (initial_date - epoch_date).total_seconds()
				ts_end = (final_date - epoch_date).total_seconds()

				u = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				if u  == None:
					u = 0				
				ret_uploaded.append([ts_start * 1000, u])

				current_hour += 1
			# hour 23:00 - 00:00 of next day
			initial_date = datetime.datetime(year, month, day, current_hour)
			final_date = datetime.datetime(year, month, day + 1, 0)
			ts_start = (initial_date - epoch_date).total_seconds()
			ts_end = (final_date - epoch_date).total_seconds()
			u = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]
			ret_uploaded.append([ts_start * 1000, u])
		elif interval == INTERVAL.HOURLY:
			current_minute = 0
			total_minutes = 59
			while current_minute < total_minutes:
				initial_date = datetime.datetime(year, month, day, hour, current_minute)
				final_date = datetime.datetime(year, month, day, hour, current_minute + 1)
				ts_start = (initial_date - epoch_date).total_seconds()
				ts_end = (final_date - epoch_date).total_seconds()

				u = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				if u  == None:
					u = 0					
				ret_uploaded.append([ts_start * 1000, u])

				current_minute += 1
		
		ret = {
			'uploaded': ret_uploaded,
			't1': t1,
		}

		return HttpResponse(json.dumps(ret), content_type='application/json')

def get_intervals_by_application(request):
	"""
	Returns the data for each given interval for a given application.
	"""
	if request.is_ajax():
		ret = []
		ret_apps = []
		ret_data = []

		data = Flow.objects

		application = request.POST.get('application')
		ts_start = request.POST.get('ts_start')
		interval = request.POST.get('interval')

		if application == None or application == '':
			apps = data.values_list('application', flat=True).distinct()

		if ts_start == None:
			ts_start = data.aggregate(Min('time_start'))['time_start__min']
		if ts_start == None:
			return HttpResponse('No data available for the specified application for that inverval.', content_type='plain/text')

		start = datetime.datetime.fromtimestamp(ts_start)
		year = start.year
		month = start.month
		day = start.day

		if interval == None:
			return HttpResponse('An interval must be provided.', content_type='plain/text')

		t1 = ts_start
		t2 = None

		for app in apps:
			# Application
			ret_apps.append(app)
			data = Flow.objects.filter(application=app)
			time_data = []
			if interval == INTERVAL.MONTHLY:
				current_day = 1
				total_days = monthrange(year, month)[1]
				while current_day < total_days:
					initial_date = datetime.datetime(year, month, current_day)
					final_date = datetime.datetime(year, month, current_day + 1)
					ts_start = (initial_date - epoch_date).total_seconds()
					ts_end = (final_date - epoch_date).total_seconds()

					u = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]				
					if u  == None:
						u = 0
					# Data
					time_data.append([ts_start * 1000, u])

					current_day += 1
			elif interval == INTERVAL.DAILY:
				current_hour = 1
				total_hours = 23
				while current_hour < total_hours:	# hours 00:00-01:00 to 22:00-23:00
					initial_date = datetime.datetime(year, month, day, current_hour)
					final_date = datetime.datetime(year, month, day, current_hour + 1)
					ts_start = (initial_date - epoch_date).total_seconds()
					ts_end = (final_date - epoch_date).total_seconds()

					u = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]
					if u  == None:
						u = 0
					# Data				
					time_data.append([ts_start * 1000, u])

					current_hour += 1
				# hour 23:00 - 00:00 of next day
				initial_date = datetime.datetime(year, month, day, current_hour)
				final_date = datetime.datetime(year, month, day + 1, 0)
				ts_start = (initial_date - epoch_date).total_seconds()
				ts_end = (final_date - epoch_date).total_seconds()
				u = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]
				time_data.append([ts_start * 1000, u])
			elif interval == INTERVAL.HOURLY:
				current_minute = 0
				total_minutes = 59
				while current_minute < total_minutes:
					initial_date = datetime.datetime(year, month, day, hour, current_minute)
					final_date = datetime.datetime(year, month, day, hour, current_minute + 1)
					ts_start = (initial_date - epoch_date).total_seconds()
					ts_end = (final_date - epoch_date).total_seconds()

					u = data.filter(time_start__gte=ts_start, time_end__lte=ts_end).aggregate(Sum('bytes_in'))["bytes_in__sum"]
					if u  == None:
						u = 0
					# Data				
					time_data.append([ts_start * 1000, u])

					current_minute += 1
			ret_data.append(time_data)
		
		ret = {
			'application': ret_apps,
			'data': ret_data,
			't1': t1,
		}

		return HttpResponse(json.dumps(ret), content_type='application/json')

def get_top_locations(request):

	ret_domains = []

	data = Flow.objects.all()

	ts_start = request.POST.get('ts_start')
	interval = request.POST.get('interval')

	if ts_start == None:
		ts_start = data.aggregate(Min('time_start'))['time_start__min']
	if ts_start == None:
		return HttpResponse('No data available for the specified device for that inverval.', content_type='plain/text')

	start = datetime.datetime.fromtimestamp(ts_start)
	year = start.year
	month = start.month
	day = start.day

	if interval == None:
		return HttpResponse('An interval must be provided.', content_type='plain/text')

	ips = list(Flow.objects.filter(direction=DIRECTION.INCOMING).values_list('ip_src', flat=True).annotate(ip_count=Count('ip_src')).order_by('-ip_count'))[:20]
	
	for ip in ips:
		downloaded = data.filter(direction=DIRECTION.INCOMING, ip_src=ip).aggregate(Sum('bytes_in'))["bytes_in__sum"]
		uploaded = data.filter(direction=DIRECTION.OUTGOING, ip_dst=ip).aggregate(Sum('bytes_in'))["bytes_in__sum"]
		try:
			t = socket.gethostbyaddr(ip)
			if t != None:
				ret_domains.append([t[0], downloaded, uploaded])
		except:
			ret_domains.append([ip, downloaded, uploaded])
			pass


	return HttpResponse(json.dumps({ 'domains': ret_domains }), content_type='application/json')	

def get_top_applications(request):

	ret_applications = []

	data = Flow.objects.all()

	ts_start = request.POST.get('ts_start')
	interval = request.POST.get('interval')

	if ts_start == None:
		ts_start = data.aggregate(Min('time_start'))['time_start__min']
	if ts_start == None:
		return HttpResponse('No data available for the specified device for that inverval.', content_type='plain/text')

	start = datetime.datetime.fromtimestamp(ts_start)
	year = start.year
	month = start.month
	day = start.day

	#if interval == None:
		#return HttpResponse('An interval must be provided.', content_type='plain/text')

	apps = list(Flow.objects.values_list('application', flat=True).distinct())

	return HttpResponse(json.dumps(apps), content_type='application/json')

def get_usage_timeline(request):
	if request.is_ajax():
		data = get_filtered_data(request)
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

def save_name(request):
	device = request.POST.get('device')
	name = request.POST.get('name')

	if device == "" or device == None:
		return HttpResponse(json.dumps({'status': 1, 'content': 'A device identifier must be given'}), content_type='application/json')

	if name == "":
		try:
			# Update the name of the device if it exists
			Device.objects.get(device=device).delete()
		except Device.DoesNotExist:
			pass
	else:
		try:
			# Update the name of the device if it exists
			currentDevice = Device.objects.get(device=device)
			currentDevice.name = name
			currentDevice.save()
		except Device.DoesNotExist:
			# Create new entry in Devices
			currentDevice = Device(device=device, name=name)
			currentDevice.save()

	return HttpResponse(json.dumps({'status': 0, 'content': name}), content_type='application/json')

def get_devices():
	"""
	Inspects the database for MAC addresses. If they exist, then this method returns a list of distinct mac_src addresses
	where the flow direction is outgoing.
	If there are not MAC addresses, returns a list of distinct ip_src addresses.
	"""

	data = Flow.objects
	devices = []
	ret_devices = []
	macsExist = True

	distMacs = data.filter(direction=DIRECTION.INCOMING).values_list('mac_dst', flat=True).distinct()
	# Check is there are values in the MAC address field
	if len(distMacs) == 1:
		if distMacs[0] is None:
			macsExist = False
	if macsExist:
		devices = list(distMacs)
	else:
		devices = list(data.filter(direction=DIRECTION.INCOMING).values_list('ip_dst', flat=True).distinct())

	# Check for a device name for each device
	for id in devices:
		try:
			name = Device.objects.get(device=id).name
		except Device.DoesNotExist:
			name = None
			pass
		ret_devices.append([id, name])

	return ret_devices

def getInt(i):
	if i is not None:
		return int(i)
	return 0;

def isNum(data):
	try:
		if data == None or data == '':
			return False
		int(data)
		return True
	except ValueError:
		return False