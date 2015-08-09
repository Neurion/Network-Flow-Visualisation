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

var VISUAL_MODE = {
	GRAPHIC: "graphic",
	TABLE: "table",
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
	var _values = {
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
		_controls.interval.menu = $('#interval_menu');
		_controls.interval.monthly = $('#interval_monthly');
		_controls.interval.daily = $('#interval_daily');
		_controls.interval.hourly = $('#interval_hourly');
		_controls.months = $('#filter_months');
		_controls.days = $('#filter_days');
		_controls.hours = $('#filter_hours');
		_controls.months.menu = $('#months_menu');
		_controls.days.menu = $('#days_menu');
		_controls.hours.menu = $('#hours_menu');
		_controls.more = $('#filter_more');

		_controls.interval.monthly.click(function(){
			filter.setInterval(_controls.interval.monthly);
			//_hideAllMenus();
			_populateIntervalMenus();
			// Hide
			_controls.days.animate({width:'hide'}, 300);
			_controls.hours.animate({width:'hide'}, 300);
			// Show
			_controls.months.animate({width:'show'}, 300);
		});	

		_controls.interval.daily.click(function(){
			filter.setInterval(_controls.interval.daily);
			//_hideAllMenus();	
			_populateIntervalMenus();
			// Hide
			_controls.hours.animate({width:'hide'}, 300);
			// Show
			_controls.months.animate({width:'show'}, 300);
			_controls.days.animate({width:'show'}, 300);
		});		

		_controls.interval.hourly.click(function(){
			filter.setInterval(_controls.interval.hourly);
			//_hideAllMenus();
			_populateIntervalMenus();
			// Show
			_controls.months.animate({width:'show'}, 300);
			_controls.days.animate({width:'show'}, 300);
			_controls.hours.animate({width:'show'}, 300);
		});

		_controls.months.click(function(){
			_controls.months.menu.animate({width:'toggle'}, 300);
		});	

		_controls.days.click(function(){
			_controls.days.menu.animate({width:'toggle'}, 300);
		});	

		_controls.hours.click(function(){
			_controls.hours.menu.animate({width:'toggle'}, 300);
		});	

		/* Direction */
		_controls.direction.click(function(){
			_controls.direction.menu.animate({width:'toggle'}, 300);
		});

		/* More */
		_controls.more.click(function(){
			$('#filter_more_container').slideToggle(300);
		});
	}
	
	var _hideAllMenus = function(){
		_controls.devices.menu.animate({width:'hide'}, 300);
		_controls.direction.menu.animate({width:'hide'}, 300);
		_controls.interval.menu.animate({width:'hide'}, 300);
		_controls.months.menu.animate({width:'hide'}, 300);
		_controls.days.menu.animate({width:'hide'}, 300);
		_controls.hours.menu.animate({width:'hide'}, 300);
	}

	/* Getters. */
	this.getDevice = function(){
		if(_values.device != null){
			return _values.device.text();
		}
		else{
			return -1;
		}
	}

	var _getDirection = function(){
		if(_values.direction != null){
			return _values.direction.text();
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
		if(_controls.interval != null){
			return _values.interval;
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
		if(_controls.interval.monthly != null){
			return _controls.interval.monthly.val();
		}
		else{
			return -1;
		}		
	}

	this.getMonth = function(){
		if(_controls.interval.monthly != null){
			return _controls.interval.monthly.val();
		}
		else{
			return -1;
		}
	}

	var _getDay = function(){
		if(_controls.interval.daily != null){
			return _controls.interval.daily.val();
		}
		else{
			return -1;
		}		
	}

	this.getDay = function(){
		if(_controls.interval.daily != null){
			return _controls.interval.daily.val();
		}
		else{
			return -1;
		}
	}

	var _getHour = function(){
		if(_controls.interval.hourly != null){
			return _controls.interval.hourly.val();
		}
		else{
			return -1;
		}		
	}

	this.getHour = function(){
		if(_controls.interval.hourly != null){
			return _controls.interval.hourly.val();
		}
		else{
			return -1;
		}
	}

	/**
	 * Returns the filter timestamp in seconds.
	 */
	this.getTimestamp = function(){
		return new Date(_year, this.getMonth(), this.getDay(), this.getHour()).getTime() / 1000;		
	}

	/* Setters */

	var _setDevice = function(dev){
		if(_values.device != null){
			_values.device.removeClass('selected');
		}
		_values.device = dev;
		_values.device.addClass('selected');
		console.log('device is now: ' + _values.device.text());
	}
	this.setDevice = function(dev){
		_setDevice(dev);
	}

	var _setInterval = function(intv){
		if(_values.interval != null){
			_values.interval.removeClass('selected');
		}
		_values.interval = intv;
		_values.interval.addClass('selected');
		console.log('interval is now: ' + _values.interval.text());
	}
	this.setInterval = function(intv){
		_setInterval(intv);
	}
	
	var _setMonth  = function(mon){
		if(_values.month != null){
			_values.month.removeClass('selected');
		}
		_values.month = mon;
		_values.month.addClass('selected');
		_hideAllMenus();
		console.log('month is now: ' + _values.month.text());		
	}
	this.setMonth = function(mon){
		_setMonth(mon);
	}
	
	var _setDay = function(day){
		if(_values.day != null){
			_values.day.removeClass('selected');
		}
		_values.day = day;
		_values.day.addClass('selected');
		_hideAllMenus();
		console.log('day is now: ' + _values.day.text());
	}
	this.setDay = function(day){
		_setDay(day);
	}

	var _setHour = function(hour){
		if(_values.hour != null){
			_values.hour.removeClass('selected');
		}
		_values.hour = hour;
		_values.hour.addClass('selected');
		console.log('hour is now: ' + _values.hour.text());		
	}
	this.setHour = function(hour){
		_setHour(hour);
	}

	/* Listeners */
 	/* MAC */
	this.setDeviceListener = function(){
		_controls.devices.click(function(){
			console.log("Device changed.");
			_controls.interval.menu.animate({width:'hide'}, 300);
			_controls.devices.menu.animate({width:'toggle'}, 300);
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
			_controls.interval.menu.animate({width:'toggle'}, 300);
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

	this.populateDays = function(){
		_populateDays();
	}

	this.populateHours = function(){
		_populateHours();
	}

	this.removeMonths = function(){
		_controls.months.menu.children().remove();
		//removeAllChildren(_controls.months.menu);	// doesn't work...???
	}

	this.removeDays = function(){
		_controls.days.menu.children().remove();	
		//removeAllChildren(_controls.days.menu);	// doesn't work...???
	}

	this.removeHours = function(){
		_controls.hours.menu.children().remove();	
		//removeAllChildren(_controls.hours.menu);	// doesn't work...???
	}

	this.updateControls = function(){
		//console.log("updating the filter controls...");	
		populateDevices();
		//console.log("...updated filter controls.");
	}

	var populateDevices = function(){
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
			_controls.devices.menu.animate({width:'hide'},300);	
		});
	}

	/* Months */
	var _populateMonths = function(){
		/* Populate months. */
		var currentDate = aggregateData.dateStart;
		while(currentDate.getTime() <= aggregateData.dateEnd.getTime()){
			var monthString = MONTHS[currentDate.getMonth()];
			currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);	// Increment by one month.
			var newItem = $("<div></div>").addClass('hover').text(currentDate.getMonth()).text(monthString);
			newItem.click(function(){
				console.log('month item clicked.');
				_setMonth($(this));
			});
			_controls.months.menu.append(newItem); 			
		}
	};

	/* Days */
	var _populateDays = function(){
		/* Populate days. */
		var currentDate = new Date(aggregateData.dateStart.getFullYear(), _getMonth());	// Start of the desired month.
		var currentMonth = _getMonth();
		while(currentMonth == _getMonth() && currentDate.getTime() < aggregateData.dateEnd.getTime()){			
			var day = currentDate.getDay();				// getDay() is 0-based
			var dayOfTheMonth = currentDate.getDate();	// getDate() is 1-based
			var dayString = DAYS[day];
			var newItem =  $("<div></div>").addClass('hover').text(dayOfTheMonth).text(dayString + " " + parseInt(dayOfTheMonth));
			newItem.click(function(){
				console.log('day item clicked.');
				_setDay($(this));				
			});
			_controls.days.menu.append(newItem); 
			currentDate = new Date(currentDate.getTime() + (SECONDS.DAY * 1000));	// Increment by one day.		
			currentMonth = currentDate.getMonth();
		}
	}	
	var _daysChanged = function(){
		console.log('day item clicked.');
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
			var newItem = $("<div></div>").addClass('hover').text(hour).text(hour + ":00");
			newItem.click(function(){
				console.log('hour item clicked.');
				_setHour($(this));				
			});			
			_controls.hours.menu.append(newItem);
			// Update hour for next iteration
			date = new Date(date.getTime() + (SECONDS.HOUR * 1000));	// Increment by one hour.	
			currentDay = date.getDate();
			seconds = date.getTime() / 1000;
		}
	}
	var _hoursChanged = function(){
		console.log('hour item clicked.');
	}

	var _populateIntervalMenus = function(){
		var oldMonth = _values.month;
		var oldDay = _values.day;
		var oldHour = _values.hour;
		filter.removeMonths();
		filter.removeDays();
		filter.removeHours();	
		filter.populateMonths();
		filter.populateDays();
		filter.populateHours();	
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