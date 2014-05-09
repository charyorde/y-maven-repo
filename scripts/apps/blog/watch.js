/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j Watches Jive */

jive.namespace('blog');

jive.blog.Watch = function(blogID, postID, i18n) {
    function startWatch(prefix, serverMethod, message) {
        var id = blogID;
        if(prefix == 'blogPost' && postID) {
            id = postID;
        }
        Watches[serverMethod](id, {
            callback:function() {
                $j('#' + prefix + '-link-startWatch').hide();
                $j('#' + prefix + '-link-stopWatch').show();
                Jive.AlertMessage('blog.watch.notify', {
                        beforeStart:function() {
                           $j('[id="blog.watch.notify"]').html(
                                    $j('<div/>').append(
                                        $j('<span/>').addClass('jive-icon-med jive-icon-info')
                                    ).append(
                                        document.createTextNode(message)
                                    )
                            );
                        },
                        afterFinish:function() {
                            $j('[id="blog.watch.notify"]').html('');
                        }
                });
            },
            errorHandler:function(msg, e) {
               alert(i18n.watchError);
            }
        });
        return false;
    }

    function stopWatch(prefix, serverMethod, message) {
        var id = blogID;
        if(prefix == 'blogPost' && postID) {
            id = postID;
        }
        Watches[serverMethod](id, {
             callback:function() {
                 $j('#' + prefix + '-link-startWatch').show();
                 $j('#' + prefix + '-link-stopWatch').hide();
                 Jive.AlertMessage('blog.watch.notify', {
                        beforeStart:function() {                            
                           $j('[id="blog.watch.notify"]').html(
                                    $j('<div/>').append(
                                        $j('<span/>').addClass('jive-icon-med jive-icon-info')
                                    ).append(
                                        document.createTextNode(message)
                                    )
                            );
                        },
                        afterFinish:function() {
                            $j('[id="blog.watch.notify"]').html('');
                        }
                 });
             },
             errorHandler:function(msg, e) {
                alert(i18n.watchError);
             }
        });
        return false;
    }

    $j(document).ready(function() {
        $j('#blog-link-startWatch').click(startWatch.partial('blog', 'watchBlog', i18n.startBlogWatch));
        $j('#blog-link-stopWatch').click(stopWatch.partial('blog', 'removeBlogWatch', i18n.stopBlogWatch));

        $j('#blogPost-link-startWatch').click(startWatch.partial('blogPost', 'watchBlogPost', i18n.startPostWatch));
        $j('#blogPost-link-stopWatch').click(stopWatch.partial('blogPost', 'removeBlogPostWatch', i18n.stopPostWatch));
    });
};
