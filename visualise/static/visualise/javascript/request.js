function requestDevicesUsage(){
    $.ajax({
		type	: "POST",
		url 	: "get_devices_usage",
		data 	: getAJAXParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){
			data.devices.bytes.downloaded = json_data[0];
			data.devices.bytes.uploaded = json_data[1];
    	},
    });	
}

function requestMetaData(callback){
	console.log("getting new data...");
	$.ajax({
		type: "POST",
		url: "get_flows_info",
		data: getAJAXParameters(),
		dataType: "json",
		async: true,
		error: function(data){
			alert('AJAX error:' + data);
		},
		success: function(json_data){

			printFilterValues();

			data.devices.macs = json_data['macs'];
			data.devices.names = json_data['names'];
			data.time.earliest = json_data['timestamp_earliest'];
			data.time.latest = json_data['timestamp_latest'];		
			data.bytes.uploaded = json_data['bytes_uploaded'];
			data.bytes.downloaded = json_data['bytes_downloaded'];
			data.time.year = new Date(data.time.earliest * 1000).getFullYear();
			filter.interval.year = data.time.earliest;

			callback();		// Can now call the callback method now that we have the new data.
		},
	});		
}