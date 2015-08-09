$(document).ready(function(){

	/* Populates the filter controls and sets the initial filter values. */
	setup();
	addPreferences();

	getAggregateData(function(){

		$('#netflow').append($('<div></div>').text(aggregateData.netflow));
		$('#devices').append($('<div></div>').text(aggregateData.devices.length));
		$('#downloaded').append($('<div></div>').text(bytesToSize(aggregateData.downloaded)));
		$('#uploaded').append($('<div></div>').text(bytesToSize(aggregateData.uploaded)));

		/* Device listener */
		filter.setDeviceListener();

		/* Direction-Incoming listener */
		filter.setDirectionIngressListener(function(){
			//requestData(function(){
				//updateMetaData();
				//updateVisuals();
			//});
		});

		/* Direction-Outgoing listener */
		filter.setDirectionEgressListener(function(){
			//requestData(function(){
				//updateMetaData();
				//updateVisuals();
			//});
		});

		filter.setDirectionBothListener(function(){

		});

		/* Interval listener */
		filter.setIntervalListener();

		filter.updateControls();

		//requestData(function(){
			//updateMetaData();
			//updateVisuals();
		//});
	});

	requestDevicesData(function(){
		populateDevicesTable();
	});

	requestTopDownloaders(function(){
		//populateTopDownloaders();
	});

	requestTopUploaders(function(){});

});

function setup(){	

	/* Menu */
	setMenuPointers();
	/* Preferences */
	setPreferencesPointers();

	filter = new Filter();
	filter.setControls();

	//visuals.push(loadDeviceUsers);
	//visuals.push(loadUsageTimeline);
	//visuals.push(loadProtocol);
	//visuals.push(loadUsage);

	window.setInterval(onTimeout, 30000);
}

function onTimeout(){
	//requestFilterValues(updateFilterControls, requestData);
	//updateVisuals();
}

function setMenuPointers(){
	//menu.filter = $('#menu_filter');
	//menu.display = $('#menu_preferences');

	//menu.filter.click(function(){
	//	$('#filter_container').slideToggle(300);
	//});

	//menu.display.click(function(){
	//	$('#preferences_container').slideToggle(300);
	//});	
}

function setPreferencesPointers(){
	controls.preferences.network.devices_downloaded = $('#check_network_devices_downloaded');
	controls.preferences.network.devices_uploaded = $('#check_network_devices_uploaded');
	controls.preferences.network.downloaded_timeline = $('#check_network_downloaded_timeline');
	controls.preferences.network.uploaded_timeline = $('#check_network_uploaded_timeline');
	controls.preferences.network.usage = $('#check_network_usage');
	controls.preferences.network.domains = $('#check_network_domains');
	controls.preferences.network.country = $('#check_network_country');
	controls.preferences.device.devices_downloaded = $('#check_device_downloaded_timeline');
	controls.preferences.device.devices_uploaded = $('#check_device_uploaded_timeline');
	controls.preferences.device.usage = $('#check_device_usage');
	controls.preferences.device.domains = $('#check_device_domains');
	controls.preferences.device.country = $('#check_device_country');
}

function updateVisuals(){

	removeAllChildren(document.getElementById('left_container'));	// Remove all visuals.
	removeAllChildren(document.getElementById('center_container'));	// Remove all visuals.
	removeAllChildren(document.getElementById('right_container'));	// Remove all visuals.

	for(var i = 0; i < visuals.length; i++){
		visuals[i]();
	}

	// Flows table
	//loadFlowsTable($('#header'));
} 

function getFilterParameters(){
	
	var f_dateStart = f_dateEnd = null;
	var f_year = f_month = f_day = f_hour = f_timeStart = f_timeEnd = -1;

	// Have to check for null aggregate data for the first request.
	if(aggregateData.dateStart == null){
		console.log("FIRST REQUEST.");
	}
	else if(filter.getInterval() == INTERVAL.MONTHLY){		
		f_dateStart = new Date(aggregateData.dateStart.getFullYear(), filter.getMonth());
		f_dateEnd = new Date(aggregateData.dateStart.getFullYear(), parseInt(filter.getMonth()) + 1);
		f_timeStart = parseInt(f_dateStart.getTime() / 1000);
		f_timeEnd = parseInt(f_dateEnd.getTime() / 1000);
		f_year = filter.getYear();
		f_month = filter.getMonth();
	}
	else if(filter.getInterval() == INTERVAL.DAILY){
		f_dateStart = new Date(aggregateData.dateStart.getFullYear(), filter.getMonth(), filter.getDay());
		f_dateEnd = new Date(aggregateData.dateStart.getFullYear(), filter.getMonth(), parseInt(filter.getDay()) + 1);
		f_timeStart = parseInt(f_dateStart.getTime() / 1000);
		f_timeEnd = parseInt(f_dateEnd.getTime() / 1000);
		f_year = filter.getYear();
		f_month = filter.getMonth();
		f_day = filter.getDay();		
	}
	else if(filter.getInterval() == INTERVAL.HOURLY){
		f_dateStart = new Date(aggregateData.dateStart.getFullYear(), filter.getMonth(), filter.getDay(), filter.getHour());
		f_dateEnd = new Date(aggregateData.dateStart.getFullYear(), filter.getMonth(), filter.getDay(), parseInt(filter.getHour()) + 1);
		f_timeStart = parseInt(f_dateStart.getTime() / 1000);
		f_timeEnd = parseInt(f_dateEnd.getTime() / 1000);
		f_year = filter.getYear();
		f_month = filter.getMonth();
		f_day = filter.getDay();
		f_hour = filter.getHour();		
	}
	else{
		console.log("shouldn't happen.");
	}

	return {
		csrfmiddlewaretoken: getCookie('csrftoken'),
		device: filter.getDevice(),
		direction: filter.getDirection(),
		port_source: filter.getPortSrc(),
		port_destination: filter.getPortDst(),
		interval: filter.getInterval(),
		year: filter.getYear(),
		month: filter.getMonth(),
		day: filter.getDay(),
		hour: filter.getHour(),
		ts_filter: filter.getTimestamp(),
	}
}

function printFilterValues(){
	console.log("##### filter values #####");
	console.log("	device: " + filter.getDevice());
	console.log("	direction: " + filter.getDirection());
	console.log("	interval: " + filter.getInterval());
	console.log("	year: " + aggregateData.dateStart.getFullYear());
	console.log("	month: " + filter.getMonth());
	console.log("	day: " + filter.getDay());
	console.log("	hour: " + filter.getHour());
	console.log("	time_start: " + parseInt(aggregateData.dateStart.getTime() / 1000));
	console.log("	time_end: " + parseInt(aggregateData.dateEnd / 1000));	
	console.log("	port_source: " + filter.getPortSrc());
	console.log("	port_destination: " + filter.getPortDst());
	console.log("");
}

function getSelectedDay(){
	console.log("returning: " + controls.filters.selectBox.time.days.val());	
	return controls.filters.selectBox.time.days.val();
}