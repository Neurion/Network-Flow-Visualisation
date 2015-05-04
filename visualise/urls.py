from django.conf.urls import patterns, url
from visualise import views

# We are here since the URL started with "visualise/"
urlpatterns = patterns('',

	# e.g. /visualise/
	url(r'^$', views.index, name='index'),
)