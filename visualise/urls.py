from django.conf.urls import patterns, url
from visualise import views

# We are here since the URL started with "visualise/"
urlpatterns = patterns('',

	url(r'get_protocols/?$', views.get_protocols, name='index'),
	url(r'get_usage/?$', views.get_usage, name='index'),
	url(r'get_timeline/?$', views.get_timeline, name='index'),

	# match anything after '/visualise/'
	url(r'^$', views.index, name='index'),
)