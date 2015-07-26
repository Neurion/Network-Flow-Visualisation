$(document).ready(function(){

	/* Populates the filter controls and sets the initial filter values. */
	setup();
	addPreferences();

	requestFilterValues(function(new_data){

		/* Set the control references for the filter */
		filter.setControls($('#select_device'), 
			$('#check_ingress'), 
			$('#check_egress'), 
			$('#text_port_source'), 
			$('#text_port_destination'),
			$('#select_interval'),
			//$('#select_month'),
			//$('#select_day'),
			//$('#select_hour'),
			$('#select_application'));

		filter.setMACListener(function(){
			//console.log("MAC changed.");

			requestMetaData(function(){
				updateMetaData();
				updateVisuals();
			});

			if(filter.getMAC() == 'all'){
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
						requestMetaData(function(){updateMetaData()});
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
						requestMetaData(function(){updateMetaData()});
					});
					buttonContainer.append(buttonRemove);

					mode.user.parent().append(buttonContainer);
				}
			}	
		});

		filter.setDirectionIngressListener(function(){
			console.log("ingress changed.");
			requestMetaData(function(){
				updateMetaData();
				updateVisuals();
			});
		});

		filter.setDirectionEgressListener(function(){
			console.log("egress changed.");
			requestMetaData(function(){
				updateMetaData();
				updateVisuals();
			});
		});		

		filter.setIntervalListener(function(){
			console.log("interval changed to " + filter.getInterval());

			var oldMonth = filter.getMonth();
			var oldDay = filter.getDay();
			var oldHour = filter.getHour();

			filter.removeMonths();
			filter.removeDays();
			filter.removeHours();

			if(filter.getInterval() == INTERVAL.MONTHLY){
				filter.addMonths();	

				filter.setMonth(oldMonth);
			}
			else if(filter.getInterval() == INTERVAL.DAILY){
				filter.addMonths();
				filter.addDays();

				filter.setMonth(oldMonth);
				filter.setDay(oldDay);
			}
			else if(filter.getInterval() == INTERVAL.HOURLY){
				filter.addMonths();
				filter.addDays();
				filter.addHours();

				filter.setMonth(oldMonth);
				filter.setDay(oldDay);
				filter.setHour(oldHour);
			}

			requestMetaData(function(){
				updateMetaData();
				updateVisuals();
			});
		});

		/* Application 
		filter.setApplicationListener(function(){
			console.log("application changed.");		
			requestMetaData(function(){
				updateMetaData()
			});			// Request new data
		});
		*/

		filter.update(new_data);

		requestMetaData(function(){
			updateMetaData();
			updateVisuals();
		});
	});
});

function setup(){

	filter = new Filter();

	/* Mode */
	setModePointers();	
	/* Menu */
	setMenuPointers();
	/* Preferences */
	setPreferencesPointers();
	/* Miscellaneous control listeners */
	setControlListeners();
	/* Initially display info for the entire network */
	setMode(mode.network);

	visuals.push(loadUsageTimeline);
	visuals.push(loadProtocol);
	visuals.push(loadUsage);

	window.setInterval(onTimeout, 30000);
}

function onTimeout(){
	//requestFilterValues(updateFilterControls, requestMetaData);
	//updateVisuals();
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

function setControlListeners(){
	$("#button_save_name").click(function(){
		$('#device_name').text(filter.mac);
	});
}

function setMode(option){
	mode.network.attr('class', '');
	mode.user.attr('class', '');
	option.addClass('current');
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

function createVisual(type, title, id){

	newVisualContainer = $("<div></div>");
	newVisualContainer.addClass("visual_container");
	
	if(type == "timeline"){
		newVisualContainer.addClass("timeline");
	}
	else if(type == "pie"){
		newVisualContainer.addClass("pie");
	}
	newVisualContainer.addClass(type);
	newVisualContainer.attr('id', id);

	newVisualTitle = $("<div></div>").addClass("visual_title").text(title);
	newVisualContainer.append(newVisualTitle);

	newVisual = $("<div></div>").addClass("visual");
	newVisualContainer.append(newVisual);

	return newVisualContainer;		// Return a reference to the element in which the visual is to be placed.
}

function getAJAXParameters(){

	var dateStart, dateEnd;
	var p_year, p_month, p_day, p_hour, p_timeStart, p_timeEnd;

	if(data.date.start != null){
		p_year = data.date.start.getFullYear();
	}
	else{
		p_year = -1;
	}

	if(data.date.start != null){
		p_month = filter.getMonth();
	}
	else{
		p_month = -1;
	}

	if(data.date.start != null){
		p_day = filter.getDay();
	}
	else{
		p_day = -1;
	}

	if(data.date.start != null){
		p_hour = filter.getHour();
	}
	else{
		p_hour = -1;
	}			

	if(data.date.start == null){
		console.log("FIRST REQUEST.");
		p_timeStart = -1;
		p_timeEnd = -1;
	}
	else if(filter.getInterval() == INTERVAL.MONTHLY){		
		dateStart = new Date(data.date.start.getFullYear(), filter.getMonth());
		dateEnd = new Date(data.date.start.getFullYear(), parseInt(filter.getMonth()) + 1);
		p_timeStart = parseInt(dateStart.getTime() / 1000);
		p_timeEnd = parseInt(dateEnd.getTime() / 1000);
	}
	else if(filter.getInterval() == INTERVAL.DAILY){
		dateStart = new Date(data.date.start.getFullYear(), filter.getMonth(), filter.getDay());
		dateEnd = new Date(data.date.start.getFullYear(), filter.getMonth(), parseInt(filter.getDay()) + 1);
		p_timeStart = parseInt(dateStart.getTime() / 1000);
		p_timeEnd = parseInt(dateEnd.getTime() / 1000);
	}
	else if(filter.getInterval() == INTERVAL.HOURLY){
		dateStart = new Date(data.date.start.getFullYear(), filter.getMonth(), filter.getDay(), filter.getHour());
		dateEnd = new Date(data.date.start.getFullYear(), filter.getMonth(), filter.getDay(), parseInt(filter.getHour()) + 1);
		p_timeStart = parseInt(dateStart.getTime() / 1000);
		p_timeEnd = parseInt(dateEnd.getTime() / 1000);
	}
	else{
		console.log("shouldn't happen...");
	}

	return {		
		csrfmiddlewaretoken: getCookie('csrftoken'),
		mac: filter.getMAC(),
		direction: filter.getDirection(),
		port_source: filter.getPortSrc(),
		port_destination: filter.getPortDst(),
		interval: filter.getInterval(),
		year: p_year,
		month: p_month,
		day: p_day,
		hour: p_hour,
		time_start: p_timeStart,
		time_end: p_timeEnd,
		//application: filter.application,
	}
}

function printFilterValues(){
	console.log("##### filter values #####");
	console.log("	mac: " + filter.getMAC());
	console.log("	direction: " + filter.getDirection());
	console.log("	interval: " + filter.getInterval());
	console.log("	year: " + data.date.start.getFullYear());
	console.log("	month: " + filter.getMonth());
	console.log("	day: " + filter.getDay());
	console.log("	hour: " + filter.getHour());
	console.log("	time_start: " + parseInt(data.date.start.getTime() / 1000));
	console.log("	time_end: " + parseInt(data.date.end.getTime() / 1000));	
	console.log("	port_source: " + filter.getPortSrc());
	console.log("	port_destination: " + filter.getPortDst());
	console.log("");
}

function getSelectedDay(){
	console.log("returning: " + controls.filters.selectBox.time.days.val());	
	return controls.filters.selectBox.time.days.val();
}