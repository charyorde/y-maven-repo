/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j */

/**
 * Main for the manage UI.
 *
 * @depends path=/resources/scripts/apps/share/models/core_deferred.js lazy=true
 * @depends path=/resources/scripts/jive/model/date.js
 * @depends path=/resources/scripts/jquery/ui/ui.sortable.js
 * @depends template=jive.announcements.activeAnnouncementList
 * @depends template=jive.announcements.expiredAnnouncementList
 */
define('jive.Announcements.Manage.Main', ['jive.CoreV3.Deferred'], function(Deferred) {
return function(options){
    var core = new Deferred();

    var unexpired = [];
    var expired = [];
    var refMap = {};

    function sortKeyComparator(left, right){
        return  right.sortKey - left.sortKey;
    }

    function publishDateComparator(left, right){
        return left.publishDate.localeCompare(right.publishDate);
    }

    function processAnnouncements(announcements){
        var now = new Date().getTime();
        for(var i = 0; i < announcements.length; ++i){
            var endDateTime = jive.model.DateUtil.parseISODateTime(announcements[i].endDate);
            if(now < endDateTime){
                announcements[i].endDateTime = endDateTime;
                unexpired.push(announcements[i]);
            }else{
                expired.push(announcements[i]);
            }
            refMap[announcements[i].resources.self.ref] = announcements[i];
        }

        unexpired.sort(sortKeyComparator);
        displayUnexpired(unexpired);

        expired.sort(publishDateComparator);
        displayExpired(expired);
    }

    function displayExpired(expired){
        var now = new Date().getTime();
        var expiredList = jive.announcements.expiredAnnouncementList({
            announcements: expired,
            containerId: options.containerId,
            containerType: options.containerType,
            now: now
        });
        var $expiredList = $j(".js-expiredAnnouncements .js-announcement-list").html(expiredList);

        $expiredList.find(".js-announcement-subjectURI").click(function(){return false;});

        $expiredList.find(".js-expireLink").on("click", expireHandler);
        $expiredList.find(".js-deleteLink").on("click", deleteHandler);
    }

    function displayUnexpired(unexpired){
        var now = new Date().getTime();
        var unexpiredList = jive.announcements.activeAnnouncementList({
            announcements: unexpired,
            containerId: options.containerId,
            containerType: options.containerType,
            now: now
        });

        var $unexpiredList = $j(".js-activeAnnouncements .js-announcement-list").html(unexpiredList);
        $unexpiredList.find(".js-announcement-subjectURI").click(function(){return false;});
        makeSortable($unexpiredList);

        $unexpiredList.find(".js-expireLink").on("click", expireHandler);
        $unexpiredList.find(".js-deleteLink").on("click", deleteHandler);
    }

    var spinner = new jive.loader.LoaderView({size: 'big'});
    spinner.prependTo($j(".js-activeAnnouncements"));
    core.getObject(options.containerType, options.containerId).pipe(function(container){
        return core.runQuery(container.getAnnouncements({count: 100}));
    }).pipe(core.slurp).pipe(processAnnouncements, function(){
        console.log("getAnnouncements failed: ", arguments);
    }).always(function(){
        spinner.destroy();
        spinner.getContent().remove();
    });

    //functions for the drag-drop updates
    function reorderUpdate(){
        var toUpdate = [];
        var now = new Date();
        $j(".js-announcement-list .js-announcement").each(function(index){
            var ref = $j(this).data("ref");
            var ann = refMap[ref];
            if(ann.endDateTime && ann.endDateTime > now){
                ann.sortKey = -index;
                toUpdate.push(ann);
            }
        });

        core.updateAll(toUpdate).done(function(){
            //update the model objects with the new data
            unexpired = Array.prototype.slice.call(arguments, 0);
            unexpired.sort(sortKeyComparator);
            $j.each(unexpired, function(){
                this.endDateTime = jive.model.DateUtil.parseISODateTime(this.endDate);
                refMap[this.resources.self.ref] = this;
            });
        }).fail(function(){
            console.log("update failed: ", arguments);
        });
    }

    function scheduleUpdate(delay){
        if(delay == null){
            delay = 2000;
        }
        if(scheduleUpdate.timeoutId != null){
            clearTimeout(scheduleUpdate.timeoutId);
        }
        scheduleUpdate.timeoutId = setTimeout(reorderUpdate, delay);
    }

    function makeSortable($context){
        var list = $context.find(".js-announcements");
        list.sortable({
            update: function(evt, ui){
                scheduleUpdate();
            },
            forcePlaceholderSize: true,
            placeholder: 'j-card-placeholder',
            tolerance: 'pointer',
            items: '.js-announcement-item'
        }).disableSelection();
    }

    //Tab flipping
    $j(".js-tab-bar a").click(function(){
        var $tabs = $j(this).closest(".js-tab-bar").find(".js-tab");
        $tabs.removeClass("active");
        $tabs.each(function(){
            $j("#" + $j(this).data("for")).hide();
        });
        var $thisTab = $j(this);
        $thisTab.addClass("active");
        $j("#" + $thisTab.data("for")).show();

        return false;
    });
    $j("a.active.js-tab").click();

    function expireHandler(evt){
        var $ann = $j(evt.target).closest(".js-announcement-item").find(".js-announcement");
        var ann = refMap[$ann.data("ref")];
        var newPubDate =  jive.model.DateUtil.formatToISODateTime(new Date(new Date().getTime() - 2000)); //2 seconds in the past
        var newEndDate =  jive.model.DateUtil.formatToISODateTime(new Date(new Date().getTime() - 1000)); //1 second in the past
        ann.publishDate = newPubDate;
        ann.endDate = newEndDate;

        core.runQuery(ann.update()).done(function (announcement){
            //find the newly-expired announcement and remove it from the unexpired list
            unexpired = $j.map(unexpired, function(entry){
                if(entry.resources.self.ref == announcement.resources.self.ref){
                    return null;
                }
                return entry;
            });
            $ann.closest(".js-announcement-item").remove();

            //Add it to the expired list
            expired.push(announcement);

            expired.sort(publishDateComparator);
            displayExpired(expired);
        });
        return false;
    }

    function deleteHandler(evt){
        var $ann = $j(evt.target).closest(".js-announcement-item").find(".js-announcement");
        var ref = $ann.data("ref");
        var ann = refMap[ref];
        core.runQuery(ann.destroy()).done(function (){
            //remove the key from our local model
            delete refMap[ref];

            unexpired = $j.map(unexpired, function(entry){
                if(entry.resources.self.ref == ref){
                    return null;
                }
                return entry;
            });
            expired = $j.map(expired, function(entry){
                if(entry.resources.self.ref == ref){
                    return null;
                }
                return entry;
            });

            //remove the display element
            $ann.closest(".js-announcement-item").remove();
        });
        return false;
    }
};
});
