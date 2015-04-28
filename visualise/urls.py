from django.conf.urls import patterns, url
from visualise import views

# We are here since the URL started with "visualise/"
urlpatterns = patterns('',
	# e.g. /visualise/
	url(r'^$', views.index, name='index'),
    # e.g. /visualise/5/
    url(r'^(?P<protocol_id>\d+)/$', views.detail, name='detail'),


    # e.g. /visualise/bob
    url(r'^getProtocol$', views.getProtocol, name='protocol'),


    # e.g. /visualise/bob
    url(r'^bob$', views.tt, name='tt'),
    # e.g. /visualise/
    url(r'^test.txt$', 'views.main'),
)