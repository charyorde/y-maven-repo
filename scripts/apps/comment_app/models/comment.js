/**
 * jive.CommentApp.Comment
 *
 * Model class that represents a comment's data and domain logic.  Instance of
 * this class should be used in conjunction with an instance of
 * jive.CommentApp.CommentSource to act as an interface to server-side data.
 *
 * Initialize an instance of Comment by passing on object of attributes and
 * values to the constructor.  Attributes given will be accessible as public
 * attributes on the Comment instance.
 */

/*extern jive $j $Class */

jive.namespace('CommentApp');

jive.CommentApp.Comment = $Class.extend({
    init: function(params) {
        var that = this;
        Object.keys(params).forEach(function(key) {
            that[key] = params[key];
        });
    }
});
