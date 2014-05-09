
var headerSet = new HeaderRowState();

function setButtonStates() {
  var testButton = $j('#test-service-button');
  var saveButton = $j('#save-service-button');
  if(isAtLeastOneRowInEditMode()) {
    testButton.prop('disabled', true);
    testButton.attr('title', 'Add/cancel header entries to enable');
    saveButton.prop('disabled', true);
    saveButton.attr('title', 'Add/cancel header entries to enable');
  } else {
    testButton.prop('disabled', false);
    testButton.removeAttr('title');
    saveButton.prop('disabled', false);
    saveButton.removeAttr('title');
  }
}

function isAtLeastOneRowInEditMode() {
  var foundEditMode = false;
  var rows = $j('#setting-headers-table tbody tr');
  rows.each(function() {
    var nameCell = $j(this).children('td:first');
    var inputElement = nameCell.find('input');
    if(inputElement.attr('type') == 'text') {
      foundEditMode = true;
    }
  });
  return foundEditMode;
}

function adjustHeaderLabels() {
  var rows = $j('#setting-headers-table tbody tr');
  if(rows.size() > 1) {
    $j('.settings-headers-exist').css('display', 'inline');
    $j('.settings-no-headers-exist').css('display', 'none');
  } else {
    $j('.settings-headers-exist').css('display', 'none');
    $j('.settings-no-headers-exist').css('display', 'inline');
  }
}

function setTestIcon(iconID) {
  $j('#test-service-working').css('display', 'none');
  $j('#test-service-success').css('display', 'none');
  $j('#test-service-failure').css('display', 'none');
  $j(iconID).css('display', 'inline');
}

/**
 * Wire handlers on page load.
 */
$j(function() {
  $j('#settings-add-header').click(function() {
    headerSet.setCurrentRow($j('#setting-headers-table tbody').children('tr:first'));
    headerSet.addRow();
    headerSet.focusName();
    setButtonStates();
    adjustHeaderLabels();
    return false;
  });

  $j('.settings-cancel-header').live('click', function() {
    headerSet.setCurrentRow($j(this).closest('tr'));
    headerSet.toggleRow(true);
    setButtonStates();
    adjustHeaderLabels()
    return false;
  });

  $j('.settings-edit-header').live('click', function() {
    headerSet.setCurrentRow($j(this).closest('tr'));
    headerSet.toggleRow(false);
    headerSet.focusName();
    setButtonStates();
    return false;
  });

  $j('.settings-remove-header').live('click', function() {
    headerSet.setCurrentRow($j(this).closest('tr'));
    headerSet.removeRow();
    setButtonStates();
    adjustHeaderLabels();
    return false;
  });

  $j('.settings-save-header').live('click', function() {
    headerSet.setCurrentRow($j(this).closest('tr'));
    headerSet.toggleRow(false);
    setButtonStates();
    return false;
  });

  $j('#test-service-button').live('click', function() {
    $j('#new-service-action-type').val('prevalidate');
    $j('#test-service-button').prop('disabled', true);
    setTestIcon('#test-service-working');
    $j('#service-add-form').ajaxSubmit({
      target: '#service-add-modal',
      success: function() {
        $j('#test-service-button').prop('disabled', false);
        if($j('.jive-error-message').size() > 0) {
          setTestIcon('#test-service-failure');
        } else {
          setTestIcon('#test-service-success');
        }
      }
    })
    return false;
  });

  $j('#save-service-button').live('click', function() {
    $j('#new-service-action-type').val('validate');
    $j('#test-service-button').prop('disabled', true);
    setTestIcon('#test-service-working');
    $j('#service-add-form').ajaxSubmit({
      target: '#service-add-modal',
      success: function() {
        $j('#test-service-button').prop('disabled', false);
        if($j('.jive-error-message').size() > 0) {
          setTestIcon('#test-service-failure');
        } else {
          $j('#new-service-action-type').val('execute');
          $j('#service-add-form').get(0).submit();
        }
      }
    })
    return false;
  });

  $j('#save-service-button').live('click', function() {
    $j('#new-service-action-type').val('execute');
    return true;
  });

  $j('#new-service-field-authentication').live('change', function(event) {
    if ($j("#serviceID").val() != "0") {
        alert("Warning:  Changing the authentication style will cause any existing credentials for this service to be deleted.");
    }
    if ($j("#new-service-field-authentication").val() == "oauth2") {
        $j(".oauth2-only").show();
        $j("#new-service-oauth2-client-id").focus();
    }
    else {
        $j(".oauth2-only").hide();
    }
  });

  // Configure initial visibility of OAuth2 properties
  if ($j("#new-service-field-authentication").val() == "oauth2") {
    $j(".oauth2-only").show();
  }
  else {
    $j(".oauth2-only").hide();
  }
});

