/**
 * @depends template=jive.soy.email_notification.*
 * @depends path=/resources/scripts/apps/email_notification/model/source.js
 *
 * @param contentId
 */
jive.namespace('EmailNotification');

jive.EmailNotification.Main = function(contentId, contentType, isUser) {
    var model = new jive.EmailNotification.Source(),
        map = {
            watch:   {
                newId: 'jive-link-thread-unwatch',
                save:  model.watch.bind(model),
                view:  jive.soy.email_notification.stop
            },
            
            unwatch: {
                newId: 'jive-link-thread-watch',
                save: model.unwatch.bind(model),
                view: jive.soy.email_notification.start
            }
        };


    $j('#jive-link-thread-watch, #jive-link-thread-unwatch').delegate('a', 'click', function(e) {
        e.preventDefault();

        var $container = $j(this).closest('#jive-link-thread-watch, #jive-link-thread-unwatch'),
            key = $container.attr('id').split('-').pop();

        map[key].save(contentId, contentType).addCallback(function() {
            $container
                .attr('id', map[key].newId)
                .html(map[key].view({ type: $container.attr('data-type') || 'common' }));
            $j(jive.soy.email_notification.message({type: key, isUser: !!isUser})).message({ style: 'success' })
        });
    });
};