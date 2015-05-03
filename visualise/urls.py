from django.conf.urls import patterns, url
from visualise import views

# We are here since the URL started with "visualise/"
urlpatterns = patterns('',

	# e.g. /visualise/
	url(r'^$', views.index, name='index'),

    # e.g. /visualise/filter
    # Pass MAC address as argument called 'mac_src' to view
    #url(r'^filter/(?P<mac>.*)$', views.filter, name='filter'),

    url(r'^filter/$', views.filter, name='filter'),

    # e.g. /visualise/bob
    url(r'^bob$', views.tt, name='tt'),

    # e.g. /visualise/
    url(r'^test.txt$', views.index),
)