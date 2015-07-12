function loadUsageChart(container){

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
			var plot = $.plot(container, data , options);	
    	},
    });		
}



function loadProtocolChart(container){

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
			var plot = $.plot(container, data, options);
    	},
    });	
}




function loadUploadTimeline(container){

    $.ajax({
		type	: "POST",
		url 	: "get_upload_timeline/",
		data 	: getAJAXParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){
    		console.log(json_data);

			var data = json_data;
			var availableFrom, availableTo;
			var date = new Date();
			var msNow = date.getTime();
			var numBuckets = BUCKETS[filter.interval];
			console.log("num_buckets:"+numBuckets);
			var buckets = [];
			var msStart, msEnd;
			var timeLabel = "Day";
			var timeFormat = "%h";
			var tickSize = [1, "hour"]; // tick every hour

			console.log("Interval: " + filter.interval);

			var msPerInterval;
			switch(filter.interval){
				case "hourly":
					msPerInterval = INTERVAL["hourly"];
					timeFormat = "%M";
					tickSize = [1, "hour"];
					timeLabel = "Latest Hour";
					break;		
				case "daily":
					msPerInterval = INTERVAL["daily"];
					timeLabel = "Last 24 hours";
					break;
				case "weekly":
					msPerInterval = INTERVAL["weekly"];
					tickSize = [1, "day"]; // tick every day
					timeLabel = "Last 7 days";
					break;
				case "monthly":
					msPerInterval = INTERVAL["monthly"];
					tickSize = [1, "day"]; // tick every day
					timeLabel = "Last 4 weeks";
					break;
			}

			msStart = msNow - (msNow % msPerInterval);
			msEnd = msStart + msPerInterval;

			console.log("from:"+msStart);
			console.log("to:"+msEnd);

			var i = 0;
			for(i = 0; i < json_data.length; i++){
				console.log(json_data[i][0] + "	" + json_data[i][1]);
			}

			//console.log("range:"+msPerInterval);
			var block = msPerInterval*(1/numBuckets);
			//console.log("block:"+block);
			
			var i, bucketCount = 0, sum = 0, count = msStart;
			//console.log("count:"+count);
			for(i = 0; i < data.length; i++){
				if(data[i][0] <= count){
					// Aggregate bytes into each bucket
					sum += data[i][1];			
				}
				else{
					bucketCount++;
					// Set starting timestamp for bucket
					buckets[bucketCount] = [(count), sum];
					console.log("start bucket "+bucketCount+": "+count)
					//console.log("	count: "+buckets[bucketCount][0])
					// Move onto next bucket
					count += block;	
					sum = 0;		
				}
			}

			data = buckets;

			var dataset = [
			    {     
			        data: data,
			        color: "#FF0000",
			        points: {
			        	fillColor: "#FF0000",
			        },
			        lines: {
			        	show: true
			        }
			    }
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
				    color: "black", 	    
		            axisLabel: timeLabel,
		            axisLabelUseCanvas: false,	    
		            mode: "time",
		            timeformat: timeFormat,
		    		tickSize: tickSize,
		            min: msStart,
		            max: msEnd,
				},
			    yaxis: {			
				    color: "black",
				    position: "left",            
		            axisLabel: 'Uploaded (MB)',
		            axisLabelUseCanvas: false,
		            min: 0,            	    
				},				
			    grid: {
			        //hoverable: true,
			        //clickable: true,
			        backgroundColor: "#fff",
			    },      
			};
			// Plot the usage timeline
			var plot = $.plot(container, dataset , options);	
	    }
	});
}





function loadDownloadTimeline(container){

    $.ajax({
		type	: "POST",
		url 	: "get_download_timeline/",
		data 	: getAJAXParameters(),
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){
    		//console.log(json_data);

			var data = json_data;
			var availableFrom, availableTo;
			var date = new Date();
			var msNow = date.getTime();
			var numBuckets = BUCKETS[filter.interval];
			//console.log("num_buckets:"+numBuckets);
			var buckets = [];
			var msStart, msEnd;
			var timeLabel = "Day";
			var timeFormat = "%h";
			var tickSize = [1, "hour"]; // tick every hour

			//console.log("Interval: " + filter.interval);

			var msPerInterval;
			switch(filter.interval){
				case "hourly":
					msPerInterval = INTERVAL["hourly"];
					timeFormat = "%M";
					tickSize = [1, "hour"];
					timeLabel = "Latest Hour";
					break;		
				case "daily":
					msPerInterval = INTERVAL["daily"];
					timeLabel = "Last 24 hours";
					break;
				case "weekly":
					msPerInterval = INTERVAL["weekly"];
					tickSize = [1, "day"]; // tick every day
					timeLabel = "Last 7 days";
					break;
				case "monthly":
					msPerInterval = INTERVAL["monthly"];
					tickSize = [1, "day"]; // tick every day
					timeLabel = "Last 4 weeks";
					break;
			}

			msStart = msNow - (msNow % msPerInterval);
			msEnd = msStart + msPerInterval;

			//console.log("from:"+msStart);
			//console.log("to:"+msEnd);

			//console.log("range:"+msPerInterval);
			var block = msPerInterval*(1/numBuckets);
			//console.log("block:"+block);
			
			var i, bucketCount = 0, sum = 0, count = msStart;
			//console.log("count:"+count);
			for(i = 0; i < data.length; i++){
				if(data[i][0] <= count){
					// Aggregate bytes into each bucket
					sum += data[i][1];			
				}
				else{
					bucketCount++;
					// Set starting timestamp for bucket
					buckets[bucketCount] = [(count), sum];
					//console.log("start bucket "+bucketCount+": "+count)
					//console.log("	count: "+buckets[bucketCount][0])
					// Move onto next bucket
					count += block;	
					sum = 0;		
				}
			}

			data = buckets;

			var dataset = [
			    {     
			        data: data,
			        color: "#FF0000",
			        points: {
			        	fillColor: "#FF0000",
			        },
			        lines: {
			        	show: true
			        }
			    }
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
				    color: "black", 	    
		            axisLabel: timeLabel,
		            axisLabelUseCanvas: false,	    
		            mode: "time",
		            timeformat: timeFormat,
		    		tickSize: tickSize,
		            min: msStart,
		            max: msEnd,
				},
			    yaxis: {			
				    color: "black",
				    position: "left",            
		            axisLabel: 'Downloaded (MB)',
		            axisLabelUseCanvas: false,
		            min: 0,            	    
				},				
			    grid: {
			        //hoverable: true,
			        //clickable: true,
			        backgroundColor: "#fff",
			    },      
			};
			// Plot the usage timeline
			var plot = $.plot(container, dataset , options);	
	    }
	});
}




function loadFlowsTable(container){
	container.append($('<span></span>').addClass('cell').text('Device'));
	container.append($('<span></span>').addClass('cell').text('Downloaded'));
	container.append($('<span></span>').addClass('cell').text('Uploaded'));
	container.append($('<span></span>').addClass('cell').text('Protocol'));
}
