/*jslint browser:true */
/*extern jive $j */

//= require <jquery>
//= require <jive/namespace>

/**
 * new jive.Autosubmitter()
 *
 * Binds a live event handler to all forms with the class 'autosubmit'.
 * Whenever any of the input elements in one of those forms changes, the form
 * will submit automatically.
 **/
jive.namespace("Autosubmitter", function() {
    function submit_form() {
        $j(this).parents('form').trigger('submit');
    }

    $j(document)
    .delegate('form.autosubmit:not(.autosubmit-registered) :input:not(:checkbox)', 'change', submit_form)
    .delegate('form.autosubmit:not(.autosubmit-registered) :checkbox', 'click', submit_form);
});

$j(document).ready(function() {
    var autosubmitter = new jive.Autosubmitter();
});
