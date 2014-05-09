/**
 * jive.DiscussionApp.Discussion
 *
 * Model class that represents a disuccion's data and domain logic.  Instance of
 * this class should be used in conjunction with an instance of
 * jive.DiscussionApp.DiscussionSource to act as an interface to server-side data.
 *
 * Initialize an instance of Discussion by passing on object of attributes and
 * values to the constructor.  Attributes given will be accessible as public
 * attributes on the Discussion instance.
 */

/*extern jive $j $Class */

jive.namespace('DiscussionApp');

jive.DiscussionApp.Discussion = jive.CommentApp.Comment.extend({
    // util function to just obtain an objects fields and not functions
    getFieldProps:function(){
        var props = {};
        for(var key in this){
            if(!$j.isFunction(this[key])){
                props[key] = this[key];
            }
        }
        return props;
    }
});