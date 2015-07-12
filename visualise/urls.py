from django.conf.urls import patterns, url
from visualise import views

# We are here since the URL started with "visualise/"
urlpatterns = patterns('',

	url(r'get_flows_info/?$', views.get_flows_info, name='index'),
	url(r'get_protocols/?$', views.get_protocols, name='index'),
	url(r'get_usage/?$', views.get_usage, name='index'),
	url(r'get_upload_timeline/?$', views.get_upload_timeline, name='index'),
	url(r'get_download_timeline/?$', views.get_download_timeline, name='index'),
	url(r'save_host_name/?$', views.save_host_name, name='index'),

	# match anything after '/visualise/'
	url(r'^$', views.index, name='index'),
)