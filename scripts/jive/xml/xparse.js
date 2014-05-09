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
///   related features, internal entities, etc).
///////////////////////////////////////////////////////////////

// global vars to track element UID's for the index

jive.xml._Xparse_count = 0;
jive.xml._Xparse_index = new Array();

//////////////////////
//// util to replace internal entities in input string
jive.xml._entity = function(str)
{
	var A = new Array();

	A = str.split("&l" + "t;");
	str = A.join("<");
	A = str.split("&g" + "t;");
	str = A.join(">");
	A = str.split("&qu" + "ot;");
	str = A.join("\"");
	A = str.split("&ap" + "os;");
	str = A.join("\'");
	A = str.split("&a" + "mp;");
	str = A.join("&");

	return str;
}
/////////////////////////
//////////////////////
//// util to remove white characters from input string
jive.xml._strip = function(str)
{
	var A = new Array();

	A = str.split("\n");
	str = A.join("");
	A = str.split(" ");
	str = A.join("");
	A = str.split("\t");
	str = A.join("");
	return str;
}

//////////////////////
//// util to replace white characters in input string
jive.xml._normalize = function(str)
{
	var A = new Array();

	A = str.split("\n");
	str = A.join(" ");
	A = str.split("\t");
	str = A.join(" ");
	return str;
}
//////////////////
/////////////////////////
//// the object constructors for the hybrid DOM
jive.xml._element = function()
{
	this.type = "element";
	this.tagName = new String();
	this.attributes = new Array();
	this.childNodes = new Array();
	this.nodeValue = "";
	this.uid = jive.xml._Xparse_count++;
	jive.xml._Xparse_index[this.uid]=this;
}

jive.xml._chardata = function()
{
	this.type = "chardata";
	this.value = new String();
}

jive.xml._pi = function()
{
	this.type = "pi";
	this.value = new String();
}

jive.xml._comment = function()
{
	this.type = "comment";
	this.value = new String();
}

// an internal fragment that is passed between functions
jive.xml._frag = function()
{
	this.str = new String();
	this.ary = new Array();
	this.end = new String();
}

/////////////////////////

///////////////////////
//// functions to process different tags

jive.xml._tag_element = function(frag)
{
	// initialize some temporary variables for manipulating the tag
	var close = frag.str.indexOf(">");
	var empty = (frag.str.substring(close - 1,close) == "/");
	if(empty)
	{
		close -= 1;
	}

	// split up the name and attributes
	var starttag = jive.xml._normalize(frag.str.substring(1,close));
	var nextspace = starttag.indexOf(" ");
	var attribs = new String();
	var name = new String();
	if(nextspace != -1)
	{
		name = starttag.substring(0,nextspace);
		attribs = starttag.substring(nextspace + 1,starttag.length);
	}
	else
	{
		name = starttag;
	}

	var thisary = frag.ary.length;
	frag.ary[thisary] = new jive.xml._element();
	frag.ary[thisary].tagName = jive.xml._strip(name);
	if(attribs.length > 0)
	{
		frag.ary[thisary].attributes = jive.xml._attribution(attribs);
	}
	if(!empty)
	{
		// !!!! important,
		// take the contents of the tag and parse them
		var contents = new jive.xml._frag();
		contents.str = frag.str.substring(close + 1,frag.str.length);
		contents.end = name;
		var val = contents;
		contents = jive.xml._compile(contents);
		frag.ary[thisary].childNodes = contents.ary;
		frag.ary[thisary].nodeValue = val;
		frag.str = contents.str;
	}
	else
	{
		frag.str = frag.str.substring(close + 2,frag.str.length);
	}
	return frag;
}

jive.xml._tag_pi = function(frag)
{
	var close = frag.str.indexOf("?" + ">");
	var val = frag.str.substring(2,close);
	var thisary = frag.ary.length;
	frag.ary[thisary] = new jive.xml._pi();
	frag.ary[thisary].nodeValue = val;
	frag.str = frag.str.substring(close + 2,frag.str.length);
	return frag;
}


jive.xml._tag_comment = function(frag)
{
	var close = frag.str.indexOf("--" + ">");
	var val = frag.str.substring(4,close);
	var thisary = frag.ary.length;
	frag.ary[thisary] = new jive.xml._comment();
	frag.ary[thisary].nodeValue = val;
	frag.str = frag.str.substring(close + 3,frag.str.length);
	return frag;
}

jive.xml._tag_cdata = function(frag)
{
	var close = frag.str.indexOf("]" + "]>");
	var val = frag.str.substring(9,close);
	var thisary = frag.ary.length;
	frag.ary[thisary] = new jive.xml._chardata();
	frag.ary[thisary].nodeValue = val;
	frag.str = frag.str.substring(close + 3,frag.str.length);
	return frag;
}

