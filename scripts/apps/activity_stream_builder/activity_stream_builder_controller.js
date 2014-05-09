/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 * Controller for EAE Activity Stream Edit View
 *
 * @class
 *
 * @depends template=jive.eae.activitystream.builder.main
 * @depends template=jive.eae.activitystream.builder.headerCss
 * @depends path=/resources/scripts/apps/activity_stream_builder/views/search_view.js
 * @depends path=/resources/scripts/apps/activity_stream_builder/views/search_results_view.js
 * @depends path=/resources/scripts/apps/activity_stream_builder/views/stream_associations_view.js
 * @depends path=/resources/scripts/apps/activity_stream_builder/models/builder_services.js
 * @depends path=/resources/scripts/apps/activity_stream_builder/models/search_services.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 */
define('jive.ActivityStream.BuilderController', [
    'jquery'
], function($) {
    return jive.oo.Class.extend(function(protect) {

        // Mix in observable to make this class an event emitter.
        jive.conc.observable(this);

        this.init = function (options) {
            var streamEditController = this;
            streamEditController.editing = false;
            streamEditController.searchServices = new jive.ActivityStream.SearchServices();
            streamEditController.builderServices = new jive.ActivityStream.BuilderServices();
        };

        this.loadStream = function(streamID, promise) {
            var streamEditController = this;
            if (!streamEditController.editing) {
                streamEditController.builderServices.getInitialViewData({
                    selectedStreamID: streamID
                }).addCallback(function(data) {
                    streamEditController.bidirectional = data.bidirectional;
                    streamEditController.currentStreamID = data.selectedStream.configuration.id;

                    streamEditController.sortSpecifiedItems(data.selectedStream);
                    var initialSearchPageAndType = 'suggested';
                    if (!data.initialResultSet.people.length && !data.initialResultSet.places.length) {
                        initialSearchPageAndType = 'places';
                    }
                    streamEditController.searchView = new jive.ActivityStream.BuilderSearchView({
                        searchPage: initialSearchPageAndType
                    });
                    streamEditController.searchResultsView = new jive.ActivityStream.BuilderSearchResultsView({
                        searchType: initialSearchPageAndType,
                        selectedStream: data.selectedStream,
                        approvalsEnabled: data.approvalsEnabled,
                        bidirectional: data.bidirectional});
                    streamEditController.streamAssocView = new jive.ActivityStream.BuilderStreamAssociationsView({
                        selectedStream: data.selectedStream,
                        bidirectional: data.bidirectional});

                    // putting some basic view-related code here to avoid having a separate main view class that's
                    // overly simple and mainly only acts as a pass-through
                    var $mainView = streamEditController.generateMainViewTemplate(data);
                    streamEditController.editing = true;
                    if (!$('#j-streambuilder-css-link').length) {
                        $('head').append(jive.eae.activitystream.builder.headerCss());
                    }
                    $('#j-dynamic-pane').html($mainView);

                    streamEditController.searchView.postRender();
                    streamEditController.searchResultsView.postRender();
                    streamEditController.streamAssocView.postRender();

                    streamEditController.searchView.addListener('search', function(options, promise) {
                        if (streamEditController.currentSearchPromise) {
                            streamEditController.currentSearchPromise.cancel();
                            delete streamEditController.currentSearchPromise;
                        }
                        streamEditController.currentSearchPromise = promise;
                        streamEditController.currentSearchPromise.addCallback(function(data, options) {
                            streamEditController.searchResultsView.updateResults(data, options);
                            streamEditController.streamAssocView.expandToFill();
                        });
                        streamEditController.searchServices.search(options, streamEditController.currentSearchPromise);
                    });

                    streamEditController.searchResultsView.addListener('getItemAssociations', function(objectType, objectID, promise) {
                        streamEditController.builderServices.getActivityStreams(objectType, objectID).addCallback(function(streams) {
                            promise.emitSuccess(streams);
                        });
                    }).addListener('setItemAssociations', function(streamID, objectDescriptors, isAssociated, itemStreamCounts, promise) {
                        if (!streamID) {
                            streamID = streamEditController.currentStreamID;
                        }
                        streamEditController.builderServices.setItemAssociations(objectDescriptors, streamID, isAssociated, itemStreamCounts).addCallback(function(modifiedViewBean) {
                            promise.emitSuccess(modifiedViewBean);
                        });
                    }).addListener('removeAllAssociations', function(objectType, objectID, appliedLabelIDs, promise) {
                            streamEditController.builderServices.removeAllAssociations(objectType, objectID).addCallback(function() {
                            promise.emitSuccess();
                            if (objectType == 3 && objectID != window._jive_current_user.ID) {
                                setTimeout(function() {
                                    jive.switchboard.emit('unfollow.user', jQuery.extend({}, {id: objectID, labelIDs: appliedLabelIDs}));
                                }, 200);
                            }
                        }).addErrback(function(error, status) {
                            promise.emitError(error, status);
                        });
                    }).addListener('getPlaceBreadcrumbBean', function(objectType, objectID, promise) {
                        streamEditController.searchServices.getBreadcrumbBean(objectType, objectID, promise);
                    }).addListener('getFollowersData', function(params, promise) {
                        streamEditController.searchServices.getFollowerList(params, promise);
                    });

                    streamEditController.streamAssocView.addListener('getItemAssociations', function(objectType, objectID, promise) {
                        streamEditController.builderServices.getActivityStreams(objectType, objectID).addCallback(function(streams) {
                            promise.emitSuccess(streams);
                        });
                    }).addListener('setItemAssociations', function(streamID, objectDescriptors, isAssociated, itemStreamCounts, promise) {
                        streamEditController.builderServices.setItemAssociations(objectDescriptors, streamID, isAssociated, itemStreamCounts).addCallback(function(modifiedViewBean) {
                            promise.emitSuccess(modifiedViewBean);
                            // the only way to create set item assns in the stream assn view is on a drag/drop, in which case we need to clear the selected count
                            if (isAssociated) {
                                streamEditController.searchResultsView.clearSelections();
                            }
                        });
                    }).addListener('removeAllAssociations', function(objectType, objectID, appliedLabelIDs, promise) {
                        streamEditController.builderServices.removeAllAssociations(objectType, objectID).addCallback(function() {
                            promise.emitSuccess();
                            if (objectType == 3 && objectID != window._jive_current_user.ID) {
                                setTimeout(function() {
                                    jive.switchboard.emit('unfollow.user', jQuery.extend({}, {id: objectID, labelIDs: appliedLabelIDs}));
                                }, 200);
                            }
                        }).addErrback(function(error, status) {
                                promise.emitError(error, status);
                            });
                    }).addListener('updateStreamConfig', function(configData, promise) {
                        streamEditController.builderServices.modifyConfig(configData).addCallback(function() {
                            promise.emitSuccess();
                        });
                    }).addListener('deleteStream', function(streamID, promise) {
                        streamEditController.builderServices.deleteStream(streamID, promise).addCallback(function(data) {
                            streamEditController.emit('removeStream', data);
                            promise.emitSuccess();
                        });
                    });

                    var $builderInit = $('#j-builder-init');
                    if ($builderInit.length) {
                        $builderInit.find('.js-close-splash').click(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            $('.j-builder-init').remove();
                            $('#j-builder-help-arrows').show();
                            $(document).one('click', function() {
                                $builderInit.remove();
                            });
                        });
                    }

                    if (!data.initialResultSet.people.length && !data.initialResultSet.places.length) {
                        // need to fire off request to do a full instance search of people/places, since there are no
                        // results in the initialResultsSet (suggestions)
                        streamEditController.searchView.changeSearchPage('places');
                    }
                    promise.emitSuccess(data.selectedStream);
                });
            }
            else {
                streamEditController.builderServices.getActivityStream(streamID).addCallback(function(streamViewBean) {
                    streamEditController.currentStreamID = streamID;
                    streamEditController.sortSpecifiedItems(streamViewBean);
                    streamEditController.searchResultsView.updateSelectedStream(streamViewBean);
                    streamEditController.streamAssocView.reload(streamViewBean);
                    promise.emitSuccess(streamViewBean);
                });
            }
        };

        this.sortSpecifiedItems = function(viewBean) {
            viewBean.specifiedPeople.sort(function(a,b) {
                return a.displayName > b.displayName;
            });
            viewBean.specifiedPlaces.sort(function(a,b) {
                return a.subject > b.subject;
            });
        };

        this.generateMainViewTemplate = function(data) {
            return $(jive.eae.activitystream.builder.main({viewData: data}));
        };

        this.getMainView = function() {
            return $('#stream-builder');
        };

        this.closeBuilder = function() {
            jive.switchboard.removeListener('associations.destroy');
            jive.switchboard.removeListener('associations.create');
            jive.switchboard.removeListener('follow.destroy');
            jive.switchboard.removeListener('follow.create');
            jive.switchboard.removeListener('follow.user');
            jive.switchboard.removeListener('unfollow.user');
            this.editing = false;
        };
    });
});
