/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
    $j(function() {

        function updateStatus(responseText, statusText,tableRef, formRef)  {

            console.log("Next round of testing");
             tableRef.append($j("tr", responseText));
             formRef.find("[name=start]").val(parseInt(formRef.find("[name=start]").val()) + parseInt(formRef.find("[name=numResults]").val()));
             if ($j(responseText).filter("[name=moreResultsAvailable]").val() == "false") {
                 formRef.closest(".activity-container").find(".jive-icon-link-forward-activity").hide();
            }
            return false;
        }

        function updateActivityList(responseText, statusText, listRef, formRef)  {
            listRef.append($j("li", responseText));
            formRef.find("[name=start]").val(parseInt(formRef.find("[name=start]").val()) + parseInt(formRef.find("[name=numResults]").val()));
            if ($j(responseText).filter("[name=moreResultsAvailable]").val() == "false") {
                 formRef.closest(".activity-container").find(".jive-icon-link-forward-activity").hide();
            }
            return false;
        }


        $j(".jive-icon-link-forward-activity").bind("click", function(){
            var container = $j(this).closest(".activity-container") ;
            var container_form = container.find('.status-moreactivity-form');

            var container_table = container.find(".jive-table-activity-full tbody") ;
            if (container_table.length == 0) {
                // This is from the small widget view, we're dealing wih a list
                var container_list = container.find("ul.jive-recent-activity");
                container_form.ajaxSubmit(function(responseText, statusText) {
                    updateActivityList(responseText, statusText, container_list, container_form);
                });
                return false;
            }
            else {
                container_form.ajaxSubmit(function(responseText, statusText) {
                    updateStatus(responseText,statusText, container_table, container_form );
                });
                return false;
            }
        });
    });
