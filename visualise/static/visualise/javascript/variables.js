var INTERVAL = {
	ALL: "all",
	HOURLY: "hourly",
	DAILY: "daily",
	MONTHLY: "monthly",
};

var DIRECTION = {
	INGRESS: "ingress",
	EGRESS: "egress",
	ALL: "all",
};

var DEFAULT = {
	INTERVAL: INTERVAL.MONTHLY,
	DIRECTION: DIRECTION.ALL,
};

var SECONDS = {
				HOUR: 3600,
				DAY: 86400,
				WEEK: 604800,
				MONTH: 2628000,
			};

var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* Controls */

var STAT_MENU = {
	OVERVIEW: null,
	DOWNLOADED: null,
	UPLOADED: null,
	LOCATIONS: null,
	APPLICATIONS: null,
	PROTOCOLS: null,
	PORTS: null,
	FLOWS: null,
	PACKETS: null,
};
var statMenu;

var aggregateData = {
	devices: null,
	dateStart: null,
	dateEnd: null,
	downloaded: 0,
	uploaded: 0,
	flows: null,
	applications: null,
};

var subsetData = {
	devices: null,
	dateStart: null,
	dateEnd: null,
	downloaded: 0,
	uploaded: 0,
	flows: null,
	applications: null,
};
var showSubset = false;

var topDownloaders = [];
var topUploaders = [];

function Device(device, name, downloaded, uploaded, flows, timeStart, timeEnd){
	this.device = device;			// Device MAC or IP.
	this.name = name;				// Device name.
	this.downloaded = downloaded;	// Bytes downloaded.
	this.uploaded = uploaded;		// Bytes uploaded.
	this.flows = flows;
	this.timeStart = timeStart;		// Earliest data.
	this.timeEnd = timeEnd;			// Latest data.
};

function getSelectedDevice(){
	var device = filter.getDevice();
	var devices;

	if(filter.isActive()){
		devices = subsetData.devices;
	}
	else{
		devices = aggregateData.devices;
	}
	for(var i = 0; i < devices.length; i++){	
		if(device == devices[i].device){			
			return devices[i];
		}
	}
}

function compareDownloaded(a, b) {
	if(a.downloaded > b.downloaded){
		return -1;
	}
	if(a.downloaded < b.downloaded){
		return 1;
	}
	return 0;
}

function compareUploaded(a, b) {
	if(a.uploaded > b.uploaded){
		return -1;
	}
	if(a.uploaded < b.uploaded){
		return 1;
	}
	return 0;
}

function compareApplications(a, b){
	return parseInt(b[1]) - parseInt(a[1]);
}

