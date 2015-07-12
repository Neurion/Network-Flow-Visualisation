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

function updateFlowsInfo(){

	removeAllChildren(document.getElementById("top_2"));

	/* Num devices or device name */
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
}

function updateVisuals(){

	removeAllChildren(document.getElementById('top_4'));
	removeAllChildren(document.getElementById('header'));

	/** Charts/Graphs */
	loadProtocolChart(createVisual("Protocols"));
	loadUsageChart(createVisual("Usage"));
	//loadUploadTimeline(createVisual("Upload Timeline"));
	//loadDownloadTimeline(createVisual("Download Timeline"));

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
	if(controls.selectBox.interval.months != null){
		oldMonth = controls.selectBox.interval.months.val();
	}
	if(controls.selectBox.interval.days != null){
		oldDay = controls.selectBox.interval.days.val();
	}
	if(controls.selectBox.interval.hours != null){
		oldHour = controls.selectBox.interval.hours.val();
	}

	// Remove the select boxes.
	$('#select_interval_month').remove();
	$('#select_interval_day').remove();
	$('#select_interval_hour').remove();

	// Add new select boxes with updated values.
	updateMonthsSelectBox();
	if(oldMonth != null){
		if($("#select_interval_month option[value='" + oldMonth + "']").length == 1){
			controls.selectBox.interval.months.val(oldMonth);
			filter.interval.month = oldMonth;			
		}
	}	
	if(filter.intervalType == INTERVAL.DAILY || filter.intervalType == INTERVAL.HOURLY){
		updateDaysSelectBox();
		if(oldDay != null){
			controls.selectBox.interval.days.val(oldDay);
			filter.interval.day = oldDay;
		}		
		if(filter.intervalType == INTERVAL.HOURLY){
			updateHoursSelectBox();
			if(oldHour != null){
				controls.selectBox.interval.hours.val(oldHour);
				filter.interval.hour = oldHour;
			}
		}
	}
}

function updateMonthsSelectBox(){
	controls.selectBox.interval.months = $('<select></select>').attr('id', 'select_interval_month');
	controls.selectBox.interval.months.change(function(){
		
		filter.interval.month = controls.selectBox.interval.months.val();

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
	$('#select_interval_type').parent().append(controls.selectBox.interval.months);
	populateMonths();
}

function updateDaysSelectBox(){
	controls.selectBox.interval.days = $('<select></select>').attr('id', 'select_interval_day');
	$('#select_interval_type').parent().append(controls.selectBox.interval.days);
	console.log("listing days for month: " + filter.interval.month);
	controls.selectBox.interval.days.change(function(){
		filter.interval.day = controls.selectBox.interval.days.val();		
		if(filter.intervalType == INTERVAL.HOURLY){
			$('#select_interval_hour').remove();		
			updateHoursSelectBox();
		}
		refreshInformation();			// Request new data
	});
	populateDays();
}

function updateHoursSelectBox(){
	controls.selectBox.interval.hours = $('<select></select>').attr('id', 'select_interval_hour');
	$('#select_interval_type').parent().append(controls.selectBox.interval.hours);
	console.log("listing hours for day: " + filter.interval.day);
	controls.selectBox.interval.hours.change(function(){
		filter.interval.hour = controls.selectBox.interval.hours.val();		
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
		controls.selectBox.interval.months.append($("<option></option>").attr("value", currentDate.getMonth()).text(monthString)); 
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);	// Increment by one month.
	}
	filter.interval.month = controls.selectBox.interval.months.val();
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
		controls.selectBox.interval.days.append($("<option></option>").attr("value", dayOfTheMonth).text(dayString + " " + dayOfTheMonth)); 
		currentDate = new Date(currentDate.getTime() + (SECONDS.DAY * 1000));	// Increment by one day.
		currentMonth = currentDate.getMonth();
	}
	filter.interval.day = controls.selectBox.interval.days.val();
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
		controls.selectBox.interval.hours.append($("<option></option>").attr("value", hour).text(hour + ":00")); 		
		// Update hour for next iteration
		date = new Date(date.getTime() + (SECONDS.HOUR * 1000));	// Increment by one hour.
		//console.log(date.toString());		
		currentDate = date.getDate();
		seconds = date.getTime() / 1000;
	}
	//console.log("current day: " + currentDate + ", target day: " + filter.interval.day);
	filter.interval.hour = controls.selectBox.interval.hours.val();
}

function populateApplications(applications){
	var i;
	for(i = 0; i < macs.length; ++i){
		$("#select_devices").append($("<option></option>").attr("value",macs[i]).text(macs[i])); 
	}	
}

function saveHostName(name){
    $.ajax({
		type	: "POST",
		url 	: "save_host_name",
		data 	: { 
			csrfmiddlewaretoken: getCookie('csrftoken'),
			mac: filter.mac,
			name: name,
		},
		dataType : "text",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(){
    		console.log("name saved!");
    	},
    });		
}

/**
* Populates the flows table with the top 5 devices.
*/
function populateFlowTable(macs, downloadedBytes, uploadedBytes){
	var i;
	for(i = 0; i < macs.length; ++i){
		//$bar = $('<div></div>').addClass("horizontal_bar");
		$row = $('<div></div>').addClass("row");
		$c1 = $('<div></div>').addClass("cell").html(macs[i]);
		$c2 = $('<div></div>').addClass("cell").html("(to do)");
		$c3 = $('<div></div>').addClass("cell").html((downloadedBytes[i]/1000000).toFixed(2)+" MB");
		$c4 = $('<div></div>').addClass("cell").html((uploadedBytes[i]/1000000).toFixed(2)+" MB");
		$row.append($c1).append($c2).append($c3).append($c4);
		$("#flows_table").append($row);
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