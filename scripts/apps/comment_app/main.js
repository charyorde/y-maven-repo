/*jslint laxbreak:true undef:true browser:true */
/*global jive $j kjs jiveToggleTab window confirm */

jive.namespace('CommentApp');

/**
 * JavaScript code to handle comments an various content types.
 *
 * This is the main entry point of the CommentApp.  This class acts as a
 * controller.  It instantiates a model layer in the form of
 * jive.CommentApp.CommentSource and a view layer as
 * jive.CommentApp.CommentListView.
 *
 * As a controller, jive.CommentApp.Main registers event listeners on the view
 * layer via the jive.conc.observable mixin.  It coordinates UI <-> server
 * interactions when any events occur.
 *
 * This class has no public methods.
 *
 * @class
 * @param   {Object}    options
 * @config  {string}    [defaultSort=datedesc]  default sort criteria for comments
 * @config  {Boolean}   [paginate=false]    if set to `true` a jive.Pager.Main instance will be created to handle paginating comments
 * @config  {number}    [pageSize=25]   number of comments to display per page if pagination is enabled
 * @config  {number}    resourceType    type of resource that this service is nested under - types are jive globals
 * @config  {number}    resourceID      ID of the specific resource that this service is nested under
 * @config  {string}    listAction      URL to fetch HTML-rendered comment list from
 * @config  {string}    location        value of 'location' parameter in calls to listAction
 * @config  {string}    commentMode     one of 'comments', 'backchannel', or 'inline'
 * @config  {boolean}   [isPrintPreview=false] flag indicating whether comments are rendered in print preview mode
 * @config  {Object}    contentObject   specifies details about the resource that comments are attached to
 * @config  {number}    [contentObject.document]    if contentObject is a document, specifies the ID of that document
 * @config  {number}    [contentObject.version]     if contentObject is a document, specifies the version number of that document
 * @config  {number}    [contentObject.object]      if contentObject is not a document, specifies the ID of that object
 * @config  {number}    [contentObject.contentObjectType]   if contentObject is not a document, specifies the type of that object
 * @config  {Object}    i18n    translated strings
 * @config  {string}    i18n.confirmDeleteComment
 * @config  {string}    i18n.postSuccessText
 * @config  {string}    i18n.postUserWroteLabel
 * @config  {string}    i18n.postGuestWroteLabel
 * @config  {string}    i18n.cmntEditingTitle
 * @config  {string}    i18n.globalAjaxError
 * @config  {string}    i18n.replyToTitle
 * @config  {string}    i18n.formSubmitPleaseWait
 * @config  {string}    i18n.globalLoginRequired
 * @config  {string}    i18n.loading    text for loading spinner
 */
