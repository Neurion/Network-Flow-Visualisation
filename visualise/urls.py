from django.conf.urls import patterns, url
from visualise import views

# We are here since the URL started with "visualise/"
urlpatterns = patterns('',

	url(r'get_meta_data/?$', views.get_meta_data, name='index'),
	url(r'get_devices_usage/?$', views.get_devices_usage, name='index'),
	url(r'get_protocols/?$', views.get_protocols, name='index'),
	url(r'get_usage/?$', views.get_usage, name='index'),
	url(r'get_usage_timeline/?$', views.get_usage_timeline, name='index'),
	url(r'save_host_name/?$', views.save_host_name, name='index'),
	url(r'get_filter_values/?$', views.get_filter_values, name='index'),

	# match anything after '/visualise/'
	url(r'^$', views.index, name='index'),
)