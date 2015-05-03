/*
Notes:
var ar = new Array("a","b"); <==> var ar = ["a","b"];
*/

/* Global data for various graphs */
var protocols_distribution = [];

var PROTO_TCP = 6;
var PROTO_UDP = 17;



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
	populateMACAddresses(sourceMACAddresses);

	populateFlowTable(sourceMACAddresses, sourceMACBytes);
});





function populateMACAddresses(macs){
	var i;
	$("#select_mac").append($("<option></option>").attr("value", "all_devices").text("(All Devices)")); 
	for(i = 0; i < macs.length; ++i)
		$("#select_mac").append($("<option></option>").attr("value", macs[i]).text(macs[i])); 
}




function populateFlowTable(macs, bytes){
	var i;
	for(i = 0; i < macs.length; ++i){
		$bar = $('<div></div>').addClass("horizontal_bar");
		$row = $('<div></div>').addClass("row");
		$c1 = $('<div></div>').addClass("cell").html(macs[i]);
		$c2 = $('<div></div>').addClass("cell").html("(to do)");
		$c3 = $('<div></div>').addClass("cell").html((bytes[i]/1000).toFixed(2)+" MB");
		$row.append($c1).append($c2).append($c3);
		$("#flows_table").append($bar).append($row);
	}
}




function loadTimeline(dat, timeInterval){
	console.log(timeInterval);
	// Date, data downloaded
	//var data = [[1427621192, 10], [1427622192, 34], [1427623192, 13], [1427624192, 3], [1427625192, 377], [1427626192, 43]];

	//var data = [[1427621192, 10], [1427622192, 34]];

	//console.log(dat);

	data = dat;

	var dataset = [
	    {
	        //label: "testing...",        
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
		label: "testing...",
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
		    position: "bottom",        
		    axisLabel: "Day",
		    axisLabelUseCanvas: true,
		    axisLabelFontSizePixels: 12,
		    axisLabelFontFamily: 'Verdana, Arial',
    		axisLabelPadding: 5	,	    
		    timeformat: "%d/%m",
		},
	    yaxis: {			
		    color: "black",
		    position: "left",        
		    axisLabel: "Downloaded",
		    axisLabelUseCanvas: true,
		    axisLabelFontSizePixels: 12,
		    axisLabelFontFamily: 'Verdana, Arial',
    		axisLabelPadding: 5	,	    
		    timeformat: "%d/%m",
		},				
	    grid: {
	        //hoverable: true,
	        //clickable: true,
	        backgroundColor: "#fff",
	    },      
	};

	// Plot the overview pie chart
	var plot = $.plot($("#overview_container_chart"), dataset , options);	
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
	        }
	    },
	    grid: {
	        //hoverable: true,
	        //clickable: true,
	    },
	    legend: {	    	
	        show: true,
	        container:$("#protocol_container_legend"),
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
	        container:$("#usage_container_legend"),
	    }	        
	};

	// Plot the usage pie chart
	var plot = $.plot($("#usage_container_chart"),data , options);		
}



