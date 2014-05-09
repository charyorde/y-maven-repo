jive.namespace('MicroBlogging');

/**
 * Make sure we only include this file once per page load.  If we do not have this block here there are 2 cases where
 * this script could be loaded multiple times:
 * 1) When resource combined is false behavior could be different from when it's on, ideally the behavior should be the same.
 * 2)  If an ajax request is made for an ftl with javascript includes the file will be reloaded (assuming it was already
 * loaded on page load)
 *
 * At a later date we can roll this work into namespace or a new function that is similar to namespace
 * @depends template=jive.statusinput.dropdown.ddFriends
 * @depends template=jive.statusinput.dropdown.ddHistory
 * @depends template=jive.statusinput.dropdown.ddTags
 */
if(!jive.MicroBlogging.StatusInputDropDown){

jive.MicroBlogging.StatusInputDropDown = jive.StatusInput.StatusInputDropDown.extend({
    init:function(statusInputContainer, options){
      this._super(statusInputContainer, options);
      this._allowTagCreation = options.allowTagCreation == undefined ? true : options.allowTagCreation;
    },
    renderFriendsData:function(data){
        // render friends data, passing along helper functions to be called from _renderData
        var that = this;
        this._renderData(data, 'friends', jive.statusinput.dropdown.ddFriends,
                {fnHandleRender:function(){that._renderFriedsDataHelper();},
                    renderIfDataIsNull:true});
    },
    _renderFriedsDataHelper:function(){
        // set up handler for friends/history links
        var that = this;
        this._dd.find('.jive-js-history').click(function(e){
            that.emit('historyLinkClicked');
            e.stopPropagation();
        });
    },
    renderHistoryData:function(data){
        // render history data, passing along helper functions to be called from _renderData
        var that = this;
        this._renderData(data, 'history', jive.statusinput.dropdown.ddHistory,
                {fnHandleRender:function(){that._renderHistoryDataHelper();},
                    renderIfDataIsNull:true});
    },
    _renderHistoryDataHelper:function(){
        // set up handler for friends/history links
        var that = this;
        this._dd.find('.jive-js-friends').click(function(e){
            that.emit('friendsLinkClicked');
            e.stopPropagation();
        });
    },
    renderTagsData:function(data, queryVal){
        // render tag data if tag creation is allowed
        // else render tag data if queryVal is empty or data is not null
        // otherwise hide drop down
        var shouldCreateTag = true;
        if(data) {
            $j.each(data.tagSearchResult, function(index, tag) {
                if(tag.name === queryVal) {
                    shouldCreateTag = false;
                }
            });
        }
        if(this._allowTagCreation || queryVal == null || data != null && data.tagSearchResult.length > 0){
            this._renderData(this._normalizeTagsData(data), 'tags', jive.statusinput.dropdown.ddTags,
                    {renderIfDataIsNull:true, selectionPrefix:'#',
                        extraTemplateData:{currentTagText:queryVal, allowTagCreation:this._allowTagCreation, shouldCreateTag: shouldCreateTag}});
        } else {
            this.hide();
        }
    },
    _normalizeTagsData:function(data){
        // normalize data returned from tags service
        var normalizedData = {mentionCollection:""};
        if(data != null && data.tagSearchResult){
            for(var i = 0; i < data.tagSearchResult.length; i++){
                var datum = data.tagSearchResult[i];
                if(datum.found){
                    if(normalizedData.mentionCollection == ""){
                        normalizedData.mentionCollection = {};
                        normalizedData.mentionCollection.entries = new Array();
                    }
                    normalizedData.mentionCollection.entries.push({html:'<a  class="jive-js-status-input-selectable" '
                            + 'href="' + _jive_base_url + '/tags#/?tags=' + encodeURIComponent(datum.name) + '"><span class="jive-icon-med jive-icon-tag">'
                            + '</span>' + jive.util.escapeHTML(datum.name) + '</a>', id:datum.name});
                }
            }
        }
        return normalizedData;
    },
    _makeSelection:function(elem, data, selectionPrefix){
        // user has clicked on an item in the drop down and made his selection
        if(elem.hasClass('jive-js-status-input-create')){
            // handle create tag case
            var id = elem.attr('data-id');
            // add a data attribute for serverside to parse creation of new tags
            var anchorAttrs = {newtag:1};
            this.emit('interactionFinished', {index:-1, value:'<span class="jive-icon-med jive-icon-tag"></span>' + id, href:_jive_base_url + '/tags#/?tags=' + id, html:elem.html()}, null, anchorAttrs);
        } else {
            this._super(elem, data, selectionPrefix);
        }
    }
});

}
