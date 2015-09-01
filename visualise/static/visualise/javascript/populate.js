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

function refreshVisuals(device){
	// Display information for all devices.
	if(filter.isActive() && filter.getDevice() != "all"){

		requestSubsetData(function(){
			if(statMenu == STAT_MENU.OVERVIEW){
				populateDeviceOverview(subsetData);
			}
			else if(statMenu == STAT_MENU.DOWNLOADED){
				populateTopDownloaders(subsetData, device);
			}
			else if(statMenu == STAT_MENU.UPLOADED){
				populateTopUploaders(subsetData, device);
			}
			else if(statMenu == STAT_MENU.LOCATIONS){
				populateTopLocations(subsetData);
			}
			else if(statMenu == STAT_MENU.APPLICATIONS){
				populateTopApplications(subsetData);
			}								
			else{
				console.log('Invalid statMenu, should not happen.');
				return;
			}
		});
	}
	// Else display information for a single device.
	else{
		getAggregateData(function(){
			if(statMenu == STAT_MENU.OVERVIEW){
				populateOverview(aggregateData);
			}
			else if(statMenu == STAT_MENU.DOWNLOADED){
				populateTopDownloaders(aggregateData, device);
			}
			else if(statMenu == STAT_MENU.UPLOADED){
				populateTopUploaders(aggregateData, device);
			}
			else if(statMenu == STAT_MENU.LOCATIONS){
				populateTopLocations(aggregateData);
			}
			else if(statMenu == STAT_MENU.APPLICATIONS){
				populateTopApplications(aggregateData);
			}								
			else{
				console.log('Invalid statMenu, should not happen.');
				return;
			}			
		});
	}
}

/****************************************************************************************/
/******************************************* Overview ********************************/
/****************************************************************************************/
function populateOverview(data){
	var container = $('#main');

	$('#main > *').each(function () {
		this.remove();
	});

	/* Table */
	var full_width_padding = $('<div></div>').addClass('full_width_padding');

	var overview_table = $('<div></div>').attr('id', 'overview_table');

	var header = $('<div></div>').addClass('header');
	header.append($('<div></div>').addClass('item device').text('Devices'));
	header.append($('<div></div>').addClass('item date_start').text('Time start'));
	header.append($('<div></div>').addClass('item date_end').text('Time end'));	
	header.append($('<div></div>').addClass('item downloaded').text('Downloaded'));
	header.append($('<div></div>').addClass('item uploaded').text('Uploaded'));
	header.append($('<div></div>').addClass('item total_traffic').text('Total Traffic'));
	overview_table.append(header);

	var row = $('<div></div>').addClass('row');
	row.append($('<div></div>').addClass('item device').text(data.devices.length));
	row.append($('<div></div>').addClass('item date_start').text(data.dateStart.toDateString()));
	row.append($('<div></div>').addClass('item date_end').text(data.dateEnd.toDateString()));
	row.append($('<div></div>').addClass('item downloaded').text(bytesToSize(data.downloaded)));
	row.append($('<div></div>').addClass('item uploaded').text(bytesToSize(data.uploaded)));
	row.append($('<div></div>').addClass('item total_traffic').text(bytesToSize(data.downloaded + data.uploaded)));
	overview_table.append(row);

	overview_table.append($('<div></div>').addClass('clear'));

	full_width_padding.append(overview_table);
	container.append(full_width_padding);

	/* Traffic */
	var half_padding = $('<div></div>').addClass('half_padding');
	var overview_traffic_pie_title = $('<div></div>').attr('id', 'overview_traffic_pie_title').text('Traffic');
	var overview_traffic_pie = $('<div></div>').attr('id', 'overview_traffic_pie');
	half_padding.append(overview_traffic_pie_title);	
	half_padding.append(overview_traffic_pie);
	container.append(half_padding);

	/* Applications */
	half_padding = $('<div></div>').addClass('half_padding');
	var application_pie_title = $('<div></div>').attr('id', 'application_pie_title').text('Applications');
	var overview_applications_pie = $('<div></div>').attr('id', 'overview_applications_pie');
	half_padding.append(application_pie_title);	
	half_padding.append(overview_applications_pie);
	container.append(half_padding);

	/* Traffic */
	populateOverviewTraffic(data.downloaded, data.uploaded);
	/* Applications */
	populateOverviewApplications();
}

