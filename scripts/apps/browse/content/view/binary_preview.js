/**
 * Launches a modal viewer for binary docs.
 *
 * @depends path=/resources/scripts/conversion/previewable-binary-lightbox.js
 */
$j(function() {
    $j('#j-browse-item-grid').delegate("a img.binary-preview", "click", function(e) {
        var url = $j(this).parent('a').data('preview-url');
        showPreviewableBinary(url, '');
        return false;
    });
});