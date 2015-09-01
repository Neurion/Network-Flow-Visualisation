function getAggregateData(callback){
	//console.log("request aggregate data...");
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
			//console.log("got aggregate data.");

			aggregateData.devices = [];
			for(var i = 0; i < json_data.devices.length; i++){
				aggregateData.devices.push(new Device(json_data.devices[i][0], json_data.devices[i][1], json_data.devices[i][4], json_data.devices[i][5], json_data.devices[i][6], new Date(json_data.devices[i][2] * 1000), new Date(json_data.devices[i][3] * 1000)));
			}
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

function requestSubsetData(callback){
	//console.log("request subset data...");
	$.ajax({
		type	: "POST",
		url 	: "get_subset_data",
		data 	: getFilterParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			//console.log("got subset data.");

			subsetData.devices = [];			
			for(var i = 0; i < json_data.devices.length; i++){
				var newDevice = new Device(json_data.devices[i][0], json_data.devices[i][1], json_data.devices[i][4], json_data.devices[i][5], json_data.devices[i][6], new Date(json_data.devices[i][2] * 1000), new Date(json_data.devices[i][3] * 1000));
				subsetData.devices.push(newDevice);
			}
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

function submitName(name, callback){
	console.log("submitting name...");
	$.ajax({
		type	: "POST",
		url 	: "save_name",
		data 	: {
			csrfmiddlewaretoken: getCookie('csrftoken'),
			device: filter.getDevice(),
			name: name,
		},
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			if(json_data.status != 0){
				alert("Error: " + json_data.content);
				return;
			}
			console.log("submitted name: " + json_data.content);
			callback(json_data.content);
		},
	});	
}