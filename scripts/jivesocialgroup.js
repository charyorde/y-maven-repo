/* this function will generate a url based on the specified name. */
function generateURL(name) {
    name = $j.trim(name);
    if ('' == name) {
        $j('#jive-socialgroup-url-blank').show();
        $j('#jive-socialgroup-url-notblank').hide();
        // hide all name options
        $j('#jive-group-name-none').show();
        $j('#jive-group-name-taken').hide();
        $j('#jive-group-name-available').hide();
        // hide all url options
        $j('#jive-group-dname-none').show();
        $j('#jive-group-dname-taken').hide();
        $j('#jive-group-dname-available').hide();
    } else {
        $j('#jive-socialgroup-url-blank').hide();
        $j('#jive-socialgroup-url-notblank').show();
        SocialGroup.generateURL(name, {
            callback:function(url) {
                // update the display name
                $j('#jive-socialgroup-displayname-input').val(url);
                $j('#jive-socialgroup-displayname-text').html(url);
            }
        }, { errorHandler:function() {
            alert(unexpectedError);
        }});
    }
}

function verifyName(name, currentname, reportSuccess) {
    //.hide()s are placed inside the conditionals to eliminate visible lag between the hides and the subsequent show.
    name = $j.trim(name);
    if ('' == name) {
        $j('#jive-group-name-taken').hide();
        $j('#jive-group-name-available').hide();
        $j('#jive-group-name-none').show();
    } else if (name.toLowerCase() == currentname.toLowerCase()) {
        $j('#jive-group-name-taken').hide();
        $j('#jive-group-name-none').hide();
        if (reportSuccess) {
            $j('#jive-group-name-available').show();
        }
    }
    else {
        SocialGroup.verifyName(name, {
            callback:function(unique) {
                if (!unique) {
                    $j('#jive-group-name-available').hide();
                    $j('#jive-group-name-taken').show();
                    $j('#jive-group-name-none').hide();
                } else if (reportSuccess) {
                    $j('#jive-group-name-taken').hide();
                    $j('#jive-group-name-available').show();
                    $j('#jive-group-name-none').hide();
                }
            }
        }, { errorHandler:function() {
            alert(unexpectedError);
        }});
    }
}

/* this function will check the availability of the name and the url, and report success or failures . */
function verifyURL(url, reportSuccess) {
    url = $j.trim(url);
    if ('' == url) {
        $j('#jive-group-dname-none').show();
        $j('#jive-group-dname-taken').hide();
        $j('#jive-group-dname-available').hide();
    } else if ('' != url) {
        SocialGroup.verifyURL(url, {
            callback:function(unique) {
              if (!unique) { // not unique
                $j('#jive-group-dname-available').hide();
                $j('#jive-group-dname-taken').show();
                  $j('#jive-group-dname-none').hide();
              } else {
                  $j('#jive-group-dname-taken').hide();
                  if (reportSuccess) {
                      $j('#jive-group-dname-available').show();
                      $j('#jive-group-dname-none').hide();
                  }
              }
            }
        }, { errorHandler:function() {
            alert(unexpectedError);
        }});
    }
}

function editURL() {
    $j('#jive-socialgroup-displayname-text').hide();
    $j('#jive-socialgroup-displayname-edit-link').hide();
    $j('#jive-socialgroup-displayname-edit').show();
}

$j(function() {
    $j('ul.jive-form-choose-grouptype :radio').click(function() {
        $j("ul.jive-form-choose-grouptype [id^=group-perm-warning-]").fadeOut('fast');
        $j("ul.jive-form-choose-grouptype :checked").siblings("[id^=group-perm-warning-]").fadeIn('fast');

        $j("ul.jive-form-choose-grouptype li").removeClass("selected");
        $j(this).parent("li").addClass("selected");
    });
    // this will handle when the user refreshes the form so everything is properly highlighted and selected in the form.
    $j('ul.jive-form-choose-grouptype :radio:checked').click();
});

function contentTypeChange(elem) {
    $j(elem).parent().toggleClass('selected', $j(elem).is(":checked"));

}

function checkRemoveExtCollab() {
    var newExtCollab = $j(".jive-socialgroup-shared").attr("checked") == "checked";
    //did have external collaboration, and now don't
    if (extCollab && extCollab != newExtCollab) {
        var socialGroupModal = $j(jive.soy.partner.removeExtCollabModal({}));
        var options = {
                destroyOnClose : true,
                centered       : true
            };
        socialGroupModal = socialGroupModal.lightbox_me(options);
        $j("#ok_remove_ext_collab").click(function(e) {
            document.forms["form-edit"].submit();
        });
        $j("#cancel_remove_ext_collab").click(function(e) {
            socialGroupModal.close();
        });
    } else {
        document.forms["form-edit"].submit();
    }
}
