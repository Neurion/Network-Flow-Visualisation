function updateFlowsInfo(){

	removeAllChildren(document.getElementById("top_2"));

	/* Display 'Num devices' or 'Device name' */
	if(filter.mac != 'all'){
		$('#top_2').append($('<span></span>').addClass('info').text('Device:'));
		$('#top_2').append($('<span></span>').addClass('value').text(filter.mac));

		if(n_names[filter.mac]){
			$('#text_name').val(n_names[filter.mac]);
		}
		else{
			$('#text_name').val('');
		}
	}
	else{
		$('#top_2').append($('<span></span>').addClass('info').text('Local devices:'));
		$('#top_2').append($('<span></span>').addClass('value').text(n_deviceMACs.length));
	}

	$('#top_2').append($('<span></span>').addClass('info').text('Earliest data:'));
	var date = new Date(flowData.time.earliest * 1000);
	var t = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
	$('#top_2').append($('<span></span>').addClass('value').text(t));
	$('#top_2').append($('<span></span>').addClass('info').text('Latest data:'));
	date = new Date(flowData.time.latest * 1000);
	t = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();		
	$('#top_2').append($('<span></span>').addClass('value').text(t));

	$('#top_2').append($('<span></span>').addClass('info').text('Downloaded:'));
	$('#top_2').append($('<span></span>').addClass('info').text('Uploaded:'));
}

function populateMACAddresses(names, macs){
	if(macs != null)
		n_deviceMACs = macs;
	removeAllChildren(document.getElementById('select_devices'));
	$("#select_devices").append($("<option></option>").attr("value", "all").text("All")); 
	var i;
	for(i = 0; i < n_deviceMACs.length; ++i){
		var mac = n_deviceMACs[i];
		var name = mac;
		if(names[mac] != null){			
			name = names[mac];
			n_names[mac] = name;
		}
		$("#select_devices").append($("<option></option>").attr("value", mac).text(name)); 
	}
}

function populateIntervalSelectBox(){
	$("#select_interval_type").append($("<option></option>").attr("value", "monthly").text("Monthly")); 
	$("#select_interval_type").append($("<option></option>").attr("value", "daily").text("Daily"));
	$("#select_interval_type").append($("<option></option>").attr("value", "hourly").text("Hourly")); 
	$("#select_interval_type").val(INTERVAL.MONTHLY);
}

function updateIntervalSelectBoxes(){

	// Store the old selected values.
	var oldMonth, oldDay, oldHour;
	if(controls.filters.selectBox.interval.months != null){
		oldMonth = controls.filters.selectBox.interval.months.val();
	}
	if(controls.filters.selectBox.interval.days != null){
		oldDay = controls.filters.selectBox.interval.days.val();
	}
	if(controls.filters.selectBox.interval.hours != null){
		oldHour = controls.filters.selectBox.interval.hours.val();
	}

	// Remove the select boxes.
	$('#select_interval_month').remove();
	$('#select_interval_day').remove();
	$('#select_interval_hour').remove();

	// Add new select boxes with updated values.
	updateMonthsSelectBox();
	if(oldMonth != null){
		if($("#select_interval_month option[value='" + oldMonth + "']").length == 1){
			controls.filters.selectBox.interval.months.val(oldMonth);
			filter.interval.month = oldMonth;			
		}
	}	
	if(filter.intervalType == INTERVAL.DAILY || filter.intervalType == INTERVAL.HOURLY){
		updateDaysSelectBox();
		if(oldDay != null){
			controls.filters.selectBox.interval.days.val(oldDay);
			filter.interval.day = oldDay;
		}		
		if(filter.intervalType == INTERVAL.HOURLY){
			updateHoursSelectBox();
			if(oldHour != null){
				controls.filters.selectBox.interval.hours.val(oldHour);
				filter.interval.hour = oldHour;
			}
		}
	}
}

function updateMonthsSelectBox(){
	controls.filters.selectBox.interval.months = $('<select></select>').attr('id', 'select_interval_month');
	controls.filters.selectBox.interval.months.change(function(){
		
		filter.interval.month = controls.filters.selectBox.interval.months.val();

		var now = new Date();
		var startOfMonth = new Date(now.getFullYear(), filter.interval.month);
		var timestamp = startOfMonth / 1000;		

		if(filter.intervalType == INTERVAL.DAILY || filter.intervalType == INTERVAL.HOURLY){
			//console.log("updating day select box.");
			$('#select_interval_day').remove();
			updateDaysSelectBox();
		}
		if(filter.intervalType == INTERVAL.HOURLY){
			//console.log("updating hour select box.");
			$('#select_interval_hour').remove();
			updateHoursSelectBox();
		}

		refreshInformation();
	});
	$('#select_interval_type').parent().append(controls.filters.selectBox.interval.months);
	populateMonths();
}

function updateDaysSelectBox(){
	controls.filters.selectBox.interval.days = $('<select></select>').attr('id', 'select_interval_day');
	$('#select_interval_type').parent().append(controls.filters.selectBox.interval.days);
	console.log("listing days for month: " + filter.interval.month);
	controls.filters.selectBox.interval.days.change(function(){
		filter.interval.day = controls.filters.selectBox.interval.days.val();		
		if(filter.intervalType == INTERVAL.HOURLY){
			$('#select_interval_hour').remove();		
			updateHoursSelectBox();
		}
		refreshInformation();			// Request new data
	});
	populateDays();
}

