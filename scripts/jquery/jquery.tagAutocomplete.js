/*
* $ Tag Autocomplete
* By: Nick Hill
* Version : 1.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function tagAutocompleteLoader($) {

    $.fn.tagAutocomplete = function(options) {
        var defaults = {
            loaded:function(){},
            tagAdded:function(){},
            tagRemoved:function(){},
            minInputLength: 2
        };

        var o = $.extend(defaults, options);

        return Array.prototype.slice.call(this.map(function() {

            var $that = $(this); // passed in ele

            $that.addClass('jive-chooser-input');

            $that.attr('autocomplete', 'off');

            // create results and selected block
            var $results = $('<div class="jive-chooser-autocomplete j-tag-result j-result-list j-rc4"></div>').hide(); // create results block

            $that.after($results); // append results block after input

            // variables
            var tagAutocompleteIndex = -1;
            var tagAutocompleteEvent;

            /* -- Cleanup -- */
            /* De-reference any DOM elements referenced in closed-over variables to prevent memory leaks. */

            $(window).unload(function() {
                $results = null;
                $that = null;
            });

            /* -- Functions -- */
            /* Lots of utility functions here. */


            var observeTagAutocompleteQuery = function(event) {
                switch(event.keyCode) {
                    case $.ui.keyCode.UP:
                        selectIndex(tagAutocompleteIndex - 1);
                        //todo: events aren't stopping, up moves cursor to start or input box
                        return false;
                    case $.ui.keyCode.DOWN:
                        selectIndex(tagAutocompleteIndex + 1);
                        return false;
                    case $.ui.keyCode.ENTER:
                        clearTagAutocompleteEvent();
                        $.stop(event, true, true);
                        if (tagAutocompleteIndex > -1) {
                            loadSelectedIndex();
                        }
                        return false;
                    case $.ui.keyCode.ESCAPE:
                        clearTagAutocomplete();
                        return false;
                    case $.ui.keyCode.LEFT:
                    case $.ui.keyCode.RIGHT:
                    case $.ui.keyCode.TAB:
                    case $.ui.keyCode.HOME:
                    case $.ui.keyCode.END:
                    case $.ui.keyCode.PAGE_UP:
                    case $.ui.keyCode.PAGE_DOWN:
                        return false;
                }
                clearTagAutocompleteEvent();
                tagAutocompleteEvent = setTimeout(function() {executeTagAutocomplete();}, 400);
            };

            var onFocus = function() {
                setTimeout(function() {executeTagAutocomplete();}, 250);
            };

            var onBlur = function() {
                // needed to make click events working
                setTimeout(function() {clearTagAutocomplete();}, 250);
            };

            var clearTagAutocomplete = function() {
                $results.html('').hide();
                tagAutocompleteIndex = -1;

            };

            var clearTagAutocompleteEvent = function() {
                if (tagAutocompleteEvent) {
                    clearTimeout(tagAutocompleteEvent);
                }
            };

            var clickSelection = function(event) {
                tagAutocompleteIndex = parseInt($(this).parent().attr('id').split('_')[1]);
                loadSelectedIndex();

                event.stopPropagation();
                return false;
            };

            var loadSelectedIndex = function() {
                var elem = $results.find('#tag-autocomplete-index_' + tagAutocompleteIndex)[0];
                if (elem && $(elem).children("a")[0]) {
                    var anchor = $($(elem).children("a")[0]),
                    tag = anchor.text();

                    // set and empty out results
                    var queryArray = $j.trim($that.val()).split(/\s+/);
                    queryArray[queryArray.length-1] = tag;
                    $that.val(queryArray.join(' '));
                    clearTagAutocomplete();
                }
            };

            var executeTagAutocomplete = function() {
                if ($that.val().match(/ $/)) {
                    clearTagAutocomplete();
                } else {
                    var queryArray = $j.trim($that.val()).split(/\s+/);
                    var query = queryArray[queryArray.length-1];

                    if (query.length >= o.minInputLength) {
                        clearTagAutocomplete();
                        $j.getJSON(jive.rest.url("/tags/search?query=" + encodeURIComponent(query) + '*'), function(data) {
                            if (data.tagSearchResult.length > 0) {
                                var $list = $('<ul class="jive-tags-list"></ul>');
                                $j.each(data.tagSearchResult, function(i,result) {
                                    $list.append($j('<li/>', {
                                        id: 'tag-autocomplete-index_'+ i,
                                        'class': 'tag-autocomplete-item clearfix'
                                    }).append($j('<a/>', {
                                        href: '#',
                                        'class': 'font-color-normal',
                                        text: result.name
                                    })));
                                });
                                $results.append($list);
                                var top = ($that.offset().top - $that.offsetParent().offset().top) + $that.outerHeight();
                                var left = $that.offset().left - $that.offsetParent().offset().left;
                                $results.css({'top': top, 'left': left});
                                $results.width($that.width());
                                $results.find('.tag-autocomplete-item').mouseover(function() { $(this).addClass('hover'); });
                                $results.find('.tag-autocomplete-item').mouseout(function() { $(this).removeClass('hover'); });
                                $results.find('.tag-autocomplete-item A').click(clickSelection);

                                $results.show();
                            }
                        });
                    }
                    else {
                        clearTagAutocomplete();
                    }
                }
            };

            var selectIndex = function(index) {
                if (index < 0) {
                    $results.find('li.hover').removeClass('hover');
                    tagAutocompleteIndex = -1;
                }
                else {
                    var elem = $results.find('#tag-autocomplete-index_' + index).addClass("hover").get(0);
                    if (elem) {
                        $results.find('li.hover:not(#tag-autocomplete-index_' + index +')').removeClass('hover');
                        tagAutocompleteIndex = index;
                    }
                }
            };

            /* Bind Events */
            $that.keydown(function(e) { if (e.keyCode == $.ui.keyCode.ENTER) $.stop(e, true, true);}).keyup(observeTagAutocompleteQuery);
            $that.blur(onBlur);
            $that.focus(onFocus);

            o.loaded();


        }), 0);
    }
}

tagAutocompleteLoader(jQuery);