function populateDeviceOverview(data){
	var container = $('#main');

	$('#main > *').each(function () {
		this.remove();
	});

	/* Table */
	var padding = $('<div></div>').addClass('full_width_padding');

	var overview_table = $('<div></div>').attr('id', 'overview_table');

	var header = $('<div></div>').addClass('header');
	header.append($('<div></div>').addClass('item device').text('Device'));
	header.append($('<div></div>').addClass('item device_name').text('Name').attr("id", "button_name"));
	header.append($('<div></div>').addClass('item date_start').text('Time start'));
	header.append($('<div></div>').addClass('item date_end').text('Time end'));	
	header.append($('<div></div>').addClass('item downloaded').text('Downloaded'));
	header.append($('<div></div>').addClass('item uploaded').text('Uploaded'));
	header.append($('<div></div>').addClass('item total_traffic').text('Total Traffic'));
	overview_table.append(header);

	var row = $('<div></div>').addClass('row');
	row.append($('<div></div>').addClass('item device').text(filter.getDevice()).attr("id", "item_device"));
	row.append($('<input></input>').attr("id", "text_name").attr("type", "text").attr("value", filter.getDeviceName()));
	row.append($('<div></div>').addClass('item device_name').text(filter.getDeviceName()).attr("id", "item_name"));
	row.append($('<div></div>').addClass('item date_start').text(getSelectedDevice().timeStart.toDateString()));
	row.append($('<div></div>').addClass('item date_end').text(getSelectedDevice().timeEnd.toDateString()));
	row.append($('<div></div>').addClass('item downloaded').text(bytesToSize(data.downloaded)));
	row.append($('<div></div>').addClass('item uploaded').text(bytesToSize(data.uploaded)));
	row.append($('<div></div>').addClass('item total_traffic').text(bytesToSize(data.downloaded + data.uploaded)));
	overview_table.append(row);

	overview_table.append($('<div></div>').addClass('clear'));

	padding.append(overview_table);
	container.append(padding);

	$('#overview_table .item').css("width", "14.12%");

	$("#button_name").click(function(){
		$("#item_name").fadeOut(300, function(){
			$("#text_name").css("width", "10%").css("height", "30px").css("margin", "5px 0px").css("margin-left", "60px").css("padding", "5px 0%").css("float", "left");
			$('#overview_table #text_name').css({
				"margin": "0px",
				"width": "14.12%",
			});
			$("#text_name").fadeIn(300);
			$("#text_name").focus();
			$("#text_name").focusout(function(){
				console.log($("#text_name").val());
				submitName($("#text_name").val(), function(name){
					$("#text_name").fadeOut(300, function(){
						$('#item_name').fadeIn(300).text(name);
						getAggregateData(function(){
							var selectedDevice = filter.getDevice();
							filter.populateDevices();
							filter.setDevice(selectedDevice);
						});
					});			
				});				
			});			
		});
	});

	/* Traffic */
	var half_padding = $('<div></div>').addClass('half_padding');
	var overview_traffic_pie_title = $('<div></div>').attr('id', 'overview_traffic_pie_title').text('Traffic');
	var overview_traffic_pie = $('<div></div>').attr('id', 'overview_traffic_pie');
	half_padding.append(overview_traffic_pie_title);
	half_padding.append(overview_traffic_pie);
	container.append(half_padding);

	/* Applications */
	half_padding = $('<div></div>').addClass('half_padding');
	var application_pie_title = $('<div></div>').attr('id', 'application_pie_title').text('Applications');
	var overview_applications_pie = $('<div></div>').attr('id', 'overview_applications_pie');
	half_padding.append(application_pie_title);	
	half_padding.append(overview_applications_pie);
	container.append(half_padding);

	/* Traffic */
	populateOverviewTraffic(subsetData.downloaded, subsetData.uploaded);
	
	/* Applications */
	populateOverviewApplications();
}

