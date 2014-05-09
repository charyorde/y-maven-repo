/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/content/common/main.js
 * @depends path=/resources/scripts/apps/content/photoAlbums/edit/views/photoAlbums_view.js
 */

/**
 * @name jive.content.photoAlbums.Main
 */
jive.namespace('content.photoAlbums');

jive.content.photoAlbums.Main = jive.content.common.Main.extend(function(protect, _super) {
	this.init = function(options) {
		this.options = $j.extend({
			resourceType: 'photoAlbums',
			autoSave: {
				properties: ['authorshipPolicy', 'photoAlbumAuthors']
			}
		}, options);
		
		_super.init.call(this, this.options);
	};
	
	protect.createView = function(options) {
		return new jive.content.photoAlbums.PhotoAlbumsView(options);
	}
	
	protect.contributeOptions = function(data) {
		var func = (this.options.edit) ? this.ajaxOptionsForEdit : this.ajaxOptionsForCreate;
		var opts = func(this.options.photoAlbumID);
		return opts;
	};
	
	protect.ajaxOptionsForCreate = function(photoAlbumID) {
		return {
			ajaxType: 'POST',
			suffix: '/'
		};
	};
	
	protect.ajaxOptionsForEdit = function(photoAlbumID) {
		return {
			ajaxType: 'PUT',
			suffix: '/' + photoAlbumID
		};
	};

});