/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2009 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*
    Builds out the sub-navigation DOM and binds events to the object
    tab - the LI that is taking the submenu
    list_class - the class (optional) to append to the UL
 */
jive.NubUpdater = function( tab, tab_type, title_text, list_class ) {
    list_class = list_class || "";
    var $sub_nav = list_template.clone();
    this.tab_type = tab_type;
    $sub_nav.find("h6.jive-nub-title-text").text( title_text );
    $sub_nav.find("li.jive-nub-title").addClass( list_class );

    $sub_nav.css('width', $j('#jive-eim-nub').width() - 5+'px');

    this.update = function( clone ) {
        $sub_nav.find('ul').append( clone );
    };

    this.notify = function() {
        var count = $sub_nav.find("li.jive-nub-item").length;

        var visible = tab.find("a.jive-instance-name").hasClass('j-active');
        if (visible ) {
            $sub_nav.show();
        } else {
            $sub_nav.hide();
        }

        if ( count < 1 ) {
            $sub_nav.find(".jive-instance-menu").append("<li class='jive-nub-item'>" + hallwayi18nMap.get('eim.hallway.none.online') + "</li>");
        }

        tab.find(".jive-instance-menu-wrapper").remove();
        tab.append($sub_nav);
        tab.find(".counter").html( "" + count + "" );

        resizeMenu();
    };

};

/**
 * Convenient container for all the tabs requiring update and rendering.
 * @param idsToFilter
 * @param chatContext
 */
jive.CombinedNubUpdater = function( idsToFilter, chatContext ) {

    this.getChatMap = function( name ) {
        return chatContext.get( name )['chatMap'];
    };

    this.getNubUpdater = function( name ) {
        return chatContext.get( name )['nubUpdater'];
    };

    this.getConnectionsCount = function() {
        return chatContext.get("connections")['count'];
    };

    this.getPagescrapeCount = function() {
        return chatContext.get("pagescrape")['count'];
    };

    this.getIdsToFilter = function() {
        return idsToFilter;
    };

    this.getDetailFor = function( id ) {
        var detail = this.getChatMap('pagescrape').get( id );
        if ( !detail ) {
            detail = this.getChatMap('connections').get( id );
        }
        return detail;
    };

    this.update = function( userId, clone ) {
        if ( this.getChatMap( "pagescrape" ).get( userId ) ) {
            this.getNubUpdater( "pagescrape" ).update( clone );
        }

        if ( this.getChatMap( "connections" ).get( userId ) ) {
            this.getNubUpdater( "connections" ).update( clone.clone( true ) );
        }
    };

    this.notify = function() {
        this.getNubUpdater( "connections" ).notify();
        this.getNubUpdater( "pagescrape" ).notify();

        // run post notify function
        if ( post_notify_function ) {
            post_notify_function();
        }
    };

    var post_notify_function;
    this.setPostNotify = function( the_func ) {
        post_notify_function = the_func;
    };

};

jive.Monitor = function( callback_object ) {
    var _count = 0;
    var that = this;
    var _start_time = 0;
    var _interval;

    this.check = function() {
        var timedout = that.isTimedOut();
        var done = that.isDone();
        if ( done || timedout ) {
            clearInterval( _interval );
            callback_object.notify();
        }
    };

    this.start = function() {
        _start_time = new Date().getTime();
       _interval = setInterval( this.check, 1000 );
    };

    this.add = function() {
        _count++;
    };

    this.dec = function() {
        _count--;
    };

    this.isDone = function() {
        return _count < 1;
    };

    this.isTimedOut = function() {
        return new Date().getTime() - _start_time > 30000; // 30 seconds timeout
    };

};