function Filter(){

	var _date;
	var _year = null;
	var _deviceName = null;
	var _controls = {
		device: null,
		direction_in: null,
		direction_out: null,
		port_src: null,
		port_dst: null,	
		interval: null,
		month: null,
		day: null,
		hour: null,
	};

	/* Caller-defined function to execute after a filter's value gets changed. */
	var _onControlChange = null;
	var _controlChange = function(){
		if(_onControlChange == null){
			console.log('Function has not been set for onControlChange().');
			return;
		}
		_onControlChange();
	}	
	this.setOnControlChange = function(func){
		_onControlChange = func;
	}

	this.setControls = function(){
		_setControls();
	}
 
	var _setControls = function(){
		_controls.devices = $('#filter_devices');
		_controls.devices.menu = $('#devices_menu');
		_controls.direction = $('#filter_direction');
		_controls.direction.menu = $('#direction_menu');
		_controls.applications = $('#filter_applications');
		_controls.applications.menu = $('#applications_menu');
		_controls.port_src = $('#filter_source_port');
		_controls.port_dst = $('#filter_destination_port');
		_controls.months = $('#filter_month');
		_controls.days = $('#filter_day');
		_controls.hours = $('#filter_hour');
		_controls.months.menu = $('#months_menu');
		_controls.days.menu = $('#days_menu');
		_controls.hours.menu = $('#hours_menu');
		_controls.more = $('#filter_more');
		_controls.more.menu = $('#filter_more_menu');

		/* Devices */
		_controls.devices.click(function(){
			_controls.devices.menu.animate({height:'toggle'}, 300);
		});

		/* Devices items */
		_controls.devices.menu.delegate('div', 'click', function(){
			_setDevice($(this).attr("value"));
			//_controls.devices.menu.animate({height:'toggle'}, 300);
			_setDeviceName($(this).text());
			_onControlChange();
		});

		/* Months */
		_controls.months.click(function(){
			_controls.months.menu.animate({height:'toggle'}, 300);
		});	

		/* Months items */
		_controls.months.menu.delegate('div', 'click', function(){
			_setMonth($(this).attr("value"));
			_populateDays();
			_controls.days.animate({height:'show'}, 300);
			_onControlChange();
		});

		/* Days */
		_controls.days.click(function(){
			_controls.days.menu.animate({height:'toggle'}, 300);
		});	

		/* Days items */
		_controls.days.menu.delegate('div', 'click', function(){
			_setDay($(this).attr("value"));
			_populateHours();
			_controls.hours.animate({height:'show'}, 300);
			_onControlChange();
		});

		/* Hours */
		_controls.hours.click(function(){
			_controls.hours.menu.animate({height:'toggle'}, 300);
		});	

		/* Hours items */
		_controls.hours.menu.delegate('div', 'click', function(){
			_setHour($(this).attr("value"));
			console.log('hour is now ' + filter.getHour());
			_onControlChange();
		});

		/* Direction */
		_controls.direction.click(function(){
			_controls.direction.menu.animate({height:'toggle'}, 300);
		});

		/* Direction items */
		_controls.direction.menu.delegate('div', 'click', function(){
			_setDirection($(this).attr("value"));
			_onControlChange();
		});

		/* Application */
		_controls.applications.click(function(){
			_controls.applications.menu.animate({height:'toggle'}, 300);
		});

		/* Application items */
		_controls.applications.menu.delegate('div', 'click', function(){
			_setApplication($(this).attr("value"));
			_onControlChange();
		});		

		/* More */
		_controls.more.click(function(){
			_controls.more.menu.animate({height:'toggle'}, 300);
		});
	}

	this.isActive = function(){
		if(this.getDevice() == "All" && this.getDirection() == "both" && this.getApplication() == "all" && this.getInterval() == INTERVAL.MONTHLY){
			return false;
		}
		else{
			return true;
		}
	}

	/* Getters. */
	this.getDevice = function(){
		if(_controls.devices.menu != null){
			return _controls.devices.menu.find(".selected").attr("value");
		}
		else{
			return null;
		}
	}

	this.getDeviceName = function(){
		if(_deviceName == this.getDevice()){
			return '';
		}
		return _deviceName;
	}

	var _getDirection = function(){
		if(_controls.direction.menu != null){
			return _controls.direction.menu.find('.selected').attr('value');
		}
		else{
			return null;
		}
	}
	this.getDirection = function(){
		return _getDirection();
	}

	this.getPortSrc = function(){
		if(_controls.port_src != null){
			if(_controls.port_src.text() != ''){
				return _controls.port_src.text();
			}
			else{
				return null;
			}
		}
		else{
			return null;
		}
	}

	this.getPortDst = function(){
		if(_controls.port_dst != null){
			if(_controls.port_dst.text() != ''){
				return _controls.port_dst.text();
			}
			else{
				return null;
			}
		}
		else{
			return null;
		}
	}

	var _getApplication = function(){
		if(_controls.applications.menu != null){
			return _controls.applications.menu.find('.selected').attr('value');
		}
		else{
			return null;
		}
	}
	this.getApplication = function(){
		return _getApplication();
	}

	var _getInterval = function(){
		if(_controls.hours.menu.find(".selected").attr("value") != null){
			return INTERVAL.HOURLY;
		}
		else if(_controls.days.menu.find(".selected").attr("value") != null){
			return INTERVAL.DAILY;
		}
		else if(_controls.months.menu.find(".selected").attr("value") != null){
			return INTERVAL.MONTHLY;
		}
	}

	this.getInterval = function(){
		return _getInterval();		
	}

	var _getYear = function(){
		return _year;		
	}

	this.getYear = function(){
		return _year;
	}

	var _getMonth = function(){
		if(_controls.months.menu.find(".selected").attr('value') != null){			
			return _controls.months.menu.find('.selected').attr('value');
		}
		else{
			return null;
		}		
	}
	this.getMonth = function(){
		return _getMonth();
	}

	var _getMonthString = function(){
		return MONTHS[_getMonth()];
	}
	this.getMonthString = function(){
		return _getMonthString();
	}

	var _getDay = function(){
		if(_controls.days.menu.find(".selected").attr('value') != null){
			return _controls.days.menu.find('.selected').attr('value');
		}
		else{
			return null;
		}		
	}
	this.getDay = function(){
		return  _getDay();
	}

	var _getHour = function(){
		if(_controls.hours.menu.find(".selected").attr('value') != null){
			return _controls.hours.menu.find('.selected').attr('value');
		}
		else{
			return null;
		}
	}
	this.getHour = function(){
		return _getHour();
	}

	/**
	 * Returns the filter timestamp in seconds.
	 */
	var _getStartTimestampSeconds = function(){
		var date;
		if(_getInterval() == INTERVAL.MONTHLY){
			date = new Date(_getYear(), _getMonth());
		}	
		else if(_getInterval() == INTERVAL.DAILY){	
			date = new Date(_getYear(), _getMonth(), _getDay());
		}
		else if(_getInterval() == INTERVAL.HOURLY){
			console.log("year: " + _getYear());
			console.log("month: " + _getMonth());
			console.log("day:" + _getDay());	
			console.log("hour:" + _getHour());				
			date = new Date(_getYear(), _getMonth(), _getDay(), _getHour());
		}
		else{
			console.log('Invalid interval, must be first request.');
			return;
		}
		//console.log(date.getFullYear());
		//console.log(date.getDate());
		//console.log(date.getHours());
		//console.log("start timestamp:" + date.toDateString());
		//console.log("start timestamp:" + date + " = " + date.getTime() / 1000);

		return date.getTime() / 1000;		
	}
	this.getStartTimestampSeconds = function(){
		return _getStartTimestampSeconds();
	}

	var _getEndTimestampSeconds = function(){
		var date;
		if(_getInterval() == INTERVAL.MONTHLY){
			date = new Date(_getYear(), _getMonth() + 1, _getDay(), _getHour());
		}
		else if(_getInterval() == INTERVAL.DAILY){
			date = new Date(_getYear(), _getMonth(), _getDay() + 1, _getHour());
		}
		else if(_getInterval() == INTERVAL.HOURLY){
			date = new Date(_getYear(), _getMonth(), _getDay(), _getHour() + 1);
		}
		else{
			console.log('Invalid interval, must be first request.');
			return;
		}
		
		//console.log("end timestamp:" + date.toDateString());
		console.log("end timestamp:" + date);

		return date.getTime() / 1000;
	}
	this.getEndTimestampSeconds = function(){
		return _getEndTimestampSeconds();
	}

	/* Setters */
	var _setDevice = function(dev){
		if(_controls.devices.menu.find(".selected").attr("value") != null){
			_controls.devices.menu.find(".selected").removeClass('selected');
		}
		_controls.devices.menu.find("[value='" + dev + "']").addClass('selected');
		if(dev != "All"){
			showSubset = false;
		}
		else{
			showSubset = true;
		}
	}
	this.setDevice = function(dev){
		_setDevice(dev);
	}

	var _setDeviceName = function(name){
		_deviceName = name;
	}

	var _setApplication = function(app){
		_controls.applications.menu.find(".selected").removeClass('selected');
		_controls.applications.menu.find("[value='" + app.toLowerCase() + "']").addClass('selected');
	}
	
	var _setMonth = function(month){
		if(_controls.months.menu != null){
			_controls.months.menu.find(".selected").removeClass('selected');
		}
		_controls.months.menu.find("[value='" + month + "']").addClass('selected');

		// Remove selected day
		_controls.days.menu.find(".selected").removeClass("selected");
		// Remove selected hour
		_controls.hours.menu.find(".selected").removeClass("selected");			
	}
	
	var _setDay = function(day){
		if(_controls.days.menu != null){
			_controls.days.menu.find(".selected").removeClass('selected');
		}
		_controls.days.menu.find("[value='" + day + "']").addClass('selected');

		// Remove selected hour
		_controls.hours.menu.find(".selected").removeClass("selected");
	}

	var _setHour = function(hour){
		if(_controls.hours.menu != null){
			_controls.hours.menu.find(".selected").removeClass('selected');
		}
		_controls.hours.menu.find("[value='" + hour + "']").addClass('selected');	
	}

	/* Listeners */

	var _setDirection = function(dir){
		_controls.direction.menu.find(".selected").removeClass('selected');
		_controls.direction.menu.find("[value='" + dir.toLowerCase() + "']").addClass('selected');
	}

	/* Source port */
	this.setPortSourceListener = function(callback){
		_controls.port_src.change(callback);
	};

	/* Destination port */
	this.setPortSourceListener = function(callback){
		_controls.port_dst.change(callback);
	};

	/* Month */
	this.setMonthListener = function(callback){
		_controls.interval.monthly.change(callback);
	};

	/* Day */
	this.setDayListener = function(callback){
		_controls.interval.daily.change(callback);
	};

	/* Hour */
	this.setHourListener = function(callback){
		_controls.interval.hourly.change(callback);
	};		

	/* Application */
	this.setApplicationListener = function(callback){
		_controls.application.change(callback);
	};

	this.populateYears = function(){
		_year = aggregateData.dateStart.getFullYear();
	}

	this.populateMonths = function(){
		_populateMonths();
	}

	this.populateDays = function(){
		_populateDays();
	}

	this.populateHours = function(){
		_populateHours();
	}

	this.removeMonths = function(){
		_controls.months.menu.children().remove();
	}

	this.removeDays = function(){
		_controls.days.menu.children().remove();	
	}

	this.removeHours = function(){
		_controls.hours.menu.children().remove();	
	}

	/* Devices */
	this.populateDevices = function(){
		var devices = aggregateData.devices;
		if(devices == null){
			console.log("Devices is empty, should not happen.");
			return;
		}
		_controls.devices.menu.find('.item').each(function(){
			this.remove();
		});
		var newItem = $("<div></div>").addClass('item').attr("value", "All").text("All");
		_controls.devices.menu.append(newItem);	
		_setDevice(newItem.attr("value"));
		_setDeviceName(newItem.text());
		for(var i = 0; i < devices.length; i++){
			newItem = $("<div></div>").addClass('item').attr("value", devices[i].device)
			if(devices[i].name != null){
				newItem.text(devices[i].name);
			}
			else{
				newItem.text(devices[i].device);
			}				
			_controls.devices.menu.append(newItem);
		}
	}

	/* Direction */
	this.populateDirection = function(){

		if(_controls.direction.menu == null){
			console.log("Direction menu doesn't exist, should not happen.");
			return;
		}
		removeAllChildren(_controls.direction.menu);

		var val = "Both";
		var newItem = $("<div></div>").addClass('item').attr('value', val.toLowerCase()).text(val);
		_controls.direction.menu.append(newItem);
		_setDirection("both");

		val = "Incoming";
		newItem = $("<div></div>").addClass('item').attr('value', val.toLowerCase()).text(val);
		_controls.direction.menu.append(newItem);

		val = "Outgoing";
		newItem = $("<div></div>").addClass('item').attr('value', val.toLowerCase()).text(val);
		_controls.direction.menu.append(newItem);
	}

	/* Applications */
	this.populateApplications = function(){
		var applications = aggregateData.applications;
		if(applications == null){
			console.log("Applications is empty, should not happen.");
			return;
		}
		removeAllChildren(_controls.applications);
		var newItem = $("<div></div>").addClass('item').attr('value', "all").text("All");
		_controls.applications.menu.append(newItem);
		newItem.click(function(){
			//_setApplication($(this).attr("value"));
			//_controls.applications.menu.animate({height:'hide'},300);
		});
		_setApplication("all");
		for(var i = 0; i < applications.length; i++){
			var a = applications[i][0]
			newItem = $("<div></div>").addClass('item').attr('value', a.toLowerCase()).text(applications[i][0]);
			newItem.click(function(){
				//_setApplication($(this).attr("value"));
				//_controls.applications.menu.animate({height:'hide'},300);
			});
			_controls.applications.menu.append(newItem);
		}
	}

	/* Months */
	var _populateMonths = function(){
		/* Populate months. */
		var currentDate = aggregateData.dateStart;
		while(currentDate.getTime() <= aggregateData.dateEnd.getTime()){
			var monthString = MONTHS[currentDate.getMonth()];			
			var newItem = $("<div></div>").addClass('item').attr('value', currentDate.getMonth()).text(monthString);
			currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);	// Increment by one month.
			_controls.months.menu.append(newItem);
		}
		_setMonth(_controls.months.menu.children(0).attr("value"));		
	};

	/* Days */
	var _populateDays = function(){
		/* Populate days. */
		_controls.days.menu.find('.item').each(function(){
			this.remove();
		});		
		var currentMonth = _getMonth();
		var currentDate = new Date(aggregateData.dateStart.getFullYear(), currentMonth);	// Start of the desired month.
		while(currentMonth == _getMonth() && currentDate.getTime() < aggregateData.dateEnd.getTime()){			
			var day = currentDate.getDay();				// getDay() is 0-based
			var dayOfTheMonth = currentDate.getDate();	// getDate() is 1-based
			var dayString = DAYS[day];
			var newItem =  $("<div></div>").addClass('item').attr('value', dayOfTheMonth).text(dayString + " " + parseInt(dayOfTheMonth));
			_controls.days.menu.append(newItem);
			currentDate = new Date(currentDate.getTime() + (SECONDS.DAY * 1000));	// Increment by one day.		
			currentMonth = currentDate.getMonth();
		}
	}	

	/* Hours */
	var _populateHours = function(){
		/* Populate hours. */
		_controls.hours.menu.find('.item').each(function(){
			this.remove();
		});			
		var date = new Date(aggregateData.dateStart.getFullYear(), _getMonth(), _getDay());
		var seconds = date.getTime() / 1000;
		var currentDay = filter.getDay();
		while(currentDay == filter.getDay() && seconds < aggregateData.dateEnd.getTime() / 1000){
			// While within the desired day AND before the absolute latest date.
			var hour = date.getHours();
			var newItem = $("<div></div>").addClass('item').attr('value', hour).text(hour + ":00");		
			_controls.hours.menu.append(newItem);
			// Update hour for next iteration
			date = new Date(date.getTime() + (SECONDS.HOUR * 1000));	// Increment by one hour.	
			currentDay = date.getDate();
			seconds = date.getTime() / 1000;
		}
	}

	var _populateIntervalMenus = function(){
		var oldMonth = _selected.month;
		var oldDay = _selected.day;
		var oldHour = _selected.hour;
		if(oldMonth){
			filter.setMonth(oldMonth);
		}
		if(oldDay){
			filter.setDay(oldDay);
		}
		if(oldHour){
			filter.setHour(oldHour);
		}	
	}
};

var visuals = []; 