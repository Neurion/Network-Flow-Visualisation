function loadDeviceUsers(){

	if(data.devices.bytes.downloaded == null){
		//console.log("Requesting new data.");
		//requestDevicesUsage();
	}
	else{
		//console.log("Already have the required data.");
	}

	console.log(json_data);

	if(visualMode == VISUAL_MODE.TABLE){

	}
	else if(visualMode == VISUAL_MODE.TABLE){
		var visualContainer = createVisual("pie", "Top Users", "v_devices_users");
		var dataset = [];
		var usage = [];

		for(var i = 0; i < json_data[0].length; i++){
			usage.append(parseInt(json_data[0]) + parseInt(json_data[1]));
			dataset.push({ label: json_data[i][0], data: json_data[i][1] });
		}

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

		//var plot = $.plot($('#stat_pie'), dataset, options);	
	}		
	
}

function loadTopDownloaders(){

	if(data.devices.bytes.downloaded == null){
		console.log("no download data available.");
	}

	console.log(json_data);

	var dataset = [];
	for(var i = 0; i < json_data.length; i++){
		dataset.push({ label: json_data[i][0], data: json_data[i][1] });
	}
	console.log("here");
	var options = {
	    series: {
	        pie: {
	            show: true,	
	            radius: 1,
	            label: {
	            	show: true,
	                radius: 0.5,
	                //formatter: function(label, point){
	                	//return(point.percent.toFixed(2) + '%');
	                //},
	                //threshold: 0.1,
	        	}
	        }
	    },
	    grid: {
	        hoverable: true,
	        clickable: true,
	    },
	    legend: {
	        show: true,
	        //container:$("#usage_container_legend"),
	    }	        
	};

	//var plot = $.plot("#stat_pie", dataset, options);					
}

function loadTopUploaders(){
    $.ajax({
		type	: "POST",
		url 	: "get_devices_uploaded",
		data 	: getAJAXParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			//alert('AJAX error:' + data);
			console.log("AJAX error with get_devices_uploaded.");
		},
    	success : function(json_data){

			var visualContainer = createVisual("pie", "Top Uploaders", "v_devices_uploaded");
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


			//var plot = $.plot(visualContainer.find('.visual'), dataset, options);			
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
			//alert('AJAX error:' + data);
			console.log("AJAX error with get_usage.");
		},
    	success : function(json_data){

			var visualContainer = createVisual("pie", "Usage", "v_usage");

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

			//var plot = $.plot(visualContainer.find('.visual'), data, options);
    	},
    });		
}



function loadProtocol(){

    $.ajax({
		type	: "POST",
		url 	: "get_protocols",
		data 	: getAJAXParameters(),
		dataType: "json",
		async 	: true,
		error 	: function(data){
			//alert('AJAX error:' + data);
			console.log("AJAX error with get_protocols.");
		},
    	success : function(json_data){

    		var visualContainer = createVisual("pie", "Protocols", "v_protocols");

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

			//var plot = $.plot(visualContainer.find('.visual'), data, options);			
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
			//alert('AJAX error:' + data);
			console.log("AJAX error with get_usage_timeline.");
		},
    	success : function(json_data){

    		var month = MONTHS[filter.getMonth()];

    		var visualContainer = createVisual("timeline", " Usage " + "(" + month + ")", "v_usage");

    		var downloaded = json_data[0];
    		var uploaded = json_data[1];

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
			    { label: "Downloaded", data: downloaded, points: { fillColor: "blue" }, color: 'blue' },
			    { label: "Uploaded", data: uploaded, points: { fillColor: "orange" }, color: 'orange' },
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

			//var plot = $.plot(visualContainer.find('.visual'), data, options);			
	    }
	});
}