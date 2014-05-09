/**
 * @depends path=/resources/scripts/apps/content/common/view.js
 */

/**
 * @name jive.content.photoAlbums.PhotoAlbumsView
 */
jive.namespace('content.photoAlbums');

jive.content.photoAlbums.PhotoAlbumsView = jive.content.common.View.extend(function(protect, _super) {
	this.init = function(options) {
		_super.init.call(this, options);
		
		var view = this;
		
		$j(document).ready(function() {
			view.multipleValue = options.multipleValue;
			view.authors = options.authors;
			
			view.createAuthorshipPolicyControl();
			view.createAuthorsUserPicker();
		});
	};
	
	this.createAuthorshipPolicyControl = function() {
		var view = this;
		$j('input[name="authorshipPolicy"]').change(function() {
			$j('#authorshipPolicyClosedPeople')[ $j(this).val() == view.multipleValue ? 'show' : 'hide']();
		});
	};
	
	this.createAuthorsUserPicker = function() {
		var initUsers = this.authors ? this.authors : [];
		var autocomplete = new jive.UserPicker.Main({
			multiple: true,
			valueIsUsername: false,
			emailAllowed: false,
			listAllowed: true,
			canInvitePartners: true,
			startingUsers: {
				users: initUsers, userlists : []
			},
			$input: $j('#photoAlbumAuthors')
		});
	}
});