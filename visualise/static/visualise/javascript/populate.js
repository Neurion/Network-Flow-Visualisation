function updateMetaData(){

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
		$('#top_2').append($('<span></span>').addClass('value').text(data.devices.macs.length));
	}

	$('#top_2').append($('<span></span>').addClass('info').text('Earliest data:'));
	var date = new Date(data.time.earliest * 1000);
	var t = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
	$('#top_2').append($('<span></span>').addClass('value').text(t));
	$('#top_2').append($('<span></span>').addClass('info').text('Latest data:'));
	date = new Date(data.time.latest * 1000);
	t = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();		
	$('#top_2').append($('<span></span>').addClass('value').text(t));

	$('#top_2').append($('<span></span>').addClass('info').text('Downloaded:'));
	$('#top_2').append($('<span></span>').addClass('value').text(bytesToSize(data.bytes.downloaded)));
	$('#top_2').append($('<span></span>').addClass('info').text('Uploaded:'));
	$('#top_2').append($('<span></span>').addClass('value').text(bytesToSize(data.bytes.uploaded)));
}

function updateControls(){
	updateMACAddresses();	// Populate the filter controls.
	updateIntervalTypeSelectBox();
	updateIntervalSelectBoxes();
	updateApplications();	
}

function updateMACAddresses(){
	var macs = data.devices.macs;
	var names = data.devices.names;
	console.log(macs);
	if(macs == null){
		console.log("should not happen...");
	}

	removeAllChildren(document.getElementById('select_devices'));
	$("#select_devices").append($("<option></option>").attr("value", "all").text("All")); 

	for(var i = 0; i < data.devices.macs.length; i++){
		var mac = data.devices.macs[i];
		var name = mac;
		if(names[mac] != null){			
			name = names[mac];
			n_names[mac] = name;
		}
		$("#select_devices").append($("<option></option>").attr("value", mac).text(name)); 
	}
}

function updateIntervalTypeSelectBox(){
	controls.filters.selectBox.intervalType.append($("<option></option>").attr("value", "all").text("All")); 
	controls.filters.selectBox.intervalType.append($("<option></option>").attr("value", "monthly").text("Monthly")); 
	controls.filters.selectBox.intervalType.append($("<option></option>").attr("value", "daily").text("Daily"));
	controls.filters.selectBox.intervalType.append($("<option></option>").attr("value", "hourly").text("Hourly")); 
	controls.filters.selectBox.intervalType.val(DEFAULT.INTERVAL);
}

function updateIntervalSelectBoxes(){

	filter.intervalType = controls.filters.selectBox.intervalType.val();

	if(filter.intervalType == INTERVAL.ALL){
		$('#select_interval_month').remove();
		$('#select_interval_day').remove();
		$('#select_interval_hour').remove();
		//updateFilterInterval();
		console.log('intervalType is all, remove controls.');
		return;
	}
	else if(filter.intervalType == INTERVAL.MONTHLY){
		var oldMonth;	// Store the old selected values.
		if(controls.filters.selectBox.interval.months != null){
			oldMonth = controls.filters.selectBox.interval.months.val();
		}
		$('#select_interval_month').remove();		// Remove the old select box.
		createMonthsSelectBox();	// Always show months
		if(oldMonth != null){
			if($("#select_interval_month option[value='" + oldMonth + "']").length == 1){
				controls.filters.selectBox.interval.months.val(oldMonth);
				filter.interval.month = oldMonth;
				//console.log("setting month back to: " + oldMonth);		
			}
		}
	}
	else if(filter.intervalType == INTERVAL.DAILY){			
		var oldDay;
		if(controls.filters.selectBox.interval.days != null){
			oldDay = controls.filters.selectBox.interval.days.val();
		}		
		$('#select_interval_day').remove();	
		createDaysSelectBox();
		if(oldDay != null){
			if($("#select_interval_day option[value='" + oldDay + "']").length == 1){
				controls.filters.selectBox.interval.days.val(oldDay);
				filter.interval.day = oldDay;			
			}
		}
	}	
	else if(filter.intervalType == INTERVAL.HOURLY){
		var oldDay, oldHour;
		if(controls.filters.selectBox.interval.days != null){
			oldDay = controls.filters.selectBox.interval.days.val();
		}		
		if(controls.filters.selectBox.interval.hours != null){
			oldHour = controls.filters.selectBox.interval.hours.val();
		}								
		$('#select_interval_day').remove();
		$('#select_interval_hour').remove();
		createDaysSelectBox();	
		createHoursSelectBox();
		if(oldDay != null){
			if($("#select_interval_day option[value='" + oldDay + "']").length == 1){
				controls.filters.selectBox.interval.days.val(oldDay);
				filter.interval.day = oldDay;			
			}
		}
		if(oldHour != null){
			if($("#select_interval_hour option[value='" + oldHour + "']").length == 1){
				controls.filters.selectBox.interval.hours.val(oldHour);
				filter.interval.hour = oldHour;			
			}
		}			
	}
}

