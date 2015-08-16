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
	var container = $('#stat_container');

	$('#stat_container > *').each(function () {
		this.remove();
	});
	
	var padding = $('<div></div>').addClass('padding');

	var summary_table = $('<div></div>').attr('id', 'summary_table');
	var header = $('<div></div>').addClass('header');
	header.append($('<div></div>').addClass('item').text('Devices'));
	header.append($('<div></div>').addClass('item').text('Downloaded'));
	header.append($('<div></div>').addClass('item').text('Uploaded'));
	header.append($('<div></div>').addClass('item').text('Locations'));
	header.append($('<div></div>').addClass('item').text('Applications'));
	summary_table.append(header);

	var row = $('<div></div>').addClass('row');
	row.append($('<div></div>').addClass('item').text(aggregateData.devices.length));
	row.append($('<div></div>').addClass('item').text(bytesToSize(aggregateData.downloaded)));
	row.append($('<div></div>').addClass('item').text(bytesToSize(aggregateData.uploaded)));
	row.append($('<div></div>').addClass('item').text(''));
	row.append($('<div></div>').addClass('item').text(''));
	summary_table.append(row);

	summary_table.append($('<div></div>').addClass('clear'));

	padding.append(summary_table);
	container.append(padding);

	/*
	var overview_padding = $('<div></div>').addClass('overview_padding');
	overview_padding.append('<span></span>').text('Network traffic').css('background-color', 'blue');
	container.append(overview_padding.append($('<div></div>').attr('id', 'overview_traffic')));
	
	overview_padding = $('<div></div>').addClass('overview_padding');
	overview_padding.append('<span></span>').text('Top Uploaders').css('background-color', 'green');
	container.append(overview_padding.append($('<div></div>').attr('id', 'overview_uploaded')));

	overview_padding = $('<div></div>').addClass('overview_padding');
	overview_padding.append('<span></span>').text('Top Locations').css('background-color', 'green');
	container.append(overview_padding.append($('<div></div>').attr('id', 'overview_locations')));

	overview_padding = $('<div></div>').addClass('overview_padding');
	overview_padding.append('<span></span>').text('Top Applications').css('background-color', 'green');
	container.append(overview_padding.append($('<div></div>').attr('id', 'overview_applications')));
	*/
}

function populateTopDownloaders(device){

	var container = $('#stat_container');
	$('#stat_container > *').each(function(){
		this.remove();
	});

	var sorted = devices.sort(compareDownloaded);

	if(device == null || device == ''){
		device = sorted[0].device;
	}

	//var stat_description = $('<div></div>').attr('id', 'stat_description').text('Device:' + device);
	//container.append($('<div></div>').attr('class', 'table_padding').append(stat_description));	
	var stat_timeline = $('<div></div>').attr('id', 'stat_timeline');
	container.append($('<div></div>').attr('class', 'timeline_padding').append(stat_timeline));
	var stat_pie = $('<div></div>').attr('id', 'stat_pie');
	container.append($('<div></div>').attr('class', 'pie_padding').append(stat_pie));
	var stat_table = $('<div></div>').attr('id', 'stat_table');
	container.append($('<div></div>').attr('class', 'table_padding').append(stat_table));
	var div_clear = $('<div></div>').addClass('clear');
	$('#stat_container').append(div_clear);

	/* Table */
	populateStatTable(sorted, device);

	/* Timeline */
	populateStatTimeline(device, 'downloaded');

	/* Pie */
	populateStatPie(sorted);
}

function populateTopUploaders(device){
	var container = $('#stat_container');
	$('#stat_container > *').each(function(){
		this.remove();
	});
	var stat_timeline = $('<div></div>').attr('id', 'stat_timeline');
	container.append($('<div></div>').attr('class', 'timeline_padding').append(stat_timeline));
	var stat_pie = $('<div></div>').attr('id', 'stat_pie');
	container.append($('<div></div>').attr('class', 'pie_padding').append(stat_pie));
	var stat_table = $('<div></div>').attr('id', 'stat_table');
	container.append($('<div></div>').attr('class', 'table_padding').append(stat_table));
	var div_clear = $('<div></div>').addClass('clear');
	$('#stat_container').append(div_clear);

	var sorted = devices.sort(compareUploaded);

	if(device == null || device == ''){
		device = sorted[0].device;
	}

	/* Table */
	populateStatTable(sorted, device);

	/* Timeline */
	populateStatTimeline(device, 'uploaded');

	/* Pie */
	populateStatPie();
}

function populateTopLocations(){
	var container = $('#stat_container');
	$('#stat_container > *').each(function(){
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
			$('#stat_container').append(table);
    	},
    });
}

function populateTopApplications(){
	$('#stat_timeline > *').each(function () {
		this.remove();
	});
	$('#stat_pie > *').each(function () {
		this.remove();
	});
	$('#stat_table > *').each(function () {
		this.remove();
	});		
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

    		console.log(new Date(time_start * 1000));

			var month = MONTHS[filter.getMonth()];

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
					max: max,
				},		
			    grid: {
			        backgroundColor: "#fff",
			    },      
			};

			var plot = $.plot($('#stat_timeline'), data, options);	
	    }
	});		
}

function populateStatPie(sortedDevices){

	var e, other = 0;
	var dataset = [];
	for(var i = 0; i < 5 && i < devices.length; i++){
		dataset.push([devices[i].device, devices[i].downloaded]);
		e  = i;
	}

	for(; e < devices.length; e++){
		other += devices[e].downloaded;
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
		newRow.append($('<span></span>').text(60));
		var dateStart = DAYS[sortedDevices[i].timeStart.getDay()] + ' ' + sortedDevices[i].timeStart.getDate() + ' ' + MONTHS[(sortedDevices[i].timeStart.getMonth() + 1)] + ' ' + sortedDevices[i].timeStart.getFullYear();
		newRow.append($('<span></span>').text(dateStart));
		var dateEnd = DAYS[sortedDevices[i].timeEnd.getDay()] + ' ' + sortedDevices[i].timeStart.getDate() + ' ' + MONTHS[(sortedDevices[i].timeEnd.getMonth() + 1)] + ' ' + sortedDevices[i].timeEnd.getFullYear();
		newRow.append($('<span></span>').text(dateEnd));
		newRow.click(function(){			
			var device = $(this).find('.device').text();	
			populateSignificant(device);
		});
		table.append(newRow);
	}

	table.append($('<div></div>').addClass('clear'));
}