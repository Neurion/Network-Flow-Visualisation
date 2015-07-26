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
    		//console.log("requesting devices usage...");
			data.devices.bytes.downloaded = json_data[0];
			data.devices.bytes.uploaded = json_data[1];
    	},
    });	
}

/** 
 * Always returns the latest and earliest timestamps on the server.
 */
function requestFilterValues(callback){
	console.log("request filter values...");
    $.ajax({
		type: "POST",
		url: "get_filter_values",
		data: getAJAXParameters(),
		dataType: "json",
		async: true,
		error: function(data){
			alert('AJAX error:' + data);
		},
    	success: function(json_data){
    		console.log("got filter values.");

			data.devices.macs = json_data[0];
			data.devices.names = json_data[1];
			data.date.start = new Date(json_data[2][0] * 1000);
			data.date.end = new Date(json_data[2][1] * 1000);

			callback(json_data);
    	},
    });		
}

function requestMetaData(callback){
	//console.log("requesting meta data...");
	$.ajax({
		type: "POST",
		url: "get_meta_data",
		data: getAJAXParameters(),
		dataType: "json",
		async: true,
		error: function(data){
			alert('AJAX error:' + data);
		},
		success: function(json_data){
			printFilterValues();
			
			data.date.start = new Date(json_data['time_earliest'] * 1000);
			data.date.end = new Date(json_data['time_latest'] * 1000);
			data.bytes.uploaded = json_data['bytes_uploaded'];
			data.bytes.downloaded = json_data['bytes_downloaded'];

			callback();	
		},
	});		
}