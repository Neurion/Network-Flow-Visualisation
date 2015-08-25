	$(document).ready(function(){

	/* Populates the filter controls and sets the initial filter values. */
	setup();

	getAggregateData(function(){

		filter.populateDirection();
		filter.populateMonths();
		filter.populateApplications();
		filter.setOnControlChange(function(){
			// Display information for all devices.
			if(filter.getDevice() == "All"){
				requestAggregateDevicesData(function(){
					if(statMenu == STAT_MENU.OVERVIEW){
						populateOverview();
					}
					else if(statMenu == STAT_MENU.DOWNLOADED){
						populateTopDownloaders();
					}
					else if(statMenu == STAT_MENU.UPLOADED){
						populateTopUploaders();
					}
					else if(statMenu == STAT_MENU.APPLICATIONS){
						populateTopApplications();
					}								
					else{
						console.log('Invalid statMenu, should not happen.');
						return;
					}
				});
			}
			// Else display information for a single device.
			else{
				requestDeviceData(function(){
					if(statMenu == STAT_MENU.OVERVIEW){
						populateDeviceOverview();
					}
					else if(statMenu == STAT_MENU.DOWNLOADED){
						//populateDeviceDownloaded();
					}
					else if(statMenu == STAT_MENU.UPLOADED){
						//populateDeviceUploaded();
					}			
					else{
						console.log('Invalid statMenu, should not happen.');
						return;
					}
				});
			}
		});

		$('#menu_overview').click(function(){
			removeCurrentMenu();
			STAT_MENU.OVERVIEW.addClass('current');
			statMenu = STAT_MENU.OVERVIEW;
			populateSignificant();
		});

		$('#menu_downloaded').click(function(){
			removeCurrentMenu();
			STAT_MENU.DOWNLOADED.addClass('current');
			statMenu = STAT_MENU.DOWNLOADED;
			populateSignificant();	
		});

		$('#menu_uploaded').click(function(){
			removeCurrentMenu();
			STAT_MENU.UPLOADED.addClass('current');
			statMenu = STAT_MENU.UPLOADED;
			populateSignificant();
		});

		$('#menu_locations').click(function(){
			removeCurrentMenu();
			STAT_MENU.LOCATIONS.addClass('current');
			statMenu = STAT_MENU.LOCATIONS;
			populateSignificant();
		});

		$('#menu_applications').click(function(){
			removeCurrentMenu();
			STAT_MENU.APPLICATIONS.addClass('current');
			statMenu = STAT_MENU.APPLICATIONS;
			populateSignificant();
		});		

		$('#devices').append($('<div></div>').text(aggregateData.devices.length));
		$('#downloaded').append($('<div></div>').text(bytesToSize(aggregateData.downloaded)));
		$('#uploaded').append($('<div></div>').text(bytesToSize(aggregateData.uploaded)));

		/* Interval listener */
		filter.setIntervalListener();

		filter.populateDevices();

		filter.setInterval(INTERVAL.MONTHLY);

		//console.log('Default filter values:');
		//printFilterValues();

	});

	requestAggregateDevicesData(function(){
		statMenu = STAT_MENU.OVERVIEW;
		populateSignificant();
	});
});		// end of page ready

function setup(){	

	/* Menu */
	setMenuPointers();

	STAT_MENU.OVERVIEW = $('#menu_overview');
	STAT_MENU.DOWNLOADED = $('#menu_downloaded');
	STAT_MENU.UPLOADED = $('#menu_uploaded');
	STAT_MENU.LOCATIONS = $('#menu_locations');
	STAT_MENU.APPLICATIONS = $('#menu_applications');

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

function removeCurrentMenu(){
	STAT_MENU.OVERVIEW.removeClass('current');
	STAT_MENU.DOWNLOADED.removeClass('current');
	STAT_MENU.UPLOADED.removeClass('current');
	STAT_MENU.LOCATIONS.removeClass('current');	
	STAT_MENU.APPLICATIONS.removeClass('current');
}

function getFilterParameters(){
	
	var f_dateStart = f_dateEnd = null;
	var f_year = f_month = f_day = f_hour = f_timeStart = f_timeEnd = -1;

	// Have to check for null aggregate data for the first request.
	if(aggregateData.dateStart == null){
		//console.log("FIRST REQUEST.");
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
	/*
	console.log("##### filter values #####");
	console.log("	device: " + filter.getDevice());
	console.log("	direction: " + filter.getDirection());
	console.log("	interval: " + filter.getInterval());
	console.log("	year: " + filter.getYear());
	console.log("	month: " + filter.getMonth());
	console.log("	day: " + filter.getDay());
	console.log("	hour: " + filter.getHour());
	console.log("	ts_start: " + filter.getStartTimestamp());
	console.log("	ts_end: " + filter.getEndTimestamp());
	console.log("	port_source: " + filter.getPortSrc());
	console.log("	port_destination: " + filter.getPortDst());
	console.log("########################");
	*/
	return {
		csrfmiddlewaretoken: getCookie('csrftoken'),
		device: filter.getDevice(),
		direction: filter.getDirection(),
		interval: filter.getInterval(),
		year: filter.getYear(),
		month: filter.getMonth(),
		day: filter.getDay(),
		hour: filter.getHour(),
		application: filter.getApplication(),
		ts_filter: filter.getStartTimestamp(),
		port_source: filter.getPortSrc(),
		port_destination: filter.getPortDst(),		
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
	console.log("	application: " + filter.getApplication());
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