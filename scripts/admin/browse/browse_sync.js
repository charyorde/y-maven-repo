/**
 * 
 * @depends template=jive.admin.browse.status
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
function poll() {
	$j.ajax({
	     url: jive.rest.url('/admin/browse/status'),
	     dataType: 'json',
	     success:function(data) { 	     	                 
		    $j('#status').html(jive.admin.browse.status(data));
		    setTimeout(poll, 2000);     		
	     }    
     });  
}

function cancel() {
	$j.ajax({
	     url: jive.rest.url('/admin/browse/cancel'),
	     type: "POST"
     });  
}    

$j(document).ready(function() {
poll();
	setTimeout(poll, 2000);
});