jive.CommentApp.Main = jive.Paginated.extend(function(protect) {
    this.init = function (options) {
        var main = this;

        this.commentMode = options.commentMode;
        this.defaultSort = options.sort || 'datedesc';
        this.paginate    = options.paginate || false;
        this.pageSize    = options.pageSize || 25;
        this.i18n        = options.i18n;

        // Set containerID differently depending on the given value of
        // 'commentMode'.
        switch (this.commentMode) {
        case 'inline':
            this.containerID = 'jive-inlinecomments';
            break;
        case 'backchannel':
            this.containerID = 'jive-authordiscussion';
            break;
        default:
            this.containerID = 'jive-comments';
            break;
        }

        this.commentSource = new jive.CommentApp.CommentSource($j.extend({ location: this.containerID }, options));

        this.commentListView = new jive.CommentApp.CommentListView(this.containerID, options);

        this.commentListView
        .addListener('sortChange', function(sort) {
            main.defaultSort = sort;
            main.update({ sort: sort });
        })

        .addListener('saveComment', function(formValues, promise) {
            var comment = new jive.CommentApp.Comment(formValues),
                listView = this;

            main.commentSource.save(comment).addCallback(function(comment) {
                var newHash = "comment-" + comment.id;
                var newLocation = window.location.href.split('#')[0] + '#' + newHash;

                promise.emitSuccess();

                if (comment.moderated) {
                    main.loadComments(null, function() {
                        listView.displaySuccess(main.i18n.postSuccessText);
                    });
                } else if (window.location.href != newLocation) {
                    // Reload comments switching to the page that contains the new
                    // comment if necessary.
                    var params = {};
                    params[newHash] = "";
                    main.locationState.setState(params, "saved comment " + comment.id);
                } else {
                    // Invoke update() explicitly to refresh comments.
                    main.update();
                }
            }).addErrback(function(error, status) {
                promise.emitError(error, status);
            });
        })

        // preview functionality has been removed from the RTE, uncomment this and other lines to re-enable
        //.addListener('previewComment', function(formValues, commentView) {
        //    var comment = new jive.CommentApp.Comment(formValues),
        //        listView = this;
        //    listView.setPreviewButtonText(main.i18n.previewingCommentButton);
        //    main.commentSource.getPreview(comment).addCallback(function(html) {
        //        commentView.displayPreview(html);
        //        listView.setPreviewButtonText(main.i18n.previewCommentButton);
        //    });
        //})

        .addListener('deleteComment', function(commentView, commentID) {
            var confirmDelete = confirm(main.i18n.confirmDeleteComment)
              , comment = new jive.CommentApp.Comment({ id: commentID });

            if (confirmDelete) {
                // highlight and fade before doing ajax call, feels snappier
                commentView.remove();  // Remove comment from the DOM.
                main.commentSource.destroy(comment.id).addCallback(function() {  // Remove comment from the server.
                    main.update({ comment: [] });  // Refresh comments.
                });
            }

        });

        $j(document).ready(function() {
            var hash;

            if (main.paginate) {
                main.pager = main.newPager();
            }

            // Avoid double-load in the case where this instance is paginated
            // and there is a hash in the location.  jive.Paginated fires a
            // load event immediately if there is a hash in the window
            // location.
            if (!main.paginate || Object.keys(jive.locationState.getEphemeralState()).length < 1) {
                main.update();
            }

            // Start loading RTE for best performance.
            define(['jive.rte'], $j.noop);
        });
    };


    /* ** public interface ** */

    this.closeForms = function() {
        this.commentListView.closeForm();
    };

    this.renderForm = function(formView, target, options) {
        this.commentListView.renderForm(formView, target, null, options);
    };

    this.addCommentListViewListener = function(event, listener) {
        this.commentListView.addListener(event, listener);
    };

    this.refresh = function() {
        this.update();
    };


    /* ** protected interface ** */

    /**
     * newPager()
     *
     * Instantiates a pager for displaying comments in groups.
     */
    protect.newPager = function() {
        var undef;  // Intentionally left undefined.
        var linkView = {
            replaceWith: function() {}
        };
        jive.conc.observable(linkView);
        var view = this;

        this.initPagination({
            numResults: this.pageSize,
            sort: this.defaultSort
        }, {
            // Customize locationState to use the location hash only.
            locationState: new jive.LocationState({ supportPushState: false }),

            // Overrides paginator's default pagination link handling.
            viewClass: function() {
                return linkView;
            },

            // The actual selector does not matter.  We just need to make sure
            // that it maps to at least one DOM element.
            paginationSelector: 'body',

            // Transform the hash value #comment-id into the key-value pair { comment: id }
            paramFilter: function(params) {
                var filtered = {};

                Object.keys(params).forEach(function(k) {
                    var matches = k.match(/^comment-(.*)$/);
                    if (matches) {
                        filtered.comment = matches[1];
                        filtered[k] = undef;
                    } else {
                        filtered[k] = params[k];
                    }
                });

                return filtered;
            }
        });

        $j('#'+ this.containerID).delegate('.js-pagination a[data-page]', 'click', function(event) {
            var page = parseInt($j(this).attr('data-page'), 10);
            linkView.emit('page', page);
            view.commentListView.scrollTo();
            event.preventDefault();
        });

        return this;
    };

    protect.loadPage = function(params) {
        var promise = new jive.conc.Promise();

        this.loadComments(params, function() {
            promise.emitSuccess();
        });

        return promise;
    };

    /**
     * update(params)
     *
     * Loads comments either directly or by refreshing the pager if pagination is enabled.
     */
    protect.update = function(params) {
        if (this.paginate && params) {
            this.pager.pushState(params);
        } else {
            this.loadComments(this.pager ? this.pager.getState() : params);
        }
    };

    /**
     * loadComments(params, callback)
     *
     * Loads rendered comments for the given resource from the server then
     * displays and initializes them.
     */
    protect.loadComments = function(params, callback) {
        var self = this;
        // If no sort criteria is given then fall back to the default value.
        params = params || {};
        params.sort = params.sort || this.defaultSort;

        // Display a loading spinner if pagination is not enabled.  The pager
        // will handle displaying the spinner if it is enabled.
        if (!this.paginate) {
            this.commentListView.beforeListLoad();
        }

        this.commentListView.showSpinner({context: $j('#' + this.containerID + ' .jive-comment-container'), size: 'big'});

        this.commentSource.getAllAsHTML(params).addCallback(function(html) {
            self.commentListView.setContent(html);
            if ($j.isFunction(callback)) {
                callback(html, 'success');
            }
        }).always(function() {
            self.commentListView.hideSpinner();
        });
    };
});
