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