/////////////////////////


//////////////////
//// util for element attribute parsing
//// returns an array of all of the keys = values
jive.xml._attribution = function(str)
{
	var all = new Array();
	while(1)
	{
		var eq = str.indexOf("=");
		if(str.length == 0 || eq == -1)
		{
			return all;
		}

		var id1 = str.indexOf("\'");
		var id2 = str.indexOf("\"");
		var ids = new Number();
		var id = new String();
		if((id1 < id2 && id1 != -1) || id2 == -1)
		{
			ids = id1;
			id = "\'";
		}
		if((id2 < id1 || id1 == -1) && id2 != -1)
		{
			ids = id2;
			id = "\"";
		}
		var nextid = str.indexOf(id,ids + 1);
		var val = str.substring(ids + 1,nextid);

		var name = jive.xml._strip(str.substring(0,eq));
		all[name] = jive.xml._entity(val);
		str = str.substring(nextid + 1,str.length);
	}
	return "";
}

////////////////////

/////////////////////////
//// transforms raw text input into a multilevel array
jive.xml._compile = function(frag)
{
	// keep circling and eating the str
	while(1)
	{
		// when the str is empty, return the fragment
		if(frag.str.length == 0)
		{
			return frag;
		}

		var TagStart = frag.str.indexOf("<");

		if(TagStart != 0)
		{
			// theres a chunk of characters here, store it and go on
			var thisary = frag.ary.length;
			frag.ary[thisary] = new jive.xml._chardata();
			if(TagStart == -1)
			{
				frag.ary[thisary].nodeValue = jive.xml._entity(frag.str);
				frag.str = "";
			}
			else
			{
				frag.ary[thisary].nodeValue = jive.xml._entity(frag.str.substring(0,TagStart));
				frag.str = frag.str.substring(TagStart,frag.str.length);
			}
		}
		else
		{
			// determine what the next section is, and process it
			if(frag.str.substring(1,2) == "?")
			{
				frag = jive.xml._tag_pi(frag);
			}
			else
			{
				if(frag.str.substring(1,4) == "!" + "--")
				{
					frag = jive.xml._tag_comment(frag);
				}
				else
				{
					if(frag.str.substring(1,9) == "!" + "[CDA" + "TA[")
					{
						frag = jive.xml._tag_cdata(frag);
					}
					else
					{
						if(frag.str.substring(1,frag.end.length + 3) == "/" + frag.end + ">" || jive.xml._strip(frag.str.substring(1,frag.end.length + 3)) == "/" + frag.end)
						{
							// found the end of the current tag, end the recursive process and return
							frag.str = frag.str.substring(frag.end.length + 3,frag.str.length);
							frag.end = "";
							return frag;
						}
						else
						{
							frag = jive.xml._tag_element(frag);
						}
					}
				}
			}
		}
	}
	return "";
}

///////////////////////


//////////////////////
//// util to remove \r characters from input string
//// and return xml string without a prolog
jive.xml._prolog = function(str)
{
	var A = new Array();

	A = str.split("\r\n");
	str = A.join("\n");
	A = str.split("\r");
	str = A.join("\n");

	var start = str.indexOf("<");
	if(str.substring(start,start + 3) == "<" + "?x" || str.substring(start,start + 3) == "<" + "?X" )
	{
		var close = str.indexOf("?" + ">");
		str = str.substring(close + 2,str.length);
	}
	var start = str.indexOf("<!DOC" + "TYPE");
	if(start != -1)
	{
		var close = str.indexOf(">",start) + 1;
		var dp = str.indexOf("[",start);
		if(dp < close && dp != -1)
		{
			close = str.indexOf("]" + ">",start) + 2;
		}
		str = str.substring(close,str.length);
	}
	return str;
}


//// Main public function that is called to
//// parse the XML string and return a root element object
jive.xml.Xparse = function(src)
{
	var frag = new jive.xml._frag();
	// remove bad \r characters and the prolog
	frag.str = jive.xml._prolog(src);
	// create a root element to contain the document
	var root = new Object();
	// main recursive function to process the xml
	frag = jive.xml._compile(frag);
	// all done, lets return the root element + index + document
	if(frag.ary.length > 0){
		root.documentElement = frag.ary[0];
	}else{
		root.documentElement = null;
	}
	root.tagName = "RO" + "OT";
	root.index = jive.xml._Xparse_index;
	jive.xml._Xparse_index = new Array();
	return root;
}

/////////////////////////

//////////////////////////////////////////////////////////////

//	End Copyright 1998 Jeremie

//////////////////////////////////////////////////////////////


