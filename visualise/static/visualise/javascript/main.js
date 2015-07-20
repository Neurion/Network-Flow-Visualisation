$(document).ready(function(){

	/* Populates the filter controls and sets the initial filter values. */
	setup();

	/* Request flows information. */
	requestMetaData(initialUpdate);
});

function setup(){

	/* Mode */
	setModePointers();	
	/* Menu */
	setMenuPointers();
	/* Preferences */
	setPreferencesPointers();
	/* Filters */
	setFilterPointers();

	setMode(mode.network);

	setControlListeners();			// Setup listener events for the filter controls.

	visuals.push(loadUsageTimeline);
	visuals.push(loadProtocol);
	visuals.push(loadUsage);

	window.setInterval(onTimeout, 30000);
}

function onTimeout(){
	requestMetaData(test);
}

function initialUpdate(){
	console.log('initial setup...');
	addPreferences();
	updateControls();	
}

function setModePointers(){
	mode.network = $('#m_network');
	mode.user = $('#m_user');
}

function setMenuPointers(){
	menu.filter = $('#menu_filter');
	menu.display = $('#menu_preferences');

	menu.filter.click(function(){
		$('#filter_container').slideToggle(300);
	});

	menu.display.click(function(){
		$('#preferences_container').slideToggle(300);
	});	
}

function setPreferencesPointers(){
	controls.preferences.network.devices_downloaded = $('#preferences_container #check_network_devices_downloaded');
	controls.preferences.network.devices_uploaded = $('#preferences_container #check_network_devices_uploaded');
	controls.preferences.network.downloaded_timeline = $('#preferences_container #check_network_downloaded_timeline');
	controls.preferences.network.uploaded_timeline = $('#preferences_container #check_network_uploaded_timeline');
	controls.preferences.network.usage = $('#preferences_container #check_network_usage');
	controls.preferences.network.application = $('#preferences_container #check_network_application');
	controls.preferences.network.domains = $('#preferences_container #check_network_domains');
	controls.preferences.network.country = $('#preferences_container #check_network_country');
	controls.preferences.device.devices_downloaded = $('#preferences_container #check_device_downloaded_timeline');
	controls.preferences.device.devices_uploaded = $('#preferences_container #check_device_uploaded_timeline');
	controls.preferences.device.usage = $('#preferences_container #check_device_usage');
	controls.preferences.device.application = $('#preferences_container #check_device_application');
	controls.preferences.device.domains = $('#preferences_container #check_device_domains');
	controls.preferences.device.country = $('#preferences_container #check_device_country');
}

function setFilterPointers(){
	controls.filters.selectBox.macs = $('#select_devices');
	controls.filters.checkBox.incoming = $('#check_ingress');
	controls.filters.checkBox.outgoing = $('#check_egress');
	controls.filters.textBox.port.src = $('#text_port_source');
	controls.filters.textBox.port.dst = $('#text_port_destination');
	controls.filters.selectBox.intervalType = $('#select_interval_type');
	controls.filters.selectBox.application = $('#select_applications');
}

function updateFilter(){
	updateFilterMac();
	updateFilterDirection();
	updateFilterPorts();
	updateFilterInterval();
	updateFilterApplication();
}

/** Filter updating methods. */
function updateFilterMac(){
	filter.mac = controls.filters.selectBox.macs.find(":selected").val();
}

function updateFilterDirection(){
	if($('#check_ingress').is(':checked') && $('#check_egress').is(':checked')){
		filter.direction = DIRECTION.ALL;
	}
	else if(controls.filters.checkBox.incoming.is(':checked')){
		filter.direction = DIRECTION.INGRESS;
	}
	else if(controls.filters.checkBox.outgoing.is(':checked')){
		filter.direction = DIRECTION.EGRESS;
	}
	else{
		alert("You must select at least one direction.");
		filter.direction = "error";
	}
}

function updateFilterPorts(){
	filter.port.src = parseInt(controls.filters.textBox.port.src.val());
	filter.port.dst = parseInt(controls.filters.textBox.port.dst.val());
	if(!filter.port.src){
		filter.port.src = -1;
	}
	if(!filter.port.dst){
		filter.port.dst = -1;
	}
}

