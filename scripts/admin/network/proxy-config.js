/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
$j(document).ready(function() {

    var errorMessages = [];
    var successMessages = [];
    var pendingShow = null;

    function showMessages() {
        if (pendingShow === null) {
            pendingShow = window.setTimeout(function() {
                pendingShow = null;
                $j("#js-proxy-server-messages").remove();
                var html = null;
                if (errorMessages.length) {
                    html = jive.admin.network.proxy.renderErrorMessages({messages:errorMessages});
                    errorMessages.length = 0;
                    successMessages.length = 0;
                } else if (successMessages.length) {
                    html = jive.admin.network.proxy.renderSuccessMessages({messages:successMessages});
                    successMessages.length = 0;
                    pendingShow = window.setTimeout(arguments.callee, 10000);
                }
                if (html) {
                    var msgContainer = $j("<div/>").attr("id", "js-proxy-server-messages");
                    msgContainer.html(html);
                    msgContainer.prependTo(".jive-body-contentBox");
                    window.scrollTo(0,0);
                }
            }, 1);
        }
    }

    function showError(msg) {
        if (msg) {
            errorMessages.push(msg);
            showMessages()
        }
    }

    function showSuccess(msg) {
        if (msg) {
            successMessages.push(msg);
            showMessages();
        }
    }

    function updateFields() {
        var enabled = Boolean($j("#enabled:checked").val());
        var useAuth = Boolean($j("#useAuth:checked").val());
        if (enabled && useAuth) {
            $j("#js-proxy-server-settings").removeClass("block-disabled")
                                           .find(".js-proxy-server-settings input")
                                           .removeAttr("disabled");
            $j("#js-proxy-auth-settings").removeClass("block-disabled")
                                         .find(".js-proxy-auth-settings input")
                                         .removeAttr("disabled");
        } else if (enabled) {
            $j("#js-proxy-server-settings").removeClass("block-disabled")
                                           .find(".js-proxy-server-settings input")
                                           .removeAttr("disabled");
            $j("#js-proxy-auth-settings").addClass("block-disabled")
                                         .find(".js-proxy-auth-settings input")
                                         .attr("disabled", "disabled");
        } else {
            $j("#js-proxy-server-settings").addClass("block-disabled")
                                           .find(".js-proxy-server-settings input")
                                           .attr("disabled", "disabled");
            $j("#js-proxy-auth-settings").addClass("block-disabled")
                                         .find(".js-proxy-auth-settings input")
                                         .attr("disabled", "disabled");
        }
        if (getProxyConfig().toString() == initialConfig.toString()) {
            $j("#js-proxy-server-settings-submit").attr("disabled", "disabled");
        } else {
            $j("#js-proxy-server-settings-submit").removeAttr("disabled");
        }
    }

    function updateNonProxyHosts(nonProxyHosts) {
        var html = jive.admin.network.proxy.renderNonProxyHostsTable({nonProxyHosts: nonProxyHosts});
        $j("#js-non-proxy-hosts").html(html);
    }

    function getProxyConfig() {
        var config = {
            enabled: Boolean($j("#enabled:checked").val()),
            host: $j("#proxyHost").val(),
            port: $j("#proxyPort").val(),
            nonProxyHosts: $j("#nonProxyHosts").val(),
            useAuth: Boolean($j("#useAuth:checked").val()),
            username: $j("#proxyUsername").val(),
            password: $j("#proxyPassword").val(),
            toString: function() {
                var data = [];
                if (this.enabled) {
                    data.push("enabled");
                    data.push(this.host);
                    data.push(String(this.port));
                    data.push(this.nonProxyHosts);
                    if (this.useAuth) {
                        data.push(this.username);
                        data.push(this.password || defaultPassword);
                    }
                } else {
                    data.push("disabled");
                }
                return data.join("\n");
            }
        };
        if (config.password == defaultPassword) {
            // not changing it, don't include it
            delete config.password;
        }
        return config;
    }

    function updateDefaultPassword() {
        var pass = "";
        if ($j("#proxyPassword").val()) {
            var buf = [];
            var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`-=[]\\;',./~!@#$%^&*()_+{}|:\"<>?";
            for (var i = 0; i < 16; i++) {
                var r = Math.floor(Math.random() * chars.length);
                buf.push(chars.charAt(r));
            }
            pass = buf.join("");
            $j("#proxyPassword").val(pass);
        }
        return pass;
    }

    var initialConfig = getProxyConfig();
    var defaultPassword = updateDefaultPassword();

    $j("#enabled, #useAuth").bind("click change", updateFields);
    $j("#proxyHost, #proxyPort, #proxyUsername, #proxyPassword").keyup(updateFields);

    $j("#js-proxy-server-settings-submit").click(function(e) {
        var req = getProxyConfig();
        if (req.enabled) {
            if (typeof req.port == 'string' && !req.port.match(/^\d+$/)) {
                showError("The proxy port must be a number from 1 to 65535.");
            }
            if(req.port <= 0 || req.port >= 65536) {
                showError("The proxy port must be a number from 1 to 65535.")
            }
            if (!(/^([-0-9a-z]+|\*)(\.[-0-9a-z]+)*$/i.test(req.host))) {
                showError("The proxy host does not appear to be valid.");
            }
            if (req.useAuth) {
                if (!req.username) {
                    showError("Username is not specified.");
                }
                if (!defaultPassword && !req.password) {
                    showError("Password is not specified.");
                }
            }
        }
        if (errorMessages.length) {
            return;
        }
        e.preventDefault();
        $j("#js-proxy-server-settings-submit").attr("disabled", "disabled");
        $j.ajax({
            type: "POST",
            url: _jive_base_url + "/__services/v2/rest/admin/network/proxy",
            data: JSON.stringify(req),
            contentType: "application/json",
            success: function() {
                showSuccess("Proxy settings successfully updated. Settings will take 30 seconds to become active.");
                defaultPassword = updateDefaultPassword();
                initialConfig = getProxyConfig();
                updateFields();
            },
            error: function(xhr) {
                $j("#js-proxy-server-settings-submit").removeAttr("disabled");
                var messages = $j.parseJSON(xhr.responseText || "[]").messages || [];
                for (var i = 0, l = messages.length; i < l; i++) {
                    showError(messages[i]);
                }
            }
        });
        showMessages();
    });

    $j("#js-non-proxy-hosts").delegate(".js-add-host", "click", function(e) {
        var host = $j("#newNonProxyHost").val();
        var nonProxyHosts = $j("#nonProxyHosts").val();
        nonProxyHosts = nonProxyHosts ? nonProxyHosts.split("|") : [];
        for (var i = 0, l = nonProxyHosts.length; i < l; i++) {
            var nonProxyHost = nonProxyHosts[i];
            if (nonProxyHost == host) {
                showError("This host is already present in the list of non-proxy hosts.");
                return;
            }
        }
        nonProxyHosts.push(host);
        $j("#nonProxyHosts").val(nonProxyHosts.join("|"));
        updateNonProxyHosts(nonProxyHosts);
        updateFields();
        e.preventDefault();
    });

    $j("#js-non-proxy-hosts").delegate(".js-delete-host", "click", function(e) {
        var self = $j(this);
        var host = self.attr("data-host");
        var nonProxyHosts = $j("#nonProxyHosts").val();
        nonProxyHosts = nonProxyHosts ? nonProxyHosts.split("|") : [];
        for (var i = 0, l = nonProxyHosts.length; i < l; i++) {
            var nonProxyHost = nonProxyHosts[i];
            if (nonProxyHost == host) {
                nonProxyHosts.splice(i, 1);
                self.closest("tr").remove();
                break; // only delete one
            }
        }
        $j("#nonProxyHosts").val(nonProxyHosts.join("|"));
        updateNonProxyHosts(nonProxyHosts);
        updateFields();
        e.preventDefault();
    });

    $j(window).bind("beforeunload", function(e) {
        if (getProxyConfig().toString() != initialConfig.toString()) {
            return $j("#js-proxy-server-unsaved-changes").text();
        }
    });
});