function createMonthsSelectBox(){
	controls.filters.selectBox.interval.months = $('<select></select>').attr('id', 'select_interval_month');
	controls.filters.selectBox.interval.months.change(monthsChanged);
	$('#select_interval_type').parent().append(controls.filters.selectBox.interval.months);
	populateMonths();
}

function monthsChanged(){
	filter.interval.month = controls.filters.selectBox.interval.months.val();

	/* Only show days if interval is either daily or hourly. */
	if(filter.intervalType == INTERVAL.DAILY || filter.intervalType == INTERVAL.HOURLY){
		$('#select_interval_day').remove();
		createDaysSelectBox();
	}
	if(filter.intervalType == INTERVAL.HOURLY){
		$('#select_interval_hour').remove();
		createHoursSelectBox();
	}
	refreshInformation();	
}

function createDaysSelectBox(){
	controls.filters.selectBox.interval.days = $('<select></select>').attr('id', 'select_interval_day');
	$('#select_interval_type').parent().append(controls.filters.selectBox.interval.days);
	controls.filters.selectBox.interval.days.change(daysChanged);
	populateDays();

}

function daysChanged(){
	filter.interval.day = controls.filters.selectBox.interval.days.val();
	if(filter.interval.month != 'all'){
		if(filter.intervalType == INTERVAL.HOURLY){
			$('#select_interval_hour').remove();		
			createHoursSelectBox();
		}
	}
	else{
		if(filter.intervalType == INTERVAL.DAILY){
			controls.filters.selectBox.interval.days.remove();
		}
		if(filter.intervalType == INTERVAL.HOURLY){
			controls.filters.selectBox.interval.hours.remove();
		}
	}
	refreshInformation();			// Request new data	
}

function createHoursSelectBox(){
	controls.filters.selectBox.interval.hours = $('<select></select>').attr('id', 'select_interval_hour');
	$('#select_interval_type').parent().append(controls.filters.selectBox.interval.hours);
	controls.filters.selectBox.interval.hours.change(hoursChanged);
	populateHours();
}

function hoursChanged(){
	filter.interval.hour = controls.filters.selectBox.interval.hours.val();
	if(filter.interval.month != 'all'){
		refreshInformation();			// Request new data		
	}
	else{
		if(filter.intervalType == INTERVAL.DAILY){
			controls.filters.selectBox.interval.days.remove();
		}
		if(filter.intervalType == INTERVAL.HOURLY){
			controls.filters.selectBox.interval.hours.remove();
		}
	}
	refreshInformation();			// Request new data	
}

