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
	filters: {
		selectBox: {
			macs: null,
			intervalType: null,
			interval: {
				hours: null,
				days: null,
				months: null,
			},
			application: null,
		},
		checkBox: {
			incoming: null,
			outgoing: null,
		},
		textBox: {
			port: {
				src: null,
				dst: null,
			},
		},
	},
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

/* Values of the filter controls. This gets updated after a control value is changed. */
var filter = {
	mac: "all",
	direction: DIRECTION.ALL,
	port: {
		src: -1,
		dst: -1,
	},
	intervalType: DEFAULT.INTERVAL,
	interval: {
		start: -1,
		end: -1,
		year: -1,
		month: -1,
		day: -1,
		hour: -1,
	},
	application: "all",
};

/*  */
var data = {
	time: {
		earliest: 0,
		latest: 0,
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

/* Generic network information. */
/* All local MAC addresses. Used to request information specific to a particular device. */
//var n_deviceMACs = [];

var n_applications = [];

var n_names = {};

var visuals = [];