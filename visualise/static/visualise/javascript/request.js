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

			aggregateData.devices = json_data.devices;
			aggregateData.dateStart = new Date(json_data.ts_earliest * 1000);
			aggregateData.dateEnd = new Date(json_data.ts_latest * 1000);
			aggregateData.downloaded = json_data.bytes_downloaded;
			aggregateData.uploaded = json_data.bytes_uploaded;
			aggregateData.flows = json_data.flows;
			aggregateData.applications = json_data.applications;

			callback();
		},
	});		
}

function requestDeviceData(callback){
	console.log("request data...");
	$.ajax({
		type	: "POST",
		url 	: "get_device_data",
		data 	: getFilterParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			console.log("got data.");

			subsetData.devices = json_data.devices;
			subsetData.dateStart = new Date(json_data.ts_earliest * 1000);
			subsetData.dateEnd = new Date(json_data.ts_latest * 1000);
			subsetData.downloaded = json_data.bytes_downloaded;
			subsetData.uploaded = json_data.bytes_uploaded;
			subsetData.flows = json_data.flows;
			subsetData.applications = json_data.applications;

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

function requestAggregateDevicesData(callback){
	console.log("getting aggregate devices data...");
	$.ajax({
		type	: "POST",
		url 	: "get_aggregate_devices_data",
		data 	: getFilterParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			console.log("got aggregate devices data.");
			/*
			console.log(json_data.devices);
			console.log(json_data.time_start);
			console.log(json_data.time_end);
			console.log(json_data.downloaded);
			console.log(json_data.uploaded);
			*/
			devices = [];
			for(var i = 0; i < json_data.devices.length; i++){
				var newDevice = new Device(json_data.devices[i], "", json_data.downloaded[i], json_data.uploaded[i], json_data.flows[i], new Date(json_data.time_start[i] * 1000), new Date(json_data.time_end[i] * 1000));
				devices.push(newDevice);
			}

			callback(json_data);
		},
	});	
}