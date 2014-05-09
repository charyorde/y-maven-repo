
/* bookmark Mgr holds the cache for all people bookmarking a particular piece of data.
    Basic cache in -> cache out stuff */
function bookmarkMgr() {
	
	var cache = new jive.ext.y.HashTable();
	
	this.addUser = function(obj){
		cache.put(obj.userId, obj);
	}
			
	this.getUser = function(userId) {
		return cache.get(userId);
	}
	
}

var bookmarkInfo = new bookmarkMgr();


$j(function() {
    var $mainContainer = $j("#jive-bookmark-list");
    var $mainForm = $j("#view-favorite-activity-form");

    /* handle select box change */
    /* update the class on the container, set page value to first page, load in html for the correct page */
	$j("#jive-view-picker li a").click(function() {
        $j(this).closest('nav').find('li.active').removeClass('active')
        $j(this).closest('li').addClass('active');

        var view = $j(this).closest('li').attr('data-value');
        $j('#js-view').val(view);
        $j("#jive-bookmark-list").html("");
        
        $mainForm.ajaxSubmit({
            cache:false,
            success: function(result) {
                    $mainContainer.html(result);
            }
        })
        
    })



});