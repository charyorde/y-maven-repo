/**
 * @namespace
 * @name jive.StreamEntryApp
 */
jive.namespace('StreamEntryApp');

/**
 */
jive.StreamEntryApp.Main = jive.oo.Class.extend(function(protect) {

    protect.init = function(options) {
        var main = this;
        this.streamEntryID = options.streamEntryID;

        var ID = this.streamEntryID;
        var ENDPOINT = jive.rest.url("streamentry" );

        $j(document).ready( function() {
            $j("#jive-link-delete").click( function() {
                var confirmed = confirm("Are you sure you want to delete this post?");
                if ( confirmed ) {
                    $j.ajax({
                        type: "DELETE",
                        url: ENDPOINT + "/" + ID,
                        success: function() {
                            window.location = "/";
                        },
                        error: function() {
                            alert("Error");
                        }
                    });
                }
            });
        });
    };

    this.render = function() {
        var ID = this.streamEntryID;
        var ENDPOINT = jive.rest.url("streamentry" );
        $j.ajax( {
            url: ENDPOINT + "/" + ID,
            contentType: "application/json",
            dataType: "json",
            type: 'GET',
            success: function( data ) {
                var target = $j("#stream-entry-detail");
                var streamEntryBlock = $j(jive.streamentry.render( data ));
                target.html( streamEntryBlock );
                document.title = data.activity.content.plainText;
            },
            error: function( xhr ) {
                alert("Not found: " + ID );
            }
        } );
    };

});