function updateFilterInterval(){

	filter.intervalType = controls.filters.selectBox.intervalType.val();

	if(filter.interval.month){
		filter.interval.month = controls.filters.selectBox.interval.months.val();
	}
	if(filter.interval.day){
		filter.interval.day = controls.filters.selectBox.interval.days.val();
	}
	if(filter.interval.hour){
		filter.interval.hour = controls.filters.selectBox.interval.hours.val();
	}

	if(filter.intervalType == INTERVAL.MONTHLY){
		var date_start = new Date(filter.interval.year, filter.interval.month);
		var date_end = new Date(filter.interval.year, parseInt(filter.interval.month) + 1);
		//filter.interval.start = parseInt(date_start.getTime() / 1000);
		//filter.interval.end = parseInt(date_end.getTime() / 1000);
		//console.log("interval.start: " + date_start);
		//console.log("interval.end: " + date_end);	
	}
	else if(filter.intervalType == INTERVAL.DAILY){		
		var date_start = new Date(filter.interval.year, filter.interval.month, filter.interval.day);
		var date_end = new Date(filter.interval.year, filter.interval.month, parseInt(filter.interval.day) + 1);
		filter.interval.start = parseInt(date_start.getTime() / 1000);
		filter.interval.end = parseInt(date_end.getTime() / 1000);
		//console.log("interval.start: " + date_start);
		//console.log("interval.end: " + date_end);			
	}
	else if(filter.intervalType == INTERVAL.HOURLY){
		var date_start = new Date(filter.interval.year, filter.interval.month, filter.interval.day, filter.interval.hour);
		var date_end = new Date(filter.interval.year, filter.interval.month, filter.interval.day, parseInt(filter.interval.hour) + 1);
		filter.interval.start = date_start.getTime() / 1000;
		filter.interval.end = date_end.getTime() / 1000;
		//console.log("interval.start: " + date_start);
		//console.log("interval.end: " + date_end);
	}
	else if(filter.intervalType == INTERVAL.ALL){
		//console.log("Showing all data.");		
	}
	else{
		console.log("invalid filter.intervalType.");
	}
}

function updateFilterApplication(){
	filter.application = controls.filters.selectBox.application.find(":selected").val();
}

function setControlListeners(){

	$("#select_devices").change(function(){
		updateFilterMac();			// Update filter value
		refreshInformation();		// Request new data
		if(filter.mac == 'all'){
			setMode(mode.network);

			$('#button_name_container').remove();
			$('#text_name').remove();
			$('#button_save').remove();
		}
		else{
			setMode(mode.user);

			$('button_save').text("test");

			if(!$('#button_name_container').length){
				var buttonContainer = $('<div></div>');
				buttonContainer.attr('id', 'button_name_container');

				var textName = $('<input>');
				textName.attr('id', 'text_name');
				textName.attr('type', 'text');
				buttonContainer.append(textName);

				var buttonSave = $('<input>');
				buttonSave.attr('id', 'button_save');
				buttonSave.attr('type', 'button');
				buttonSave.val('Save Name');
				buttonSave.click(function(){
					console.log("Saving name for: " + filter.mac + " to: " + textName.val());
					saveHostName(textName.val());
					textName.val("");
					refreshInformation();
				});
				buttonContainer.append(buttonSave);

				var buttonRemove = $('<input>');
				buttonRemove.attr('id', 'button_remove');
				buttonRemove.attr('type', 'button');
				buttonRemove.val('Remove Name');
				buttonRemove.click(function(){
					console.log("Removing name for: " + filter.mac + " to: " + textName.val());
					saveHostName(filter.mac);
					textName.val("");
					refreshInformation();
				});
				buttonContainer.append(buttonRemove);

				mode.user.parent().append(buttonContainer);
			}
		}
	});

	$("#check_ingress").change(function(){		
		updateFilterDirection();	// Update filter value
		refreshInformation();		// Request new data
	});

	$("#check_egress").change(function(){
		updateFilterDirection();	// Update filter value
		refreshInformation();		// Request new data
	});

	$("#text_port").change(function(){
		updateFilterPort();			// Update filter value
		refreshInformation();		// Request new data
	});

	$("#select_interval_type").change(function(){
		filter.intervalType = $("#select_interval_type").val();
		refreshInformation();			// Request new data
		updateIntervalSelectBoxes();
		if(filter.intervalType == INTERVAL.DAILY){
			filter.interval.hour = null;
			if(filter.intervalType == INTERVAL.MONTHLY){
				filter.interval.day = null;
			}
		}
	});

	$("#text_application").change(function(){		
		updateFilterApplication();	// Update filter value
		refreshInformation();			// Request new data
	});

	$("#button_save_name").click(function(){
		$('#device_name').text(filter.mac);
	});
}

