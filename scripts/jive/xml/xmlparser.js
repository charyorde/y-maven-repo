// Ver .91 Feb 21 1998
//////////////////////////////////////////////////////////////
//
//	Copyright 1998 Jeremie
//	Free for public non-commercial use and modification
//	as long as this header is kept intact and unmodified.
//	Please see http://www.jeremie.com for more information
//	or email jer@jeremie.com with questions/suggestions.
//
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
////////// Simple XML Processing Library //////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
////   Fully complies to the XML 1.0 spec
////   as a well-formed processor, with the
////   exception of full error reporting and
////   the document type declaration(and it's
////   related features, internal entities, etc).
///////////////////////////////////////////////////////////////



jive.xml.XMLParser = function(){

	var parser = null;

//	alert(XMLDom);
	if (window.ActiveXObject){

		var ARR_ACTIVEX = ["MSXML4.DOMDocument",
                   "MSXML3.DOMDocument",
                   "MSXML2.DOMDocument",
                   "MSXML.DOMDocument",
                   "Microsoft.XmlDom"]

            var xmlDoc = null;


            if(xmlDoc == null){
			var bFound = false;
			for(var i=0;i<ARR_ACTIVEX.length && !bFound;i++){
				try{
					xmlDoc=new ActiveXObject(ARR_ACTIVEX[i]);
					bFound = true;
				}catch(e){
				}
			}
		}

		if(xmlDoc == null){
			alert("No XML parser available");
			return;
		}
		parser = function(str){
			xmlDoc.async="false";
			xmlDoc.loadXML(str);
			return xmlDoc;
		}


	}

	if(parser == null && window.DOMParser){
		var xmlDoc = new DOMParser();

		parser = function(str){
			var doc = xmlDoc.parseFromString(str, "text/xml");
			var roottag = doc.documentElement;
			if ((roottag.tagName == "parserError") ||
			    (roottag.namespaceURI == "http://www.mozilla.org/newlayout/xml/parsererror.xml")){
				    return null;
			}
			return doc;
		}

	}else if (parser == null && document.implementation && document.implementation.createDocument){
		//create the DOM Document the standards way
		var xmlDoc = document.implementation.createDocument("","", null);
		parser = function(str){
			xmlDoc.async="false";
			xmlDoc.loadXML(str);
			return xmlDoc;
		}
	}else{
        parser = function(str){
            return jive.xml.Xparse(str);
        }
	}


	this.parse = function(str){
		if(parser != null){
			return parser(str);
		}else{
			throw "no xml parser defined"
		}
	}

}






