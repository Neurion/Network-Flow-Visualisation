	$(document).ready(function(){

	/* Populates the filter controls and sets the initial filter values. */
	setup();

	getAggregateData(function(){
 
		filter.populateDevices();
		filter.populateDirection();
		filter.populateYears();
		filter.populateMonths();
		filter.populateDays();
		filter.populateHours();
		filter.populateApplications();
		filter.setOnControlChange(function(){
			refreshVisuals();
		});

		$('#menu_overview').click(function(){
			removeCurrentMenu();
			STAT_MENU.OVERVIEW.addClass('current');
			statMenu = STAT_MENU.OVERVIEW;
			refreshVisuals();
		});

		$('#menu_downloaded').click(function(){
			removeCurrentMenu();
			STAT_MENU.DOWNLOADED.addClass('current');
			statMenu = STAT_MENU.DOWNLOADED;
			refreshVisuals();
		});

		$('#menu_uploaded').click(function(){
			removeCurrentMenu();
			STAT_MENU.UPLOADED.addClass('current');
			statMenu = STAT_MENU.UPLOADED;
			refreshVisuals();
		});

		$('#menu_locations').click(function(){
			removeCurrentMenu();
			STAT_MENU.LOCATIONS.addClass('current');
			statMenu = STAT_MENU.LOCATIONS;
			refreshVisuals();
		});

		$('#menu_applications').click(function(){
			removeCurrentMenu();
			STAT_MENU.APPLICATIONS.addClass('current');
			statMenu = STAT_MENU.APPLICATIONS;
			refreshVisuals();
		});

		$('#menu_more').click(function(){
			if($('#menu_hidden').css("display") == "none"){
				$('#menu_more').text("<");
			}
			else{
				$('#menu_more').text(">");
				removeCurrentMenu();
				STAT_MENU.OVERVIEW.addClass('current');
				statMenu = STAT_MENU.OVERVIEW;
				refreshVisuals();		
			}
			$('#menu_hidden').animate({width:'toggle'}, 300, function(){

			});			
		});

		$('#menu_protocols').click(function(){
			removeCurrentMenu();
			STAT_MENU.PROTOCOLS.addClass('current');
			statMenu = STAT_MENU.PROTOCOLS;
			//refreshVisuals();
		});

		$('#menu_ports').click(function(){
			removeCurrentMenu();
			STAT_MENU.PORTS.addClass('current');
			statMenu = STAT_MENU.PORTS;
			//refreshVisuals();
		});	

		$('#menu_flows').click(function(){
			removeCurrentMenu();
			STAT_MENU.FLOWS.addClass('current');
			statMenu = STAT_MENU.FLOWS;
			//refreshVisuals();
		});	

		$('#menu_packets').click(function(){
			removeCurrentMenu();
			STAT_MENU.PACKETS.addClass('current');
			statMenu = STAT_MENU.PACKETS;
			//refreshVisuals();
		});							

		$('#devices').append($('<div></div>').text(aggregateData.devices.length));
		$('#downloaded').append($('<div></div>').text(bytesToSize(aggregateData.downloaded)));
		$('#uploaded').append($('<div></div>').text(bytesToSize(aggregateData.uploaded)));

		statMenu = STAT_MENU.OVERVIEW;
		refreshVisuals();
	});
});

function setup(){

	STAT_MENU.OVERVIEW = $('#menu_overview');
	STAT_MENU.DOWNLOADED = $('#menu_downloaded');
	STAT_MENU.UPLOADED = $('#menu_uploaded');
	STAT_MENU.LOCATIONS = $('#menu_locations');
	STAT_MENU.APPLICATIONS = $('#menu_applications');
	STAT_MENU.PROTOCOLS = $('#menu_protocols');
	STAT_MENU.PORTS = $('#menu_ports');
	STAT_MENU.FLOWS = $('#menu_flows');
	STAT_MENU.PACKETS = $('#menu_packets');

	filter = new Filter();
	filter.setControls();
}

function removeCurrentMenu(){
	STAT_MENU.OVERVIEW.removeClass('current');
	STAT_MENU.DOWNLOADED.removeClass('current');
	STAT_MENU.UPLOADED.removeClass('current');
	STAT_MENU.LOCATIONS.removeClass('current');	
	STAT_MENU.APPLICATIONS.removeClass('current');
	STAT_MENU.PROTOCOLS.removeClass('current');
	STAT_MENU.PORTS.removeClass('current');
	STAT_MENU.FLOWS.removeClass('current');
	STAT_MENU.PACKETS.removeClass('current');
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
	console.log("	ts_start: " + filter.getStartTimestampSeconds());
	console.log("	ts_end: " + filter.getEndTimestampSeconds());
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
		ts_start: filter.getStartTimestampSeconds(),
		//ts_end: filter.getEndTimestampSeconds(),
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
	console.log("	time_start: " + filter.getStartTimestampSeconds());
	console.log("	time_end: " + filter.getEndTimestampSeconds());	
	console.log("	port_source: " + filter.getPortSrc());
	console.log("	port_destination: " + filter.getPortDst());
	console.log("");
}

function getSelectedDay(){
	console.log("returning: " + controls.filters.selectBox.time.days.val());	
	return controls.filters.selectBox.time.days.val();
}