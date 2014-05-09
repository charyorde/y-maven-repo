/**
 * jive.CommentApp.CommentSource
 *
 * Model class that encapsulates the server interface for retrieving and
 * updating comments.
 *
 * To use create an instance of CommentSource, giving it the resourceType and
 * resourceID of the content that comments will be attached to.  Use methods of
 * the instance to look up and save comments.
 */

/*extern jive $j */
/**
 * CommentSource
 *
 * REST service for interacting with comment objects
 *
 * @depends path=/resources/scripts/apps/shared/models/nested_rest_service.js
 */

jive.namespace('CommentApp');

/**
 * Interface to the internal comment REST API.
 *
 * @class
 * @extends jive.NestedRestService
 * @param {Object} options
 * @config {number} resourceType    type of resource that this service is nested under - types are jive globals
 * @config {number} resourceID      ID of the specific resource that this service is nested under
 * @config {string} listAction      URL to fetch HTML-rendered comment list from
 * @config {string} location        value of 'location' parameter in calls to listAction
 * @config {string} commentMode     one of 'comments', 'backchannel', or 'inline'
 * @config {boolean} [isPrintPreview=false] flag indicating whether comments are rendered in print preview mode
 * @config {Object} contentObject   specifies details about the resource that comments are attached to
 * @config {number} [contentObject.document]    if contentObject is a document, specifies the ID of that document
 * @config {number} [contentObject.version]     if contentObject is a document, specifies the version number of that document
 * @config {number} [contentObject.object]      if contentObject is not a document, specifies the ID of that object
 * @config {number} [contentObject.contentObjectType]   if contentObject is not a document, specifies the type of that object
 */
jive.CommentApp.CommentSource = jive.NestedRestService.extend(function(protect, _super) {
    /**
     * Set to "comment"; configures the REST endpoints that instances of this
     * class connect to.
     *
     * @name resourceType
     * @fieldOf jive.CommentApp.CommentSource#
     * @type string
     * @protected
     */
    protect.resourceType = "comment";

    protect.init = function(options) {
        this.parentType     = options.resourceType;
        this.parentID       = options.resourceID;
        this.listAction     = options.listAction;
        this.location       = options.location;
        this.commentMode    = options.commentMode;
        this.isPrintPreview = Boolean(options.isPrintPreview);
        this.contentObject  = options.contentObject;

        _super.init.call(this, {
            parentType: this.parentType,
            parentID: this.parentID
        });
    };

    var delay = 1;

    /**
     * Loads rendered comments for the given resource from the server.  Results
     * from the server are emitted by the promise that is returned.
     *
     * @methodOf jive.CommentApp.CommentSource#
     * @param {Object}  [options]
     * @config {string} [sort]  specifies the sort criteria to be used when rendering comments
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of comments is ready
     */
    this.getAllAsHTML = function(params) {
        var promise = new jive.conc.Promise();

        $j.ajax({
            type: "GET",
            url: this.listAction,
            dataType: "html",
            cache: false,
            data: $j.extend({
                location: this.location,
                mode: this.commentMode,
                isPrintPreview : this.isPrintPreview
            }, this.contentObject, params),
            success: function(html) {
                promise.emitSuccess(html);
            },
            error: function(data) {
                promise.emitError(data);
            }

        });

        return promise;
    };

    /**
     * Given a comment instance fetches an HTML rendering of the comment.  The
     * rendered HTML is emitted by the promise that is returned.
     *
     * @methodOf jive.CommentApp.CommentSource#
     * @param {jive.CommentApp.Comment} comment comment instance to retrieve a preview of
     * @config {string} body    HTML content of the comment
     * @returns {jive.conc.Promise} promise that is fulfilled when the preview is ready
     */
    this.getPreview = function(comment) {
        var promise = new jive.conc.Promise();

        $j.ajax({
            type: "POST",
            url: this.POST_COMMENT_ENDPOINT + "/preview",
            dataType: "html",
            cache: false,
            data: { commentBody: comment.body },
            success: function(html) {
                promise.emitSuccess(html);
            },
            error: function(data) {
                promise.emitError(data);
            }
        });

        return promise;
    };
});
