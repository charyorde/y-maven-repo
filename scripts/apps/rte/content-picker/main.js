/*globals jive tinyMCEPopup */

//= require <jquery/jquery>
//= require <core_ext/array>
//= require <tiny_mce3/tiny_mce_popup>
//= require <utils>
//= require <jive/namespace>
//= require <jive>
//= require <userpicker>

jive.namespace('rte.ContentPicker');

//= require "controllers/content_picker_controller"
//= require "views/main_page"

jive.rte.ContentPicker.main = function() {
    var controller = new jive.rte.ContentPicker.ContentPickerController();
    var main_page  = new jive.rte.ContentPicker.MainPage(controller);
};

tinyMCEPopup.onInit.add(function(ed) {
    jive.rte.ContentPicker.main();
});
