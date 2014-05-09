/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*extern jive $j $Class importCsvTitle emailLink */

jive.Csv = $Class.extend({
    init: function(options) {
        var that = this;
        
        this.elements = {
            instructionsBody: $j("#import-csv-body"),
            uploadedErrorMessage: $j("#upload-csv-error"),
            uploadedBody: $j("#uploaded-csv-body"),
            emailsBody: $j("#select-emails-body"),
            fileName: $j("#uploaded-csv-fileName"),
            sampleName: $j("#uploaded-csv-sample-name"),
            sampleEmail: $j("#uploaded-csv-sample-email"),
            nameSelect: $j("#uploaded-csv-name-select"),
            emailSelect: $j("#uploaded-csv-email-select"),
            currentList: $j("#jive-current-members-list"),
            emailsList: $j("#select-emails-list"),
            importFriends: $j("#import-friends"),
            importCancel: $j("#import-cancel"),
            containerType: $j("#container-type"),
            containerId: $j("#container-id")
        };

        $j("#csv").change(function() { that.handleSubmit.bind(that); $j(this).closest('form').submit(); });
        $j("#uploadForm").click(this.uploadForm.bind(this));
        $j("#show-emails-button").click(this.selectCsv.bind(this));
        this.elements.importFriends.click(this.doImport.bind(this));
        this.elements.importCancel.click(this.doCancel.bind(this));
        this._importCallback = options.importCallback || null;
        this._cancelCallback = options.cancelCallback || null;
        this._emailLink = options.emailLink;
    },

    handleSubmit: function () {
    },

    processUploadError: function(errorMessage) {
        this.reset();
        this.elements.uploadedErrorMessage.text(errorMessage).show();
    },

    processResult: function (fileName, columns, sample) {
        columns = $j.makeArray(columns);
        sample = $j.makeArray(sample);
        this.elements.fileName.text(fileName);
        this.elements.sampleName.text(sample[0]);
        this.elements.sampleEmail.text("(" + sample[1] + ")");
        this.elements.nameSelect.text("");
        this.elements.emailSelect.text("");

        var elementCreator = function(select, selectedIndex, column, index) {
            var option = $j('<option/>').val(column).text(column);
            if (index == selectedIndex) {
                option.prop('selected', true);
            }
            select.append(option);
        };

        var that = this;

        columns.forEach(elementCreator.partial(this.elements.nameSelect, 0));
        this.elements.nameSelect.change(function() {
            that.elements.sampleName.text(sample[this.selectedIndex]);
        });

        columns.forEach(elementCreator.partial(this.elements.emailSelect, 1));
        this.elements.emailSelect.change(function() {
            that.elements.sampleEmail.text("(" + sample[this.selectedIndex] + ")");
        });

        this.elements.instructionsBody.hide();
        this.elements.uploadedBody.show();
    },

    uploadForm: function(e) {
        e.preventDefault();
        e.stopPropagation();
        csvWindow.reset();
    },

    selectCsv: function(e) {
        e.preventDefault();
        e.stopPropagation();
        $j("#upload-form-submit").attr('src', this._emailLink + '?nameColumn=' + this.elements.nameSelect.val() + "&emailColumn=" +
            this.elements.emailSelect.val() + "&containerType="+this.elements.containerType.val() + "&containerID="+this.elements.containerId.val());
    },

    selectEmails: function(emails, duplicates) {
        $j("#select-emails-list-text").hide()
        emails = $j.makeArray(emails);
        duplicates = $j.makeArray(duplicates);
        emails.forEach(function(email) {
            var id = "select-email-" + email.email;
            this.elements.emailsList.append(
                $j('<li/>')
                    .append(
                        $j('<input/>').attr('type', 'checkbox').attr('id', id)
                    )
                    .append(
                        $j('<label/>').attr('for', id)
                            .append($j('<strong/>').text(email.name))
                            .append($j('<span/>').text(" (" + email.email + ")"))
                    )
            );
        }.bind(this));
        if (emails.length === 0) {
            $j("#select-emails-list-text").show()
        }
        else {
            $j("#jive-select-emails-scroller").addClass("jive-select-emails-scroller-tall");
        }
        if (duplicates.length > 0) {
            duplicates.forEach(function(email) {
                this.elements.currentList.append(
                    $j('<li/>')
                        .append($j('<strong/>').text(email.name))
                        .append($j('<span/>').text(" (" + email.email + ")"))
                );
            }.bind(this));
            $j("#jive-select-emails-scroller").removeClass("jive-select-emails-scroller-tall");
            $j("#jive-current-members").show();
        }
        else {
            $j("#jive-current-members").hide();
        }
        var selectAllNone = function(isChecked, e) {
            var boxes = this.elements.emailsList.find('[type="checkbox"]');
            if (isChecked) {
                boxes.prop('checked', true);
            } else {
                boxes.prop('checked', false);
            }
            e.preventDefault();
            e.stopPropagation();
        };
        $j("#select-emails-all").click(selectAllNone.bind(this, true));
        $j("#select-emails-none").click(selectAllNone.bind(this, false));
        $j("#two").addClass("selected");
        $j("#one").removeClass("selected");
        this.elements.uploadedBody.hide();
        this.elements.emailsBody.show();
        $j("#upload-form-submit").attr('src', '');
    },

    doImport: function(e) {
        if ($j.isFunction(this._importCallback)) {
            var friends = this.elements.emailsList.find('[type="checkbox"]:checked').map(function() {
                return this.id.replace("select-email-", "");
            });
            this._importCallback(Array.prototype.slice.call(friends, 0));
            this.reset();
            this._clearCallbacks();
        }
        e.preventDefault();
        e.stopPropagation();
    },

    doCancel: function(e) {
        if ($j.isFunction(this._cancelCallback)) {
            this._cancelCallback();
            this.reset();
            this._clearCallbacks();
        }
        e.preventDefault();
        e.stopPropagation();
    },

    reset: function() {
        this.elements.uploadedBody.hide();
        this.elements.emailsBody.hide();
        this.elements.uploadedErrorMessage.hide();
        this.elements.emailsList.children().remove();
        this.elements.currentList.children().remove();
        $j("#upload-form").each(function() { this.reset(); });
        this.elements.instructionsBody.show();
        $j("#upload-form-submit").removeAttr('src');
        $j("#one").addClass("selected");
        $j("#two").removeClass("selected");
        $j("#upload-form-submit").attr('src', '');
        generateFormToken($j('#upload-form'), "csv.upload");
    },

    _clearCallbacks: function() {
        this._importCallback = null;
        this._cancelCallback = null;
    }
});




