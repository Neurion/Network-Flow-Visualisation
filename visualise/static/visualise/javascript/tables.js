function updateVisuals(){

	removeAllChildren(document.getElementById('top_4'));
	//removeAllChildren(document.getElementById('header'));

	/** Charts/Graphs */
	loadProtocolChart(createVisual("Protocols"));
	loadUsageChart(createVisual("Usage"));
	//loadUploadTimeline(createVisual("Upload Timeline"));
	//loadDownloadTimeline(createVisual("Download Timeline"));

	$("#top_4").append($('<div></div>').addClass('clear'));

	// Flows table
	loadFlowsTable($('#header'));	
}

/**
* Populates the flows table with the top 5 devices.
*/
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

function loadFlowsTable(container){
	container.append($('<span></span>').addClass('cell').text('Device'));
	container.append($('<span></span>').addClass('cell').text('Downloaded'));
	container.append($('<span></span>').addClass('cell').text('Uploaded'));
	container.append($('<span></span>').addClass('cell').text('Protocol'));
}
