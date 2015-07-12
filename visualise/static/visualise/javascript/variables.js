var INTERVAL = {
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

var menu = {
	network: null,
	user: null,
};

var controls = {
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
};

/* Values of the filter controls. This gets updated after a control value is changed. */
var filter = {
	mac: "all",
	direction: "all",
	port: {
		src: -1,
		dst: -1,
	},
	intervalType: null,
	interval: {
		year: null,
		month: null,
		day: null,
		hour: null,
	},
	application: "all",
};

/* Information about the flow data being displayed, be it specific to a device or to the network in general. */
var flowData = {
	time: {
		earliest: 0,
		latest: 0,
	}
};

/* Generic network information. */
/* All local MAC addresses. Used to request information specific to a particular device. */
var n_deviceMACs = [];

var n_names = {};