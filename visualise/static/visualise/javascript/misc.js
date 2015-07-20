/** 
 * This file contains helper functions not specific to the application.
*/

/**
 * Removes all children from the given element.
*/
function removeAllChildren(element){
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}	
}

function createInput(id, type){
    var $input = $('<input></input>');
    $input.attr('id', id);
    $input.attr('type', type);
    return $input;
}

/**
 * Returns the specified cookie.
*/
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

// from http://scratch99.com/web-development/javascript/convert-bytes-to-mb-kb/
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}; 




function printFilterValues(){
    console.log("### filter values ###");
    console.log("   mac: " + filter.mac);
    console.log("   direction: " + filter.direction);
    console.log("   month: " + filter.interval.month);
    console.log("   day: " + filter.interval.day);
    console.log("   hour: " + filter.interval.hour);
    console.log("   port_source: " + filter.port.src);
    console.log("   port_destination: " + filter.port.dst);
    console.log("\n\n");
}