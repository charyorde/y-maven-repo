
function SortUtil() {
  this.sortOrder = SortUtil.ASCENDING;
}

SortUtil.ASCENDING = 'ascending';
SortUtil.DESCENDING = 'descending';

SortUtil.prototype.sort = function(sortColumn) {
  $j('#service-settings-page-number').val(0);
  $j('#service-settings-sort-column').val(sortColumn);

  var currentOrderElement = $j('#service-settings-sort-order');
  var currentOrder = currentOrderElement.val();
  if(currentOrder == SortUtil.ASCENDING) {
    currentOrderElement.val(SortUtil.DESCENDING);
  } else {
    currentOrderElement.val(SortUtil.ASCENDING);
  }

  $j('#serviceList-form').submit();
}

var sortUtil = new SortUtil();
