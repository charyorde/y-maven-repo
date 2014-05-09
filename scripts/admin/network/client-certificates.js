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
                    html = jive.admin.client_certs.renderErrorMessages({messages:errorMessages});
                    errorMessages.length = 0;
                    successMessages.length = 0;
                } else if (successMessages.length) {
                    html = jive.admin.client_certs.renderSuccessMessages({messages:errorMessages});
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

    function getStrategy() {
        return $j("input:checked[name=strategy]").val();
    }

    var initialStrategy = getStrategy();

    $j("input[name=strategy]").bind("change click", function() {
        if (getStrategy() == initialStrategy) {
            $j("#js-change-strategy-submit").attr("disabled", "disabled");
        } else {
            $j("#js-change-strategy-submit").removeAttr("disabled");
        }
        var myValue = $j(this).val();
        $j("#js-change-strategy ul.strategies > li").removeClass("checked")
                                                    .filter("[data-value=" + myValue + "]")
                                                    .addClass("checked");
    });

    $j("#js-change-strategy-submit").click(function(e) {
        if (!confirm($j("#js-change-strategy-confirmation").text())) {
            $j("input[name=strategy][value=" + initialStrategy + "]").click();
            $j("#js-change-strategy-submit").attr("disabled", "disabled");
            e.preventDefault();
        }
        initialStrategy = getStrategy(); // to prevent the unload handler
    });

    $j("#js-certificate-list").delegate(".js-delete-key", "click", function(e) {
        var self = $j(this);
        var myAlias = self.attr("data-alias");
        function removeRow() {
            var table = self.closest("tbody");
            self.closest("tr").remove();
            if (table.has("> tr").length == 0) {
                table.html(jive.admin.client_certs.renderEmptyCertificateRow({allowDelete:true}));
            }
        }
        $j.ajax({
            type: "POST",
            url: _jive_base_url + "/__services/v2/rest/admin/network/client-certs/delete?key=" + encodeURIComponent(myAlias),
            dataType: "json",
            success: function() {
                showSuccess("Successfully removed key: " + myAlias);
                removeRow();
            },
            error: function(xhr) {
                if (xhr.status == 404) {
                    removeRow();
                } else {
                    showError($j.parseJSON(xhr.responseText || "{}").message);
                }
            }
        });
        showMessages();
        e.preventDefault();
    });

    $j(window).bind("beforeunload", function(e) {
        if (initialStrategy != getStrategy()) {
            return $j("#js-change-strategy-unsaved-changes").text();
        }
    });
});
