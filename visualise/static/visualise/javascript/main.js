$(document).ready(function(){

	/** Menu */
	setMenuPointers();
	setMenu(menu.network);

	/** Flows information */
	populateFlowsInfo();

	/** Controls */
	setControlPointers();
	setFilterListeners();	// Setup listener events for the filter controls.
	populateMACAddresses();	// Populate filter controls.
	populateIntervalSelectBox();	

	// Create the visual objects.
	updateVisuals();
});

function setMenuPointers(){
	menu.network = document.getElementById('m_network');
	menu.user = document.getElementById('m_user');
}

function setControlPointers(){
	controls.selectBox.macs = document.getElementById('select_devices');
	controls.checkBox.incoming = document.getElementById('check_ingress');
	controls.checkBox.outgoing = document.getElementById('check_egress');
	controls.textBox.port = document.getElementById('text_port');
	controls.selectBox.intervalType = document.getElementById('select_interval_type');
	controls.selectBox.application = document.getElementById('select_applications');	
}

function updateVisuals(){

	removeAllChildren(document.getElementById('top_4'));
	removeAllChildren(document.getElementById('header'));

	// Charts/Graphs
	var newVisualContainer = $("<div></div>").addClass("visual_container");
	var newVisualTitle = $("<div></div>").addClass("visual_title").text("Protocols");
	var newVisual = $("<div></div>").addClass("visual");
	loadProtocolChart(newVisual);
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_4").append(newVisualContainer);

	newVisualContainer = $("<div></div>").addClass("visual_container");
	newVisualTitle = $("<div></div>").addClass("visual_title").text("Usage");
	newVisual = $("<div></div>").addClass("visual");
	loadUsageChart(newVisual);
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_4").append(newVisualContainer);

	newVisualContainer = $("<div></div>").addClass("visual_container");
	newVisualTitle = $("<div></div>").addClass("visual_title").text("Upload Timeline");
	newVisual = $("<div></div>").addClass("visual");
	//loadUploadTimeline(newVisual);
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_4").append(newVisualContainer);

	newVisualContainer = $("<div></div>").addClass("visual_container");
	newVisualTitle = $("<div></div>").addClass("visual_title").text("Download Timeline");
	newVisual = $("<div></div>").addClass("visual");
	//loadDownloadTimeline(newVisual);
	newVisualContainer.append(newVisualTitle);
	newVisualContainer.append(newVisual);
	$("#top_4").append(newVisualContainer);

	$("#top_4").append($('<div></div>').addClass('clear'));

	// Flows table
	loadFlowsTable($('#header'));	
}

function setFilterListeners(){

	$("#select_devices").change(function(){
		filter.mac = $('#select_devices').find(":selected").text();
		populateFlowsInfo();
		if(filter.mac == 'All'){
			setMenu(menu.network);
		}
		else{
			setMenu(menu.user);
		}
		updateVisuals();
	});

	$("#check_ingress").change(function(){
		filter.direction = getDirection();
		updateVisuals();
	});

	$("#check_egress").change(function(){
		filter.direction = getDirection();
		updateVisuals();
	});

	$("#text_port").change(function(){
		filter.port = $('#text_port').val();
		updateVisuals();		
	});

	$("#select_interval_type").change(function(){
		filter.intervalType = $("#select_interval_type").val();
		updateIntervalSelectBoxes();
		if(filter.intervalType == INTERVAL.DAILY){
			filter.interval.hour = null;
			if(filter.intervalType == INTERVAL.MONTHLY){
				filter.interval.day = null;
			}
		}
	});

	$("#text_application").change(function(){
		filter.application = $('#select_application').find(":selected").text();
		updateVisuals();
	});

	$("#button_save_name").click(function(){
		$('#device_name').text(filter.mac);
	});
}

function setMenu(option){
	menu.network.className = '';
	menu.user.className = '';
	option.className = 'current';
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

function saveHostName(name){
	$.ajax({
		type	: "POST",
		url 	: "save_device_name",
		data 	: {
			csrfmiddlewaretoken : getCookie('csrftoken'),
			mac : filter.mac,
		},
		dataType : "json",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
		success : function(json_data){
			console.log(json_data);
			console.log(json_data["status"]);
			populateMACAddresses();
		},
	});
}