from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
	url(r'^/?$', include('visualise.urls', namespace="visualise")),
    url(r'^visualise/?', include('visualise.urls', namespace="visualise")),
    url(r'^admin/', include(admin.site.urls)),
)
