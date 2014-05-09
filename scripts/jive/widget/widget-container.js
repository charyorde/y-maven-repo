/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('widgets');

jive.widgets.Container = function(options) {
    var idPre = "#jive-widgetframe";
    var widgetArgs = $j.extend({}, options);
    var that = this;

    var widgetQueue = new Array();

    this.addWidget = function(id) {
        $j('#jive-widgetframe-loading_' + id).show();
        widgetQueue.push(id);
    };

    var renderComplete = function($widget, id) {
        $j(idPre + '-loading_' + id).hide();
        $j(idPre + '-body_' + id).show();

        // fire an event that this widget frame has loaded
        $j(idPre + '_' + widgetArgs.id).trigger('frameLoaded');
    };

    var render = function(id, params) {
        var size = $j(idPre + '-body_' + id).parent().hasClass('jive-widgetsize-large') ? 2 : 1;

        var options = $j.extend({'size': size, 'frameID': id}, widgetArgs);
        options = $j.extend(params, options);

        $j.get(widgetArgs.renderWidgetAction, options, function(data) {
            var shivHtml,
                htmlAndScripts = jive.util.separateScripts(data)
              , html = htmlAndScripts[0]
              , scripts = htmlAndScripts[1];

            if (typeof innerShiv != 'undefined') {
                shivHtml = innerShiv(html);
            } else {
                shivHtml = html;
            }
            $j(idPre + '-body_' + id).html(shivHtml);
            scripts();
            renderComplete(null, id);
        });
    };

    this.renderAll = function () {
        widgetQueue.forEach(render);
    };

    this.refreshLink = function (id, params) {
        var selector = '#' + idPre + '-refresh-link_' + id,
            callback = this.refresh.bind(this, id, params);

        $j(document.body).on('click', selector, callback);
    };
    
    this.refresh = function(id, params){
        $j(idPre + '-loading_' + id).show();
        $j(idPre + '-body_' + id).hide();
        render(id, params);
        return false;
    };

    this.editMode = function(id, type) {
        var $menu = $j(idPre + "-options_" + id);
        var jivewidgetprops = new WidgetProps({
            widgetFrameID : id
        });
        if (type == "com.jivesoftware.community.widget.Widget") {
            $menu.find("li.jive-widget-edit a").click(function() {
                jivewidgetprops.killRTEs();
                widgets.editWidgetFrame(id);
                return false;
            });
        }
        $menu.find("li.jive-widget-minimize a").click(function() {
            jivewidgetprops.killRTEs();
            widgets.minimizeWidgetFrame(id);
            return false;
        });
        $menu.find("li.jive-widget-maximize a").click(function() {
            widgets.maximizeWidgetFrame(id);
            return false;
        });
        $menu.find("li.jive-widget-remove a").click(function() {
            jivewidgetprops.killRTEs();
            widgets.removeWidgetFrame(id);
            return false;
        });
    };
};
