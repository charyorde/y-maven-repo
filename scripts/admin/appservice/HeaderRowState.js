

// --------------------------------------------------------------------------------------------------------- Constructor

// Constructor.
function HeaderRowState() {
}

//-------------------------------------------------------------------------------------------------------  Class Methods

HeaderRowState.createButton = function(label, clazz, id) {
  var button = $j('<button>');
  button.addClass(clazz);
  button.attr('id', id);
  button.text(label);
  return button;
}

HeaderRowState.createEditLink = function(clazz) {
  var img = $j('<img>');
  img.attr('src', '/images/transparent.png');
  img.addClass('jive-icon-sml').addClass('jive-icon-edit');

  var link = $j('<a>');
  link.attr('href', '#edit-header');
  link.addClass(clazz);
  link.css('text-decoration', 'none');
  link.text(' edit');
  link.prepend(img);

  var paragraph = $j('<p>');
  paragraph.append(link)

  return paragraph;
}

HeaderRowState.createHeader = function() {
  var row = $j('<tr>');
  row.append($j('<td>').addClass('settings-header-name'));
  row.append($j('<td>').addClass('settings-header-value'));
  row.append($j('<td>').addClass('settings-header-button1'));
  row.append($j('<td>').addClass('settings-header-button2'));
  return row;
}

HeaderRowState.createRemoveLink = function() {
  var link = $j('<a>');
  link.attr('href', '#remove-header');
  link.addClass('settings-remove-header');
  link.css('text-decoration', 'none');
  link.text(' remove');

  var img = $j('<img>');
  img.attr('src', '/images/transparent.png');
  img.addClass('jive-icon-sml').addClass('jive-icon-delete');
  link.prepend(img);

  return link;
}

HeaderRowState.createTextField = function(type, name, value, maxlength, id) {
  var field = $j('<input>');
  field.attr('type', type);
  field.attr('name', name);
  field.attr('value', value);
  field.attr('maxlength', maxlength);
  field.attr('id', id);
  field.attr('size', 30);
  return field;
}

//---------------------------------------------------------------------------------------------------------  API Methods

/**
 * Add a new row to the current table.
 */
HeaderRowState.prototype.addRow = function() {
  var newRow = HeaderRowState.createHeader();
  this.currentTable.append(newRow);
  this.currentRow = newRow;

  // setup the name cell
  var nameCell = HeaderRowState.createTextField('text', 'headerNames', '', 255, 'settings-header-name');
  this.addFocusWatchingHandler(nameCell);
  this.addNullWatchingChangeHandler(nameCell);
  this.setNameCell(nameCell);

  // setup the value cell
  var valueCell = HeaderRowState.createTextField('text', 'headerValues', '', 255, 'settings-header-value');
  this.addFocusWatchingHandler(valueCell);
  this.addNullWatchingChangeHandler(valueCell);
  this.setValueCell(valueCell);

  this.setButton1Cell(HeaderRowState.createButton('add', 'settings-save-header', 'settings-header-button1'));
  this.setButton2Cell(HeaderRowState.createButton('cancel', 'settings-remove-header', 'settings-header-button2'));

  this.enableButton1(false);
}

/**
 * Set the focus to be the name cell of the current row.
 */
HeaderRowState.prototype.focusName = function() {
  var nameCell = this.getNameCell();
  var inputElement = nameCell.find('input')
  inputElement.focus();
}

/**
 * Remove the current row from the header table.
 */
HeaderRowState.prototype.removeRow = function() {
  this.currentRow.remove();
}

/**
 * Set the current row and table based on the tr element passed in.
 */
HeaderRowState.prototype.setCurrentRow = function(row) {
  this.currentRow = row;
  this.currentTable = row.closest('table');
}

/**
 * Toggle the state of the current row between edit and non-edit modes.
 */
HeaderRowState.prototype.toggleRow = function(isCancel) {
  var isEditMode = this.isEditMode();
  this.toggleNameCell(isEditMode, isCancel);
  this.toggleValueCell(isEditMode, isCancel);
  this.toggleButton1Cell(isEditMode);
  this.toggleButton2Cell(isEditMode);
}

//-------------------------------------------------------------------------------------  Get/Set Methods For Table Cells

/**
 * Get the cell element that holds the header name.
 */
HeaderRowState.prototype.getNameCell = function() {
  return this.currentRow.children('td:first');
}

/**
 * Set the cell element that holds the header name.
 */
HeaderRowState.prototype.setNameCell = function(field) {
  this.getNameCell().html(field);
}

/**
 * Get the cell element that holds the header value.
 */
HeaderRowState.prototype.getValueCell = function() {
  return this.currentRow.children('td:nth-child(2)');
}

/**
 * Set the cell element that holds the header value.
 */
HeaderRowState.prototype.setValueCell = function(field) {
  this.getValueCell().html(field);
}

/**
 * Get the cell element that holds the first button.
 */
