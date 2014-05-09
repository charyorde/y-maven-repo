
/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/* Wire handlers */
$j(function() {

    $j('.info-message').hide();


    $j('#js-apps-one-subdomain-test').click( function(){
        $j('.info-message').hide();
        testOneSubdomainUrl();
    });

    $j('#js-apps-one-subdomain-img-test').load(
            function() {
                $j('#js-apps-one-subdomain-success').fadeIn();
                $j('#js-apps-one-subdomain-error').stop().hide();
            });
    $j('#js-apps-one-subdomain-img-test').error(
            function() {
                $j('#js-apps-one-subdomain-error').fadeIn();
                $j('#js-apps-one-subdomain-success').stop().hide();
            });
    
    $j('#js-apps-multi-subdomain-test').click( function(){
        $j('.info-message').hide();
        testMultiSubdomainUrl();
    });

    $j('#js-apps-multi-subdomain-img-test').load(
            function() {
                $j('#js-apps-multi-subdomain-success').fadeIn();
                $j('#js-apps-multi-subdomain-error').stop().hide();
            });
    $j('#js-apps-multi-subdomain-img-test').error(
            function() {
                $j('#js-apps-multi-subdomain-error').fadeIn();
                $j('#js-apps-multi-subdomain-success').stop().hide();
            });

});

function testOneSubdomainUrl() {
    var path = $j('#js-jive-path').text();
    var protocol = $j('#js-jive-protocol').text();
    var subdomain = $j.trim($j('#js-onesub-name').val());
    if (subdomain.length == 0) {
        $j('#js-subdomain-empty').show();
    } else {
        var singleDomainSeparator = $j('#js-apps-subdomain-separator').text();
        var imgSrc = protocol + '://' + subdomain + singleDomainSeparator + path + 'images/blank.gif?ts=' + new Date().getTime();
        $j('#js-apps-one-subdomain-img-test').attr("src", "");
        $j('#js-apps-one-subdomain-img-test').attr("src", imgSrc); // Triggers onload and onerror events.
    }
}

function testMultiSubdomainUrl() {
    var path = $j('#js-jive-path').text();
    var protocol = $j('#js-jive-protocol').text();
    var postfix = $j.trim($j('#js-multisub').val());
    var multiDomainSeparator = $j('#js-apps-subdomain-separator').text();
    var imgSrc = protocol + '://' + String(Math.random()).substring(2) + '-' + postfix + multiDomainSeparator + path + 'images/blank.gif?ts=' + new Date().getTime();
    $j('#js-apps-multi-subdomain-img-test').attr("src", "");
    $j('#js-apps-multi-subdomain-img-test').attr("src", imgSrc); // Triggers onload and onerror events.
}