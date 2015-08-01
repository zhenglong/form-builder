var FieldType = {
	none: 0,
	number: 100,
	integer: 101,
	string: 102,
	email: 103,
	password: 104,
	prependedText: 105,
	appendedText: 106,
	textArea: 107,
	select: 200,
	multiSelect: 201,
	radioButton: 202,
	radioButtonList: 203,
	checkBox: 204,
	checkBoxList: 205
};

var TableMeta = _class(function () {
	this.upper().constructor.apply(this, arguments);
	this.name = '';
	this.fields = [];

	var _methods = {
		init: function(name) {
			this.name = name;
		},
		addFields: function(fields) {
			if (!fields) return;
			if (fields.length) this.fields.push.apply(this.fields, fields);
			else this.fields.push(fields);
		},
		setFields: function(fields) {
			this.fields = fields;
		},
		getFields: function() {
			return this.fields;
		}
	};
	$.extend(this, _methods);
});
TableMeta.inherit(BaseViewModel);

var FieldMeta = _class(function() {
	this.upper().constructor.apply(this, arguments);
	this.name = '';
	this.displayText = '';
	this.dataSource = null;
	this.placeholder = '';
	var _type = FieldType.none;

	var _methods = {
		init: function(type, name) {
			this.name = name;
			this.type = type;
		},
		getType: function() {
			return _type;
		},
		toHtml: function() {
			switch(_type) {
				case FieldType.email:
				case FieldType.integer:
				case FieldType.number:
				case FieldType.password:
				case FieldType.prependedText:
				case FieldType.appendedText:
				case FieldType.string:
				case FieldType.textArea:
					return this.renderTextInput(_type);
				case FieldType.checkBox:
					return this.renderCheckbox();
				case FieldType.checkBoxList:
					return this.renderCheckboxList();
				case FieldType.radioButton:
					return this.renderRadio();
				case FieldType.radioButtonList:
					return this.renderRadioList();
				case FieldType.select:
					return this.renderSelect();
				case FieldType.multiSelect:
					return this.renderMultiSelect();
			}
		},
		renderRadio: function() {
			return '<input type="radio" ';
		},
		renderRadioList: function() {
		},
		renderCheckbox: function() {
		},
		renderCheckboxList: function() {
		},
		renderTextInput: function() {
		},
		renderSelect: function() {
		},
		renderMultiSelect: function() {
		},
	};
	$.extend(this, _methods);
});

