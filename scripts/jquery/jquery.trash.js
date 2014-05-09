/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * Sometimes when DOM elements in IE are dereferenced they are not
 * actually garbage-collected until the page is unloaded.  This method
 * uses an aggressive technique to encourage IE to remove elements from
 * memory sooner.
 *
 * Use these methods instead of jQuery#remove() or jQuery#empty() in cases where a pseudo
 * memory leak is observed.
 *
 * For information on pseudo-leaks, see
 * http://outofhanwell.com/ieleak/index.php?title=Fixing_Leaks#Pseudo-Leaks
 */
(function($) {
    var $garbageBin;
    function getGarbageBin() {
        if (!$garbageBin) {
            $garbageBin = $(document.createElement('DIV'));
            $garbageBin.attr('id', 'IELeakGarbageBin').appendTo('body').hide();
        }
        return $garbageBin.get(0);
    }

    $.fn.trash = function(selector) {
        var bin = getGarbageBin();

        for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
            if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
                if ( elem.nodeType === 1 ) {
                    jQuery.cleanData( elem.getElementsByTagName("*") );
                    jQuery.cleanData( [ elem ] );
                }

                bin.appendChild(elem);
            }
        }

        bin.innerHTML = '';

        return this;
    };

    var origRemove = $.fn.remove;

    $.fn.removeAndTrash = function(selector, keepData) {
        if (keepData) {
            return origRemove.apply(this, arguments);
        }

        return this.trash(selector);
    };

    $.fn.emptyAndTrash = function() {
        for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
            while (elem.firstChild) {
                $(elem.firstChild).trash();
            }
        }

        return this;
    };
})(jQuery);
