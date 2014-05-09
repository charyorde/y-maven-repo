/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*global $j tagSpanID defaultToTagEditMode  inlineTagEditUrl baseContainerTagUrl tagModerationCallback hasTags*/

/*
 * Javascript for inline tag input UI. These functions are used on the content view pages.
 */

$j(function() {
    /* Inline Tag Editing */

    var ajaxErrorHandler = new jive.Util.AjaxErrorHandler();

    /* launch editor */
    $j('.jive-edit-inline-tags-link').live('click', function() {
        $j('.jive-edit-inline-tags').slideToggle('fast');
        $j('.jive-edit-inline-tags-field').focus();
        $j('.jive-thread-post-details-tags, .jive-edit-inline-tags-edit').addClass('jive-content-footer-tags-editing');
        if ( $j('.jive-edit-inline-tags').is(':visible') ) {
            $j('.jive-thread-post-details-tags a, .jive-edit-inline-tags-link').click(function() { return false; });
        }
        return false;
    });

    /*  save tags */
    $j('.jive-edit-inline-tags-save').click(function() {
        var theNewTags = $j.trim($j('.jive-edit-inline-tags-field').val());

        if(defaultToTagEditMode) {
            $j('.jive-thread-post-details-tags, .jive-edit-inline-tags-edit').removeClass('jive-content-footer-tags-editing');
            $j('.jive-thread-post-details-tags a').unbind("click");
            $j('.jive-edit-inline-tags').show();
        }  

        $j.ajax( {
                
                    dataType: "json",
                    type: "POST",
                    url: inlineTagEditUrl,
                    data: { tags: encodeURIComponent(theNewTags) },
                    success: function(data, status, xhr){
                        ajaxErrorHandler.checkForLoginRedirect(xhr);

                        if (parseInt(data.tagCount, 10) > 0) {
                            var theNewTagsString = $j.parseJSON(data.tags).map(
                                function(tag) {
                                    tag = $j.trim(tag);
                                    return $j('<span/>').append($j('<a/>')
                                        .attr('href', baseContainerTagUrl + encodeURIComponent(tag))
                                        .text(tag)
                                    ).html();
                                }).join(', ');

                            $j('#'+tagSpanID).html(theNewTagsString);

                            $j('#jive-edit-inline-add-none').hide();
                            $j('#jive-edit-inline-tags-edit').hide();
                            $j('.jive-thread-post-details-tags, .jive-edit-inline-tags-edit').removeClass('jive-content-footer-tags-editing');

                            if(!hasTags) {
                                $j('#jive-edit-inline-tags-edit').toggleClass('jive-edit-inline-tags-edit');
                                $j('#jive-edit-inline-placeholder').toggleClass('jive-edit-inline-tags-edit');
                            }

                            hasTags = true;
                            $j('#jive-edit-inline-placeholder').hide();
                            $j('.jive-edit-inline-tags-link').unbind("click");

                        } else {

                            $j('#'+tagSpanID).html('');

                            $j('#jive-edit-inline-add-none').show();
                            $j('#jive-edit-inline-tags-edit').hide();
                            $j('.jive-thread-post-details-tags, .jive-edit-inline-tags-edit').removeClass('jive-content-footer-tags-editing');

                            if(hasTags) {
                                $j('#jive-edit-inline-tags-edit').toggleClass('jive-edit-inline-tags-edit');
                                $j('#jive-edit-inline-placeholder').toggleClass('jive-edit-inline-tags-edit');

                            }

                            hasTags = false;
                            $j('#jive-edit-inline-placeholder').hide();
                            $j('.jive-edit-inline-tags-link').unbind("click");
                            
                        }

                        if(!defaultToTagEditMode) {
                            $j('.jive-edit-inline-tags').slideToggle('fast');
                            $j('.jive-edit-inline-tags-edit').show();
                        }
                        
                        if('awaiting_moderation' == data.status || 'abuse_hidden' == data.status) {
                            if(tagModerationCallback && typeof tagModerationCallback == 'function') {
                                tagModerationCallback(data.status);
                            }
                        }

                    }, //end callback function
                    error: function(xhr, status, ex) {
                        if (xhr.status == 400) {
                            var jsonResp = $j.parseJSON(xhr.responseText);

                            if(jsonResp && jsonResp.error.code=='4001') { //invalid param
                                alert(jsonResp.error.message);
                            }
                        } else {
                            ajaxErrorHandler.handleError(xhr);
                        }
                    }
            }
        ); //end post

        return false;
        //end tag save
    });

    /* cancel edit */
    $j('.jive-edit-inline-tags-cancel').click(function() {
        cancelEdit();
        return false;
    });

    $j(window).keypress(function(e) {
        if ((e.keyCode == 27 || (e.DOM_VK_ESCAPE == 27 && e.which==0)) && $j('#jive-tag-choices').is(':hidden')) {
            $j('#jive-tags').blur();
            cancelEdit();
            return false;
            
        }
    });
    

    function cancelEdit() {
        $j('.jive-edit-inline-tags').slideToggle('fast');
        $j('.jive-edit-inline-tags-edit').show();
        $j('.jive-thread-post-details-tags, .jive-edit-inline-tags-edit').removeClass('jive-content-footer-tags-editing');
        $j('.jive-thread-post-details-tags a, .jive-edit-inline-tags-link').unbind("click");
    }
});   //end tag inline tag editing

//focus on tag editor if editing by default
$j(document).ready(function() {
    if (defaultToTagEditMode) {
        // $j('.jive-edit-inline-tags-field').focus();
        // removing this - see JIVE-2917. Also, it shouldn't have worked this way anyway.
    }
});
