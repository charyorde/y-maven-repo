/*jslint browser:true */
/*extern jive $j */

jive.namespace('blog');

jive.blog.TagSortApp = function() {
    // Given an link with an href like '#/?sort=foo' returns the value of the
    // 'sort' parameter.  In this example that value is 'foo'.
    function sortValue(link) {
        var params = $j(link).attr('href').split('?').last().split('&');
        return params.filter(function(p) {
            return p.match(/^sort=/);
        }).first().split('=').last();
    }

    $j(document).ready(function() {
        $j('.jive-tags-sort-link a').click(function() {
            $j('#jivetagform').find('[name=sort]').val(sortValue(this)).end().submit();
            return false;
        });
    });
};
