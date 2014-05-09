/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 *
 * @depends template=jive.verifier.confirmDialog
 */
jiveInstanceVerifier = $Class.extend({

    init:  function() {
        var self = this;
        self.wireEvents();
    },

    wireEvents: function() {
        var self = this;

        $j("#j-verifier-btn-save").click(function(e) {
            e.preventDefault();
            var modalDiv = $j(jive.verifier.confirmDialog());
            $j("body").append(modalDiv);
            modalDiv.lightbox_me({closeSelector: ".close", destroyOnClose: true});

            function close() {
                modalDiv.find(".j-modal-close-top, .close").click();
            }
            function save() {
                var form = $j("#verificationForm");
                form.submit();
            }
            modalDiv.find("#verifier-confirm-submit-button").click(save);
            modalDiv.find("#verifier-confirm-close-button").click(close);
        });

        $j("#radio-copied").change(function(e) {
            e.preventDefault();
            if ($j("#radio-copied").is(":checked")) {
                copiedSelected();
            }

        });

        $j("#radio-moved").change(function(e) {
            e.preventDefault();
            if ($j("#radio-moved").is(":checked")) {
                movedSelected();
            }
        });

        function copiedSelected () {
            $j("#copied-type").fadeIn(300);
            $j("#moved-type").hide();
            $j("#license-copy-warn-mssg").fadeIn(300);
            $j("#j-verifier-btn-save").prop('disabled', false);
        };

        function movedSelected() {
            $j("#copied-type").fadeOut(300);
            $j("#moved-type").show();
            $j("#license-copy-warn-mssg").fadeOut(300);
            $j("#j-verifier-btn-save").prop('disabled', false);
        }
    }

});