/* CSV import functions */
var csvWindow;
var doImport = function(userChooser, emailAvatar) {
    var importCallback = function (friends) {

        var values = new Array();
        if (friends.length) {
            friends.forEach(function(friend) {
                values.push({
                    id: -1,
                    email: friend,
                    displayName: friend,
                    avatar: emailAvatar,
                    entitled: true });
            });
            if (values.length > 0) {
                userChooser.setUsers(values);
            }
        }

        win.close();
    };
    var cancelCallback = function () {
        win.close();
    };
    if (!csvWindow) {
        var csvOptions = {
            emailLink: emailLink,
            importCallback: importCallback,
            cancelCallback: cancelCallback
        };
        csvWindow = new jive.Csv(csvOptions);
    }
    else {
        csvWindow._importCallback = importCallback;
        csvWindow._cancelCallback = cancelCallback;
    }
    generateFormToken($j('#upload-form'), "csv.upload");
    var win = new jive.gui.smallWindowPanel((importCsvTitle || "Import Contacts"), $j("#jive-import-csv-container")[0], 'large');
    win.setBackAction(function() {
        win.close();
        csvWindow.reset();
        csvWindow._clearCallbacks();
    });
    win.show();
};

/* toggle showing & hiding instructions for exporting CSV files */
function jiveHideInstructions(item) {
    $j('#' + item).hide();
    $j("#jive-exportinfo-links").show();
}
function jiveShowInstructions(item) {
    $j("#jive-exportinfo-links").hide();
    $j('#' + item).show();
}
function generateFormToken(form, tokenName) {
    // First remove any existing tokens
    form.find('[name="jive.token.name"]').remove();
    form.find('[name="'+ tokenName +'"]').remove();

    // Grab a new token (if we need to, and append it to the form)
    jive.util.securedPost(tokenName).addCallback(function(newToken) {
        form.append('<input type="hidden" name="jive.token.name" value="'+ newToken['jive.token.name'] +'"/>');
        form.append('<input type="hidden" name="'+ newToken['jive.token.name'] +'" value="'+ newToken[tokenName] +'"/>');
    });
}
