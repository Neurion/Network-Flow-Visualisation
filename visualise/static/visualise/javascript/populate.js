function populateFlowsInfo(){
	$.ajax({
		type: "POST",
		url: "get_flows_info",
		data: {
			csrfmiddlewaretoken: getCookie('csrftoken'),
			mac: filter.mac,
		},
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			//console.log(json_data);
			
			flowData.time.earliest = json_data['timestamp_earliest']
			flowData.time.latest = json_data['timestamp_latest']

			var oldMac = $('#select_devices').val();
			$('#select_devices').val(filter.mac);

			removeAllChildren(document.getElementById("top_2"));

			/* Num devices or device name */
			if(filter.mac != 'All'){
				$('#top_2').append($('<span></span>').addClass('info').text('Device:'));
				$('#top_2').append($('<span></span>').addClass('value').text(json_data['name']));
			}
			else{
				$('#top_2').append($('<span></span>').addClass('info').text('Local devices:'));
				$('#top_2').append($('<span></span>').addClass('value').text(json_data['macs'].length));
			}
		
			$('#top_2').append($('<span></span>').addClass('info').text('Earliest data:'));
			var date = new Date(flowData.time.earliest * 1000);
			var t = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
			$('#top_2').append($('<span></span>').addClass('value').text(t));
			$('#top_2').append($('<span></span>').addClass('info').text('Latest data:'));
			date = new Date(flowData.time.latest * 1000);
			t = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();		
			$('#top_2').append($('<span></span>').addClass('value').text(t));

			// Populate the filter controls.
			populateMACAddresses(json_data['macs']);
			$('#select_devices').val(oldMac);

			updateIntervalSelectBoxes();
		},
	});	
}

function populateMACAddresses(macs){
	if(macs != null)
		n_deviceMACs = macs;
	removeAllChildren(document.getElementById('select_devices'));
	$("#select_devices").append($("<option></option>").attr("value", "All").text("All")); 
	var i;
	for(i = 0; i < n_deviceMACs.length; ++i){
		$("#select_devices").append($("<option></option>").attr("value", n_deviceMACs[i]).text(n_deviceMACs[i])); 
	}
}

function populateIntervalSelectBox(){
	$("#select_interval_type").append($("<option></option>").attr("value", "monthly").text("Monthly")); 
	//$("#select_interval_range").append($("<option></option>").attr("value", "weekly").text("Weekly"));
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
	addMonthsSelectBox();
	if(oldMonth != null){		
		controls.selectBox.interval.months.val(oldMonth);
		filter.interval.month = oldMonth;
	}	
	if(filter.intervalType == INTERVAL.DAILY || filter.intervalType == INTERVAL.HOURLY){
		addDaysSelectBox();
		if(oldDay != null){
			controls.selectBox.interval.days.val(oldDay);
			filter.interval.day = oldDay;
		}		
		if(filter.intervalType == INTERVAL.HOURLY){
			addHoursSelectBox();
			if(oldHour != null){
				controls.selectBox.interval.hours.val(oldHour);
				filter.interval.hour = oldHour;
			}			
		}
	}
}

function addMonthsSelectBox(){
	controls.selectBox.interval.months = $('<select></select>').attr('id', 'select_interval_month');
	controls.selectBox.interval.months.change(function(){
		filter.interval.month = controls.selectBox.interval.months.val();

		var now = new Date();
		var startOfMonth = new Date(now.getFullYear(), filter.interval.month);
		var timestamp = startOfMonth / 1000;		

		if(filter.intervalType == INTERVAL.DAILY || filter.intervalType == INTERVAL.HOURLY){
			//console.log("updating day select box.");
			$('#select_interval_day').remove();
			addDaysSelectBox();
		}
		if(filter.intervalType == INTERVAL.HOURLY){
			//console.log("updating hour select box.");
			$('#select_interval_hour').remove();
			addHoursSelectBox();
		}
	});
	$('#select_interval_type').parent().append(controls.selectBox.interval.months);
	populateMonths();
}

function addDaysSelectBox(){
	controls.selectBox.interval.days = $('<select></select>').attr('id', 'select_interval_day');
	$('#select_interval_type').parent().append(controls.selectBox.interval.days);
	console.log("listing days for month: " + filter.interval.month);
	controls.selectBox.interval.days.change(function(){
		filter.interval.day = controls.selectBox.interval.days.val();		
		if(filter.intervalType == INTERVAL.HOURLY){
			//console.log("updating hour select box.");
			$('#select_interval_hour').remove();		
			addHoursSelectBox();
		}		
	});
	populateDays();
}

function addHoursSelectBox(){
	controls.selectBox.interval.hours = $('<select></select>').attr('id', 'select_interval_hour');
	$('#select_interval_type').parent().append(controls.selectBox.interval.hours);
	console.log("listing hours for day: " + filter.interval.day);
	controls.selectBox.interval.hours.change(function(){
		filter.interval.hour = controls.selectBox.interval.hours.val();		
	});
	populateHours();
}

function populateMonths(){	
	var firstSeconds = flowData.time.earliest;
	var lastSeconds = flowData.time.latest + SECONDS.MONTH;
	var date = new Date(firstSeconds * 1000);
	var seconds = date.getTime() / 1000;
	while(seconds < lastSeconds){
		var month = date.getMonth();
		var monthString = MONTHS[month];
		controls.selectBox.interval.months.append($("<option></option>").attr("value", month).text(monthString)); 
		date = new Date(date.getTime() + (SECONDS.MONTH * 1000));	// Increment by one month.
		seconds = date.getTime() / 1000;
	}
	filter.interval.month = controls.selectBox.interval.months.val();
}

function populateDays(){	
	var now = new Date();
	var date = new Date(now.getFullYear(), filter.interval.month);
	var seconds = date.getTime() / 1000;
	var currentMonth = filter.interval.month;
	while(currentMonth == filter.interval.month && seconds < flowData.time.latest){
		var day = date.getDay();
		var dayOfTheMonth = date.getDate();
		var dayString = DAYS[day];
		controls.selectBox.interval.days.append($("<option></option>").attr("value", dayOfTheMonth).text(dayString + " " + dayOfTheMonth)); 
		date = new Date(date.getTime() + (SECONDS.DAY * 1000));	// Increment by one day.
		currentMonth = date.getMonth();
		seconds = date.getTime() / 1000;
	}
	filter.interval.day = controls.selectBox.interval.days.val();
}

/** Populates the hours select box control. It is required that the month and day select boxes are already populated. */
function populateHours(){
	var now = new Date();
	var date = new Date(now.getFullYear(), filter.interval.month, filter.interval.day);
	var seconds = date.getTime() / 1000;
	var currentDate = filter.interval.day;
	console.log(date.toString());
	while(currentDate == filter.interval.day && seconds < flowData.time.latest){
		// While within the desired day AND before the absolute latest date.
		console.log("current day: " + currentDate + ", target day: " + filter.interval.day);
		var hour = date.getHours();
		controls.selectBox.interval.hours.append($("<option></option>").attr("value", hour).text(hour + ":00")); 		
		// Update hour for next iteration
		date = new Date(date.getTime() + (SECONDS.HOUR * 1000));	// Increment by one hour.
		console.log(date.toString());		
		currentDate = date.getDate();
		seconds = date.getTime() / 1000;
	}
	console.log("current day: " + currentDate + ", target day: " + filter.interval.day);
	filter.interval.hour = controls.selectBox.interval.hours.val();
}

function populateApplications(applications){
	var i;
	for(i = 0; i < macs.length; ++i){
		$("#select_devices").append($("<option></option>").attr("value",macs[i]).text(macs[i])); 
	}	
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