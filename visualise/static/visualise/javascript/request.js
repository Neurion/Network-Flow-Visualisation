function getAggregateData(callback){
	console.log("request aggregate data...");
	$.ajax({
		type	: "POST",
		url 	: "get_aggregate_data",
		data 	: getFilterParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			console.log("got aggregate data.");
			aggregateData.netflow = json_data.netflow;
			aggregateData.devices = json_data.devices;
			aggregateData.dateStart = new Date(json_data.ts_earliest * 1000);
			aggregateData.dateEnd = new Date(json_data.ts_latest * 1000);
			aggregateData.downloaded = json_data.bytes_downloaded;
			aggregateData.uploaded = json_data.bytes_uploaded;
			callback();
		},
	});		
}

function requestData(callback){
	console.log("request data...");
	$.ajax({
		type	: "POST",
		url 	: "get_data",
		data 	: getFilterParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			console.log("got data.");

			callback(json_data);
			/*
			for(var i = 0; i < json_data[0].length; i++){
				var dateStart = new Date(json_data[i][3]);
				var dateEnd = new Date(json_data[i][4]);
				var newDevice = new Device(json_data[i][0], json_data[i][1], json_data[i][2], dateStart, dateEnd);
				devices.push(newDevice);
			}
			*/
		},
	});	
}

function requestDevicesData(callback){
	console.log("getting devices data...");
	$.ajax({
		type	: "POST",
		url 	: "get_devices_data",
		data 	: getFilterParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			console.log("got devices data.");
			/*
			console.log(json_data.devices);
			console.log(json_data.time_start);
			console.log(json_data.time_end);
			console.log(json_data.downloaded);
			console.log(json_data.uploaded);
			console.log(json_data.volume);
			*/

			for(var i = 0; i < json_data.devices.length; i++){
				var newDevice = new Device(json_data.devices[i], "", json_data.downloaded[i], json_data.uploaded[i], new Date(json_data.time_start[i] * 1000), new Date(json_data.time_end[i] * 1000));
				devices.push(newDevice);
			}

			callback(json_data);
		},
	});	
}

function requestTopDownloaders(callback){
	$.ajax({
		type	: "POST",
		url 	: "get_top_downloaders",
		data 	: getFilterParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			topDownloaders = json_data;
			console.log(json_data);
			callback();
		},
	});		
}

function requestTopUploaders(callback){
	$.ajax({
		type	: "POST",
		url 	: "get_top_uploaders",
		data 	: getFilterParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){

			callback();
		},
	});		
}