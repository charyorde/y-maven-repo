/*jslint browser:true */
/*extern $j */

// using a namespace
var Comments = {
    select : function select(evt) {
        // get the node that the event was fired on
        var oCommentNode = $j(this).closest('[id^=jive-message-]');
        var sCommentId = parseInt(oCommentNode.attr('id').split('-').last(), 10);

        var bHasRelations = false;
        if (Comments.tableRelations[sCommentId]) {
            var oRelations = Comments.getRelations(sCommentId);
            bHasRelations = true;
        }

        // reset previous selected comments
        // do this even if there are no table relations
        if (Comments.sSelectedId) {
            var oSelectedRelations = Comments.getRelations(Comments.sSelectedId);
            // add all relation ids into one big array
            var collLoop = oSelectedRelations.parents.concat(oSelectedRelations.children, Comments.sSelectedId);
            // loop through the array and reset all the class names
            (collLoop).forEach(function(msgID) {
                var msg = $j('#jive-message-' + msgID);
                msg.removeClass();
                msg.addClass(msg.data('oldClassName'));
            });
        }

        if (!bHasRelations) {
            oCommentNode.removeClass().addClass('jive-messagebox-this');

            // save the selection so we can reset later
            Comments.sSelectedId = sCommentId;
            return;
        }

        // loop through parents and set class
        oRelations.parents.forEach(function(msgID) {
            $j('#jive-message-' + msgID).removeClass().addClass('jive-messagebox-parent');
        });

        // loop through children and set class
        oRelations.children.forEach(function(msgID) {
            $j('#jive-message-' + msgID).removeClass().addClass('jive-messagebox-child');
        });

        // set class of selected <li>
        oCommentNode.data('oldClassName', oCommentNode.attr('className'));
        oCommentNode.removeClass();
        oCommentNode.addClass('jive-messagebox-this');

        // assign selected id
        Comments.sSelectedId = sCommentId;
    },

    // fetch all relations
    getRelations : function getRelations(sCommentId) {
        // create blank arrays so no errors occur if nothing is returned
        var oResult = {parents : [], children : []};
        if (Comments.tableRelations[sCommentId]) {
            if (Comments.tableRelations[sCommentId].parents) {
                oResult.parents = Comments.tableRelations[sCommentId].parents;
            }

            if (Comments.tableRelations[sCommentId].children) {
                oResult.children = Comments.tableRelations[sCommentId].children;
            }
        }

        return oResult;
    },

    // initiate everything
    init : function init() {
        var oCommentContainer = $j("#jive-message-holder");
        oCommentContainer.children('div').click(Comments.select).focus(Comments.select);
    },

    // reset the selected item
    sSelectedId : null
};

// load the whole thing
$j(document).ready(Comments.init);
