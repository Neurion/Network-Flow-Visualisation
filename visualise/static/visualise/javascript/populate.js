function updateMetaData(){
	//console.log("updating meta data...");
	removeAllChildren(document.getElementById("top_2"));

	/* Display 'Num devices' or 'Device name' */
	if(filter.getMAC() != 'all'){
		$('#top_2').append($('<span></span>').addClass('info').text('Device:'));
		$('#top_2').append($('<span></span>').addClass('value').text(filter.getMAC()));

		if(data.devices.names[filter.getMAC()]){
			$('#text_name').val(n_names[filter.getMAC()]);
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
	var date = data.date.start;
	var t = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
	$('#top_2').append($('<span></span>').addClass('value').text(t));
	$('#top_2').append($('<span></span>').addClass('info').text('Latest data:'));
	date = data.date.end;
	t = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();		
	$('#top_2').append($('<span></span>').addClass('value').text(t));

	$('#top_2').append($('<span></span>').addClass('info').text('Downloaded:'));
	$('#top_2').append($('<span></span>').addClass('value').text(bytesToSize(data.bytes.downloaded)));
	$('#top_2').append($('<span></span>').addClass('info').text('Uploaded:'));
	$('#top_2').append($('<span></span>').addClass('value').text(bytesToSize(data.bytes.uploaded)));

	//console.log("...updated meta data.");
}

function updateFilterControls(){
	updateIntervalSelectBoxes();
	updateApplications();
}

function updateIntervalSelectBoxes(){

	if(filter.interval == INTERVAL.ALL){
		$('#select_interval_month').remove();
		$('#select_interval_day').remove();
		$('#select_interval_hour').remove();
		//updateFilterInterval();
		console.log('interval is all, remove controls.');
		return;
	}
	else if(filter.interval == INTERVAL.MONTHLY){
		var oldMonth;	// Store the old selected values.
		if(controls.filters.selectBox.time.months != null){
			oldMonth = controls.filters.selectBox.time.months.val();
		}
		$('#select_interval_month').remove();		// Remove the old select box.
		createMonthsSelectBox();	// Always show months
		if(oldMonth != -1){
			if($("#select_interval_month option[value='" + oldMonth + "']").length == 1){
				controls.filters.selectBox.time.months.val(oldMonth);
				filter.time.month = oldMonth;
				//console.log("setting month back to: " + oldMonth);		
			}
		}
	}
	else if(filter.interval == INTERVAL.DAILY){			
		var oldDay;
		if(controls.filters.selectBox.time.days != null){
			oldDay = controls.filters.selectBox.time.days.val();
		}		
		$('#select_interval_day').remove();	
		createDaysSelectBox();
		if(oldDay != -1){
			if($("#select_interval_day option[value='" + oldDay + "']").length == 1){
				controls.filters.selectBox.time.days.val(oldDay);
				filter.time.day = oldDay;			
			}
		}
	}	
	else if(filter.interval == INTERVAL.HOURLY){
		var oldDay, oldHour;
		if(controls.filters.selectBox.time.days != null){
			oldDay = controls.filters.selectBox.time.days.val();
		}		
		if(controls.filters.selectBox.time.hours != null){
			oldHour = controls.filters.selectBox.time.hours.val();
		}								
		$('#select_interval_day').remove();
		$('#select_interval_hour').remove();
		createDaysSelectBox();	
		createHoursSelectBox();
		if(oldDay != -1){
			if($("#select_interval_day option[value='" + oldDay + "']").length == 1){
				controls.filters.selectBox.time.days.val(oldDay);
				filter.time.day = oldDay;			
			}
		}
		if(oldHour != -1){
			if($("#select_interval_hour option[value='" + oldHour + "']").length == 1){
				controls.filters.selectBox.time.hours.val(oldHour);
				filter.time.hour = oldHour;			
			}
		}			
	}
}

function updateApplications(){
	//var i;
	$("#select_applications").append($("<option></option>").attr("value", "all").text("All")); 
	//for(i = 0; i < macs.length; ++i){
	//	$("#select_applications").append($("<option></option>").attr("value",macs[i]).text(macs[i])); 
	//}	
}

function addPreferences(){

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