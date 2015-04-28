from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from django.db.models import Max, Min
from visualise.models import Flow
import json


def index(request):

	# Get packets in ascending order
	packets_all = Flow.objects.all().order_by('timestamp')

	# Timeline
	time_oldest = packets_all.aggregate(Min('timestamp'))
	time_newest = packets_all.aggregate(Max('timestamp'))	

	# Distinct MAC source addresses of outgoing traffic
	source_macs = packets_all.order_by().values('mac_src').distinct()

	# Protocol counts
	tcp_count = Flow.objects.extra(where=["protocol=6"]).count		
	udp_count = Flow.objects.extra(where=["protocol=17"]).count

	context = {'packets_list': packets_all,
				'time_oldest': time_oldest,
				'time_newest': time_newest,
				'source_macs': source_macs,
				'tcp_count': tcp_count,
				'udp_count': udp_count,
				}
	return render(request, 'visualise/index.html', context)	




def getProtocol(request):
	response_data = HttpResponse()
	response_data['a1'] = 'value1'
	response_data['a2'] = 'value2'
	p = Flow.objects.get(id=1)
	context_dict['packet'] = p
	return render_to_response('visualise/index.html', context_dict, context)


def tt(request):
	return render(request, 'visualise/tt.html')


def detail(request, protocol_id):
    protocol = get_object_or_404(Protocol, pk=protocol_id)
    return render(request, 'visualise/detail.html', {'protocol': protocol})