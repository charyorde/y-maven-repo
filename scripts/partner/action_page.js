(function($) {
    
    var baseAPI = jive.app.url({ path: '/api/core/v3'} );
    var arrowOffset = 86, defaultTop, recommendation;
    
    
    function positionWelcome() {
        var actionLinkTop = $('#jive-nav-link-actions').offset().top;
        $('.j-partner-welcome').css('top', actionLinkTop - defaultTop - arrowOffset);
    }
    
    
    
    jive.namespace('partner').actionPage = {
        
        init: function() {
            defaultTop = $('.j-partner-welcome').offset().top;
            recommendation = jive.RecommendationApp.RecommendationModel();
        },
    
        loadGroups: function() {
            if (!$('.j-partner-welcome').length) {
                // not a partner
                return;
            }

            positionWelcome();
            
            // hide until data loaded, if no groups are loaded show the welcome
            $('.j-partner-welcome, .j-stream-container, .j-partner-groups, .j-partner-trending-users').hide();
            
            
            // load the groups
            $.getJSON(baseAPI + '/places?filter=type(group)').then(function(result) {
                var groupHtml = result.list.map(function(group) {
                    return jive.soy.partner.groupWidgetItem({ group: group });
                }).join('\n');
                
                $('.j-group-list').html(groupHtml);
                
                // if there were groups, show the stream, otherwise show the welcome
                if (groupHtml) {
                    $('.j-partner-groups').fadeIn('fast');
                    $('.j-stream-container').fadeIn('fast');
                } else {
                    $('.j-partner-welcome').fadeIn('fast');
                }
                
            }, function() {
                $('.j-stream-container').show();
            });
            
            
            // TODO remove timeout once the session issues are all fixed
            setTimeout(function() {
            
                // load the trending users
                recommendation.getTrendingUsers(12).addCallback(function(result) {
                    try {
                        var userHtml = result.recommendations.map(function(user) {
                            return jive.soy.partner.userWidgetItem({ user: user });
                        }).join('\n');
                    } catch(e) {
                        userHtml = '';
                    }
                    
                    $('.j-rending-user-list').html(userHtml);
    
                    if (userHtml) {
                        $('.j-partner-trending-users').fadeIn('fast');
                    }
                });


            }, 100);
        }
    };
})(jQuery);