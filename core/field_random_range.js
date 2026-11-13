/**
 * @license
 * Scratch Blocks
 */
'use strict';

goog.provide('Blockly.FieldRandomRange');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldTextDropdown');
goog.require('Blockly.utils');

Blockly.FieldRandomRange = function(
    minValue,
    maxValue,
    opt_minLabel,
    opt_maxLabel
) {
    this.minLabel_ = opt_minLabel || 'От';
    this.maxLabel_ = opt_maxLabel || 'До';

    this.minLimit_ = 0;
    this.maxLimit_ = 1000000;

    var value = JSON.stringify([
        String(minValue === undefined ? 1 : minValue),
        String(maxValue === undefined ? 10 : maxValue)
    ]);

    Blockly.FieldRandomRange.superClass_.constructor.call(
        this,
        value
    );

    this.addArgType('randomrange');
};

goog.inherits(
    Blockly.FieldRandomRange,
    Blockly.FieldTextInput
);

/**
 * Creating a field from JSON
 */
Blockly.FieldRandomRange.fromJson = function(options) {
    var field = new Blockly.FieldRandomRange(
        options['min'] || 1,
        options['max'] || 10,
        options['label0'],
        options['label1']
    );

    if (options['value']) {
        field.setValue(options['value']);
    }

    return field;
};

/**
 * Initialization of the field and the arrow
 */
Blockly.FieldRandomRange.prototype.init = function(block) {
    if (this.fieldGroup_) {
        return;
    }
    
    Blockly.FieldRandomRange.superClass_.init.call(this);

    this.arrowSize_ = 12;
    this.arrowX_ = 0;
    this.arrowY_ = 11;

    this.arrow_ = Blockly.utils.createSvgElement(
        'image',
        {
            'height': this.arrowSize_ + 'px',
            'width': this.arrowSize_ + 'px'
        }
    );

    this.arrow_.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        Blockly.mainWorkspace.options.pathToMedia +
            'dropdown-arrow-dark.svg'
    );

    this.arrow_.style.cursor = 'pointer';

    this.fieldGroup_.appendChild(this.arrow_);

    this.mouseUpWrapper_ = Blockly.bindEvent_(
        this.arrow_,
        'mouseup',
        this,
        this.showEditor_
    );

    this.disableColourChange_ = true;

    this.render_();
};

/**
 * Text displayed on the block
 */
Blockly.FieldRandomRange.prototype.getDisplayText_ = function() {
    var values = this.getInputValues();

    // return values[0] + ' – ' + values[1];
    return ""
};

/**
 * Display update
 */
Blockly.FieldRandomRange.prototype.setText = function(newText) {
    Blockly.FieldRandomRange.superClass_.setText.call(
        this,
        newText
    );

    this.render_();
};

/**
 * Retrieving range values
 */
Blockly.FieldRandomRange.prototype.getInputValues = function() {
    var values;

    try {
        values = JSON.parse(this.getValue());
    } catch (e) {
        values = ['1', '10'];
    }

    if (!Array.isArray(values) || values.length !== 2) {
        return ['1', '10'];
    }

    return [
        String(values[0]),
        String(values[1])
    ];
};

/**
 * Pointer positioning
 */
Blockly.FieldRandomRange.prototype.positionArrow = function(x) {
    if (!this.arrow_) {
        return 0;
    }

    var arrowPadding = Blockly.BlockSvg.DROPDOWN_ARROW_PADDING;
    var arrowWidth = this.arrowSize_ + arrowPadding;

    var arrowCenterX = Blockly.BlockSvg.FIELD_WIDTH / 2;
    this.arrowX_ = arrowCenterX - this.arrowSize_ / 2;

    // TODO: Fix the coordinate calculation algorithm 
    this.arrow_.setAttribute(
        'transform',
        'translate(' + (this.arrowX_ - 7) + ',' + (this.arrowY_ - 5) + ')'
    );

    return arrowWidth;
};

/**
 * Open menue
 */
Blockly.FieldRandomRange.prototype.showEditor_ = function() {
    if (Blockly.DropDownDiv.hideIfOwner(this)) {
        return;
    }

    Blockly.DropDownDiv.hideWithoutAnimation();
    Blockly.DropDownDiv.clearContent();

    var contentDiv = Blockly.DropDownDiv.getContentDiv();

    contentDiv.setAttribute('role', 'group');
    contentDiv.setAttribute('aria-label', 'Диапазон случайного числа');
    contentDiv.style.width = '240px';

    var values = this.getInputValues();

    this.appendNumberInput_(
        contentDiv,
        this.minLabel_,
        values[0],
        0
    );

    this.appendNumberInput_(
        contentDiv,
        this.maxLabel_,
        values[1],
        1
    );

    var block = this.sourceBlock_;

    Blockly.DropDownDiv.setColour(
        block.getColour(),
        block.getColourTertiary()
    );

    Blockly.DropDownDiv.setCategory(
        (block.parentBlock_ || block).getCategory()
    );

    Blockly.DropDownDiv.showPositionedByBlock(
        this,
        block,
        function() {
            contentDiv.removeAttribute('role');
            contentDiv.removeAttribute('aria-label');
        }
    );
};

/**
 * Creating a number field in a menu
 */
Blockly.FieldRandomRange.prototype.appendNumberInput_ = function(
    contentDiv,
    labelText,
    value,
    index
) {
    var row = document.createElement('label');

    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.margin = '6px';
    row.style.gap = '8px';

    var input = document.createElement('input');

    input.type = 'number';
    input.step = '1';
    input.value = value;

    input.setAttribute('aria-label', labelText);

    input.style.flex = '1';
    input.style.minWidth = '0';
    input.style.padding = '6px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';

    var label = document.createElement('span');

    label.textContent = labelText;

    row.appendChild(input);
    row.appendChild(label);

    contentDiv.appendChild(row);

    input.addEventListener('input', function() {
        var inputs = contentDiv.querySelectorAll('input');

        var min = inputs[0].value;
        var max = inputs[1].value;

        // We do not save invalid values
        if (
            min === '' ||
            max === '' ||
            !Number.isSafeInteger(Number(min)) ||
            !Number.isSafeInteger(Number(max)) ||
            Number(min) > Number(max) ||
            Number(min) < this.minLimit_ ||
            Number(max) > this.maxLimit_
        ) {
            return;
        }

        this.setValue(JSON.stringify([min, max]));

    }.bind(this));
};

/**
 * Field registration
 */
Blockly.Field.register(
    'field_random_range',
    Blockly.FieldRandomRange
);