function updateHoursSelectBox(){
	controls.filters.selectBox.interval.hours = $('<select></select>').attr('id', 'select_interval_hour');
	$('#select_interval_type').parent().append(controls.filters.selectBox.interval.hours);
	console.log("listing hours for day: " + filter.interval.day);
	controls.filters.selectBox.interval.hours.change(function(){
		filter.interval.hour = controls.filters.selectBox.interval.hours.val();		
	});
	populateHours();
}

function populateMonths(){
	var initialDate = new Date(flowData.time.earliest * 1000);
	var finalDate = new Date(flowData.time.latest * 1000);
	var currentDate = initialDate;
	while(currentDate.getTime() <= finalDate.getTime()){
		var monthString = MONTHS[currentDate.getMonth()];
		//console.log(monthString);
		controls.filters.selectBox.interval.months.append($("<option></option>").attr("value", currentDate.getMonth()).text(monthString)); 
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);	// Increment by one month.
	}
	filter.interval.month = controls.filters.selectBox.interval.months.val();
}

function populateDays(){	
	var initialDate = new Date(flowData.time.earliest * 1000);
	var finalDate = new Date(flowData.time.latest * 1000);
	var currentDate = new Date(initialDate.getFullYear(), filter.interval.month);
	var currentMonth = filter.interval.month;
	while(currentMonth == filter.interval.month && currentDate.getTime() < finalDate.getTime()){
		var day = currentDate.getDay();
		var dayOfTheMonth = currentDate.getDate();
		var dayString = DAYS[day];
		controls.filters.selectBox.interval.days.append($("<option></option>").attr("value", dayOfTheMonth).text(dayString + " " + dayOfTheMonth)); 
		currentDate = new Date(currentDate.getTime() + (SECONDS.DAY * 1000));	// Increment by one day.
		currentMonth = currentDate.getMonth();
	}
	filter.interval.day = controls.filters.selectBox.interval.days.val();
}

/** Populates the hours select box control. It is required that the month and day select boxes are already populated. */
function populateHours(){
	var now = new Date();
	var date = new Date(now.getFullYear(), filter.interval.month, filter.interval.day);
	var seconds = date.getTime() / 1000;
	var currentDate = filter.interval.day;
	//console.log(date.toString());
	while(currentDate == filter.interval.day && seconds < flowData.time.latest){
		// While within the desired day AND before the absolute latest date.
		//console.log("current day: " + currentDate + ", target day: " + filter.interval.day);
		var hour = date.getHours();
		controls.filters.selectBox.interval.hours.append($("<option></option>").attr("value", hour).text(hour + ":00")); 		
		// Update hour for next iteration
		date = new Date(date.getTime() + (SECONDS.HOUR * 1000));	// Increment by one hour.
		//console.log(date.toString());		
		currentDate = date.getDate();
		seconds = date.getTime() / 1000;
	}
	//console.log("current day: " + currentDate + ", target day: " + filter.interval.day);
	filter.interval.hour = controls.filters.selectBox.interval.hours.val();
}

function populateApplications(applications){
	var i;
	for(i = 0; i < macs.length; ++i){
		$("#select_devices").append($("<option></option>").attr("value",macs[i]).text(macs[i])); 
	}	
}

function populatePreferences(){

	$('#preferences_container').prepend('<br />');		
	$('#preferences_container').prepend($('<div></div>').attr('id', 'device_container'));
	$('#preferences_container').prepend('<hr />');
	$('#preferences_container').prepend('<span class="header">Device statistics</span>');
	$('#preferences_container').prepend('<br />');
		
	$('#preferences_container').prepend($('<div></div>').attr('id', 'network_container'));
	$('#preferences_container').prepend('<hr />');
	$('#preferences_container').prepend('<span class="header">Network statistics</span>');
	$('#preferences_container').prepend('<br />');	

	var $networkParent = $('#preferences_container #network_container');
	var $deviceParent = $('#preferences_container #device_container');
	var $check, $label;

	/* These visuals can only be displayed for network data. */
	/* Devices downloaded */
	$check = createInput('check_network_devices_downloaded', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Devices downloaded</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);

	/* Devices uploaded */
	$check = createInput('check_network_devices_uploaded', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Devices uploaded</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);

	/* Downloaded timeline */
	$check = createInput('check_network_downloaded_timeline', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Downloaded timeline</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);	

	/* Uploaded timeline */
	$check = createInput('check_network_uploaded_timeline', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Uploaded timeline</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);

	/* Usage */
	$check = createInput('check_network_usage', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Usage</label>');
	$label.attr('for', $check.attr('name'));
	$networkParent.append($check, $label);

	/* Application */
	$check = createInput('check_network_application', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Application</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);	

	/* Domains */
	$check = createInput('check_network_domains', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Domains</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);	

	/* Country */
	$check = createInput('check_network_country', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Country</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);

	/* These visuals can only be displayed for device data. */
	/* Downloaded timeline */
	$check = createInput('check_device_downloaded_timeline', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Downloaded timeline</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);	

	/* Uploaded timeline */
	$check = createInput('check_device_uploaded_timeline', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Uploaded timeline</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);

	/* Usage */
	$check = createInput('check_device_usage', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Usage</label>');
	$label.attr('for', $check.attr('name'));
	$deviceParent.append($check, $label);

	/* Application */
	$check = createInput('check_device_application', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Application</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);	

	/* Domains */
	$check = createInput('check_device_domains', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Domains</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);	

	/* Country */
	$check = createInput('check_device_country', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$label = $('<label>Country</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);		
	
}