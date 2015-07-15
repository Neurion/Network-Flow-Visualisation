$(document).ready(function(){

	setup();

	/** Request flows information and draw visuals. */
	refreshInformation();	
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

	populateMACAddresses();			// Populate filter controls.
	populateIntervalSelectBox();	// Add "Monthly", "Daily", and "Hourly".
	populatePreferences();

	setFilterListeners();			// Setup listener events for the filter controls.
	
	updateIntervalSelectBoxes();	// Add default "Monthly" select box.

	updateFilterMac();
	updateFilterDirection();
	updateFilterPorts();
	updateFilterInterval();
	updateFilterApplication();
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
	filter.interval.month = controls.filters.selectBox.interval.months.val();
	if(filter.interval.day){
		filter.interval.day = controls.filters.selectBox.interval.days.val();
	}
	if(filter.interval.hour){
		filter.interval.hour = controls.filters.selectBox.interval.hours.val();
	}
}

function updateFilterApplication(){
	filter.application = controls.filters.selectBox.application.find(":selected").text();
}

function setFilterListeners(){

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
	$.ajax({
		type: "POST",
		url: "get_flows_info",
		data: getAJAXParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){

			n_deviceMACs = json_data['macs'];

			flowData.time.earliest = json_data['timestamp_earliest']
			flowData.time.latest = json_data['timestamp_latest']			

			var oldMac = $('#select_devices').val();
			$('#select_devices').val(filter.mac);

			updateFlowsInfo();

			// Populate the filter controls.
			populateMACAddresses(json_data['names'], json_data['macs']);
			$('#select_devices').val(oldMac);

			updateIntervalSelectBoxes();
			updateFilterInterval();

			var date = new Date(flowData.time.earliest * 1000);
			filter.interval.year = date.getFullYear()

			updateVisuals();
			//printFilterValues();
		},
	});	
}

function getTimestamp(){
	return new Date(filter.interval.year, filter.interval.month).getTime() / 1000;
}

function setMode(option){
	mode.network.attr('class', '');
	mode.user.attr('class', '');
	option.addClass('current');
}

/** 
 * Adds the selected visuals to the global 'visuals' variable.
 */
function getSelectedVisuals(){

	visuals.push(loadProtocolChart);
}

function updateVisuals(){

	removeAllChildren(document.getElementById('top_4'));	// Remove all visuals.

	getSelectedVisuals();
	for(var i = 0; i < visuals.length; i++){
		var visual = createVisual("Protocols");
		visuals[i](visual);
	}

	/** Graphs, charts and tables. */
	//loadProtocolChart(createVisual("Protocols"));
	//loadUsageChart(createVisual("Usage"));

	$("#top_4").append($('<div></div>').addClass('clear'));

	// Flows table
	loadFlowsTable($('#header'));	
}

function createVisual(title){
	newVisualContainer = $("<div></div>").addClass("visual_container");
	newVisualTitle = $("<div></div>").addClass("visual_title").text(title);
	newVisual = $("<div></div>").addClass("visual");
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_4").append(newVisualContainer);	
	return newVisual;
}

function getAJAXParameters(){
	var initialDate = new Date(filter.interval.year, filter.interval.month, filter.interval.day, filter.interval.hour);
	var finalDate;
	if(filter.intervalType == INTERVAL.MONTHLY){
		var finalMonth = parseInt(filter.interval.month) + 1;
		finalDate = new Date(filter.interval.year, finalMonth);
	}
	else if(filter.intervalType == INTERVAL.DAILY){
		var finalDay = parseInt(filter.interval.day) + 1;
		finalDate = new Date(filter.interval.year, filter.interval.month, finalDay);
	}
	else if(filter.intervalType == INTERVAL.HOURLY){
		var finalHour = parseInt(filter.interval.hour) + 1;
		finalDate = new Date(filter.interval.year, filter.interval.month, filter.interval.day, finalHour);
	}
	else{
		alert("should not happen...");
	}
	return {		
		csrfmiddlewaretoken: getCookie('csrftoken'),
		mac: filter.mac,
		direction: filter.direction,
		port_source: filter.port.src,
		port_destination: filter.port.dst,
		//interval_start: ,
	}
}

function printFilterValues(){
	console.log("### filter values ###");
	console.log("	mac: " + filter.mac);
	console.log("	direction: " + filter.direction);
	console.log("	month: " + filter.interval.month);
	console.log("	day: " + filter.interval.day);
	console.log("	hour: " + filter.interval.hour);
	console.log("	port_source: " + filter.port.src);
	console.log("	port_destination: " + filter.port.dst);
	console.log("\n\n");
}