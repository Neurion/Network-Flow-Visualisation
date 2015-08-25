function updateMetaData(){
	//console.log("updating meta data...");
	removeAllChildren(document.getElementById("top_2"));

	/* Display 'Num devices' or 'Device name' */
	if(filter.getDevice() != 'all'){
		$('#top_2').append($('<span></span>').addClass('info').text('Device:'));
		$('#top_2').append($('<span></span>').addClass('value').text(filter.getDevice()));

		if(data.devices.names[filter.getDevice()]){
			$('#text_name').val(n_names[filter.getDevice()]);
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

function populateSignificant(device){	
	if(statMenu == STAT_MENU.OVERVIEW){
		populateOverview();
	}
	else if(statMenu == STAT_MENU.DOWNLOADED){
		populateTopDownloaders(device);
	}
	else if(statMenu == STAT_MENU.UPLOADED){
		populateTopUploaders(device);
	}
	else if(statMenu == STAT_MENU.LOCATIONS){
		populateTopLocations();
	}
	else if(statMenu == STAT_MENU.APPLICATIONS){
		populateTopApplications();
	}	
	else{
		console.log('unknown statMenu...');
	}
}

function populateOverview(){
	var container = $('#main');

	$('#main > *').each(function () {
		this.remove();
	});

	/* Table */
	var padding = $('<div></div>').addClass('full_width_padding');

	var summary_table = $('<div></div>').attr('id', 'summary_table');

	var header = $('<div></div>').addClass('header');
	header.append($('<span></span>').addClass('item').text('Devices'));
	header.append($('<span></span>').addClass('item').text('Time start'));
	header.append($('<span></span>').addClass('item').text('Time end'));
	header.append($('<span></span>').addClass('item').text('Total Traffic'));
	header.append($('<span></span>').addClass('item').text('Downloaded'));
	header.append($('<span></span>').addClass('item').text('Uploaded'));
	/*header.append($('<span></span>').addClass('item').text('Locations'));*/
	summary_table.append(header);

	var row = $('<div></div>').addClass('row');
	row.append($('<span></span>').addClass('item').text(aggregateData.devices.length));
	row.append($('<span></span>').addClass('item').text(aggregateData.dateStart.toDateString()));
	row.append($('<span></span>').addClass('item').text(aggregateData.dateEnd.toDateString()));
	row.append($('<span></span>').addClass('item').text(bytesToSize(aggregateData.downloaded + aggregateData.uploaded)));
	row.append($('<span></span>').addClass('item').text(bytesToSize(aggregateData.downloaded)));
	row.append($('<span></span>').addClass('item').text(bytesToSize(aggregateData.uploaded)));
	/*row.append($('<span></span>').addClass('item').text('test'));	*/
	summary_table.append(row);

	summary_table.append($('<div></div>').addClass('clear'));

	padding.append(summary_table);
	container.append(padding);

	/* Traffic */
	var third_padding = $('<div></div>').addClass('third_padding');
	var traffic_pie_title = $('<div></div>').attr('id', 'traffic_pie_title').text('Network Traffic');
	var traffic_pie = $('<div></div>').attr('id', 'overview_traffic_pie');
	third_padding.append(traffic_pie_title);	
	third_padding.append(traffic_pie);
	container.append(third_padding);

	/* Applications */
	third_padding = $('<div></div>').addClass('third_padding');
	var application_pie_title = $('<div></div>').attr('id', 'application_pie_title').text('Network Applications');
	var overview_applications_pie = $('<div></div>').attr('id', 'overview_applications_pie');
	third_padding.append(application_pie_title);	
	third_padding.append(overview_applications_pie);
	container.append(third_padding);

	/* Traffic */
	populateOverviewTraffic(aggregateData.downloaded, aggregateData.uploaded);
	/* Applications */
	populateOverviewApplications();
}

function populateDeviceOverview(){
	var container = $('#main');

	$('#main > *').each(function () {
		this.remove();
	});

	/* Table */
	var padding = $('<div></div>').addClass('full_width_padding');

	var summary_table = $('<div></div>').attr('id', 'summary_table');

	var header = $('<div></div>').addClass('header');
	header.append($('<span></span>').addClass('item').text('Device'));
	header.append($('<span></span>').addClass('item').text('Total Traffic'));
	header.append($('<span></span>').addClass('item').text('Downloaded'));
	header.append($('<span></span>').addClass('item').text('Uploaded'));
	/*header.append($('<span></span>').addClass('item').text('Locations'));*/
	summary_table.append(header);

	var row = $('<div></div>').addClass('row');
	row.append($('<span></span>').addClass('item').text(filter.getDevice()));
	row.append($('<span></span>').addClass('item').text(bytesToSize(subsetData.downloaded + subsetData.uploaded)));
	row.append($('<span></span>').addClass('item').text(bytesToSize(subsetData.downloaded)));
	row.append($('<span></span>').addClass('item').text(bytesToSize(subsetData.uploaded)));
	/*row.append($('<span></span>').addClass('item').text('test'));	*/
	summary_table.append(row);

	summary_table.append($('<div></div>').addClass('clear'));

	padding.append(summary_table);
	container.append(padding);

	/* Traffic */
	var third_padding = $('<div></div>').addClass('third_padding');
	var traffic_pie_title = $('<div></div>').attr('id', 'traffic_pie_title').text('Network Traffic');
	var traffic_pie = $('<div></div>').attr('id', 'overview_traffic_pie');
	third_padding.append(traffic_pie_title);	
	third_padding.append(traffic_pie);
	container.append(third_padding);

	/* Applications */
	third_padding = $('<div></div>').addClass('third_padding');
	var application_pie_title = $('<div></div>').attr('id', 'application_pie_title').text('Network Applications');
	var overview_applications_pie = $('<div></div>').attr('id', 'overview_applications_pie');
	third_padding.append(application_pie_title);	
	third_padding.append(overview_applications_pie);
	container.append(third_padding);

	/* Traffic */
	populateOverviewTraffic(subsetData.downloaded, subsetData.uploaded);
	
	/* Applications */
	populateOverviewApplications();
}

function populateOverviewTraffic(downloaded, uploaded){

	var container = $('#overview_traffic_pie');

	var dataset = [downloaded, uploaded];

	var options = {
	    series: {
	        pie: {
	            show: true,	
	            radius: 1,
	            label: {
	            	show: true,
	                radius: 1/2,
	                formatter: function(label, point){
	                	return(point.percent.toFixed(2) + '%');
	                },
		        }
	        }
	    },
	    grid: {
	        hoverable: true,
	        clickable: true,
	    },	    
	    legend: {
			show: true,
			//container: $("#stat_timeline"),
	    }
	};
	var plot = $.plot(container, dataset, options);	
}

function populateOverviewApplications(){

	var container = $('#overview_applications_pie');

	var dataset = aggregateData.applications;

	var options = {
	    series: {
	        pie: {
	            show: true,	
	            radius: 1,
	            label: {
	            	show: true,
	                radius: 1/2,
	                formatter: function(label, point){
	                	return(point.percent.toFixed(2) + '%');
	                },
		        }
	        }
	    },
	    grid: {
	        hoverable: true,
	        clickable: true,
	    },	    
	    legend: {
			show: true,
			container: $("#stat_timeline"),
	    }
	};
	var plot = $.plot(container, dataset, options);	
}

function populateOverviewDownloaded(){

}

function populateOverviewUploaded(){

}

function populateTopDownloaders(device){

	var container = $('#main');
	$('#main > *').each(function(){
		this.remove();
	});

	var sorted = devices.sort(compareDownloaded);

	if(devices[0].downloaded == null){
		console.log("Highest downloader has 0 bytes downloaded");
		return;
	}

	if(device == null || device == ''){
		device = sorted[0].device;
	}

	var stat_timeline = $('<div></div>').attr('id', 'stat_timeline');
	container.append($('<div></div>').attr('class', 'timeline_padding').append(stat_timeline));
	var stat_pie = $('<div></div>').attr('id', 'stat_pie');
	container.append($('<div></div>').attr('class', 'pie_padding').append(stat_pie));
	var stat_table = $('<div></div>').attr('id', 'stat_table');
	container.append($('<div></div>').attr('class', 'table_padding').append(stat_table));
	var div_clear = $('<div></div>').addClass('clear');
	$('#main').append(div_clear);

	/* Table */
	populateStatTable(sorted, device);

	/* Timeline */
	populateStatTimeline(device, 'downloaded');

	/* Pie */
	var e, other = 0;
	var d1 = [], d2 = [];
	for(var i = 0; i < sorted.length; i++){
		d1.push(sorted[i].device);
		d2.push(sorted[i].downloaded);
		e = i;
	}	
	for(; e < sorted.length; e++){
		other += sorted[e].downloaded;
	}
	d1.push("other");
	d2.push(other);	
	populateStatPie(d1, d2);
}

function populateTopUploaders(device){
	var container = $('#main');
	$('#main > *').each(function(){
		this.remove();
	});
	var stat_timeline = $('<div></div>').attr('id', 'stat_timeline');
	container.append($('<div></div>').attr('class', 'timeline_padding').append(stat_timeline));
	var stat_pie = $('<div></div>').attr('id', 'stat_pie');
	container.append($('<div></div>').attr('class', 'pie_padding').append(stat_pie));
	var stat_table = $('<div></div>').attr('id', 'stat_table');
	container.append($('<div></div>').attr('class', 'table_padding').append(stat_table));
	var div_clear = $('<div></div>').addClass('clear');
	$('#main').append(div_clear);

	var sorted = devices.sort(compareUploaded);

	if(devices[0].uploaded == null){
		console.log("Highest uploader has 0 bytes uploaded");
		return;
	}

	if(device == null || device == ''){
		device = sorted[0].device;
	}

	/* Table */
	populateStatTable(sorted, device);

	/* Timeline */
	populateStatTimeline(device, 'uploaded');

	/* Pie */
	var e, other = 0;
	var d1 = [], d2 = [];
	for(var i = 0; i < sorted.length; i++){
		d1.push(sorted[i].device);
		d2.push(sorted[i].uploaded);
		e = i;
	}	
	for(; e < sorted.length; e++){
		other += sorted[e].uploaded;
	}
	d1.push("other");
	d2.push(other);		
	populateStatPie(d1, d2);
}

function populateTopLocations(){
	var container = $('#main');
	$('#main > *').each(function(){
		this.remove();
	});
	var stat_timeline = $('<div></div>').attr('id', 'stat_timeline');
	container.append($('<div></div>').attr('class', 'timeline_padding').append(stat_timeline));
	var stat_pie = $('<div></div>').attr('id', 'stat_pie');
	container.append($('<div></div>').attr('class', 'pie_padding').append(stat_pie));
	var stat_table = $('<div></div>').attr('id', 'stat_table');
	container.append($('<div></div>').attr('class', 'table_padding').append(stat_table));

    $.ajax({
		type	: "POST",
		url 	: "get_top_domains",
		data 	: {
			csrfmiddlewaretoken: getCookie('csrftoken'),
			interval: filter.getInterval(),
		},
		dataType: "json",
		async 	: true,
		error 	: function(data){
			console.log("AJAX error with get_top_domains.");
		},
    	success : function(json_data){
    		console.log(json_data);

    		var domains = json_data;

    		$('#stat_table').remove();

			/* Table */
			var table = $('<div></div>').attr('id', 'locations_table');

			/* Table header. */
			var newRow = $('<div></div>').addClass('header');
			newRow.append($('<span></span>').text('Domain'));
			newRow.append($('<span></span>').text('Country'));
			//newRow.append($('<span></span>').text('Volume').css('text-align', 'right'));
			newRow.append($('<span></span>').text('Downloaded').css('text-align', 'right'));
			newRow.append($('<span></span>').text('Uploaded').css('text-align', 'right'));
			table.append(newRow);

			/* Data */
			for(var i = 0; i < domains.length; i++){
				newRow = $('<div></div>').addClass('row');
				newRow.append($('<span></span>').addClass('domain').text(domains[i]));
				newRow.append($('<span></span>').text('test'));
				newRow.append($('<span></span>').text('test'));
				newRow.append($('<span></span>').text('test'));
				newRow.click(function(){			
					//var device = $(this).find('.device').text();	
					populateSignificant();
				});

				table.append(newRow);
			}

			table.append($('<div></div>').addClass('clear'));
			//var padding = $('<div></div>').addClass('padding');
			//padding.append(table);			
			$('#main').append(table);
    	},
    });
}

function populateTopApplications(selectedApplication){
	var container = $('#main');
	$('#main > *').each(function(){
		this.remove();
	});

	var stat_timeline = $('<div></div>').attr('id', 'stat_timeline');
	container.append($('<div></div>').attr('class', 'timeline_padding').append(stat_timeline));
	var stat_pie = $('<div></div>').attr('id', 'stat_pie');
	container.append($('<div></div>').attr('class', 'pie_padding').append(stat_pie));
	var stat_table = $('<div></div>').attr('id', 'stat_table');
	container.append($('<div></div>').attr('class', 'table_padding').append(stat_table));
	var sorted = aggregateData.applications.sort(compareApplications);

	if(sorted[0] == null){
		console.log("Applications are null.");
		return;
	}

	if(sorted == null || selectedApplication == ''){
		selectedApplication = sorted[0];
	}

	/* Table */
	populateApplicationTable(sorted, selectedApplication);

	/* Timeline */
	populateApplicationTimeline(selectedApplication);

	/* Pie */
	var e, other = 0;
	var d1 = [], d2 = [];
	for(var i = 0; i < sorted.length; i++){
		d1.push(sorted[i][0]);
		d2.push(sorted[i][1]);
		e = i;
	}	
	populateStatPie(d1, d2);
}














function populateStatTimeline(device, compare){
	var target = filter.getDevice();
	if(device != null && device != ""){
		target = device;
	}

	var url, label;
	if(compare == 'downloaded'){
		url = 'get_downloaded_intervals_by_device';
		label = 'Downloaded';
	}
	else if(compare == 'uploaded'){
		url = 'get_uploaded_intervals_by_device';
		label = 'Uploaded';
	}

    $.ajax({
		type	: "POST",
		url 	: url,
		data 	: {
			csrfmiddlewaretoken: getCookie('csrftoken'),
			device: target,
			direction: filter.getDirection(),
			//ts_start: filter.
			interval: filter.getInterval(),
		},
		dataType : "json",
		async : true,
		error : function(data){
			console.log("AJAX error with " + url);
		},
    	success : function(json_data){

    		var data, time_start = json_data.ts_start, max = json_data.max;
    		if(compare == 'downloaded'){
    			data = json_data.downloaded;
    		}
    		else if(compare == 'uploaded'){
    			data = json_data.uploaded;
    		}

			var month = filter.getMonthString();

			var timeLabel, timeFormat, tickSize, timeLabel, tickFormatter;
			if(filter.getInterval() == INTERVAL.MONTHLY){
				timeLabel = "Days";
				timeFormat = "%d";
				tickSize = [1, "day"]; // tick every day
				tickFormatter = function (val, axis) {
					var date = new Date(val);
			        return DAYS[date.getDay()] + " " + date.getDate();
			    };
			}
			else if(filter.getInterval() == INTERVAL.DAILY){
				timeLabel = "Hours";
				timeFormat = "%h";
				tickSize = [1, "hour"]; // tick every hour
			}
			else if(filter.getInterval() == INTERVAL.HOURLY){
				timeLabel = "Minutes";
				timeFormat = "%m";
				tickSize = [1, "minute"]; // tick every minute
			}

			var data = [
			    { label: label, data: data, points: { fillColor: "blue" }, color: 'blue' },
			];

			var options = {
				series: {		
				    shadowSize: 5,	
				    lines:{
				    	fill: true,	// area chart
				    },
				   	points: {
				    	show: false,
				    },   	    		          
				},
			    xaxis: {    
		            axisLabel: timeLabel,
		            axisLabelUseCanvas: false,	    
		            mode: "time",
		            timeformat: timeFormat,
				    tickFormatter: tickFormatter,
				    //tickFormatter: function(val, axis){
				    	//console.log(new Date(val));
				    	//return new Date(val * 1000).getDate();
				    //}
					//min: (new Date(time_start)).getTime(),
					//max: 50000000,				    
				},
			    yaxis: {		
				    position: "left",
		            axisLabel: label,
		            axisLabelUseCanvas: false,
		            tickFormatter: function(val, axis) {           
				        return bytesToSize(val);
				    },
					min: 0,
					//max: max,
				},		
			    grid: {
			        backgroundColor: "#fff",
			    },      
			};

			var plot = $.plot($('#stat_timeline'), data, options);	
	    }
	});
}

function populateApplicationTimeline(){

	var target = filter.getApplication();

	var url, label;
	url = 'get_intervals_by_application';
	label = 'Application';

    $.ajax({
		type	: "POST",
		url 	: url,
		data 	: {
			csrfmiddlewaretoken: getCookie('csrftoken'),
			device: target,
			direction: filter.getDirection(),
			//ts_start: filter.
			interval: filter.getInterval(),
		},
		dataType : "json",
		async : true,
		error : function(data){
			console.log("AJAX error with " + url);
		},
    	success : function(json_data){

    		var dataset = [], time_start = json_data.ts_start, max = json_data.max;
    		var apps = json_data.application;
    		var data = json_data.data;

    		for(var i = 0; i < apps.length; i++){
    			dataset.push({label: apps[i], data: data[i]});
    		}

			var month = filter.getMonthString();

			var timeLabel, timeFormat, tickSize, timeLabel, tickFormatter;
			if(filter.getInterval() == INTERVAL.MONTHLY){
				timeLabel = "Days";
				timeFormat = "%d";
				tickSize = [1, "day"]; // tick every day
				tickFormatter = function (val, axis) {
					var date = new Date(val);
			        return DAYS[date.getDay()] + " " + date.getDate();
			    };
			}
			else if(filter.getInterval() == INTERVAL.DAILY){
				timeLabel = "Hours";
				timeFormat = "%h";
				tickSize = [1, "hour"]; // tick every hour
			}
			else if(filter.getInterval() == INTERVAL.HOURLY){
				timeLabel = "Minutes";
				timeFormat = "%m";
				tickSize = [1, "minute"]; // tick every minute
			}

			var options = {
				series: {		
				    shadowSize: 5,	
				    lines:{
				    	fill: true,	// area chart
				    },
				   	points: {
				    	show: false,
				    },   	    		          
				},
			    xaxis: {    
		            axisLabel: timeLabel,
		            axisLabelUseCanvas: false,	    
		            mode: "time",
		            timeformat: timeFormat,
				    tickFormatter: tickFormatter,
				    //tickFormatter: function(val, axis){
				    	//console.log(new Date(val));
				    	//return new Date(val * 1000).getDate();
				    //}
					//min: (new Date(time_start)).getTime(),
					//max: 50000000,				    
				},
			    yaxis: {		
				    position: "left",
		            axisLabel: label,
		            axisLabelUseCanvas: false,
		            tickFormatter: function(val, axis) {           
				        return bytesToSize(val);
				    },
					min: 0,
					//max: max,
				},		
			    grid: {
			        backgroundColor: "#fff",
			    },      
			};

			var plot = $.plot($('#stat_timeline'), dataset, options);	
	    }
	});
}

function populateStatPie(data1, data2){

	var dataset = [];
	var e, other = 0;
	for(var i = 0; i < data1.length; i++){
		dataset.push([data1[i], data2[i]]);
		e = i;
	}

	var options = {
	    series: {
	        pie: {
	            show: true,	
	            radius: 1,
	            label: {
	            	show: true,
	                radius: 1/2,
	                formatter: function(label, point){
	                	return(point.percent.toFixed(2) + '%');
	                },
		        }
	        }
	    },
	    grid: {
	        hoverable: true,
	        clickable: true,
	    },	    
	    legend: {
			show: true,
			container: $("#stat_timeline"),
	    }
	};
	var plot = $.plot($('#stat_pie'), dataset, options);

	$('#stat_pie').bind("plotclick", function(event, pos, obj) {
		//console.log(obj);
		//window.location.replace(data[obj.seriesIndex].url);
	});		
}

function populateStatTable(sortedDevices, device){
	var table = $('#stat_table');

	/* Table header. */
	var newRow = $('<div></div>').addClass('header');
	newRow.append($('<span></span>').text('Device'));
	newRow.append($('<span></span>').text('Volume').css('text-align', 'right'));
	newRow.append($('<span></span>').text('Downloaded').css('text-align', 'right'));
	newRow.append($('<span></span>').text('Uploaded').css('text-align', 'right'));
	newRow.append($('<span></span>').text('Flows'));
	newRow.append($('<span></span>').text('Start Date'));
	newRow.append($('<span></span>').text('End Date'));
	table.append(newRow);

	for(var i = 0; i < 10 && i < sortedDevices.length; i++){
		newRow = $('<div></div>').addClass('row');
		if(sortedDevices[i].device == device){
			newRow.css('opacity', '0.5');
		}
		newRow.append($('<span></span>').attr('class', 'device').text(sortedDevices[i].device));
		var volumeBytes = toInt(sortedDevices[i].downloaded) + toInt(sortedDevices[i].uploaded);
		newRow.append($('<span></span>').text(bytesToSize(volumeBytes)));
		var downloadedBytes = toInt(sortedDevices[i].downloaded);
		newRow.append($('<span></span>').text(bytesToSize(downloadedBytes)));
		var uploadedBytes = toInt(sortedDevices[i].uploaded);
		newRow.append($('<span></span>').text(bytesToSize(uploadedBytes)));
		newRow.append($('<span></span>').text(sortedDevices[i].flows));
		var dateStart = DAYS[sortedDevices[i].timeStart.getDay()] + ' ' + sortedDevices[i].timeStart.getDate() + ' ' + MONTHS[(sortedDevices[i].timeStart.getMonth() + 1)] + ' ' + sortedDevices[i].timeStart.getFullYear();
		newRow.append($('<span></span>').text(dateStart));
		var dateEnd = DAYS[sortedDevices[i].timeEnd.getDay()] + ' ' + sortedDevices[i].timeStart.getDate() + ' ' + MONTHS[(sortedDevices[i].timeEnd.getMonth() + 1)] + ' ' + sortedDevices[i].timeEnd.getFullYear();
		newRow.append($('<span></span>').text(dateEnd));
		/* Item click */
		newRow.click(function(){			
			var device = $(this).find('.device').text();	
			populateSignificant(device);
		});
		table.append(newRow);
	}

	table.append($('<div></div>').addClass('clear'));
}

function populateApplicationTable(sortedApplications, selectedApplication){
	var table = $('#stat_table');

	/* Table header. */
	var newRow = $('<div></div>').addClass('header');
	newRow.append($('<span></span>').text('Application'));
	newRow.append($('<span></span>').text('Volume').css('text-align', 'right'));
	newRow.append($('<span></span>').text('Downloaded').css('text-align', 'right'));
	newRow.append($('<span></span>').text('Uploaded').css('text-align', 'right'));
	table.append(newRow);

	for(var i = 0; i < 10 && i < sortedApplications.length; i++){
		newRow = $('<div></div>').addClass('row');
		if(sortedApplications[i] == selectedApplication){
			newRow.css('opacity', '0.5');
		}
		newRow.append($('<span></span>').attr('class', 'application').text(sortedApplications[i][0]));
		var volumeBytes = toInt(sortedApplications[i][1]) + toInt(sortedApplications[i][2]);
		newRow.append($('<span></span>').text(bytesToSize(volumeBytes)));
		var downloadedBytes = toInt(sortedApplications[i][1]);
		newRow.append($('<span></span>').text(bytesToSize(downloadedBytes)));
		var uploadedBytes = toInt(sortedApplications[i][2]);
		newRow.append($('<span></span>').text(bytesToSize(uploadedBytes)));
		/* Item click */
		newRow.click(function(){			
			var device = $(this).find('.device').text();	
			populateSignificant(device);
		});
		table.append(newRow);
	}

	table.append($('<div></div>').addClass('clear'));	
}