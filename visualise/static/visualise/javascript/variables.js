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

/* All possible visuals that can be displayed. */
var visuals = {
	network: {
		devices_downloaded: {
			container: null,
			func: null,
			data: null,
		},
		devices_uploaded: {
			container: null,
			func: null,
			data: null,
		},
		usage: {
			container: null,
			func: null,
			data: null,
		},
		domains: {
			container: null,
			func: null,
			data: null,
		},
		country: {
			container: null,
			func: null,
			data: null,
		},
	},
	device: {
		downloaded: {
			container: null,
			func: null,
			data: null,
		},
		uploaded: {
			container: null,
			func: null,
			data: null,
		},
		usage: {
			container: null,
			func: null,
			data: null,
		},
		domains: {
			container: null,
			func: null,
			data: null,
		},
		country: {
			container: null,
			func: null,
			data: null,
		},
	},
};

var mode = {
	network: null,
	user: null,
};

var menu = {
	filter: null,
	display: null,
}

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

/*  */
var data = {
	date: {
		start: null,
		end: null,
	},	
	bytes: {
		uploaded: 0,
		downloaded: 0,
	},	
	devices: {
		macs: null,
		names: null,
		bytes: {
			downloaded: null,
			uploaded: null,
		},
	},
};

function Filter(){

	var _date;
	var _year = -1;

	var _controls = {
		mac: null,
		direction_in: null,
		direction_out: null,
		port: {
			src: null,
			dst: null,
		},		
		interval: null,
		month: null,
		day: null,
		hour: null,
		application: null,
	}

	this.setControls = function(c_macs, c_direction_in, c_direction_out, c_port_src, c_port_dst, c_interval, c_applications){
		_controls.macs = c_macs;
		_controls.direction_in = c_direction_in;
		_controls.direction_out = c_direction_out;
		_controls.port.src = c_port_src;
		_controls.port.dst = c_port_dst;
		_controls.interval = c_interval;
		//_controls.month = c_month;
		//_controls.day = c_day;
		//_controls.hour = c_hour;
		_controls.applications = c_applications;

		_controls.interval.append($("<option></option>").attr("value", "monthly").text("Monthly")); 
		_controls.interval.append($("<option></option>").attr("value", "daily").text("Daily"));
		_controls.interval.append($("<option></option>").attr("value", "hourly").text("Hourly")); 
		_controls.interval.val(DEFAULT.INTERVAL);

		_createMonths();

	}

	/* Getters. */
	this.getMAC = function(){
		if(_controls.macs != null){
			if(_controls.macs.val() != ''){
				return _controls.macs.val();
			}
			else{
				return -1;
			}
		}
		else{
			return -1;
		}
	}

	this.getDirection = function(){
		if(_controls.direction_in != null && _controls.direction_out != null){
			if(_controls.direction_in.is(':checked') && _controls.direction_out.is(':checked')){
				return DIRECTION.ALL;
			}
			else if(_controls.direction_in.is(':checked')){
				return DIRECTION.INGRESS;
			}
			else if(_controls.direction_out.is(':checked')){
				return DIRECTION.EGRESS;
			}
			else{
				alert("You must select at least one direction.");
				return "error";
			}
		}
	}

	this.getPortSrc = function(){
		if(_controls.port.src != null){
			if(_controls.port.src.text() != ''){
				return _controls.port.src.text();
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
		if(_controls.port.dst != null){
			if(_controls.port.dst.text() != ''){
				return _controls.port.dst.text();
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
			return _controls.interval.val();
		}
		else{
			return -1;
		}
	}

	this.getInterval = function(){
		if(_controls.interval != null){
			return _controls.interval.val();
		}
		else{
			return -1;
		}			
	}

	var _getYear = function(){
		return _year;		
	}

	this.getYear = function(){
		return _year;
	}

	var _getMonth = function(){
		if(_controls.month != null){
			return _controls.month.val();
		}
		else{
			return -1;
		}		
	}

	this.getMonth = function(){
		if(_controls.month != null){
			return _controls.month.val();
		}
		else{
			return -1;
		}
	}

	var _getDay = function(){
		if(_controls.day != null){
			return _controls.day.val();
		}
		else{
			return -1;
		}		
	}

	this.getDay = function(){
		if(_controls.day != null){
			return _controls.day.val();
		}
		else{
			return -1;
		}
	}

	var _getHour = function(){
		if(_controls.hour != null){
			return _controls.hour.val();
		}
		else{
			return -1;
		}		
	}

	this.getHour = function(){
		if(_controls.hour != null){
			return _controls.hour.val();
		}
		else{
			return -1;
		}
	}

	this.getTimestamp = function(){
		return new Date(year, this.getMonth()).getTime() / 1000;		
	}

	/* Setters */
	this.setMonth = function(val){
		if(val != -1){
			_controls.month.val(val);
		}
	}

	this.setDay = function(val){
		if(val != -1){
			_controls.day.val(val);
		}
	}

	this.setHour = function(val){
		if(val != -1){
			_controls.hour.val(val);
		}
	}

	/* Listeners */
 	/* MAC */
	this.setMACListener = function(callback){
		_controls.macs.change(callback);
	};

	/* Ingress */
	this.setDirectionIngressListener = function(callback){
		_controls.direction_in.change(callback);
	};

	/* Egress */
	this.setDirectionEgressListener = function(callback){
		_controls.direction_out.change(callback);
	};

	/* Source port */
	this.setPortSourceListener = function(callback){
		_controls.port.src.change(callback);
	};

	/* Destination port */
	this.setPortSourceListener = function(callback){
		_controls.port.dst.change(callback);
	};

	/* Interval */
	this.setIntervalListener = function(callback){
		_controls.interval.change(callback);
	};

	/* Month */
	this.setMonthListener = function(callback){
		_controls.month.change(callback);
	};

	/* Day */
	this.setDayListener = function(callback){
		_controls.day.change(callback);
	};

	/* Hour */
	this.setHourListener = function(callback){
		_controls.hour.change(callback);
	};		

	/* Application */
	this.setApplicationListener = function(callback){
		_controls.application.change(callback);
	};

	this.addMonths = function(){
		_createMonths();
	}

	this.addDays = function(){
		_createDays();
	}

	this.addHours = function(){
		_createHours();
	}

	this.removeMonths = function(){		
		if(_controls.month != null){
			console.log("Removing month control.");
			_controls.month.remove();
		}
	}

	this.removeDays = function(){		
		if(_controls.day != null){
			console.log("Removing day control.");
			_controls.day.remove();
		}
	}

	this.removeHours = function(){
		if(_controls.hour != null){
			console.log("Removing hour control.");
			_controls.hour.remove();
		}
	}

	this.update = function(new_data){
		console.log("updating the filter controls...");	
		data.devices.macs = new_data[0];
		updateMACs();
		dateStart = new Date(new_data[2][0] * 1000);
		dateEnd = new Date(new_data[2][1] * 1000);
		console.log("...updated filter controls.");
	}

	var updateMACs = function(){
		var macs = data.devices.macs;
		var names = data.devices.names;
		if(macs == null){
			console.log("should not happen...");
		}
		removeAllChildren(_controls.macs);
		_controls.macs.append($("<option></option>").attr("value", "all").text("All"));
		for(var i = 0; i < data.devices.macs.length; i++){
			var mac = data.devices.macs[i];
			var name = mac;
			if(names[mac] != null){
				name = names[mac];
				n_names[mac] = name;
			}
			_controls.macs.append($("<option></option>").attr("value", mac).text(name));
		}		
	}

	/* Months */
	var _createMonths = function(){
		_controls.month = $('<select></select>').attr('id', 'select_month');
		_controls.month.change(_monthsChanged);
		_controls.interval.parent().append(_controls.month);

		/* Populate months. */
		var currentDate = data.date.start;
		while(currentDate.getTime() <= data.date.end.getTime()){
			var monthString = MONTHS[currentDate.getMonth()];
			_controls.month.append($("<option></option>").attr("value", currentDate.getMonth()).text(monthString)); 
			currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);	// Increment by one month.
		}
	};
	var _monthsChanged = function(){
		/* Only show days if interval is either daily or hourly. */
		if(_getInterval == INTERVAL.DAILY || _getInterval == INTERVAL.HOURLY){
			_controls.day.remove();
			_createDays();
		}
		if(_getInterval == INTERVAL.HOURLY){
			_controls.hour.remove();
			_createHours();
		}
		requestMetaData(function(){
			updateMetaData();
			updateVisuals();
		});
	}


	/* Days */
	var _createDays = function(){
		_controls.day = $('<select></select>').attr('id', 'select_day');
		_controls.interval.parent().append(_controls.day);
		_controls.day.change(_daysChanged);

		/* Populate days. */
		var currentDate = new Date(data.date.start.getFullYear(), _getMonth());	// Start of the desired month.
		var currentMonth = _getMonth();
		while(currentMonth == _getMonth() && currentDate.getTime() < data.date.end.getTime()){			
			var day = currentDate.getDay();				// getDay() is 0-based
			var dayOfTheMonth = currentDate.getDate();	// getDate() is 1-based
			var dayString = DAYS[day];
			_controls.day.append($("<option></option>").attr("value", dayOfTheMonth).text(dayString + " " + parseInt(dayOfTheMonth))); 
			currentDate = new Date(currentDate.getTime() + (SECONDS.DAY * 1000));	// Increment by one day.		
			currentMonth = currentDate.getMonth();
		}

		_controls.month.attr('disabled', 'true');
	}	
	var _daysChanged = function(){
		if(_getMonth() != 'all'){
			if(_getInterval == INTERVAL.HOURLY){
				$('#select_hour').remove();		
				_createHours();
			}
		}
		else{
			if(_getInterval == INTERVAL.DAILY){
				_controls.day.remove();
			}
			if(_getInterval == INTERVAL.HOURLY){
				_controls.hour.remove();
			}
		}
		requestMetaData(function(){
			updateMetaData();
			updateVisuals();
		});			// Request new data
	}


	/* Hours */
	var _createHours = function(){
		_controls.hour = $('<select></select>').attr('id', 'select_hour');
		_controls.interval.parent().append(_controls.hour);
		_controls.hour.change(_hoursChanged);

		/* Populate hours. */
		var date = new Date(data.date.start.getFullYear(), _getMonth(), _getDay());
		var seconds = date.getTime() / 1000;
		var currentDay = filter.getDay();
		while(currentDay == filter.getDay() && seconds < data.date.end.getTime() / 1000){
			// While within the desired day AND before the absolute latest date.
			var hour = date.getHours();
			_controls.hour.append($("<option></option>").attr("value", hour).text(hour + ":00")); 		
			// Update hour for next iteration
			date = new Date(date.getTime() + (SECONDS.HOUR * 1000));	// Increment by one hour.	
			currentDay = date.getDate();
			seconds = date.getTime() / 1000;
		}

		_controls.month.attr('disabled', 'true');
		_controls.day.attr('disabled', 'true');
	}
	var _hoursChanged = function(){
		if(_controls.month == 'all'){
			if(_getInterval == INTERVAL.DAILY){
				_controls.day.remove();
			}
			if(_getInterval == INTERVAL.HOURLY){
				_controls.hour.remove();
			}
		}
		requestMetaData(function(){
			updateMetaData();
			updateVisuals();
		});			// Request new data	
	}
};

var visuals = []; 