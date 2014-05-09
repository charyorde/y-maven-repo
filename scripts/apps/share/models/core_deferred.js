/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Deferred-based async management for CoreV3.
 *
 * @depends coreapi=v3
 */
define('jive.CoreV3.Deferred', ['jquery', 'coreApiPrereqs'], function($) {
return jive.oo.Class.extend(function(protect){
    protect.init = function(options){
        options = $.extend({}, options, {
            logSuccess: false
        });
        protect.logSuccess = options.logSuccess;
    };

    function queryToDeferred(response, deferred) {
        if (response.error) {
            console.log("CoreV3 Request failed", response, this);
            deferred.reject(response, this);
        }
        else {
            if(protect.logSuccess){
                console.log("CoreV3 Request succeeded", response);
            }
            if(response.list){
                deferred.resolve(response.list, response);
            }else{
                deferred.resolve(response);
            }
        }
    }

    function connectDeferred(source, sink){
        source.then(function(){
            sink.resolve.apply(sink, arguments);
        }, function(){
            sink.reject.apply(sink, arguments);
        }, function(){
            sink.notify.apply(sink, arguments);
        });
    }

    function runQuery(query, deferred) {
        if(!deferred){
            deferred = new $.Deferred();
        }
        query.execute(function(response){
            queryToDeferred(response, deferred);
        });
        return deferred.promise();
    }

    /**
     * CoreV3 paginates everything, but announcements can't be filtered or sorted, so we have to slurp up the whole
     * result set, regardless of its size.  Slurp can be used in a promise pipeline to produce the final accumulated
     * list.
     * @param list Results from the most recent page.
     * @param response The raw response object.
     * @param priorList All the results we've seen so far.
     * @return {Array} the final result list.
     */
    function slurp(list, response, priorList){
        if(priorList == null){
            priorList = [];
        }

        if(list.length < response.itemsPerPage){
            //we're done; return the final results.
            return priorList.concat(list);
        }else{
            //recursive step to query for another page of results.
            return runQuery(response.getNextPage()).pipe(function(newList, response){
                return slurp(newList, response, priorList.concat(list));
            });
        }
    }

    var TYPE_MAP = {
        3: 'people',
        37: 'places',
        600: 'places',
        700: 'places',
        14: 'places'
    };

    /**
     * Given the type and ID from an entity descriptor, get the object via CoreV3.
     *
     * @param objectType The object type.
     * @param objectId The object ID (not the browse ID, but the actual JiveObject id).
     * @return {*}
     */
    this.getObject = function(objectType, objectId){
        var entityCategory = TYPE_MAP[objectType];
        if(!entityCategory){
            entityCategory = 'contents';
        }
        var endpoint = osapi.jive.corev3[entityCategory];

        var query = endpoint.getByEntityDescriptor({
            entityDescriptor: objectType + "," + objectId
        });

        return runQuery(query).pipe(function(list){
            return list[0];
        });
    };

    /**
     * Run a CoreV3 request, and return a promise that resolves with it's return value.
     *
     * @param query The OSAPI request object.
     * @param deferred Optional. A new deferred is constructed if none is provided.
     */
    this.runQuery = runQuery;

    this.slurp = slurp;

    /**
     * Batch update several entities.
     *
     * @param entities The entities to update.
     * @return {promise} A promise that represents the result of the request.  Done handlers will recieve all the result objects.
     */
    this.updateAll = function updateAll(entities){
        var that = this;
        var requests = [];
        $.each(entities, function(){
            requests.push(this.update());
        });

        //TODO: batch this
        var reqDefs = [];
        $.each(requests, function(){
            reqDefs.push(that.runQuery(this));
        });

        return $.when.apply($, reqDefs);
    };
});
});