jive.HallwayPresence = function( strategy ) {

    var last_combined_ts = null;
    var start_ts = new Date().getTime();

    this.start = function() {
        if ( !strategy ) {
            // can't process unless there's a registered strategy
            return;
        }

        if ( !strategy.fn_process_tabs ) {
            // can't process unless there is an external id processor
            return;
        }

        if ( strategy.fn_start_sentry ) {
            // if there is start sentry function, then run it; if evaluates to true, then proceed to do work
            strategy.fn_start_sentry( do_work, error_callback );
        } else {
            // if not start sentry, then just go ahead and do work
            do_work();
        }
    };

    function do_local_pagescrape() {
        var chatMap = new jive.ext.y.HashTable();
        var count = 0;

        $j("a[data-externalId]").each( function() {
            var presence_info = $j(this);
            var externalId = presence_info.attr("data-externalId");
            var online = presence_info.attr("data-online");

            var max_page_scrapes = strategy.fn_max_pagescrapes ? strategy.fn_max_pagescrapes() : 500;
            // maximum # of pagescrapes defaults to 500 if not defined

            if ( count <= max_page_scrapes
              && externalId
              && online == 'true'
              && !chatMap.get( externalId )
              && ( strategy.fn_externalid_sentry ? strategy.fn_externalid_sentry( externalId ) : true ) ) {
                chatMap.put( externalId, externalId );
                count++;
            }
        });

        $j("#this-page-tab").find(".counter").text( count );
    }

    function get_sorted_unique_ids( externalIds, connectionsMap, pagescrapeMap ) {
        var nameIdMap = new jive.ext.y.HashTable();
        var names = new Array();
        for( var i = 0; i <= externalIds.length; i++ ) {
            var id = externalIds[i];
            var name = connectionsMap.get( id )["name"];
            if ( !name ) {
                name = pagescrapeMap.get( id )["name"];
            }
            if ( name && !nameIdMap.get( name ) ) {
                nameIdMap.put( name, id );
                names.push( name );
            }
        }
        names.sort();
        var sortedIds = new Array();
        for ( var i = 0; i < names.length; i++ ) {
            var name = names[i];
            if ( name ) {
                var id = nameIdMap.get( name );
                if ( id ) {
                    sortedIds.push( id );
                }
            }

        }

        return sortedIds;
    }

    function do_combined() {
        var now = new Date().getTime();
        if ( now - start_ts > 3600000 ) {
            return;
        }

        last_combined_ts = new Date().getTime();
        var externalIds = new Array();

        //
        // get pagescrape map
        //
        var pagescrapeMap = new jive.ext.y.HashTable();
        var pagescrapeCount = 0;
        $j("a[data-externalId]").each( function() {
            var presence_info = $j(this);
            var externalId = presence_info.attr("data-externalId");
            var name = presence_info.text();
            var username = presence_info.attr("data-username");
            var avatarid = presence_info.attr("data-avatarId");

            var trimmedNamed = name.replace(/^\s+|\s+$/g,"");
            if ( !trimmedNamed ) {
                // in this case, try to locate an image, and get its alt, which is typically the username
                name = $j(this).find("img").attr("alt");
            }

            var max_page_scrapes = strategy.fn_max_pagescrapes ? strategy.fn_max_pagescrapes() : 500;
            // maximum # of pagescrapes defaults to 500 if not defined

            if ( pagescrapeCount <= max_page_scrapes
              && externalId
              && name
              && !pagescrapeMap.get( externalId )
              && ( strategy.fn_externalid_sentry ? strategy.fn_externalid_sentry( externalId ) : true ) ) {
                pagescrapeMap.put( externalId, { "name": name, "username": username, "avatarid": avatarid } );
                externalIds.push( externalId );
                pagescrapeCount++;
            }
        });

        //
        // get connections
        //
        var connectionsChatMap = new jive.ext.y.HashTable();
        var cacheKey = "connections_" + _jive_effective_user_id;
        var processed_local;
        if ( strategy.local_store ) {

            strategy.local_store.get(cacheKey, function(ok, cached) {
                //alert( ok + "; " + cached );
                if ( ok && cached != undefined && cached != "" ) {

                    //alert( "local" );

                    cached = cached + "";
                    var parts = cached.split( '^', 2);
                    var time = parts[0];
                    var stringified  = parts[1];
                    var lastUpdateTs = eimServiceInfo.lastConnectionUpdateTs;

                    if ( (lastUpdateTs - time) <= 0 ) {
                        // if last connection update ts is earlier than or equal to the last time the user's connections
                        // was refreshed, use the cached connections
                        try {
                            var revived = JSON.parse( stringified );
                            strategy.fn_parse_connections( revived.connection, connectionsChatMap, externalIds );
                            processed_local = true;
                        } catch(err) {
                            // error, clean cache, setup the call to server
                            strategy.local_store.set( cacheKey, undefined );
                        }
                    }
                }
            });
        }

        if ( !processed_local ) {
            //alert( "remote" );
            var connectionurl = jive.rest.url( strategy.fn_connections_url() + _jive_effective_user_id
                    + "?ts=" + ( eimServiceInfo.lastConnectionUpdateTs ? eimServiceInfo.lastConnectionUpdateTs : ( new Date().getTime() ) ) );
            $j.getJSON( connectionurl, function(connections) {
              if ( connections  ) {
                  strategy.fn_parse_connections( connections.connection, connectionsChatMap, externalIds );
                  var lastUpdateTs = eimServiceInfo.lastConnectionUpdateTs;
                  var stringified = JSON.stringify( connections );
                  stringified = lastUpdateTs + "^" + stringified;
                  if ( strategy.local_store ) {
                    //  alert( cacheKey + ": " + stringified );
                    strategy.local_store.set( cacheKey, stringified);
                  }
                  finalize_rendering( externalIds, connectionsChatMap, pagescrapeMap );
              }
            });
        } else {
            finalize_rendering( externalIds, connectionsChatMap, pagescrapeMap );
        }

    }

    function finalize_rendering( externalIds, connectionsChatMap, pagescrapeMap ) {

        var connectionsCount = externalIds.length;

        //
        // get unique ids to filter in name sort order
        //
        externalIds = get_sorted_unique_ids( externalIds, connectionsChatMap, pagescrapeMap );

        var connections_nub_updater = new jive.NubUpdater(
                $j("#connections-tab"),
                "connections",
                hallwayi18nMap.get('eim.hallway.online.yourconnections'),
                undefined );

        var page_nub_updater = new jive.NubUpdater(
                $j("#this-page-tab"),
                "page",
                hallwayi18nMap.get('eim.hallway.online.thispage'),
                "jive-instance-menu-page" );

        //
        // process external calls
        //
        var chatContext =  new jive.ext.y.HashTable();
        chatContext.put( "connections", { "chatMap" : connectionsChatMap, "count" : connectionsCount, "nubUpdater": connections_nub_updater } );
        chatContext.put( "pagescrape", { "chatMap" : pagescrapeMap, "count" : connectionsCount, "nubUpdater": page_nub_updater } );

        strategy.fn_process_tabs( externalIds, chatContext );
    }
    
    function error_callback() {
        var dismissed;
        if ( strategy.local_store ) {
            strategy.local_store.get("_dismiss_set", function(ok, cached) {
                dismissed = ok && cached == "true";
            } );
        }
        if( !dismissed ){
            var error_tab = nub_tab_template.clone();
            error_tab.find(".jive-instance-name").remove();
            error_tab.append("<div style='margin-left:15px;margin-top:11px;margin-right: 20px;'>" + hallwayi18nMap.get('eim.hallway.unavailable')
                    + " <a href='#' id='dismiss'>(" + hallwayi18nMap.get('eim.hallway.unavailable.close') + ")</a></div>");
            error_tab.show();
            $j(".jive-eim-tabs").append( error_tab );

            error_tab.find("a#dismiss").click( function() {
                $j(".jive-eim-tabs").hide();
                if ( strategy.local_store ) {
                    strategy.local_store.set("_dismiss_set", "true");
                }
            });
        }
    }

    jive.HallwayPresence.get_list_item_clone = function(name, username, avatarid) {
        var clone = list_item_template.clone( true );
        var base_url = hallwayi18nMap.get('base_url');
        if ( base_url == '/' ) {
            base_url = '';
        }
        clone.find(".presence-name").html( name );
        clone.find(".jive-avatar").attr("src", base_url + "/people/" + username + "/avatar/16.png?a=" + avatarid );
        return clone;
    };

    function do_spinner( tab ) {
        var $sub_nav = list_template.clone();
        tab.find(".jive-instance-menu-wrapper").remove();
        tab.append($sub_nav);
        var base_url = hallwayi18nMap.get('base_url');
        if ( base_url == '/' ) {
            base_url = '';
        }
        var spinner = '<img src="' + base_url + '/images/jive-icon-working-16x16.gif" />';
        $sub_nav.find(".jive-instance-menu").append("<li class='jive-nub-item'>" + spinner + "<span style='margin-top:2px'>" + hallwayi18nMap.get('eim.hallway.working') + "</span></li>");
    }

    function is_on_demand() {
        return eimServiceInfo.on_demand && eimServiceInfo.on_demand == 'true';
    }

    function is_preloading() {
        return eimServiceInfo.preloading && eimServiceInfo.preloading == 'true';
    }

    function do_work() {
        if ( strategy.local_store )  {
            strategy.local_store.set("_dismiss_set", "");
        }

        var on_demand = is_on_demand();

        // read-only online tab
        var online_tab = $j(
        "<li class='jive-nub-tab '>" +
            "<span class='jive-nub-label'><strong class='font-color-meta'>" + hallwayi18nMap.get('eim.hallway.online') + "</strong></span>" +
        "</li>'");
        online_tab.show();
        $j(".jive-eim-tabs").append( online_tab );

        // connections tab
        var initial_online_connection_count = "";
        if ( !on_demand ) {
            initial_online_connection_count = "  (<span class='counter'>" + (eimServiceInfo.connection_counts ? eimServiceInfo.connection_counts : 0) + "</span>)";
        } 
        var $connections_tab = nub_tab_template.clone(true)
             .find(".jive-instance-name")
             .html( hallwayi18nMap.get('eim.hallway.connections') + initial_online_connection_count )
             .end().show().attr("id", "connections-tab")
             .appendTo($j(".jive-eim-tabs"));
        
        // page tab
        var $this_page_tab = nub_tab_template.clone( true )
             .find(".jive-instance-name")
             .html( hallwayi18nMap.get('eim.hallway.thispage') + (on_demand ? "" : "  (<span class='counter'>0</span>)") )
             .end().show().attr("id", "this-page-tab")
             .appendTo($j(".jive-eim-tabs"));

        var toggle = function() {
            $j('#jive-eim-nub .j-active').removeClass('j-active');
            var the_list = $j(this).parent().find(".jive-instance-menu-wrapper");

            if ( the_list.is(':visible') ) {
                the_list.css({'width': $j('#jive-eim-nub').width()-5 +'px'});
                the_list.find('.jive-instance-menu-container').animate({'top': the_list.height()+'px'}, 200, function() {
                    the_list.hide();    
                });
            } else {

                var now = new Date().getTime();
                if ( now - start_ts > 3600000 ) {
                    alert('Please refresh the page to use the chatbar.');
                    return;
                }

                var parent_tab = $j(this).parent();
                parent_tab.find('a.jive-instance-name').addClass('j-active');
                $j(".jive-instance-menu-wrapper").hide();
                the_list.show();
//                alert(the_list.height());
                the_list.css({'height': the_list.height(), 'width': $j('#jive-eim-nub').width()-5 +'px', 'bottom': $j('#jive-eim-nub .jive-eim-tabs').outerHeight() + 1 + 'px'});
                the_list.find('.jive-instance-menu-container').css('top', the_list.height()+'px').animate({'top': '0px'}, 200 );

                if ( is_on_demand() || !last_combined_ts ) {
                    do_combined();
                }
                
                if ( $j.browser.msie ) {
                    // ie has problems with disappearing content; nudge using show/hide to make it work
                    the_list.find(".jive-nub-item").each( function()  {
                            var item = $j(this);
                            item.hide();
                            item.show();
                        }
                    );
                }
            }
            resizeMenu();
            return false;
        };

        /* click handler */
        $connections_tab.find("a.jive-instance-name").click(toggle);
        $this_page_tab.find("a.jive-instance-name").click(toggle);

        if ( !on_demand && is_preloading() ) {
            // if auto polling then make the first connections and pagescrapes
            setTimeout( do_combined, eimServiceInfo.initial_load_interval ?  eimServiceInfo.initial_load_interval : 2500 );
        } else if ( !is_preloading() ) {
            setTimeout( do_local_pagescrape, 3500 );
        }

        do_spinner( $connections_tab );
        do_spinner( $this_page_tab );

        if ( !on_demand ) {
            // if not on demand, then schedule auto refreshes in the future if refresh intervals are specified; else
            // do not autorefresh.
            if( eimServiceInfo.refresh_interval ) {
                setInterval( do_combined, eimServiceInfo.refresh_interval );
            }
        }

    };

};

function resizeMenu() {
    var $menu = $j('.jive-instance-menu:visible');

    var everything_height = $j("#jive-eim-nub").outerHeight() + $j('.jive-instance-menu-container:visible').outerHeight();
    var original_menu_height = getFullHeight($menu);
    if (!$menu.data('original_height'))
        $menu.data('original_height', original_menu_height);

    var diff = $j(window).height() - everything_height;
    if (diff < 0) {
        $menu.height($menu.height() + diff + 'px');
    } else {
        $menu.height(Math.min($menu.height() + diff, $menu.data('original_height')));
    }
    $menu.closest('.jive-instance-menu-wrapper').height($menu.closest('.jive-instance-menu-container').height());
}

/* Returns height of the DOM, with margins, as an INT */
function getFullHeight($ele) {
    return $ele.outerHeight() + parseInt($ele.css('margin-bottom')) + parseInt($ele.css('margin-top'));
}

$j(function() {
    resizeMenu();
    
    $j(window).resize(function() {
      resizeMenu();
    });

});
