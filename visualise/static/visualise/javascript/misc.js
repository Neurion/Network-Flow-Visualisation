/** 
 * This file contains helper methods. 
*/

/**
 * Removes all children from the given element.
*/
function removeAllChildren(element){
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}	
}