function populateOverviewTraffic(downloaded, uploaded){

	var container = $('#overview_traffic_pie');

	var dataset = [
		{ label: 'Downloaded', data: downloaded },
		{ label: 'Uploaded', data: uploaded },
	];

	var options = {
	    series: {
	        pie: {
	            show: true,	
	            label: {
	            	show: true,
	                radius: 1/2,
	                formatter: function(label, point){
	                	return(point.percent.toFixed(2) + '%');
	                },
		        }
	        }
	    },
	    legend: {show: true}
	};
	var plot = $.plot(container, dataset, options);	
}

function populateOverviewApplications(){

	if(aggregateData.applications == null){
		return;
	}

	var container = $('#overview_applications_pie');

	var dataset = [];
	for(var i = 0; i < aggregateData.applications.length; i++){
		dataset.push({ label: aggregateData.applications[i][0], data: aggregateData.applications[i][1] });
	}

	var options = {
	    series: {
	        pie: {
	            show: true,	
	            label: {
	            	show: true,
	                radius: 1/2,
	                formatter: function(label, point){
	                	return(point.percent.toFixed(2) + '%');
	                },
		        }
	        }
	    },
	    legend: {
	    	show: true,
	    	noColumns: 1,
	    }
	};
	var plot = $.plot(container, dataset, options);	
}
/****************************************************************************************/
/****************************************************************************************/








