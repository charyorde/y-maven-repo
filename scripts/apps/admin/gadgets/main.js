jive.namespace("GadgetSettings");

jive.GadgetSettings.Main = function(options) {
    var gadgetSource = new jive.GadgetSettings.GadgetSource(options);
    var gadgetBrowserView = new jive.GadgetSettings.GadgetBrowserView(options);

    gadgetBrowserView.addListener("removing", function(gadget) {
        var removeCallback = function() {
            console.log("Gadget Removed");
            gadgetBrowserView.hideMsg();
            gadgetBrowserView.remove(gadget);
        };

        gadgetBrowserView.showMsg("removing");
        gadgetSource.remove(gadget, removeCallback);
    }).addListener("type-changed", function(gadget, type, enabled) {
        gadgetSource.toggleType(gadget, type, enabled, $j.noop);
    })
    .addListener("change-category", function(gadget) {
        gadgetBrowserView.showCategorySelector(gadget);
    })
    .addListener("category-changed", function(gadget, category) {
        gadgetSource.updateCategory(gadget, category, $j.noop);

        gadgetBrowserView.hideCategorySelector(gadget, category);
    })
    .addListener("change-category-cancel", function(gadget) {
        gadgetBrowserView.hideCategorySelector(gadget);
    });

    var reloadGadgets = function() {
        var callback = function(gadgets) {
            gadgetBrowserView.refresh(gadgets);
        };

        gadgetSource.fetchAll(callback);
    };

    $j(function() {
        reloadGadgets();
    });
};