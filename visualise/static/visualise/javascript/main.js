/*
Notes:
var ar = new Array("a","b"); <==> var ar = ["a","b"];
*/

/* Global data for various graphs */
var protocols_distribution = [];
var timelineData = [];
var sourceMACAddresses = [];
var sourceMACDownloadedBytes = [];
var sourceMACUploadedBytes = [];

var PROTO_TCP = 6;
var PROTO_UDP = 17;

// Default filter values
var f_interval = "daily";
var INTERVAL = {"hourly" : 3600000,
				"daily" : 86400000,
				"weekly" : 604800000,
				"monthly" : 2628000000};

$(document).ready(function(){
	console.log("ready");
	/*
    $.ajax({
    	type: "GET",
    	crossDomain: true,    	
    	accept: "text/plain",
        contentType: "text/plain; charset=utf-8",
        dataType: "text/plain",    	
    	url: "http://www.geoplugin.net/json.gp", 
    	data:"ip=124.248.134.11",
    	success: function(result){
	        console.log(result);
	        console.log("dsgsdfg");
	        //$("#test").html(result);
    	},
    });
	*/
	loadTimeline(timelineData);

	/*
	// AJAX request for the protocol chart data
	$.ajax({
		url: "getProtocol", 
		success: function(result){
			console.log("ajax returned...");
			console.log(result);
        	//$("#test").html(result);
		}
	});
	*/

	loadProtocolChart();

	loadUsageChart();

	// Filters
	populateMACAddressesSelectBox(sourceMACAddresses);

	populateIntervalSelectBox();

	populateFlowTable(sourceMACAddresses, sourceMACDownloadedBytes, sourceMACUploadedBytes);
});





function populateMACAddressesSelectBox(macs){
	var i;
	$("#select_mac").append($("<option></option>").attr("value", "all_devices").text("(All Devices)")); 
	for(i = 0; i < macs.length; ++i)
		$("#select_mac").append($("<option></option>").attr("value", macs[i]).text(macs[i])); 
}



function populateIntervalSelectBox(){
	var i;
	$("#select_interval").append($("<option></option>").attr("value", "hourly").text("Hourly")); 
	$("#select_interval").append($("<option></option>").attr("value", "daily").text("Daily"));
	$("#select_interval").append($("<option></option>").attr("value", "weekly").text("Weekly")); 
	$("#select_interval").append($("<option></option>").attr("value", "monthly").text("Monthly")); 

	$("#select_interval").attr("name", "time_interval").val(f_interval);
}



function populateFlowTable(macs, downloadedBytes, uploadedBytes){
	var i;
	for(i = 0; i < macs.length; ++i){
		$bar = $('<div></div>').addClass("horizontal_bar");
		$row = $('<div></div>').addClass("row");
		$c1 = $('<div></div>').addClass("cell").html(macs[i]);
		$c2 = $('<div></div>').addClass("cell").html("(to do)");
		$c3 = $('<div></div>').addClass("cell").html((downloadedBytes[i]/1000000).toFixed(2)+" MB");
		$c4 = $('<div></div>').addClass("cell").html((uploadedBytes[i]/1000000).toFixed(2)+" MB");
		$row.append($c1).append($c2).append($c3).append($c4);
		$("#flows_table").append($bar).append($row);
	}
}




function loadTimeline(dat){

	// Date, data downloaded
	var data = [[1427621192, 10], [1427622192, 34], [1427623192, 13], [1427624192, 3], [1427625192, 377], [1427626192, 43]];

	data = dat;

	var availableFrom, availableTo;
	var date = new Date();
	var msNow = date.getTime();
	var buckets;
	var msStart, msEnd;


	var timeLabel = "Day";
	var tickSize = [1, "hour"]; // tick every hour

	console.log("Interval:"+f_interval);

	var msPerInterval;
	switch(f_interval){
		case "hourly":
			msPerInterval = INTERVAL["hourly"];
			break;		
		case "daily":
			msPerInterval = INTERVAL["daily"];
			break;
		case "weekly":
			msPerInterval = INTERVAL["weekly"];
			tickSize = [1, "day"]; // tick every day
			break;
		case "monthly":
			msPerInterval = INTERVAL["monthly"];
			tickSize = [1, "day"]; // tick every day
			break;
	}

	msStart = msNow - (msNow % msPerInterval);
	msEnd = msStart + msPerInterval;

	console.log("from:"+msStart);
	console.log("to:"+msEnd);

	console.log(dat[0]);
	console.log(dat[dat.length-1]);


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
		    mode: "time",
		    color: "black", 	    
            axisLabel: timeLabel,
            axisLabelUseCanvas: false,	    
            mode: "time",
    		tickSize: tickSize, // tick every hour
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

	// Plot the overview pie chart
	var plot = $.plot($("#timeline_container_chart"), dataset , options);	
}








function loadProtocolChart(){

	var data = [
		{ label: "TCP", data: tcpCount },
		{ label: "UDP", data: udpCount }
	];

	var options = {
	    series: {
	        pie: {
	            show: true,	
	            radius: 1,
	            label: {
	            	show: true,
	                radius: 2/3,
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
	        show: false,
	        //container:$("#protocol_container_legend"),
	    }	        
	};

	// Plot the protocol pie chart
	var plot = $.plot($("#protocol_container_chart"),data , options);	
}







function loadUsageChart(){

	var data = [ 
		{ label: "Download", data: [450895] },
		{ label: "Upload", data: [77664] }
	];

	var options = {
	    series: {
	        pie: {
	            show: true,	 
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
	var plot = $.plot($("#usage_container_chart"), data , options);		
}



