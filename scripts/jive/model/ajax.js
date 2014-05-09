// url is a string
// control is the controller
// rdyFun will be called when a successful result is returned from the server
// errFun will be called if anything goes wrong
jive.model.Ajax = function(control, rdyFun, errFun){
	var that = this;

	// parameters is a form
	this.POST = function (url, parameters) {

		var readyFunction = function(reply){
			try{
				// reply is the message from the server
				// check to see if the server sent back JSON
				var list = null;
                if(!$obj(list) || list == null || !$obj(list.documentElement) || list.documentElement == null){
                    var parser = new jive.xml.XMLParser();
                    try{
                        list = parser.parse(reply);
                    }catch(e){
                        errFun("XML Parse exception");
                        return;
                    }
                }
				// list is a ROOT xml object
				// and holds the actual document in the
				// .contents property
				if($obj(list) && list != null && $obj(list.documentElement) && list.documentElement != null){
					// if it returned results at all
					// then get them
					list = list.documentElement;
				}else{
					// otherwise its an error
					errFun("XML Parse exception");
					return;
				}

				if(list.tagName == "br"){
					// an exception
					//
					// we should log this somehow ?
					errFun("Server Exception");
				}else
				if(list.tagName == "NotLoggedInException"){
					control.handleLogIn(function(){
						that.POST(url, parameters);
					});
				}else{
					control.poke();
					rdyFun(list);
				}
			}catch(e){
				alert("ajax error:" + e);
			}
		};

		var errorFun = function(){
//			500 error
			errFun("500 Status");
		}

		var ajax = new jive.ext.y.yAjax(readyFunction, errorFun);
		ajax.POST(url, parameters);
	}
}
