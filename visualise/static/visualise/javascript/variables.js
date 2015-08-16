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
};
var statMenu;

var controls = {
	preferences: {
		network: {
			devices_downloaded: null,
			devices_uploaded: null,			
			downloaded_timeline: null,
			uploaded_timeline: null,
			usage: null,
			application: null,
			domains: null,
			country: null,			
		},
		device: {
			devices_downloaded: null,
			devices_uploaded: null,			
			usage: null,
			application: null,
			domains: null,
			country: null,
		},
	},
};

var aggregateData = {
	devices: null,
	dateStart: null,
	dateEnd: null,
	downloaded: 0,
	uploaded: 0,	
}

var topDownloaders = [];
var topUploaders = [];
var devices = [];
function Device(device, name, downloaded, uploaded, timeStart, timeEnd){
	this.device = device;			// Device MAC or IP.
	this.name = name;				// Device name.
	this.downloaded = downloaded;	// Bytes downloaded.
	this.uploaded = uploaded;		// Bytes uploaded.
	this.timeStart = timeStart;		// Earliest data.
	this.timeEnd = timeEnd;			// Latest data.
};

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

function Filter(){

	var _date;
	var _year = -1;
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
	var _selected = {
		device: null,
		direction_in: null,
		direction_out: null,
		port_in: null,
		port_out: null,
		month: null,
		interval: null,
		day: null,
		hour: null,
	};

	this.setControls = function(){
		_setControls();
	}
 
	var _setControls = function(){
		_controls.devices = $('#filter_devices');
		_controls.devices.menu = $('#devices_menu');
		_controls.direction = $('#filter_direction');
		_controls.direction.incoming = $('#direction_incoming');
		_controls.direction.outgoing = $('#direction_outgoing');
		_controls.direction.both = $('#direction_both');	
		_controls.direction.menu = $('#direction_menu');
		_controls.port_src = $('#filter_source_port');
		_controls.port_dst = $('#filter_destination_port');
		_controls.interval = $('#filter_interval');
		_controls.months = $('#filter_month');
		_controls.days = $('#filter_day');
		_controls.hours = $('#filter_hour');
		_controls.months.menu = $('#months_menu');
		_controls.days.menu = $('#days_menu');
		_controls.hours.menu = $('#hours_menu');
		_controls.more = $('#filter_more');

		/* Date */
		_controls.months.click(function(){
			_controls.months.menu.animate({height:'toggle'}, 300);
		});	

		_controls.days.click(function(){
			_controls.days.menu.animate({height:'toggle'}, 300);
		});	

		_controls.hours.click(function(){
			_controls.hours.menu.animate({height:'toggle'}, 300);
		});	

		/* Direction */
		_controls.direction.click(function(){
			_controls.direction.menu.animate({height:'toggle'}, 300);
		});

		/* More */
		_controls.more.click(function(){
			$('#filter_more_container').animate({height:'toggle'}, 300);
		});
	}

	/* Getters. */
	this.getDevice = function(){
		if(_selected.device != null){
			return _selected.device.text();
		}
		else{
			return -1;
		}
	}

	var _getDirection = function(){
		if(_selected.direction != null){
			return _selected.direction.text();
		}	
	}

	this.getDirection = function(){
		_getDirection();
	}

	this.getPortSrc = function(){
		if(_controls.port_src != null){
			if(_controls.port_src.text() != ''){
				return _controls.port_src.text();
			}
			else{
				return -1;
			}
		}
		else{
			return -1;
		}
	}

	this.getPortDst = function(){
		if(_controls.port_dst != null){
			if(_controls.port_dst.text() != ''){
				return _controls.port_dst.text();
			}
			else{
				return -1;
			}
		}
		else{
			return -1;
		}
	}

	var _getInterval = function(){
		if(_selected.interval != null){
			return _selected.interval;
		}
		else{
			return -1;
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
		if(_controls.months != null){			
			return _controls.months.menu.find('.selected').attr('value');
		}
		else{
			return -1;
		}		
	}
	this.getMonth = function(){
		return _getMonth();
	}

	var _getDay = function(){
		if(_controls.days != null){
			return _controls.days.menu.find('.selected').attr('value');
		}
		else{
			return -1;
		}		
	}
	this.getDay = function(){
		return  _getDay();
	}

	var _getHour = function(){
		if(_controls.hours != null){
			return _controls.hours.menu.find('.selected').text().toLowerCase();
		}
		else{
			return -1;
		}
	}
	this.getHour = function(){
		return _getHour();
	}

	/**
	 * Returns the filter timestamp in seconds.
	 */
	this.getTimestamp = function(){
		return new Date(_year, this.getMonth(), this.getDay(), this.getHour()).getTime() / 1000;		
	}

	/* Setters */

	var _setDevice = function(dev){
		if(_selected.device != null){
			_selected.device.removeClass('selected');
		}
		_selected.device = dev;
		_selected.device.addClass('selected');
		console.log('device is now: ' + _selected.device.text());
	}
	this.setDevice = function(dev){
		_setDevice(dev);
	}

	var _setInterval = function(intv){
		_selected.interval = intv;
	}
	this.setInterval = function(intv){
		_setInterval(intv);
	}
	
	var _setMonth = function(mon){
		if(_selected.month != null){
			_selected.month.removeClass('selected');
		}
		_selected.month = mon;
		_selected.month.addClass('selected');

		if(_selected.month.text().toLowerCase() == "all"){
			console.log('interval = all');
		}
		else{
			console.log('interval = monthly');
			_controls.days.animate({height:'show'}, 300);
		}
	}
	this.setMonth = function(mon){
		_setMonth(mon);
	}
	
	var _setDay = function(day){
		if(_selected.day != null){
			_selected.day.removeClass('selected');
		}
		_selected.day = day;
		_selected.day.addClass('selected');

		if(_selected.day.text().toLowerCase() == "all"){
			console.log('interval = all');
		}
		else{
			console.log('interval = daily');
			_controls.hours.animate({height:'show'}, 300);
		}		
	}
	this.setDay = function(day){
		_setDay(day);
	}

	var _setHour = function(hour){
		if(_selected.hour != null){
			_selected.hour.removeClass('selected');
		}
		_selected.hour = hour;
		_selected.hour.addClass('selected');
	}
	this.setHour = function(hour){
		_setHour(hour);
	}

	/* Listeners */
 	/* Device */
	this.setDeviceListener = function(){
		_controls.devices.click(function(){
			_controls.devices.menu.animate({height:'toggle'}, 300);
		});
	};

	/* Ingress */
	this.setDirectionIngressListener = function(callback){
		_controls.direction.incoming.click(function(){

			if(_controls.direction.incoming.hasClass('selected')){
				_controls.direction.incoming.removeClass('selected');
			}
			else{
				_controls.direction.incoming.addClass('selected');
			}

			console.log("Ingress selected.");

			callback();

			_hideAllMenus();
		});
	};

	/* Egress */
	this.setDirectionEgressListener = function(callback){
		_controls.direction.outgoing.click(function(){

			if(_controls.direction.outgoing.hasClass('selected')){		
				_controls.direction.outgoing.removeClass('selected');
			}
			else{
				_controls.direction.outgoing.addClass('selected');
			}

			console.log("Egress selected.");

			callback();

			_hideAllMenus();
		});
	};

	this.setDirectionBothListener = function(callback){
		_controls.direction.both.click(function(){

			if(_controls.direction.both.hasClass('selected')){		
				_controls.direction.both.removeClass('selected');
			}
			else{
				_controls.direction.both.addClass('selected');
			}

			console.log("Both selected.");

			callback();

			_hideAllMenus();
		});
	}

	/* Source port */
	this.setPortSourceListener = function(callback){
		_controls.port_src.change(callback);
	};

	/* Destination port */
	this.setPortSourceListener = function(callback){
		_controls.port_dst.change(callback);
	};

	/* Interval */
	this.setIntervalListener = function(){
		_controls.interval.click(function(){
			_controls.interval.menu.animate({height:'toggle'}, 300);
		});
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

	this.populateMonths = function(){
		_populateMonths();
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

	this.populateDevices = function(){
		var devices = aggregateData.devices;
		if(devices == null){
			console.log("Devices is empty, should not happen.");
			return;
		}
		removeAllChildren(_controls.devices);
		var newItem = $("<div></div>").addClass('item').text("All");
		newItem.click(function(){
			_setDevice($(this));
		});
		_setDevice(newItem);
		_controls.devices.menu.append(newItem);	
		for(var i = 0; i < aggregateData.devices.length; i++){
			var device = aggregateData.devices[i];
			newItem = $("<div></div>").addClass('item').text(device);
			newItem.click(function(){
				_setDevice($(this));
			});		
			_controls.devices.menu.append(newItem);
		}

		_controls.devices.menu.click(function(){
			_controls.devices.menu.animate({height:'hide'},300);	
		});
	}

	/* Months */
	var _populateMonths = function(){
		/* Populate months. */
		var currentDate = aggregateData.dateStart;
		console.log();
		while(currentDate.getTime() <= aggregateData.dateEnd.getTime()){
			var monthString = MONTHS[currentDate.getMonth()];			
			var newItem = $("<div></div>").addClass('item').attr('value', currentDate.getMonth()).text(monthString);
			newItem.click(function(){
				_setMonth($(this));
				console.log('month is now ' + filter.getMonth());

				/* Remove day menu items */
				_controls.days.menu.find('.item').each(function(){
					this.remove();
				});

				_populateDays();
			});
			currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);	// Increment by one month.
			_controls.months.menu.append(newItem);
		}
	};

	/* Days */
	var _populateDays = function(){
		/* Populate days. */
		var currentMonth = _getMonth();
		var currentDate = new Date(aggregateData.dateStart.getFullYear(), currentMonth);	// Start of the desired month.
		console.log(currentDate);
		while(currentMonth == _getMonth() && currentDate.getTime() < aggregateData.dateEnd.getTime()){			
			var day = currentDate.getDay();				// getDay() is 0-based
			var dayOfTheMonth = currentDate.getDate();	// getDate() is 1-based
			var dayString = DAYS[day];
			var newItem =  $("<div></div>").addClass('item').attr('value', dayOfTheMonth).text(dayString + " " + parseInt(dayOfTheMonth));
			newItem.click(function(){
				_setDay($(this));
				console.log('day is now ' + filter.getDay());

				/* Remove day menu items */
				_controls.hours.menu.find('.item').each(function(){
					this.remove();
				});

				_populateHours();			
			});
			_controls.days.menu.append(newItem);
			currentDate = new Date(currentDate.getTime() + (SECONDS.DAY * 1000));	// Increment by one day.		
			currentMonth = currentDate.getMonth();
		}
	}	

	/* Hours */
	var _populateHours = function(){
		/* Populate hours. */
		var date = new Date(aggregateData.dateStart.getFullYear(), _getMonth(), _getDay());
		var seconds = date.getTime() / 1000;
		var currentDay = filter.getDay();
		while(currentDay == filter.getDay() && seconds < aggregateData.dateEnd.getTime() / 1000){
			// While within the desired day AND before the absolute latest date.
			var hour = date.getHours();
			var newItem = $("<div></div>").addClass('item').attr('value', hour).text(hour + ":00");
			newItem.click(function(){
				_setHour($(this));
				console.log('hour is now ' + _getHour());			
			});			
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
		//filter.removeMonths();
		//filter.removeDays();
		//filter.removeHours();	
		//filter.populateMonths();
		//filter.populateDays();
		//filter.populateHours();	
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