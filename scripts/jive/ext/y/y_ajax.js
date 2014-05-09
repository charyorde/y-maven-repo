// var ajax = new yAjax("index.php");
// ajax.POST(parameters);


// url is a string
jive.ext.y.yAjax = function(rdyFun, errFun){
	var http_request = false;

	if (window.XMLHttpRequest) { // Mozilla, Safari,...
		http_request = new XMLHttpRequest();
		if (http_request.overrideMimeType) {
			http_request.overrideMimeType('text/xml');
		}
	} else if (window.ActiveXObject) { // IE
		try {
			http_request = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				http_request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {}
		}
	}
	if (!http_request) {
		return false;
	}

	http_request.onreadystatechange = alertContents;

	function alertContents() {
		try{
			if (http_request.readyState == 4) {
				if (http_request.status == 200) {
					rdyFun(http_request.responseText);
				} else {
					errFun();
				}
			}
		}catch(e){
			// alert(e);
		}
	}

	// parameters is a form
	this.POST = function (url, parameters) {
			http_request.open('POST', url, true);
			http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			http_request.setRequestHeader("Content-length", parameters.length);
			http_request.setRequestHeader("Connection", "close");
			http_request.send(parameters);
	}
}