HeaderRowState.prototype.getButton1Cell = function() {
  return this.currentRow.children('td:nth-child(3)');
}

/**
 * Set the cell element that holds the first button.
 */
HeaderRowState.prototype.setButton1Cell = function(field) {
  this.getButton1Cell().html(field);
}

/**
 * Get the cell element that holds the second button.
 */
HeaderRowState.prototype.getButton2Cell = function() {
  return this.currentRow.children('td:nth-child(4)');
}

/**
 * Set the cell element that holds the second button.
 */
HeaderRowState.prototype.setButton2Cell = function(field) {
  this.getButton2Cell().html(field);
}

//------------------------------------------------------------------------------------------------------  Helper Methods

HeaderRowState.prototype.addFocusWatchingHandler = function(inputField) {
  var rowState = this;
  inputField.bind('focus', function(event) {
    rowState.setCurrentRow(inputField.closest('tr'));
  });
}

HeaderRowState.prototype.addNullWatchingChangeHandler = function(inputField) {
  var rowState = this;
  inputField.bind('keyup', function(event) {
    var nameCell = rowState.getNameCell();
    var valueCell = rowState.getValueCell();
    var name = nameCell.find('input').val();
    var value = valueCell.find('input').val();
    if(name == null || name.length == 0 || value == null || value.length == 0) {
      rowState.enableButton1(false);
    } else {
      rowState.enableButton1(true);
    }
  });
}

HeaderRowState.prototype.enableButton1 = function(shouldEnable) {
  var button = this.getButton1Cell().children('button');
  if(shouldEnable) {
    button.prop('disabled', false);
  } else {
    button.prop('disabled', true);
  }
}

HeaderRowState.prototype.isEditMode = function() {
  var nameCell = this.getNameCell();
  var nameInputElement = nameCell.find('input');
  return nameInputElement.attr('type') == 'text';
}

/**
 * Toggle the name cell between edit mode and display mode.
 */
HeaderRowState.prototype.toggleNameCell = function(isEditMode, isCancel) {
  var nameCell = this.getNameCell();
  var nameInputElement = nameCell.find('input');
  if(isEditMode) {
    var cellTextValue;
    if(isCancel) {
      cellTextValue = nameCell.attr('abbr');
    } else {
      cellTextValue = nameInputElement.attr('value')
    }
    nameCell.text(cellTextValue);
    newElement = HeaderRowState.createTextField('hidden', nameInputElement.attr('name'), cellTextValue);
    nameCell.removeAttr('abbr');
    nameCell.append(newElement);
  } else {
    var value = $j.trim(nameCell.text());
    nameCell.attr('abbr', value);
    newElement = HeaderRowState.createTextField('text', nameInputElement.attr('name'), value);
    this.addFocusWatchingHandler(newElement);
    this.addNullWatchingChangeHandler(newElement);
    this.setNameCell(newElement);
  }
}

/**
 * Toggle the value cell between edit mode and display mode.
 */
HeaderRowState.prototype.toggleValueCell = function(isEditMode, isCancel) {
  var valueCell = this.getValueCell();
  var valueInputElement = valueCell.find('input');
  if(isEditMode) {
    var cellTextValue;
    if(isCancel) {
      cellTextValue = valueCell.attr('abbr');
    } else {
      cellTextValue = valueInputElement.attr('value')
    }
    valueCell.text(cellTextValue);
    newElement = HeaderRowState.createTextField('hidden', valueInputElement.attr('name'), cellTextValue);
    valueCell.removeAttr('abbr');
    valueCell.append(newElement);
  } else {
    var value = $j.trim(valueCell.text());
    valueCell.attr('abbr', value);
    newElement = HeaderRowState.createTextField('text', valueInputElement.attr('name'), value);
    this.addFocusWatchingHandler(newElement);
    this.addNullWatchingChangeHandler(newElement);
    this.setValueCell(newElement);
  }
}

/**
 * Toggle the button1 cell between edit mode and display mode.
 */
HeaderRowState.prototype.toggleButton1Cell = function(isEditMode) {
  var buttonCell = this.getButton1Cell();
  if(isEditMode) {
    newElement = HeaderRowState.createEditLink('settings-edit-header');
    this.setButton1Cell(newElement);
  } else {
    newElement = HeaderRowState.createButton('add', 'settings-save-header');
    this.setButton1Cell(newElement);
  }
}

/**
 * Toggle the button2 cell between edit mode and display mode.
 */
HeaderRowState.prototype.toggleButton2Cell = function (isEditMode) {
  var buttonCell = this.getButton2Cell();
  if(isEditMode) {
    newElement = HeaderRowState.createRemoveLink('settings-remove-header');
    this.setButton2Cell(newElement);
  } else {
    newElement = HeaderRowState.createButton('cancel', 'settings-cancel-header');
    this.setButton2Cell(newElement);
  }
}

