// Code inspired by John Resig and John Nunemaker's Quicksilver search code. See http://ejohn.org/apps/livesearch/
// Refactored to be a pure function taking an array of strings or objects instead of depending on a particular DOM structure
// Used in the Jive Apps RTE plugin along with quicksilver.js to provide fast client-side searching

/**
 * Filter an array of strings, a la QuickSilver, various IDEs, etc. Useful for smart autocompleters, etc.
 * @param entries  the array of entries to filter
 * @param searchText  the string to filter the entries on
 * @param limit  an optional max number of results to return
 * @param entryStringFormatter  if entries is an object, this function can be used to generate a string from the object to be filtered
 */
jQuery.quickSilverFilter = function(entries, searchText, limit, entryStringFormatter) {
    var term = $j.trim(searchText.toLowerCase()), scores = [];

    if(entryStringFormatter == null) {
        entryStringFormatter = function(entry) { return entry };
    }

    if(!term) {
        return entries;
    } else {
        var results = [];

        jQuery(entries).each(function(i, entry) {
            var score = entryStringFormatter(entry).score(term);
            if (score > 0) { scores.push([score, i]); }
        });

        jQuery.each(scores.sort(function(a, b){return b[0] - a[0];}), function(){
            results.push(entries[this[1]]);
        });

        if(limit != null && results.length > limit){
            results = results.slice(0, limit);
        }

        return results;
    }
};