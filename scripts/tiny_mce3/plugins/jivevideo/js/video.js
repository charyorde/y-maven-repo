// begin edits //
// https://brewspace.jiveland.com/docs/DOC-10757 //
// tinyMCEPopup.requireLangPack();
// end edits //

var action, orgTableWidth, orgTableHeight, dom = tinyMCEPopup.editor.dom;

function insertVideo() {
    var inst = tinyMCEPopup.editor;

    var service = $j("#site").val();
    var video = $j("#videoId").val();

    if (service && service.length) {
        tinyMCEPopup.restoreSelection();

        var html = "";
        // Create new video
        html += '<img';

        html += makeAttrib('class', "jive_macro jive_macro_" + service);
        html += makeAttrib("jivemacro",service);
        html += makeAttrib('___default_attr', video);
        var src = window.parent.CS_RESOURCE_BASE_URL + "/images/tiny_mce3/plugins/jiveemoticons/images/spacer.gif";
        html += makeAttrib('src',src);
        html += makeAttrib('data-mce-src',src);
        html += makeAttrib("width","425");
        html += makeAttrib("height", "350");
        html += "/>";

        inst.execCommand('mceBeginUndoLevel');
        inst.execCommand('mceInsertContent', false, html);
        inst.execCommand('mceEndUndoLevel');

        tinyMCEPopup.close();
    }else{
        invalid();
    }
}

function makeAttrib(attrib, value) {
	var formObj = $j('#webform').get(0);
	var valueElm = formObj.elements[attrib];

	if (typeof(value) == "undefined" || value == null) {
		value = "";

		if (valueElm)
			value = valueElm.value;
	}

	if (value == "")
		return "";

	// XML encode it
	value = value.replace(/&/g, '&amp;');
	value = value.replace(/\"/g, '&quot;');
	value = value.replace(/</g, '&lt;');
	value = value.replace(/>/g, '&gt;');

	return ' ' + attrib + '="' + value + '"';
}

function valid(){
    document.getElementById("invalid").style.display = "none";
    document.getElementById("insert").disabled = false;
}

function invalid(){
    document.getElementById("invalid").style.display = "block";
    document.getElementById("insert").disabled = true;
}

function getGenericVideoID(str, validEmbedPatterns) {
    var id, i, res;

    id  = null;
    for (i = 0; i < validEmbedPatterns.length; i += 1) {
        res = str.match(validEmbedPatterns[i]);
        if (res && res.length >= 2) {
            id = res[1];
            return id;
        }
    }
    return null;
}

function init() {
	tinyMCEPopup.resizeToInnerSize();

	var inst = tinyMCEPopup.editor;

    var availableSources = {
        "youtube": {
            regexes:
                    [/youtube\.com\/watch\?(?:[^&]+&)*v=([_\-a-zA-Z0-9]+)/i,
                        /youtube\.com\/embed\/([_\-a-zA-Z0-9]+)/i,
                        /youtube\.com\/user\/.*\/([_\-a-zA-Z0-9]+)/i,
                        /youtube\.com\/v\/([_\-a-zA-Z0-9]+)/i,
                        /youtu\.be\/([_\-a-zA-Z0-9]+)/i],
            displayName: "youtube.com"
        },

        "vimeo": {
            regexes:
                    [/vimeo.com\/moogaloop.swf\?clip_id=([a-zA-Z0-9]+)/i,
                        /vimeo.com\/video\/([a-zA-Z0-9]+)/i,
                        /vimeo.com\/([a-zA-Z0-9]+)/i],
            displayName: "vimeo.com"
        },
        "veoh": {
            regexes:
                    [/veoh.com\/browse\/videos\/\S+\/watch\/([a-zA-Z0-9]+)/i,
                        /veoh.com\/videos\/([a-zA-Z0-9]+)/i,
                        /veoh.com\/veohplayer.swf\?permalinkId=([a-zA-Z0-9]+)/i,
                        /veoh.com\/watch\/([a-zA-Z0-9]+)/i],
            displayName: "veoh.com"
        },
        "dailymotion": {
            regexes:
                    [/dailymotion.com\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/([a-z0-9]+)\/video\/([a-zA-Z0-9]+)/i,
                        /dailymotion.com\/video\/([a-zA-Z0-9]+)/i,
                        /dailymotion.com\/swf\/([a-zA-Z0-9]+)/i,
                        /dailymotion.com\/embed\/video\/([a-zA-Z0-9]+)/i,
                        /dailymotion.com\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/video\/([a-zA-Z0-9]+)/i,
                        /dailymotion.com\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\/video\/([a-zA-Z0-9]+)/i,
                        /dailymotion.com\/([a-zA-Z0-9]+)\/video\/([a-z0-9]+)/i],
            displayName: "dailymotion.com"
        }
    };
    var sourceMap = {};
    var sourceList = [];

    if(inst.plugins.jivevideo.enabled.length == 1 && inst.plugins.jivevideo.enabled[0].getName() == "videomacro") {
        // Only one macro enabled and it's built-in video. Remove the "From Web" tab
        $j('#jive-web-tab').hide();
    } else {
        inst.plugins.jivevideo.enabled.forEach(function(videoSource) {
            // don't show the builtin video macro on this tab
            var sourceName = videoSource.getName();
            if (availableSources[sourceName] != null) {
                sourceMap[sourceName] = availableSources[sourceName];
                sourceList.push(sourceMap[sourceName].displayName);
            }
        });
        sourceList.sort();
        $j("#sourceList").text(sourceList.join(", "));
    }

    var embedElem = $j("#embed").bind("keyup change mouseup textInput", validate).get(0);
    function validate(){
        var val = embedElem.value;
        if (val == '') {
            invalid();
        }
        var result = null;
        for(var sourceName in sourceMap){
            result = getGenericVideoID(val, sourceMap[sourceName].regexes);
            if(result != null){
                break;
            }
        }
        if(result != null){
            $j("#site").val(sourceName);
            $j("#videoId").val(result);
            valid();
        }else{
            $j("#site").val("");
            $j("#videoId").val("");
            invalid();
        }
    }
}

tinyMCEPopup.onInit.add(init);