/****************************************************************************************/
/******************************************* Downloaders ********************************/
/****************************************************************************************/
function populateTopDownloaders(data, device){

	var container = $('#main');
	$('#main > *').each(function(){
		this.remove();
	});

	if(data.downloaded == null){
		console.log("Highest downloader has 0 bytes downloaded");
		return;
	}

	var sorted = data.devices.sort(compareDownloaded);
	console.log(sorted);
	if(device == "" || device  ==  null){
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

	/* Timeline */
	populateTopDownloadersTimeline(sorted, device);

	/* Pie */
	populateTopDownloadersPie(sorted);

	/* Table */
	populateUsageTable(sorted, device);	
}

function populateTopDownloadersTimeline(sorted, device){

	if(device == null || device == ""){
		device = sorted[0].devices;
	}

    $.ajax({
		type	: "POST",
		url 	: 'get_downloaded_intervals_by_device',
		data 	: {
			csrfmiddlewaretoken: getCookie('csrftoken'),
			device: device,
			direction: filter.getDirection(),
			ts_start: filter.getStartTimestampSeconds(),
			interval: filter.getInterval(),
		},
		dataType : "json",
		async : true,
		error : function(data){
			console.log("AJAX error with " + 'get_downloaded_intervals_by_device');
		},
    	success : function(json_data){

    		var data, time_start = json_data.ts_start, max = json_data.max;
    		
    		data = json_data.downloaded;
			var month = filter.getMonthString();

			var timeLabel, timeFormat, tickSize, timeLabel, tickFormatter;
			if(filter.getInterval() == INTERVAL.MONTHLY){
				timeLabel = "Days of " + MONTHS[filter.getMonth()];
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
			    { label: 'Downloaded', data: data, points: { fillColor: "blue" }, color: 'blue' },
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
		            axisLabel: 'Downloaded',
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

function populateTopDownloadersPie(sorted){
	var dataset = [];
	var e, other = 0;
	for(var i = 0; i < 10 && i < sorted.length; i++){
		if(sorted[i].name != null){
			dataset.push({ label: sorted[i].name, data: sorted[i].downloaded, });
		}
		else{
			dataset.push({ label: sorted[i].device, data: sorted[i].downloaded, });
		}		
		e = i;
	}
	dataset.push(["other", other]);

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
	    legend: {
			show: true,
	    }
	};
	var plot = $.plot($('#stat_pie'), dataset, options);

	$('#stat_pie').bind("plotclick", function(event, pos, obj) {
		//console.log(obj);
		//window.location.replace(data[obj.seriesIndex].url);
	});		
}

/***************************************************************************************/
/***************************************************************************************/







/********************************* Uploaders *******************************************/
/***************************************************************************************/
function populateTopUploaders(data, device){

	var container = $('#main');
	$('#main > *').each(function(){
		this.remove();
	});

	if(data.uploaded == null){
		console.log("Highest uploader has 0 bytes uploaded");
		return;
	}
	//console.log(data);
	var sorted = data.devices.sort(compareUploaded);
	//console.log(sorted);
	if(device == null || device == ''){
		device = sorted[0].device;
	}

	/* Timeline */
	var stat_timeline = $('<div></div>').attr('id', 'stat_timeline');
	container.append($('<div></div>').attr('class', 'timeline_padding').append(stat_timeline));
	/* Pie */
	var stat_pie = $('<div></div>').attr('id', 'stat_pie');
	container.append($('<div></div>').attr('class', 'pie_padding').append(stat_pie));
	/* Table */
	var stat_table = $('<div></div>').attr('id', 'stat_table');
	container.append($('<div></div>').attr('class', 'table_padding').append(stat_table));
	var div_clear = $('<div></div>').addClass('clear');
	$('#main').append(div_clear);

	/* Timeline */
	populateTopUploadersTimeline(sorted, device);

	/* Pie */
	populateTopUploadersPie(sorted);

	/* Table */
	populateUsageTable(sorted, device);		
}

function populateTopUploadersTimeline(sorted, device){

	if(device == null || device == ""){
		device = sorted[0].devices;
	}

    $.ajax({
		type	: "POST",
		url 	: 'get_uploaded_intervals_by_device',
		data 	: {
			csrfmiddlewaretoken: getCookie('csrftoken'),
			device: device,
			direction: filter.getDirection(),
			ts_start: filter.getStartTimestampSeconds(),
			interval: filter.getInterval(),
		},
		dataType : "json",
		async : true,
		error : function(data){
			console.log("AJAX error with " + 'get_uploaded_intervals_by_device');
		},
    	success : function(json_data){

    		var data, time_start = json_data.ts_start, max = json_data.max;
    		
    		data = json_data.uploaded;
			var month = filter.getMonthString();

			var timeLabel, timeFormat, tickSize, timeLabel, tickFormatter;
			if(filter.getInterval() == INTERVAL.MONTHLY){
				timeLabel = "Days of " + MONTHS[filter.getMonth()];
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
			    { label: 'Uploaded', data: data, points: { fillColor: "blue" }, color: 'blue' },
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
		            axisLabel: 'Uploaded',
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

function populateTopUploadersPie(sorted){
	var dataset = [];
	var e, other = 0;
	for(var i = 0; i < 10 && i < sorted.length; i++){
		if(sorted[i].name != null){
			dataset.push({ label: sorted[i].name, data: sorted[i].uploaded, });
		}
		else{
			dataset.push({ label: sorted[i].device, data: sorted[i].uploaded, });
		}		
		e = i;
	}
	dataset.push(["other", other]);

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
	    legend: {
			show: true,
	    }
	};
	var plot = $.plot($('#stat_pie'), dataset, options);
}

/***************************************************************************************/
/***************************************************************************************/



function populateUsageTable(sorted, device){
	var table = $('#stat_table');

	/* Table header. */
	var newRow = $('<div></div>').addClass('header');
	newRow.append($('<span></span>').text('Device'));
	newRow.append($('<span></span>').text('Total Traffic'));
	newRow.append($('<span></span>').text('Downloaded'));
	newRow.append($('<span></span>').text('Uploaded'));
	newRow.append($('<span></span>').text('Flows'));
	newRow.append($('<span></span>').text('Start Date'));
	newRow.append($('<span></span>').text('End Date'));
	table.append(newRow);

	for(var i = 0; i < 10 && i < sorted.length; i++){
		newRow = $('<div></div>').addClass('row');
		if(sorted[i].device == device){
			newRow.css('opacity', '0.5');
		}

		if(sorted[i].name != null){
			newRow.append($('<span></span>').attr('class', 'device').attr("value", sorted[i].device).text(sorted[i].name));
		}
		else{
			newRow.append($('<span></span>').attr('class', 'device').attr("value", sorted[i].device).text(sorted[i].device));
		}
		var volumeBytes = toInt(sorted[i].downloaded) + toInt(sorted[i].uploaded);
		newRow.append($('<span></span>').text(bytesToSize(volumeBytes)));
		var downloadedBytes = toInt(sorted[i].downloaded);
		newRow.append($('<span></span>').text(bytesToSize(downloadedBytes)));
		var uploadedBytes = toInt(sorted[i].uploaded);
		newRow.append($('<span></span>').text(bytesToSize(uploadedBytes)));
		newRow.append($('<span></span>').text(sorted[i].flows));
		var dateStart = sorted[i].timeStart.toDateString();
		newRow.append($('<span></span>').text(dateStart));
		var dateEnd = sorted[i].timeEnd.toDateString();
		newRow.append($('<span></span>').text(dateEnd));
		/* Item click */
		newRow.click(function(){			
			var device = $(this).find('.device').attr("value");
			refreshVisuals(device);
		});
		table.append(newRow);
	}

	table.append($('<div></div>').addClass('clear'));
}




/****************************************************************************************/
/******************************************* Locations ********************************/
/****************************************************************************************/
function populateTopLocations(){
	var container = $('#main');
	$('#main > *').each(function(){
		this.remove();
	});

	/* Pie */
	var locations_pie = $('<div></div>').attr('id', 'locations_pie');

	var locations_pie_padding = $('<div></div>').attr('class', 'locations_pie_padding');
	locations_pie_padding.append(locations_pie);

	var locations_pie_legend = $('<div></div>').attr('id', 'locations_pie_legend');
	locations_pie_padding.append(locations_pie_legend);

	locations_pie_padding.append($('<div></div>').attr('class', 'clear'));

	container.append(locations_pie_padding);

	/* Table */
	var locations_table = $('<div></div>').attr('id', 'locations_table');
	container.append($('<div></div>').attr('class', 'table_padding').append(locations_table));
	var div_clear = $('<div></div>').addClass('clear');
	$('#main').append(div_clear);

    $.ajax({
		type	: "POST",
		url 	: "get_top_locations",
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

    		var domains = json_data.domains;

			/* Table */
			var table = $('#locations_table');

			/* Table header. */
			var newRow = $('<div></div>').addClass('header');
			newRow.append($('<div></div>').addClass('item location').text('Location'));
			newRow.append($('<div></div>').addClass('item downloaded').text('Downloaded').css('text-align', 'right'));
			newRow.append($('<div></div>').addClass('item uploaded').text('Uploaded').css('text-align', 'right'));
			newRow.append($('<div></div>').addClass('item traffic').text('Total traffic').css('text-align', 'right'));
			table.append(newRow);

			/* Data */
			for(var i = 0; i < domains.length; i++){
				newRow = $('<div></div>').addClass('row');
				newRow.append($('<div></div>').addClass('item location').text(domains[i][0]));
				newRow.append($('<div></div>').addClass('item downloaded').text(bytesToSize(domains[i][1])));
				newRow.append($('<div></div>').addClass('item uploaded').text(bytesToSize(domains[i][2])));
				newRow.append($('<div></div>').addClass('item uploaded').text(bytesToSize(parseInt(domains[i][1]) + parseInt(domains[i][2]))));
				newRow.click(function(){			
					//var device = $(this).find('.device').text();	
					//refreshVisuals();
				});

				table.append(newRow);
			}

			//var padding = $('<div></div>').css({"float": "left", "display": "inline-block", "width": "100%",});
			//padding.append(table);
			//$('#main').append(table);

			/* Pie */
			populateTopLocationsPie(domains);
    	},
    });
}

function populateTopLocationsPie(sorted){

	var dataset = [];
	var e, other = 0;
	for(var i = 0; i < 10 && i < sorted.length; i++){
		dataset.push({ label: sorted[i][0], data: parseInt(sorted[i][1]) + parseInt(sorted[i][2])});	
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
	    legend: {
			show: true,
			container: $('#locations_pie_legend'),
	    }
	};
	var plot = $.plot($('#locations_pie'), dataset, options);
}

/***************************************************************************************/
/***************************************************************************************/




/********************************* Applications *******************************************/
/***************************************************************************************/
function populateTopApplications(data){
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
	var sorted = data.applications.sort(compareApplications);

	if(sorted[0] == null){
		console.log("Applications are null.");
		return;
	}

	/* Table */
	populateTopApplicationsTable(sorted);

	/* Timeline */
	populateTopApplicationsTimeline();

	/* Pie */
	populateTopApplicationsPie(sorted);
}

function populateTopApplicationsTimeline(){

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

function populateTopApplicationsPie(sorted){
	var dataset = [];
	var e, other = 0;
	for(var i = 0; i < 10 && i < sorted.length; i++){
		dataset.push({ label: sorted[i][0], data: parseInt(sorted[i][1]) + parseInt(sorted[i][1]), });
		e = i;
	}
	dataset.push(["other", other]);

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
	    legend: {
			show: true,
	    }
	};
	var plot = $.plot($('#stat_pie'), dataset, options);	
}

function populateTopApplicationsTable(sortedApplications){
	var table = $('#stat_table');

	/* Table header. */
	var newRow = $('<div></div>').addClass('header');
	newRow.append($('<span></span>').text('Application'));
	newRow.append($('<span></span>').text('Volume'));
	newRow.append($('<span></span>').text('Downloaded'));
	newRow.append($('<span></span>').text('Uploaded'));
	newRow.append($('<span></span>').text('Time start'));
	newRow.append($('<span></span>').text('Time end'));
	table.append(newRow);

	for(var i = 0; i < 10 && i < sortedApplications.length; i++){
		newRow = $('<div></div>').addClass('row');
		newRow.append($('<span></span>').attr('class', 'application').text(sortedApplications[i][0]));
		var volumeBytes = toInt(sortedApplications[i][1]) + toInt(sortedApplications[i][2]);
		newRow.append($('<span></span>').text(bytesToSize(volumeBytes)));
		var downloadedBytes = toInt(sortedApplications[i][1]);
		newRow.append($('<span></span>').text(bytesToSize(downloadedBytes)));
		var uploadedBytes = toInt(sortedApplications[i][2]);
		newRow.append($('<span></span>').text(bytesToSize(uploadedBytes)));
		var timeStart = new Date(sortedApplications[i][3] * 1000).toDateString();
		newRow.append($('<span></span>').text(timeStart));
		var timeEnd = new Date(sortedApplications[i][4] * 1000).toDateString();
		newRow.append($('<span></span>').text(timeEnd));			
		/* Item click */
		newRow.click(function(){			
			var device = $(this).find('.device').text();	
			refreshVisuals(device);
		});
		table.append(newRow);
	}

	table.append($('<div></div>').addClass('clear'));	
}
/***************************************************************************************/
/***************************************************************************************/