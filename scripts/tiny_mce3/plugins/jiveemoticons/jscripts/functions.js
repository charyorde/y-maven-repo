function init() {
	tinyMCEPopup.resizeToInnerSize();
}

function insertEmoticon(file_name, title) {


	// XML encode
	title = title.replace(/&/g, '&amp;');
	title = title.replace(/\"/g, '&quot;');
	title = title.replace(/</g, '&lt;');
	title = title.replace(/>/g, '&gt;');

	var html = ' <img class="emoticon" src="' + parent.CS_RESOURCE_BASE_URL + file_name + '" data-mce-src="' + parent.CS_RESOURCE_BASE_URL + file_name + '" border="0" /> ';

	tinyMCE.execCommand('mceInsertContent', false, html);
	tinyMCEPopup.close();
}
