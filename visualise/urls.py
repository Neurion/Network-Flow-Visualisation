from django.conf.urls import patterns, url
from visualise import views

# We are here since the URL started with "visualise/"
urlpatterns = patterns('',

	url(r'get_aggregate_data/?$', views.get_aggregate_data),	
	url(r'get_downloaded_intervals_by_device/?$', views.get_downloaded_intervals_by_device),
	url(r'get_uploaded_intervals_by_device/?$', views.get_uploaded_intervals_by_device),
	url(r'get_intervals_by_application/?$', views.get_intervals_by_application),
	url(r'get_subset_data/?$', views.get_subset_data),
	url(r'get_top_locations/?$', views.get_top_locations),
	url(r'get_top_applications/?$', views.get_top_applications),
	url(r'get_usage_timeline/?$', views.get_usage_timeline),
	url(r'save_name/?$', views.save_name),

	# match anything after '/visualise/'
	url(r'^$', views.index),
)