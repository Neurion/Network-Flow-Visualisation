/*
Notes:
var ar = new Array("a","b"); <==> var ar = ["a","b"];
*/

var DEFAULT = {
	INTERVAL : "daily",
};

var INTERVAL = {
				"hourly" : 3600000,
				"daily" : 86400000,
				"weekly" : 604800000,
				"monthly" : 2628000000,
			};

var BUCKETS = {
				"hourly" : 60,
				"daily" : 24,
				"weekly" : 7,
				"monthly" : 4,
			};

/* Values of the filter controls. This gets updated after a control value is changed. */
var filterValues = {
	"device" : "all",
	"direction" : "all",
	"port" : -1,
	"interval" : DEFAULT.INTERVAL,
	"application" : "all",
};

/* Generic network information. */
/* All local MAC addresses. Used to request information specific to a particular device. */
var n_deviceMACs = [];
/* The number of bytes downloaded by the local network. */
var n_bytesDownloaded;
/* The number of bytes uploaded by the local network. */
var n_bytesUploaded;
/* Network protocols and the bytes associated with the protocol. */
var n_protocols = {
	protocols : [],
	bytesDownloaded : [],
	bytesUploaded : [],
};

/* Information about the currently selected device. */
var device = {

};

$(document).ready(function(){

	// Setup listener events for the filter controls.
	setMenuListeners();
	setFilterListeners();

	// Populate filter controls.
	populateMACAddresses();
	populateIntervalSelectBox();

	$('#m_network').addClass('current');

	// Create the visual objects.
	updateVisuals();
});



function updateVisuals(){

	removeAllChildren(document.getElementById('top_3'));
	removeAllChildren(document.getElementById('header'));

	// Charts/Graphs
	var newVisualContainer = $("<div></div>").addClass("visual_container");
	var newVisualTitle = $("<div></div>").addClass("visual_title").text("Protocols");
	var newVisual = $("<div></div>").addClass("visual");
	loadProtocolChart(newVisual);
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_3").append(newVisualContainer);

	newVisualContainer = $("<div></div>").addClass("visual_container");
	newVisualTitle = $("<div></div>").addClass("visual_title").text("Usage");
	newVisual = $("<div></div>").addClass("visual");
	loadUsageChart(newVisual);
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_3").append(newVisualContainer);

	newVisualContainer = $("<div></div>").addClass("visual_container");
	newVisualTitle = $("<div></div>").addClass("visual_title").text("Download Timeline");
	newVisual = $("<div></div>").addClass("visual");
	loadUsageTimeline(newVisual);
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_3").append(newVisualContainer);

	newVisualContainer = $("<div></div>").addClass("visual_container");
	newVisualTitle = $("<div></div>").addClass("visual_title").text("Upload Timeline");
	newVisual = $("<div></div>").addClass("visual");
	loadUsageTimeline(newVisual);
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_3").append(newVisualContainer);

	$("#top_3").append($('<div></div>').addClass('clear'));

	// Flows table
	loadFlowsTable($('#header'));	
}



function setMenuListeners(){

	// Network menu
	$("#m_network").click(function(){
		console.log("clicked network.");
	});

	// Users menu
	$("#m_users").click(function(){
		console.log("clicked users.");
	});
}


function setFilterListeners(){

	$("#select_devices").change(function(){
		/*console.log("select_devices was changed.");*/
		filterValues["device"] = $('#select_devices').find(":selected").text();
		updateVisuals();
	});

	$("#check_ingress").change(function(){
		/*console.log("check_ingress was changed.");*/
		var direction = getDirection();
		filterValues["direction"] = direction;
		updateVisuals();
	});

	$("#check_egress").change(function(){
		/*console.log("check_egress was changed.");*/
		var direction = getDirection();
		filterValues["direction"] = direction;
		updateVisuals();
	});

	$("#text_port").change(function(){
		/*console.log("text_port was changed.");*/
		filterValues["port"] = $('#text_port').val();
		updateVisuals();		
	});

	// Timeline select box
	$("#select_interval").change(function(){
		filterValues["interval"] = $("#select_interval").val();
		console.log("set interval: " + filterValues["interval"]);
		loadTimeline(timelineData);
	});

	$("#text_application").change(function(){
		/*console.log("select_application was changed.");*/
		filterValues["application"] = $('#select_application').find(":selected").text();
		updateVisuals();		
	});		
}



function populateMACAddresses(){
	var i;
	for(i = 0; i < n_deviceMACs.length; ++i){
		$("#select_devices").append($("<option></option>").attr("value", n_deviceMACs[i]).text(n_deviceMACs[i])); 
	}
}



