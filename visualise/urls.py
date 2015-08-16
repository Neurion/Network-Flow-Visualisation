from django.conf.urls import patterns, url
from visualise import views

# We are here since the URL started with "visualise/"
urlpatterns = patterns('',

	url(r'get_aggregate_data/?$', views.get_aggregate_data),	
	url(r'get_downloaded_intervals_by_device/?$', views.get_downloaded_intervals_by_device),
	url(r'get_uploaded_intervals_by_device/?$', views.get_uploaded_intervals_by_device),
	url(r'get_devices_data/?$', views.get_devices_data),
	url(r'get_top_domains/?$', views.get_top_domains),
	url(r'get_protocols/?$', views.get_protocols),
	url(r'get_usage/?$', views.get_usage),
	url(r'get_usage_timeline/?$', views.get_usage_timeline),
	url(r'save_host_name/?$', views.save_host_name),

	# match anything after '/visualise/'
	url(r'^$', views.index),
)