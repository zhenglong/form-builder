var DataVisualElement = _class(function() {
	this.elementId = '';
	this.elementName = '';
	this.label = '';
	this.placeholder = '';
	this.cssClasses = ['form-control'];
	this.type = FieldType.none;
	this.meta = [];

	var _methods = {
		init: function(fieldType) {
			this.type = fieldType;
		},
		toHtml: function() {
			return '<div class="form-group"><label {1}>{0}</label>{2}</div>'.format(
				this.label, this.elementId ? 'for="{0}"'.format(this.elementId) : '',
				this._renderControl());
		},
		getValueForEditor: function() {
			return {
				'element-in-editor-id': this.elementId,
				'element-in-editor-name': this.elementName,
				'element-in-editor-label': this.label,
				'element-in-editor-placeholder': this.placeholder,
				'element-in-editor-style': this.cssClasses.join(' ')
			};
		},
		setValueFromEditor: function(data) {
			this.elementId = data['element-in-editor-id'];
			this.elementName = data['element-in-editor-name'];
			this.label = data['element-in-editor-label'];
			this.placeholder = data['element-in-editor-placeholder'];
			this.cssClasses = data['element-in-editor-style'].split(' ');
		},
		_initMeta: function() {
			var field = new FieldMeta(FieldType.string, 'element-in-editor-id');
			field.displayText = 'Id';
			field.placeholder = '输入Id';
			this.meta.push(field);
			field = new FieldMeta(FieldType.string, 'element-in-editor-name');
			field.displayText = 'Name';
			field.placeholder = '输入Name';
			this.meta.push(field);
			field = new FieldMeta(FieldType.string, 'element-in-editor-label');
			field.displayText = 'Label';
			field.placeholder = '输入Label';
			this.meta.push(field);
			field = new FieldMeta(FieldType.string, 'element-in-editor-placeholder');
			field.displayText = 'Placeholder';
			field.placeholder = '输入Placeholder';
			this.meta.push(field);
			field = new FieldMeta(FieldType.string, 'element-in-editor-style');
			field.displayText = 'Style';
			field.placeholder = '输入Style';
			this.meta.push(field);
		},
		_renderControl: function() {
			throw 'not implemented';
		}
	};
	$.extend(this, _methods);
});
DataVisualElement.createFromType = function(fieldType, isMultiple) {
	var result = null;
	isMultiple = !!isMultiple;
	switch(fieldType) {
		case FieldType.checkBox:
			result = new CheckboxVisualElement();
			result.init(isMultiple);
			break;
		case FieldType.radioButton:
			result = new RadioVisualElement();
			result.init(isMultiple);
			break;
		case FieldType.email:
		case FieldType.integer:
		case FieldType.number:
		case FieldType.password:
		case FieldType.string:
		case FieldType.textArea:
			result = new TextInputVisualElement();
			result.init(fieldType);
			break;
		case FieldType.select:
			result = new SelectVisualElement();
			result.init(isMultiple);
			break;
	}

	return result;
};

var TextInputVisualElement = _class(function() {
	var _type = {};
	_type[FieldType.email] = 'email';
	_type[FieldType.integer] = 'number';
	_type[FieldType.number] = 'number';
	_type[FieldType.password] = 'password';
	_type[FieldType.string] = 'text';
	//FieldType.textArea
	
	this.appendedAddon = '';
	this.prependedAddon = '';

	var _methods = {
		init: function(fieldType) {
			this.upper().init(fieldType);
		},
		_renderControl: function() {
			if (this.appendedAddon || this.prependedAddon) {
				return '<div class="form-group">{0}{1}{2}</div>'.format(
					this.prependedAddon ? '<div class="input-group-addon">{0}</div>'.format(this.prependedAddon) : '', 
					this._renderInput(),
					this.appendedAddon ? '<div class="input-group-addon">{0}</div>'.format(this.appendedAddon) : '');
			} else {
				return this._renderInput();
			}
		},
		_renderInput: function() {
			if (this.type in _type) {
				return '<input type="{0}" placeholder="{3}" {1} {2}  class="{4}" />'.format(
					_type[this.type], this.elementId ? 'id="{0}"'.format(this.elementId) : '', 
					this.elementName ? 'name="{0}"'.format(this.elementName) : '', 
					this.placeholder, this.cssClasses.join(' '));
			} else {
				switch(this.type) {
					case FieldType.textArea:
						return '<textarea placeholder="{2}" {0} {1} class="{3}"></textarea>'.format(
							this.elementId ? 'id="{0}"'.format(this.elementId) : '', 
							this.elementName ? 'name="{0}"'.format(this.elementName) : '', 
							this.placeholder, this.cssClasses.join(' '));
				}
			}
		}
	};
	$.extend(this, _methods);
});
TextInputVisualElement.inherit(DataVisualElement);

var RadioVisualElement = _class(function() {
	var _isMultiple = false;
	this.dataSource = null;

	var _methods = {
		init: function(isMultiple) {
			this.upper().init(FieldType.radioButton);
			_isMultiple = isMultiple;
		},
		toHtml: function() {
		}
	};
	$.extend(this, _methods);
});
RadioVisualElement.inherit(DataVisualElement);

var CheckboxVisualElement = _class(function() {
	var _isMultiple = false;
	this.dataSource = null;
	var _methods = {
		init: function(isMultiple) {
			this.upper().init(FieldType.radioButton);
			_isMultiple = isMultiple;
		},
		toHtml: function() {
		}
	};
	$.extend(this, _methods);
});
CheckboxVisualElement.inherit(DataVisualElement);

var SelectVisualElement = _class(function() {
	var _isMultiple = false;
	this.dataSource = null;
	var _methods = {
		init: function(isMultiple) {
			this.upper().init(FieldType.select);
			_isMultiple = isMultiple;
		},
		_renderControl: function() {
		}
	};
	$.extend(this, _methods);
});
SelectVisualElement.inherit(DataVisualElement);
