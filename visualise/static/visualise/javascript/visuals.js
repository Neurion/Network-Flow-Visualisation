


function loadTopDownloaders(){

	if(data.devices.bytes.downloaded == null){
		requestDevicesUsage();
	}

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

			var visual = createVisual("pie", "Top Downloaders", "v_devices_downloaded");
			var dataset = []

			var downloaded = json_data[0];
			var uploaded = json_data[1];

			for(var i = 0; i < json_data.length; i++){
				dataset.push({ label: json_data[i][0], data: json_data[i][1] });
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
			                threshold: 0.1,            	
			        	}
			        }
			    },
			    grid: {
			        //hoverable: true,
			        //clickable: true
			    },
			    legend: {
			        show: true,
			        //container:$("#usage_container_legend"),
			    }	        
			};

			// Plot the usage pie chart
			var plot = $.plot(visual, dataset, options);
    	},
    });		
}

function loadTopUploaders(){
    $.ajax({
		type	: "POST",
		url 	: "get_devices_uploaded",
		data 	: getAJAXParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){

			var visual = createVisual("pie", "Top Uploaders", "v_devices_uploaded");
			var dataset = []

			for(var i = 0; i < json_data.length; i++){
				dataset.push({ label: json_data[i][0], data: json_data[i][1] });
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
			                threshold: 0.1,            	
			        	}
			        }
			    },
			    grid: {
			        //hoverable: true,
			        //clickable: true
			    },
			    legend: {
			        show: true,
			    }	        
			};

			// Plot the usage pie chart
			var plot = $.plot(visual, dataset, options);
    	},
    });		
}

function loadUsage(){

    $.ajax({
		type	: "POST",
		url 	: "get_usage",
		data 	: getAJAXParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){

			var visual = createVisual("pie", "Usage", "v_usage");

    		var data = [];
    		data.push({ label: "Downloaded", data: json_data["downloaded"] });
    		data.push({ label: "Uploaded", data: json_data["uploaded"] });
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
			                threshold: 0.1,            	
			        	}
			        }
			    },
			    grid: {
			        //hoverable: true,
			        //clickable: true
			    },
			    legend: {
			        show: true,
			        //container:$("#usage_container_legend"),
			    }	        
			};

			// Plot the usage pie chart
			var plot = $.plot(visual, data , options);
    	},
    });		
}



function loadProtocol(){

    $.ajax({
		type	: "POST",
		url 	: "get_protocols",
		data 	: getAJAXParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){

    		var visual = createVisual("pie", "Protocols", "v_protocols");

    		var i;
    		var data = [];
    		for(i = 0; i < json_data["protocols"].length; i++){
    			data.push({ label : json_data["protocols"][i], data : json_data["bytes"][i] });
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
			                threshold: 0.1,            	
				        } 		                 
			        }
			    },
			    grid: {
			        //hoverable: true,
			        //clickable: true,
			    },
			    legend: {	    	
			        show: true,
			        //container:$("#protocol_container_legend"),
			    }	        
			};
			// Plot the protocol pie chart
			var plot = $.plot(visual, data, options);
    	},
    });	
}




function loadUsageTimeline(){

    $.ajax({
		type	: "POST",
		url 	: "get_usage_timeline",
		data 	: getAJAXParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){

    		var visual = createVisual("timeline", "Usage", "v_usage");

    		var downloaded = json_data[0];
    		var uploaded = json_data[1];

			var timeLabel,timeFormat, tickSize, timeLabel, tickFormatter;
			if(filter.intervalType == INTERVAL.MONTHLY){
				timeLabel = "Days";
				timeFormat = "%d";
				tickSize = [1, "day"]; // tick every day
				tickFormatter = function (val, axis) {
			        return DAYS[new Date(val).getDay()];
			    };
			}
			else if(filter.intervalType == INTERVAL.DAILY){
				timeLabel = "Hours";
				timeFormat = "%h";
				tickSize = [1, "hour"]; // tick every hour
			}
			else if(filter.intervalType == INTERVAL.HOURLY){
				timeLabel = "Minutes";
				timeFormat = "%m";
				tickSize = [1, "minute"]; // tick every minute
			}

			var data1 = [
			    { label: "Downloaded", data: downloaded, points: { fillColor: "#058DC7" }, color: '#058DC7' },
			    { label: "Uploaded", data: uploaded, points: { fillColor: "#AA4643" }, color: '#AA4643' },
			];

			var options = {
				series: {		
				    shadowSize: 5,	
				    lines:{
				    	fill: true,	// Area chart
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
		    		//tickSize: 1,
				},
			    yaxis: {		
				    position: "left",            
		            //axisLabel: 'Downloaded (MB)',
		            axisLabelUseCanvas: false,
		            tickFormatter: function (val, axis) {           
				        return bytesToSize(val);
				    },	        	    
				},		
			    grid: {
			        //hoverable: true,
			        //clickable: true,
			        backgroundColor: "#fff",
			    },      
			};
			// Plot the usage timeline
			var plot = $.plot(visual, data1, options);
	    }
	});
}