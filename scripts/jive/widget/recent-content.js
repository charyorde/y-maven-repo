/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j */

jive.RecentContentApp = function(container, i18n) {
    $j(function() {
        var $container = $j(container);

        function updateStatus(responseText, statusText, tableRef, formRef)  {
            tableRef.append($j("tr", responseText));
            formRef.find("[name=start]").val(
                parseInt(formRef.find("[name=start]").val(), 10) +
                parseInt(formRef.find("[name=numResults]").val(), 10)
            );
            if ($j(responseText).filter("[name=moreResultsAvailable]").val() == "false") {
                $container.find(".jive-more-content").hide();
            }

            tableRef.find('tr').removeClass('jive-table-row-even', 'jive-table-row-odd');
            tableRef.find('tr:odd').each(function() {
                $j(this).addClass('jive-table-row-even');
            });
            tableRef.find('tr:even').each(function() {
                $j(this).addClass('jive-table-row-odd');
            });
            
            $container.find('.jive-widget-loading').remove();

            return false;
        }

        function updateContentListSidebar(responseText, statusText, listRef, formRef)  {
            listRef.append($j("li", responseText));
            formRef.find("[name=start]").val(
                parseInt(formRef.find("[name=start]").val(), 10) +
                parseInt(formRef.find("[name=numResults]").val(), 10)
            );
            if ($j(responseText).filter("[name=moreResultsAvailable]").val() == "false") {
                 $container.find(".jive-more-content").hide();
            }
            return false;
        }

        $container.find(".jive-more-content").live('click', function(){
            var container_form = $container.find('.status-morecontent-form');

            $container.find('.jive-table-recentcontent').append($j('<div/>', {
                'class': 'jive-widget-loading',
                html: $j('<div/>', {
                    html: $j('<strong/>', {
                        text: i18n.loading
                    })
                })
            }));
            
            var container_table = $container.find(".jive-table-recentcontent tbody") ;
            if (container_table.length === 0) {
                // This is from the small widget view, we're dealing wih a list
                var container_list = $container.find("ul.j-icon-list");
                container_form.ajaxSubmit(function(responseText, statusText) {
                    updateContentListSidebar(responseText, statusText, container_list, container_form);
                });
            }
            else {
                container_form.ajaxSubmit(function(responseText, statusText) {
                    updateStatus(responseText, statusText, container_table, container_form );
                });
            }

            return false;
        });
    });
};
