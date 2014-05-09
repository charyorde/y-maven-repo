/*
 * $ Content Autocomplete
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
 * @depends path=/resources/scripts/jquery/jquery.utils.js
 */

function contentAutocompleteLoader($) {

    $.fn.contentAutocomplete = function(options) {
        var defaults = {
            prefix: 'content_auto',
            loaded:function() {
            },
            contentAdded:function() {
            },
            contentTypeParam: 'contentType',
            contentIDParam: 'content',
            startingContent: {
                type: -1,
                id: -1,
                html: ''
            },
            contentTypes:[],
            containerType: -1,
            container: -1,
            minInputLength: 3,
            urls: {
                contentAutocomplete: _jive_base_url + '/content-autocomplete.jspa'
            },
            i18nKeys: {
                change: 'Change'
            }
        };

        var o = $.extend(defaults, options);

        return this.each(function() {

            var $that = $(this); // passed in ele
            var $hiddenContentType = $('<input type="hidden" name="' + o.contentTypeParam + '" value="' + o
                    .startingContent.type + '"/>');
            var $hiddenContentID = $('<input type="hidden" name="' + o.contentIDParam + '" value="' + o.startingContent
                    .id + '"/>');

            // create results and selected block
            var $results = $('<div class="jive-chooser-autocomplete j-result-list j-rc4"></div>').hide(); // create results block
            var $selected = $('<ul class="jive-chooser-list j-content-list clearfix"></ul>').hide(); // create selected block

            if (o.startingContent.html.length > 0) {
                $that.val('').hide().prop('disabled', true);
                $selected.html(o.startingContent.html);
            }

            $that.before($hiddenContentID).before($hiddenContentType); // append hidden type and id inputs before input
            $that.after($selected).after($results); // append selected and results block after input

            // variables
            var contentAutocompleteInputHasFocus = false;
            var contentAutocompleteIndex = 0;
            var contentAutocompleteEvent;

            /* -- Functions -- */
            /* Lots of utility functions here. */

            var observeContentAutocompleteQuery = function(event) {
                switch (event.keyCode) {
                    case $.keyCode.UP:
                        selectIndex(contentAutocompleteIndex - 1);
                        return false;
                    case $.keyCode.DOWN:
                        selectIndex(contentAutocompleteIndex + 1);
                        return false;
                    case $.keyCode.ENTER:
                        clearContentAutocompleteEvent();
                        $.stop(event, true, true);
                        if (contentAutocompleteIndex > 0) {
                            loadSelectedIndex();
                        }
                        return false;
                    case $.keyCode.ESCAPE:
                        clearContentAutocomplete();
                        return false;
                    case $.keyCode.LEFT:
                    case $.keyCode.RIGHT:
                    case $.keyCode.TAB:
                    case $.keyCode.HOME:
                    case $.keyCode.END:
                    case $.keyCode.PAGE_UP:
                    case $.keyCode.PAGE_DOWN:
                        return false;
                }

                clearContentAutocompleteEvent();
                contentAutocompleteEvent = setTimeout(function() {
                    executeContentAutocomplete();
                }, 400);
            };

            var onFocus = function() {
                contentAutocompleteInputHasFocus = true;
                setTimeout(function() {
                    executeContentAutocomplete();
                }, 250);
            };

            var onBlur = function() {
                return false;
                // needed to make click events working
                contentAutocompleteInputHasFocus = false;
                setTimeout(function() {
                    clearContentAutocomplete();
                }, 250);
            };

            var executeContentAutocomplete = function() {
                // Configure ajax settings to serialize array values in the old
                // way.  E.g. "tags=foo&tags=bar" instead of
                // "tags[]=foo&tags[]=bar".
                var traditional = $j.ajaxSettings.traditional;
                $j.ajaxSettings.traditional = true;

                contentAutocompleteInputHasFocus = true;
                var query = $that.val();
                if (query.length >= o.minInputLength) {
                    query = query + '*';
                    $results.load(o.urls.contentAutocomplete, {
                        query: query,
                        contentTypes: o.contentTypes,
                        containerType: o.containerType,
                        container: o.container
                    }, setupResults);
                } else if (query.length == 0) {
                    $results.load(o.urls.contentAutocomplete, {
                        contentTypes: o.contentTypes,
                        containerType: o.containerType,
                        container: o.container
                    }, setupResults);
                }
                else {
                    clearContentAutocomplete();
                }
                contentAutocompleteIndex = 0;

                // Restore previous ajax settings.
                $j.ajaxSettings.traditional = traditional;
            };

            var setupResults = function() {
                if ($results.html() != '') {
                    var top = ($that.offset().top - $that.offsetParent().offset().top) + $that.outerHeight();
                    var left = $that.offset().left - $that.offsetParent().offset().left;
                    $results.css({'top': top, 'left': left});
                    if ($that.width() > 200) {
                        $results.width($that.width());
                    }
                    $results.find('.content-autocomplete-item').mouseover(function() {
                        $(this).addClass('hover');
                    });
                    $results.find('.content-autocomplete-item').mouseout(function() {
                        $(this).removeClass('hover');
                    });
                    $results.find('.content-autocomplete-item A').click(clickSelection);

                    $results.show();
                    // set index to first result so enter works
                    selectIndex(1);
                }
            };

            var selectIndex = function(index) {
                if (index > 0) {
                    var elem = $results.find('#content-autocomplete-index_' + index).addClass("hover").get(0);
                    if (elem) {
                        $results.find('ul li.hover:not(#content-autocomplete-index_' + index + ')')
                                .removeClass('hover');
                        //elem.scrollIntoView(false);
                        contentAutocompleteIndex = index;
                    }
                }
                else {
                    $results.find('ul li.hover').removeClass('hover');
                    //$that[0].scrollIntoView(false);
                    contentAutocompleteIndex = 0;
                }
            };

            var clickSelection = function(event) {
                contentAutocompleteIndex = $(this).parent().attr('id').split('_')[1];
                loadSelectedIndex();

                event.stopPropagation();
                return false;
            };

            var loadSelectedIndex = function() {
                var elem = $results.find('#content-autocomplete-index_' + contentAutocompleteIndex)[0];
                if (elem && $(elem).children("a")[0]) {
                    var anchor = $($(elem).children("a")[0]);
                    var content = {
                        type: anchor.attr('id').split('_')[1],
                        id: anchor.attr('id').split('_')[2],
                        html: anchor.html()
                    };

                    addSelection(content);

                    // empty out results
                    $that.val('');
                    $results.html('').hide();
                }
            };

            var addSelection = function(content) {
                // set hidden values
                $hiddenContentType.val(content.type);
                $hiddenContentID.val(content.id);

                // disable and hide input
                $that.hide().prop('disabled', true);

                // show selected display
                var $wrapperSingle = $('<li class="content-autocomplete-selection clearfix content-autocomplete-selection_'
                        + content.type + '_' + content.id + '"></li>');
                $wrapperSingle.append($(content.html).clone())
                        .append('<span><em>(<a href="#" class="content-autocomplete-remove">' + o.i18nKeys.change
                        + '</a>)</em></span>');
                $selected.html($wrapperSingle);

                $selected.find('.content-autocomplete-remove').click(removeSelection);

                $selected.show();

                o.contentAdded(content);
            };

            var removeSelection = function(event) {
                // empty out selected and hide
                $selected.html('').hide();

                // enable and show input
                $that.prop('disabled', false).show();

                // reset hidden values
                $hiddenContentType.val('');
                $hiddenContentID.val('');

                event.stopPropagation();
                $that.focus();

                return false;
            };

            var clearContentAutocomplete = function() {
                if (!contentAutocompleteInputHasFocus) {
                    $results.html('').hide();
                }
            };

            var clearContentAutocompleteEvent = function() {
                if (contentAutocompleteEvent) {
                    clearTimeout(contentAutocompleteEvent);
                }
            };

            // load starting values, if exists
            if (o.startingContent.html != '') {
                addSelection(o.startingContent);
            }

            /* Bind Events */
            $that.keydown(
                    function(e) {
                        if (e.keyCode == $.ui.keyCode.ENTER) {
                            $.stop(e, true, true);
                        }
                    }).keyup(observeContentAutocompleteQuery);
            $that.blur(onBlur);
            $that.focus(onFocus);

            o.loaded();
        });

    }
}

contentAutocompleteLoader(jQuery);