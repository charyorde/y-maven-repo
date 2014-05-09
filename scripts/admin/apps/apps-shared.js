/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
function radioCheck() {
    $j('input[type="radio"]').each(
        function() {
            if($j(this).is(":checked")) {
                $j(this).closest('li').addClass('checked').find('.test-row').fadeIn(300);
            } else {
                $j(this).closest('li').removeClass('checked').find('.test-row').fadeOut(300)
                // below is sample only
                .find('.info-message').hide();
            }
        }
    );
}
$j(function() {
    radioCheck();
    $j('input[type="radio"]').change( 
        radioCheck
    );
    /*BELOW IS FOR SAMPLE ONLY*/
    $j('.info-message').hide();
//    $j('[name="test"]').click( function(){
//        $j(this).siblings(".info-message").fadeIn();
//    });
//    $j('[type="submit"]').click( function(e){
//        $j(this).siblings(".info-message").fadeIn();
//        e.preventDefault();
//    });
});