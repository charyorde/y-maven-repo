/**
 * jive.UserRelationshipList.Main
 *
 * Main class for controlling interactions for managing user relationship lists (i.e. friend/connection labels).
 *
 * @depends path=/resources/scripts/apps/filters/main.js
 * @depends path=/resources/scripts/apps/shared/models/user_relationship_list_source.js
 * @depends path=/resources/scripts/apps/userrelationshiplist/views/people_connections_label_view.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 */

jive.namespace('UserRelationshipList');

jive.UserRelationshipList.Main = jive.Filters.Main.extend(function(protect, _super) {

    this.init = function(options) {
        _super.init.call(this, options);
        var main = this;
        main.labelSource = new jive.UserRelationshipListSource();
        main.peopleLabelView = new jive.UserRelationshipList.PeopleConnectionsLabelView(options.labelLists, options.bidirectionalConnections, options.i18n);

        //show label view if following view applied on render
        this.manageLabelView(this.filterGroup.applied(this.getState().filterID).getIDs());

        this.peopleLabelView.addListener('labelCreated', function(label, parentID, pattern, promise) {

            main.labelSource.save(label).addCallback(function(data) {

                //create new filterID based on pattern
                data.filterID = pattern.replace(/\\/g, "").replace(/\(\.\*\)/g, data.listID);

                //get the filter's parent
                var parentFilter = main.filterGroup.get(parentID);

                //add a new filter object based on the label to the filterGroup
                parentFilter.children.push({
                    id: data.filterID,
                    parentID: parentID,
                    description: label.name,
                    css: label.css,
                    type: 'simple',
                    nested: true,
                    listID: data.listID,
                    memberCount: 0,
                    searchable:true,
                    objectTypes:[],
                    sorts:[],
                    descriptionArgs:null,
                    exclusive:true
                });

                jive.switchboard.emit('userlabel.created', jQuery.extend({}, label, {listID: data.listID}));

                promise.emitSuccess(data);
                //main.loadPage(main.getState(), false);
            });
        });
        
        this.peopleLabelView.addListener('labelUpdated', function(label, promise) {
           main.labelSource.save(jQuery.extend(label, {id: label.listID})).addCallback(function(data) {
                jive.switchboard.emit('userlabel.updated', jQuery.extend({}, label, data));
                promise.emitSuccess(data);
                main.loadPage(main.getState(), true);
            });
        });

        this.peopleLabelView.addListener('labelRemoved', function(listID, filterID, parentFilterID, promise) {
           main.labelSource.destroy(listID).addCallback(function(data) {
               jive.switchboard.emit('userlabel.removed', { id: listID });
                promise.emitSuccess(data);
                main.loadPage(main.getState(), true);
            });
            //if label is selected and then removed, reroute to parent filter
            if (filterID == main.getState().filterID){
                main.pushState({
                    filterID: main.mergeFilters({
                        remove: filterID
                    })
                });
            }
        });

        jive.switchboard.addListener('userlabel.applied', function(label, userID) {
            main.peopleLabelView.incrementLabelCount(label.id);
        });

        jive.switchboard.addListener('userlabel.unapplied', function(label, userID) {
            main.peopleLabelView.decrementLabelCount(label.id);
            //if current filter is unapplied label, remove user from browse view
            var filterID = main.getState().filterID;
            if (filterID.length > 0 && filterID[0].indexOf('following~label[' + label.id + ']') === 0){
                main.removeGridItem({id: userID, type: 3});
            }
        });

        jive.switchboard.addListener('unfollow.user', function(obj) {
            //if current filter is "follow, remove thumb
            if (main.peopleLabelView.isActive()){
                if (obj.labelIDs){
                    //decrement any applied labels
                    obj.labelIDs.forEach(function(labelID) {
                        main.peopleLabelView.decrementLabelCount(labelID);
                    });
                }
            }
            main.loadPage(main.getState(), false);
        });
    };

    protect.loadPage = function(params, forceReload) {
        this.manageLabelView(params.filterID);
        return _super.loadPage.apply(this, arguments);
    };

    protect.manageLabelView = function(ids) {
        if (ids.some(function(id) {
            return id.indexOf("following") >= 0;
        })) {
            this.peopleLabelView.activate();
        } else {
            this.peopleLabelView.passivate();
        }
    };
});
