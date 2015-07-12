$(document).ready(function(){

	/** Menu */
	setMenuPointers();
	setMenu(menu.network);

	/** Request flows information and draw visuals. */
	refreshInformation();

	/** Controls */
	setControlPointers();
	populateMACAddresses();		// Populate filter controls.
	setFilterListeners();		// Setup listener events for the filter controls.
	populateIntervalSelectBox();
});

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
	filter.port.src = controls.textBox.port.src.val();
	filter.port.dst = controls.textBox.port.dst.val();

}

function updateFilterInterval(){
	filter.intervalType = controls.selectBox.intervalType.val();
	filter.interval.month = controls.selectBox.month.val();
	filter.interval.day = controls.selectBox.day.val();
	filter.interval.hour = controls.selectBox.hour.val();
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
	return {
		csrfmiddlewaretoken: getCookie('csrftoken'),
		mac: filter.mac,
		direction: filter.direction,
		port_source: filter.port.src,
		port_destination: filter.port.dst,
	}
}