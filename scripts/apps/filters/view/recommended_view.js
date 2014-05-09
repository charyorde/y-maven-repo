jive.namespace('Filters');

/**
 * Handles UI for a list of link items
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/controllers/localexchange.js
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.browse.grid.jiveGenius
 * @depends template=jive.browse.content.detailContentHeader
 * @depends template=jive.browse.container.detailContainerHeader
 */
jive.Filters.RecommendedView = jive.AbstractView.extend(function(protect) {
    this.update = function(type, promise) {
        jive.localexchange.emit('view.update.start');
        var $content = $j('#j-browse-item-grid').html('');

        promise.addCallback(function(data) {
            var params = { items: data, type : type };

            if (type != 'people') {
                // content or places
                params.header = type === 'content' ? 'jive.browse.content.detailContentHeader' : 'jive.browse.container.detailContainerHeader';
            } else {
                var columns = { latestActivity: true };
                function addColumns(i) {
                    this[i].columns = columns;
                }
                
                $j.each(data.trendingContent, addColumns.bind(data.trendingContent));
                // data.recommendations may not always be present
                $j.each(data.recommendations || [], addColumns.bind(data.recommendations || []));

                params.columnDetails = columns;
                params.header = 'jive.browse.user.detailUserHeader';
            }

            $content.html(jive.browse.grid.jiveGenius(params));
            jive.localexchange.emit('view.update.stop');
        });
    };
});
