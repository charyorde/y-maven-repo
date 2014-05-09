var __jiveViewFavoriteDetailsInit = false;
$j(function() {
    if (__jiveViewFavoriteDetailsInit) {
        return;
    }
    $j("#show-more").live("click", function() {
        $j(this).hide();
        var query = $j(this).attr("target");
        $j(".jive-site-recent-notes-tags").load(jiveSiteRecentNotesTagsLink, query);
        return false;
    });
    __jiveViewFavoriteDetailsInit = true;
});