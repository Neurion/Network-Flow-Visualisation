$(document).ready(function(){

	setup();

	/** Request flows information and draw visuals. */
	refreshInformation();	
});

function setup(){
	/** Menu */
	setMenuPointers();
	setMenu(menu.network);

	/** Controls */
	setControlPointers();
	populateMACAddresses();			// Populate filter controls.
	setFilterListeners();			// Setup listener events for the filter controls.
	populateIntervalSelectBox();	// Add "Monthly", "Daily", and "Hourly".
	updateIntervalSelectBoxes();	// Add default "Monthly" select box.

	updateFilterMac();
	updateFilterDirection();
	updateFilterPorts();
	updateFilterInterval();
	updateFilterApplication();	
}

function setMenuPointers(){
	menu.network = $('#m_network');
	menu.user = $('#m_user');
}

function setControlPointers(){
	controls.selectBox.macs = $('#select_devices');
	controls.checkBox.incoming = $('#check_ingress');
	controls.checkBox.outgoing = $('#check_egress');
	controls.textBox.port.src = $('#text_port_source');
	controls.textBox.port.dst = $('#text_port_destination');
	controls.selectBox.intervalType = $('#select_interval_type');
	controls.selectBox.application = $('#select_applications');
}

/** Filter updating methods. */
function updateFilterMac(){
	filter.mac = controls.selectBox.macs.find(":selected").val();
}

function updateFilterDirection(){
	if($('#check_ingress').is(':checked') && $('#check_egress').is(':checked')){
		filter.direction = DIRECTION.ALL;
	}
	else if(controls.checkBox.incoming.is(':checked')){
		filter.direction = DIRECTION.INGRESS;
	}
	else if(controls.checkBox.outgoing.is(':checked')){
		filter.direction = DIRECTION.EGRESS;
	}
	else{
		alert("You must select at least one direction.");
		filter.direction = "error";
	}
}

function updateFilterPorts(){
	filter.port.src = parseInt(controls.textBox.port.src.val());
	filter.port.dst = parseInt(controls.textBox.port.dst.val());
	if(!filter.port.src){
		filter.port.src = -1;
	}
	if(!filter.port.dst){
		filter.port.dst = -1;
	}
}

function updateFilterInterval(){
	filter.intervalType = controls.selectBox.intervalType.val();
	filter.interval.month = controls.selectBox.interval.months.val();
	if(filter.interval.day){
		filter.interval.day = controls.selectBox.interval.days.val();
	}
	if(filter.interval.hour){
		filter.interval.hour = controls.selectBox.interval.hours.val();
	}
}

function updateFilterApplication(){
	filter.application = controls.selectBox.application.find(":selected").text();
}

function setFilterListeners(){

	$("#select_devices").change(function(){
		updateFilterMac();			// Update filter value
		refreshInformation();		// Request new data
		if(filter.mac == 'all'){
			setMenu(menu.network);

			$('#button_name_container').remove();
			$('#text_name').remove();
			$('#button_save').remove();
		}
		else{
			setMenu(menu.user);

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
				});
				buttonContainer.append(buttonSave);

				menu.user.parent().append(buttonContainer);
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

function getTimestamp(){
	return new Date(filter.interval.year, filter.interval.month).getTime() / 1000;
}

function setMenu(option){
	menu.network.attr('class', '');
	menu.user.attr('class', '');
	option.addClass('current');
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
	//console.log("start from: " + initialDate);
	//console.log("to: " + finalDate);
	return {
		csrfmiddlewaretoken: getCookie('csrftoken'),
		mac: filter.mac,
		direction: filter.direction,
		port_source: filter.port.src,
		port_destination: filter.port.dst,
		//interval_start: ,
	}
}