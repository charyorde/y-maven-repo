/*jslint browser:true */
/*extern jive $j UserStatusAction */

jive.model.YourStatusUpdates = function(userName, idPrefix, invalidCharsText, excludeName, noTextText) {

    var that = this;
    userName = jive.util.escapeHTML(userName);

    this.editStatus = function (id) {
       $j('#j-status-form-action-' + id).slideDown();
       $j('#statustext-small-' + id).keyup(that.saveStatusViaReturn);
    };

    this.saveStatusViaReturn = function(event) {
        var key = event.which || event.keyCode;
        if (key === jive.Event.KEY_RETURN) {
            if (typeof excludeName == "undefined") {
                that.saveStatus(event.target.getAttribute('_prefix'), false);
            }
            else {
                that.saveStatus(event.target.getAttribute('_prefix'), excludeName);
            }
        }
    };

    this.saveStatus = function(id, excludeName) {
        $j('#statustext-small-' + id).unbind('keyup', that.saveStatusViaReturn);
        var status = $j('#statustext-small-' + id).val();
        if (status.length == 0) {
            window.alert(noTextText);
            return false;
        }
        UserStatusAction.setUserStatus($j('#statustext-small-' + id).val(), {
            errorHandler:function(msg, e) {
                $j('#statustext-small-' + id).val($j('#statustext-value-' + id).val());
                that.editStatus(id);
                window.alert(invalidCharsText);
            },
            callback:function(msg) {
                $j('#statustext-small-' + id).val('');
                $j('#jive-success-box-'+id).show().fadeOut(4500);    
            }
        });
    };

};