function refreshInformation(){

}

function getTimestamp(){
	return new Date(filter.interval.year, filter.interval.month).getTime() / 1000;
}

function setMode(option){
	mode.network.attr('class', '');
	mode.user.attr('class', '');
	option.addClass('current');
}

function updateVisuals(){

	removeAllChildren(document.getElementById('top_4'));	// Remove all visuals.

	for(var i = 0; i < visuals.length; i++){
		visuals[i]();		// Call the function for each visual.
	}

	$("#top_4").append($('<span></span>').addClass('clear'));

	// Flows table
	loadFlowsTable($('#header'));	
}

function createVisual(type, title, id){

	newVisualContainer = $("<div></div>").addClass("visual_container");
	/*
	if(type == "timeline"){
		newVisualContainer.addClass("timeline");
	}
	else if(type == "timeline"){
		newVisualContainer.addClass("pie");
	}
	*/
	newVisualContainer.addClass(type);
	newVisualContainer.attr('id', id);
	newVisualTitle = $("<div></div>").addClass("visual_title").text(title);
	newVisual = $("<div></div>").addClass("visual");
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_4").append(newVisualContainer);	
	return newVisual;		// Return a reference to the element in which the visual is to be placed.
}

function getAJAXParameters(){

	if(filter.intervalType == INTERVAL.MONTHLY){
		var startDate = new Date(filter.interval.year, filter.interval.month);
		var endDate = new Date(filter.interval.year, parseInt(filter.interval.month) + 1);
		//filter.interval.start = parseInt(startDate.getTime() / 1000);
		//filter.interval.end = parseInt(endDate.getTime() / 1000);
	}
	else if(filter.intervalType == INTERVAL.DAILY){
		var startDate = new Date(filter.interval.year, filter.interval.month, filter.interval.day);
		var endDate = new Date(filter.interval.year, filter.interval.month, parseInt(filter.interval.day) + 1);
		filter.interval.start = parseInt(startDate.getTime() / 1000);
		filter.interval.end = parseInt(endDate.getTime() / 1000);
	}
	else if(filter.intervalType == INTERVAL.HOURLY){
		var startDate = new Date(filter.interval.year, filter.interval.month, filter.interval.day, filter.interval.hour);
		var endDate = new Date(filter.interval.year, filter.interval.month, filter.interval.day, parseInt(filter.interval.hour) + 1);
		filter.interval.start = startDate.getTime() / 1000;
		filter.interval.end = endDate.getTime() / 1000;
	}
	else{
		//alert("this must be the very first request.");
	}

	return {		
		csrfmiddlewaretoken: getCookie('csrftoken'),
		mac: filter.mac,
		direction: filter.direction,
		port_source: filter.port.src,
		port_destination: filter.port.dst,
		interval_type: filter.intervalType,
		interval_year: filter.interval.year,
		interval_month: filter.interval.month,
		interval_day: filter.interval.day,
		interval_hour: filter.interval.hour,
		interval_start: filter.interval.start,
		interval_end: filter.interval.end,
		application: filter.application,
	}
}

function printFilterValues(){
	console.log("##### filter values #####");
	console.log("	mac: " + filter.mac);
	console.log("	direction: " + filter.direction);
	console.log("	month: " + filter.interval.month);
	console.log("	day: " + filter.interval.day);
	console.log("	hour: " + filter.interval.hour);
	console.log("	start: " + filter.interval.start);
	console.log("	end: " + filter.interval.end);	
	console.log("	port_source: " + filter.port.src);
	console.log("	port_destination: " + filter.port.dst);
	console.log("");
}