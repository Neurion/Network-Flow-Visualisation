function saveHostName(name){
    $.ajax({
		type	: "POST",
		url 	: "save_host_name",
		data 	: { 
			csrfmiddlewaretoken: getCookie('csrftoken'),
			mac: filter.mac,
			name: name,
		},
		dataType : "text",
		async : true,
		error : function(data){
			alert('AJAX error:' + data);
		},
    	/*success : function(){
    	},*/
    });		
}