function populateMonths(){
	var initialDate = new Date(data.time.earliest * 1000);
	var finalDate = new Date(data.time.latest * 1000);
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
	var initialDate = new Date(data.time.earliest * 1000);
	var finalDate = new Date(data.time.latest * 1000);
	var currentDate = new Date(initialDate.getFullYear(), filter.interval.month);
	var currentMonth = filter.interval.month;
	while(currentMonth == filter.interval.month && currentDate.getTime() < finalDate.getTime()){
		var day = currentDate.getDay();					// getDay() is 0-based
		var dayOfTheMonth = currentDate.getDate() - 1;	// getDate() is 1-based
		var dayString = DAYS[day];
		controls.filters.selectBox.interval.days.append($("<option></option>").attr("value", dayOfTheMonth).text(dayString + " " + parseInt(dayOfTheMonth + 1))); 
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
	while(currentDate == filter.interval.day && seconds < data.time.latest){
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

function updateApplications(){
	//var i;
	$("#select_applications").append($("<option></option>").attr("value", "all").text("All")); 
	//for(i = 0; i < macs.length; ++i){
	//	$("#select_applications").append($("<option></option>").attr("value",macs[i]).text(macs[i])); 
	//}	
}

function addPreferences(){
	console.log("adding preferences...");
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
	$check.change(function(){
		if($('#check_network_devices_downloaded').is(':checked')){
			console.log("show devices downloaded.");
			visuals.push(loadDevicesDownloaded);
			loadDevicesDownloaded();			
		}
		else{
			console.log("remove devices downloaded.");
			$('#v_devices_downloaded').remove();
		}		
	});	
	$label = $('<label>Devices downloaded</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);

	/* Devices uploaded */
	$check = createInput('check_network_devices_uploaded', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		if($('#check_network_devices_uploaded').is(':checked')){
			console.log("show devices uploaded.");
			visuals.push(loadDevicesUploaded);
			loadDevicesUploaded();			
		}
		else{
			console.log("remove devices uploaded.");
			$('#v_devices_uploaded').remove();			
		}			
	});	
	$label = $('<label>Devices uploaded</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);

	/* Usage */
	$check = createInput('check_network_usage', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		if($('#check_network_usage').is(':checked')){
			visuals.push(loadUsageTimeline);
			loadUsageTimeline();
		}
		else{
			console.log("remove network usage timeline.");
			$('#v_usage').remove();
		}
	});	
	$label = $('<label>Usage</label>');
	$label.attr('for', $check.attr('name'));
	$networkParent.append($check, $label);

	/* Application */
	$check = createInput('check_network_application', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		console.log("show network application.");
	});	
	$label = $('<label>Application</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);	

	/* Domains */
	$check = createInput('check_network_domains', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		console.log("show network domains.");
	});	
	$label = $('<label>Domains</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);	

	/* Country */
	$check = createInput('check_network_country', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		console.log("show network country.");
	});	
	$label = $('<label>Country</label>');
	$label.attr('for', $check.attr('name'));		
	$networkParent.append($check, $label);

	/* These visuals can only be displayed for device data. */
	/* Top downloaders */
	$check = createInput('check_top_downloaders', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){		
		if($('#check_network_usage').is(':checked')){
			console.log("show top downloaders.");
			visuals.push(loadTopDownloaders);
			loadTopDownloaders();
		}
		else{
			console.log("remove top downloaders.");
			$('#v_top_downloaders').remove();
		}		
	});	
	$label = $('<label>Top Downloaders</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);	

	/* Top uploaders */
	$check = createInput('check_top_uploaders', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){		
		if($('#check_network_usage').is(':checked')){
			console.log("show top uploaders.");
			visuals.push(loadTopUploaders);
			loadTopUploaders();
		}
		else{
			console.log("remove top uploaders.");
			$('#v_top_uploaders').remove();
		}		
	});	
	$label = $('<label>Top Uploaders</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);

	/* Downloaded timeline */
	$check = createInput('check_device_downloaded_timeline', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		console.log("show device downloaded timeline.");
	});	
	$label = $('<label>Downloaded timeline</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);	

	/* Uploaded timeline */
	$check = createInput('check_device_uploaded_timeline', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		console.log("show device uploaded timeline.");
	});	
	$label = $('<label>Uploaded timeline</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);

	/* Usage */
	$check = createInput('check_device_usage', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		console.log("show device usage.");
	});	
	$label = $('<label>Usage</label>');
	$label.attr('for', $check.attr('name'));
	$deviceParent.append($check, $label);

	/* Application */
	$check = createInput('check_device_application', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		console.log("show device application.");
	});	
	$label = $('<label>Application</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);	

	/* Domains */
	$check = createInput('check_device_domains', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		console.log("show device domains.");
	});	
	$label = $('<label>Domains</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);	

	/* Country */
	$check = createInput('check_device_country', 'checkbox');
	$check.attr('name', $check.attr('id'));
	$check.change(function(){
		console.log("show device country.");
	});	
	$label = $('<label>Country</label>');
	$label.attr('for', $check.attr('name'));		
	$deviceParent.append($check, $label);		
	
}

function createPreference(id, callback){

}