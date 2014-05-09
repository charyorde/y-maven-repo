
function PageTracker() {
}

PageTracker.prototype.nextPage = function() {
  var pageNumber = $j('#service-settings-page-number').val();
  pageNumber++;
  $j('#service-settings-page-number').val(pageNumber);
  $j('#serviceList-form').submit();
}

PageTracker.prototype.previousPage = function() {
  var pageNumber = $j('#service-settings-page-number').val();
  if(pageNumber != 0) {
    pageNumber--;
    $j('#service-settings-page-number').val(pageNumber);
    $j('#serviceList-form').submit();
  }
}

var pageTracker = new PageTracker();
/* functions for view-services screen */
$j(function() {
  // called when the lightbox is closed to reload the bridge list.
  var lightboxCallback = function() {
      $j('#service-add-modal').html('');
  };

  // used to load the lightbox
  var loadLightbox = function() {
    $j('#service-add-modal').lightbox_me({
      closeSelector: ".jive-modal-close, .close",
      onClose: lightboxCallback,
      onLoad: function() {
        $j('#new-service-field-name').focus();
      }
    });
  };

  // button for new service - launches modal
  $j('#addService').live('click', function() {
      var url = $j(this).children('a').attr('href');
      $j('#service-add-modal').load(url, loadLightbox);
      scroll(0,0);
      return false;
  });

  // links to edit a service
  $j('span.editService').click(function() {
    var url = $j(this).children('a').attr('href');
    $j('#service-add-modal').load(url, loadLightbox);
    scroll(0,0);
    return false;
  });
});

$j(".jive-modal-close, .close").live('click', function() {
  $j('#service-add-modal').trigger('close');
  return false;
});

/* header display support */
$j(function() {
  var detailRows = $j('tr.module-title-row');

  $j('#jive-service-name a').click(function() {
    toggleDetails($j(this));
    return false;
  });

  $j('#show-all-details').click(function() {
    showDetails(detailRows, true);
    return false;
  });

  $j('#hide-all-details').click(function() {
    hideDetails(detailRows, true);
    return false;
  });

  hideDetails(detailRows);
});

function toggleDetails(element) {
  if (element.hasClass("show-details-link")) {
    showDetails(element, true);
  } else {
    hideDetails(element, true);
  }
}

function showDetails(rows, animate) {
  var details = rows.closest('tr').next('tr.module-detail-row').find('td div.module-details');
  if(!animate) {
    details.show();
  }
  details.slideDown();
  rows.addClass("hide-details-link").removeClass("show-details-link");
  var icon = rows.children("#jive-header-arrow");
  icon.addClass("jive-icon-arrow-generic-up").removeClass("jive-icon-arrow-generic-down")
}

function hideDetails(rows, animate) {
  var details = rows.closest('tr').next('tr.module-detail-row').find('td div.module-details');
  if(!animate) {
    details.hide();
  }
  details.slideUp();
  rows.addClass("show-details-link").removeClass("hide-details-link");
  var icon = rows.children("#jive-header-arrow");
  icon.addClass("jive-icon-arrow-generic-down").removeClass("jive-icon-arrow-generic-up")
}

/* functions for create-service screen */
$j(function() {
  $j('#new-service-button').live('click', function() {
    $j('#service-add-form').ajaxSubmit({
      target: '#service-add-modal'
    })
    return false;
  });
});


/* functions for the service permissions screen */
$j('form#servicesPermissions-form button#connects-user-submit-button').live('click', function() {
  $j('#servicesPermissions-action').val("userSearch");
  $j('#servicesPermissions-form').submit();
});

$j('form#servicesPermissions-form select#connects-column-picker-user-name').live('change', function() {
  $j('#servicesPermissions-action').val("userNameSelection");
  $j('#servicesPermissions-form').submit();
});

$j('form#servicesPermissions-form select#connects-column-picker-app-id').live('change', function() {
  $j('#servicesPermissions-action').val("appsSelection");
  $j('#servicesPermissions-form').submit();
});

$j('form#servicesPermissions-form select#connects-column-picker-connection-id').live('change', function() {
  $j('#servicesPermissions-action').val("serviceSelection");
  $j('#servicesPermissions-form').submit();
});

$j('form#servicesPermissions-form button#connects-column-picker-toggle-button-id').live('click', function() {
  $j('#servicesPermissions-action').val("toggleService");
  $j('#servicesPermissions-form').submit();
});

