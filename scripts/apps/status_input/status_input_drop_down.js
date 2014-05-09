jive.namespace('StatusInput');

/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 *
 * @depends template=jive.statusinput.dropdown.ddSearch
 */
if(!jive.StatusInput.StatusInputDropDown){

jive.StatusInput.StatusInputDropDown = $Class.extend({
    init:function(statusInputContainer, options){
        this._$statusInputContainer = $j(statusInputContainer);
        this._i18n = options.i18n;
        this._dd = null;
        this._data = {search:null, friends:null, history:null};
        this._statusInputIdPostfix = options.statusInputIdPostfix;
    },
    _getCollectionFromData:function(data){
        return data.mentionCollection;    
    },
    _getCollectionEntriesFromData:function(data){
        return data.mentionCollection.entries;
    },
    _makeSelection:function(elem, data, selectionPrefix){
        // user has clicked on an item in the drop down and made his selection
        var selectionVal = elem.html(),
            selectionHref = elem.attr('href'),
            selectionIndex;

        // search the entries for the tag that was selected
        $j.each(data.mentionCollection.entries, function(i) {
            // compare urls to avoid false positives on entries with the same name
            var compare = $j(this.html).attr('href');
            if (compare === selectionHref) {
                selectionIndex = i;
                return false;
            }
        });

        this.emit('interactionFinished',
                $j.extend({index:selectionIndex, value:selectionVal, href:selectionHref}, this._getCollectionEntriesFromData(data)[selectionIndex]));
    },


    /**
     * Renders drop down with new data
     *
     * @param dataNew - Object containing the new data for the drop down
     * @param dataKey - Key used to store and fetch data
     * @param template - Soy template used to render data
     * @param options - various options:
     *          fnHandleRender - Callback function to handle rendering of new data
     *          renderIfDataIsNull - Boolean, flag specifying if template should be rendered if data is null
     *          fnHandleRenderNoData - Callback function to handle rendering of no data
     *          selectionPrefix - Strings, prefix of selection text
     *          extraTemplateData - Optional, Object, any extra template data 
     */
    _renderData:function(dataNew, dataKey, template, options){
        options = options || {};
        var fnHandleRender = options.fnHandleRender;
        var renderIfDataIsNull = options.renderIfDataIsNull || false;
        var fnHandleRenderNoData = options.fnHandleRenderNoData;
        var selectionPrefix = options.selectionPrefix;
        var extraTemplateData = options.extraTemplateData || {};
        
        if(typeof this._getCollectionFromData(dataNew) == 'object' || renderIfDataIsNull){
            var dataRef = this._data[dataKey] = dataNew;
            var dataRefEntries = this._getCollectionEntriesFromData(dataRef) || {};
            // call the template function to obtain the template's instantiated html
            var that = this;
            var tHTML = template.call(this, $j.extend({
                i18n: that._i18n,
                entries: dataRefEntries}, extraTemplateData));
            // remove the previously rendered data
            var currentDDs = $j('.j-js-autocomplete');
            if(currentDDs.length > 0){
                currentDDs.remove();
            }
            // append the new template html
            // insert at body to
            this._$statusInputContainer.after(tHTML);
            // reassign dd to the jquery object
            this._dd = $j('.j-js-autocomplete');
            // position the drop-down in the correct location. Note drop-down is positioned absolutely

            var selectorPosition = this._$statusInputContainer.position();
            this._dd.css('top', (selectorPosition.top + this._$statusInputContainer.parent().height()) + 'px');
            this._dd.css('left', selectorPosition.left + 'px');

            // rebind events to drop down
            this._dd.bind('keyup mouseup', function(e){
                // don't want this event to propagate to the document level
                e.stopPropagation();
            });
            this._dd.bind('keydown', function(e){
                // e.which appears to have a bug related to this event use keyCode instead
                // don't want this event to propagate to the document level
                e.stopPropagation();
                switch(e.keyCode){
                    case 27:
                        // escape key
                        that.emit('interactionFinished');
                        break;
                    case 38:
                        // up arrow
                        that.selectItem(that._getSelectItemIndex() - 1);
                        e.stopImmediatePropagation();
                        return false;
                        break;
                    case 40:
                        // down arrow
                        that.selectItem(that._getSelectItemIndex() + 1);
                        e.stopImmediatePropagation();
                        return false;
                        break;
                    case 13:
                        // Enter key
                        e.stopImmediatePropagation();
                        break;
                    case 32:
                        // Space key
                        that.selectItem(that._getSelectItemIndex());
                        that._makeSelection(that._getSelectedItem(), dataRef, selectionPrefix);
                        e.preventDefault();
                        break;
                    default:
                        break;
                }
            });

            this._dd.find('.j-autocomplete-results a').click(function(event) {
                that._makeSelection($j(this), dataRef, selectionPrefix);
                event.preventDefault();
            });

            // make a call to a function to handle data specific code
            if(fnHandleRender != null){
                fnHandleRender();
            }

            this.show();
        } else {
            this.dataRef = null;

            // make a call to a function to handle data specific code
            if(fnHandleRenderNoData != null){
                fnHandleRenderNoData();
            }else{
                this.hide();
            }
        }
    },
    renderSearchData:function(data){
        this._renderData(data, 'search', jive.statusinput.dropdown.ddSearch);
    },
    hide:function(){
        if(this._dd != null)
            this._dd.hide();
    },
    show:function(){
        if(this._dd != null)
            this._dd.slideDown('fast');
    },
    isVisible:function(){
        // drop down may be in the dom but invisible.
        var dd = $j('.j-js-autocomplete');
        return this._dd && !!dd.length && dd.is(':visible');
    },
    selectItem:function(index){
        if(this._dd == null){
            return;
        }
        //console.log('select index ' + index);
        
        var selectableElems = this._getSelectItems();

        if(index < 0 || index >= selectableElems.length){
            return;
        }
        this.deselectItem();
        this._selectItemHelper(selectableElems[index], true);
    },
    deselectItem:function(index){
        //console.log('deselect index ' + index);
        var selectableElems = this._getSelectItems();

        if(index != null && (index < 0 || index >= selectableElems.length)){
            return;
        }

        var itemToDeselect = index == null ? this._getSelectedItem() : selectableElems[index];
        // check that item to deselect is actually selected
        if(itemToDeselect.length == 0){
            return;
        }

        this._selectItemHelper(itemToDeselect);
        this._selectedIndex = -1;
    },
    _getSelectItems:function(){
        return this._dd.find('.' + jive.StatusInput.StatusInputDropDown.selectableItemClassName);
    },
    _getSelectedItem:function(){
        return this._dd.find('.' + jive.StatusInput.StatusInputDropDown.selectedItemClassName);
    },
    _getSelectItemIndex:function(item){
        item = item || this._getSelectedItem()[0];
        return this._getSelectItems().index(item);
    },
    _selectItemHelper:function(item, isSelect){
        var focusOrBlur  = isSelect ? 'focus' : 'blur',
            className    = jive.StatusInput.StatusInputDropDown.selectedItemClassName + ' j-selected';

        $j(item).toggleClass(className, isSelect)[focusOrBlur]();
    }
});

jive.StatusInput.StatusInputDropDown.selectedItemClassName = 'jive-js-status-input-selected';
jive.StatusInput.StatusInputDropDown.selectableItemClassName = 'jive-js-status-input-selectable';

// Mixes in `addListener` and `emit` methods so that other classes can
// listen to events from this one.
jive.conc.observable(jive.StatusInput.StatusInputDropDown.prototype);

jive.StatusInput.StatusInputDropDown.delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();
}
