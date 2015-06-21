/*
Notes:
var ar = new Array("a","b"); <==> var ar = ["a","b"];
this = public
var = private
*/

/**
* Constructor function for a graph object.
* @param the container element in which to store the graph
*/
function Graph(container_element, newData){
	// Private fields
	var container = container_element;	// containing element of the graph
	var data = newData;
	var scale = "";

	// Public fields
	this.setScale = function(newScale){
		scale = newScale;
	}
	this.getScale = function(){
		return scale;
	}
	this.draw = function(){

	}
}

function Chart(container_element, newData, newOptions){
	// Private fields
	var container = container_element;	// containing element of the graph
	var data = newData;
	var options = newOptions;	
	this.draw = function(){
		// Plot the protocol pie chart
		var plot = $.plot(container ,data , options);			
	};
}