jive.namespace("GadgetSettings");

jive.GadgetSettings.GadgetBrowserView = $Class.extend({
    init: function(options) {
        this.template = options.template;
        this.gadgetTemplate = options.gadgetTemplate;
        this.$browser = options.browser;
        this.$msgContainer = options.browser.parent();
        this.gadgets = {};

        this.msgTemplates = {
            removing: options.removingTemplate
        };
    },
    refresh: function(gadgets) {
        var $browser = this.$browser;
        var gadgetTemplate = this.gadgetTemplate;
        var that = this;

        var loadGadget = function(index, gadget) {
            var $gadgetHtml = $j(gadgetTemplate(gadget));
            $gadgetHtml.find("a.evt-click-remove").click(function() {
                that.emit("removing", gadget);
                return false;
            });

            var loadType = function(index, type) {
                $gadgetHtml.find("#j-gadget-type-" + gadget.id + "-" + type.id).click(function() {
                    that.emit("type-changed", gadget, type, $j(this).is(":checked"));
                });
            };
            $j.each(gadget.types, loadType);

            $gadgetHtml.find("#j-gadget-category-" + gadget.id + " a").click(function() {
                that.emit("change-category", gadget);
                return false;
            });

            $gadgetHtml.find("#j-gadget-categories-" + gadget.id).change(function() {
                var category;
                var selectedVal = $j(this).find(":selected").val();
                if (selectedVal < 0) {
                    return;
                }
                for (var i = 0; i < gadget.categories.length; i++) {
                    category = gadget.categories[i];
                    if (category.id != selectedVal) {
                        category = null;
                    }
                    else {
                        break;
                    }
                }
                that.emit("category-changed", gadget, category);
            });

            $gadgetHtml.find("a#j-gadget-categories-"  + gadget.id + "-cancel").click(function() {
                that.emit("change-category-cancel", gadget);
                return false;
            });

            that.gadgets[gadget.id] = $gadgetHtml.appendTo($browser);
        };

        $j.each(gadgets, loadGadget);
    },
    remove: function(gadget) {
        var $gadget = this.gadgets[gadget.id];
        $gadget.slideUp("slow", function() {
            $j(this).remove();
        });
        gadgetInstalledCount = gadgetInstalledCount - 1;
        $j("#j-gadget-installed-count").text("Installed Gadgets (" + gadgetInstalledCount + ")");
    },
    showMsg: function(msg) {
        var $html = $j(this.msgTemplates[msg]());
        $html.hide();
        $html.prependTo(this.$msgContainer).slideDown("slow");
    },
    hideMsg: function() {
        this.$msgContainer.find(".gadget-message").slideUp("slow", function() {
            $j(this).remove();
        });
    },
    showCategorySelector: function(gadget) {
        $j("#j-gadget-category-" + gadget.id).hide();
        $j("#j-gadget-categories-" + gadget.id).show();
    },
    hideCategorySelector: function(gadget, category) {
        if (category) {
            $j("#j-gadget-category-" + gadget.id + "-text").text(category.name);
        }
        $j("#j-gadget-categories-" + gadget.id).hide();
        $j("#j-gadget-category-" + gadget.id).show();
    }
});

jive.conc.observable(jive.GadgetSettings.GadgetBrowserView.prototype);
