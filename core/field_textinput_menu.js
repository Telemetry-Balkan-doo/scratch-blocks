/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

goog.provide('Blockly.FieldTextInputMenu');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextDropdown');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils');

/**
 * Field that opens a drop-down containing two text inputs.
 * Its value is a JSON-encoded array containing both input values.
 * @param {string} label Text displayed on the block.
 * @param {string} firstValue Initial value for the first input.
 * @param {string} secondValue Initial value for the second input.
 * @param {string=} opt_firstLabel Label for the first input.
 * @param {string=} opt_secondLabel Label for the second input.
 * @constructor
 * @extends {Blockly.FieldTextInput}
 */
Blockly.FieldTextInputMenu = function(label, firstValue, secondValue,
    opt_firstLabel, opt_secondLabel) {
  this.label_ = label === undefined || label === null ? 'Edit' : label;
  this.firstLabel_ = opt_firstLabel || 'First';
  this.secondLabel_ = opt_secondLabel || 'Second';
  this.centerArrow_ = true;
  var value = JSON.stringify([firstValue || '', secondValue || '']);
  Blockly.FieldTextInputMenu.superClass_.constructor.call(this, value);
  this.addArgType('textinputmenu');
};
goog.inherits(Blockly.FieldTextInputMenu, Blockly.FieldTextInput);

/**
 * Construct a FieldTextInputMenu from a JSON field definition.
 * @param {!Object} element JSON field definition.
 * @return {!Blockly.FieldTextInputMenu} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldTextInputMenu.fromJson = function(element) {
  var label = element['text'] === undefined || element['text'] === null ? 'Edit' :
      Blockly.utils.replaceMessageReferences(element['text']);
  var field = new Blockly.FieldTextInputMenu(
      label,
      Blockly.utils.replaceMessageReferences(element['text0'] || ''),
      Blockly.utils.replaceMessageReferences(element['text1'] || ''),
      Blockly.utils.replaceMessageReferences(element['label0'] || 'First'),
      Blockly.utils.replaceMessageReferences(element['label1'] || 'Second'));
  if (element['value']) {
    field.setValue(element['value']);
  }
  return field;
};

/**
 * Initialize the field and its drop-down arrow.
 * @param {!Blockly.Block} block Owning block.
 */
Blockly.FieldTextInputMenu.prototype.init = function(block) {
  if (this.fieldGroup_) {
    return;
  }
  Blockly.FieldTextInputMenu.superClass_.init.call(this);
  this.arrowSize_ = 12;
  this.arrowX_ = 0;
  this.arrowY_ = 11;
  this.arrow_ = Blockly.utils.createSvgElement('image', {
    'height': this.arrowSize_ + 'px',
    'width': this.arrowSize_ + 'px'
  });
  this.arrow_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', Blockly.mainWorkspace.options.pathToMedia +
      'dropdown-arrow-dark.svg');
  this.arrow_.style.cursor = 'pointer';
  this.fieldGroup_.appendChild(this.arrow_);
  this.mouseUpWrapper_ =
      Blockly.bindEvent_(this.arrow_, 'mouseup', this, this.showEditor_);
  this.disableColourChange_ = true;
  this.render_();
};

/**
 * Display the configured label rather than the serialized value.
 * @return {string} Display label.
 * @private
 */
Blockly.FieldTextInputMenu.prototype.getDisplayText_ = function() {
  return this.label_;
};

/**
 * Update the serialized value while keeping the configured display label.
 * @param {*} newText New serialized value.
 */
Blockly.FieldTextInputMenu.prototype.setText = function(newText) {
  Blockly.FieldTextInputMenu.superClass_.setText.call(this, newText);
  this.render_();
};

Blockly.FieldTextInputMenu.prototype.positionArrow = function(x) {
  if (!this.arrow_) {
    return 0;
  }
  if (!this.centerArrow_) {
    return Blockly.FieldTextDropdown.prototype.positionArrow.call(this, x);
  }

  var arrowPadding = Blockly.BlockSvg.DROPDOWN_ARROW_PADDING;
  var arrowWidth = this.arrowSize_ + arrowPadding;
  var arrowCenterX = this.sourceBlock_.outputConnection ?
      Blockly.BlockSvg.FIELD_WIDTH / 2 : (x + arrowWidth) / 2;
  this.arrowX_ = arrowCenterX - this.arrowSize_ / 2;
  this.arrow_.setAttribute('transform',
      'translate(' + this.arrowX_ + ',' + this.arrowY_ + ')');
  return arrowWidth;
};

/**
 * Get the current values of the two text inputs.
 * @return {!Array.<string>} The first and second input values.
 */
Blockly.FieldTextInputMenu.prototype.getInputValues = function() {
  var values;
  try {
    values = JSON.parse(this.getValue());
  } catch (e) {
    throw new Error('Invalid value for field_textinput_menu: ' +
        this.getValue());
  }
  if (!Array.isArray(values) || values.length !== 2) {
    throw new Error('Invalid value for field_textinput_menu: ' +
        this.getValue());
  }
  return [String(values[0]), String(values[1])];
};

/**
 * Show the drop-down containing two text inputs.
 * @private
 */
Blockly.FieldTextInputMenu.prototype.showEditor_ = function() {
  if (Blockly.DropDownDiv.hideIfOwner(this)) {
    return;
  }
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  contentDiv.setAttribute('role', 'group');
  contentDiv.setAttribute('aria-label', this.label_);
  contentDiv.style.width = '240px';

  var values = this.getInputValues();
  this.appendTextInput_(contentDiv, this.firstLabel_, values[0] || '');
  this.appendTextInput_(contentDiv, this.secondLabel_, values[1] || '');

  var block = this.sourceBlock_;
  Blockly.DropDownDiv.setColour(block.getColour(), block.getColourTertiary());
  Blockly.DropDownDiv.setCategory(
      (block.parentBlock_ || block).getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, block, function() {
    contentDiv.removeAttribute('role');
    contentDiv.removeAttribute('aria-label');
  });
};

/**
 * Add a labeled text input to the drop-down.
 * @param {!Element} contentDiv Drop-down content.
 * @param {string} labelText Input label.
 * @param {string} value Initial input value.
 * @private
 */
Blockly.FieldTextInputMenu.prototype.appendTextInput_ = function(
    contentDiv, labelText, value) {
  var row = document.createElement('label');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.margin = '6px';
  row.style.gap = '8px';
  row.appendChild(document.createTextNode(labelText));

  var input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.setAttribute('aria-label', labelText);
  input.style.flex = '1';
  input.style.minWidth = '0';
  input.addEventListener('input', function() {

    input.value = input.value.replace(/[^0-9.]/g, '');

    var parts = input.value.split('.');
    if (parts.length > 2) {
      input.value = parts[0] + '.' + parts.slice(1).join('');
    }

    var inputs = contentDiv.querySelectorAll('input');
    this.setValue(JSON.stringify([inputs[0].value, inputs[1].value]));
  }.bind(this));
  row.appendChild(input);
  contentDiv.appendChild(row);
};

Blockly.Field.register('field_textinput_menu', Blockly.FieldTextInputMenu);