function populateApplications(applications){
	var i;
	for(i = 0; i < macs.length; ++i){
		$("#select_devices").append($("<option></option>").attr("value",macs[i]).text(macs[i])); 
	}	
}



function populateIntervalSelectBox(){
	var i;
	$("#select_interval").append($("<option></option>").attr("value", "hourly").text("Hour")); 
	$("#select_interval").append($("<option></option>").attr("value", "daily").text("Day"));
	$("#select_interval").append($("<option></option>").attr("value", "weekly").text("Week")); 
	$("#select_interval").append($("<option></option>").attr("value", "monthly").text("Month")); 

	$("#select_interval").val("daily");
}



function populateFlowTable(macs, downloadedBytes, uploadedBytes){
	var i;
	for(i = 0; i < macs.length; ++i){
		//$bar = $('<div></div>').addClass("horizontal_bar");
		$row = $('<div></div>').addClass("row");
		$c1 = $('<div></div>').addClass("cell").html(macs[i]);
		$c2 = $('<div></div>').addClass("cell").html("(to do)");
		$c3 = $('<div></div>').addClass("cell").html((downloadedBytes[i]/1000000).toFixed(2)+" MB");
		$c4 = $('<div></div>').addClass("cell").html((uploadedBytes[i]/1000000).toFixed(2)+" MB");
		$row.append($c1).append($c2).append($c3).append($c4);
		$("#flows_table").append($row);
	}
}



function loadUsageTimeline(container){

    $.ajax({
		type	: "POST",
		url 	: "get_timeline/",
		data 	: {
			csrfmiddlewaretoken : getCookie('csrftoken'),
		},
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){
    		console.log(json_data);

			var data = dat;
			var availableFrom, availableTo;
			var date = new Date();
			var msNow = date.getTime();
			var numBuckets = BUCKETS[filterValues["interval"]];
			console.log("num_buckets:"+numBuckets);
			var buckets = [];
			var msStart, msEnd;
			var timeLabel = "Day";
			var timeFormat = "%h";
			var tickSize = [1, "hour"]; // tick every hour

			console.log("Interval: " + filterValues["interval"]);

			var msPerInterval;
			switch(filterValues["interval"]){
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

			console.log("range:"+msPerInterval);
			var block = msPerInterval*(1/numBuckets);
			console.log("block:"+block);
			
			var i, bucketCount = 0, sum = 0, count = msStart;
			console.log("count:"+count);
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




function loadProtocolChart(container){

    $.ajax({
		type	: "POST",
		url 	: "get_protocols/",
		data 	: {
			csrfmiddlewaretoken : getCookie('csrftoken'),
			device : filterValues['device'],
			direction : filterValues['direction'],
			port : filterValues['port'],
		},
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){
    		//console.log(json_data);
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







function loadUsageChart(container){

    $.ajax({
		type	: "POST",
		url 	: "get_usage/",
		data 	: {
			csrfmiddlewaretoken : getCookie('csrftoken'),
		},
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){
    		//console.log(json_data);
    		var data = [];
    		data.push({ label : "Downloaded", data : json_data["downloaded"] });
    		data.push({ label : "Uploaded", data : json_data["uploaded"] });
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




function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}




function getDeviceUsage(mac){
    $.ajax({
		type	: "POST",
		url 	: "get_device_usage",
		data 	: {
			csrfmiddlewaretoken : getCookie('csrftoken'),
		},
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	success : function(json_data){
    		//console.log(json_data);
    		//console.log(json_data["downloaded"]);
    		//console.log(json_data["uploaded"]);
    	},
    });
}



function loadFlowsTable(container){
	container.append($('<span></span>').addClass('cell').text('Device'));
	container.append($('<span></span>').addClass('cell').text('Downloaded'));
	container.append($('<span></span>').addClass('cell').text('Uploaded'));
	container.append($('<span></span>').addClass('cell').text('Protocol'));
}



function getDirection(){
	if($('#check_ingress').is(':checked') && $('#check_egress').is(':checked')){
		//console.log("Both.");
		return "all";
	}
	if(!$('#check_ingress').is(':checked')){		
		if(!$('#check_egress').is(':checked')){
			//console.log("Neither, throw an error...");
			alert("You must select at least one direction.");
		}
		//console.log("Only egress.");
		return "egress";
	}
	//console.log("Only ingress.");
	return "ingress";
}



function removeAllChildren(element){
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}	
}