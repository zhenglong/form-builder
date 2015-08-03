var FieldType = {
	none: 0,
	number: 100,
	integer: 101,
	string: 102,
	email: 103,
	password: 104,
	textArea: 107,
	select: 200,
	radioButton: 202,
	checkBox: 204,
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
	// TODO: name should be only set once in init.
	this.name = '';
	this.displayText = '';
	this.dataSource = null;
	this.placeholder = '';
	this.isMultipleValue = false;
	var _type = FieldType.none;
	// use getVisualElement() when its value is wanted.
	var _visualElement = null;
	var _tpl = '<div class="field-block"><span>{0}</span><i class="close field-remove">&times;</i></div>';
	var _parent = null;

	var _methods = {
		init: function(type, name) {
			this.name = name;
			_type = type;
			_visualElement = DataVisualElement.createFromType(_type, this.isMultipleValue);
		},
		/*
		 *
		 * @param target {CellViewModel}
		 */
		dropIn: function(target) {
			// TODO: need refactor
			if (_parent) throw 'field could be dropped in only one cell';
			if (!this.elem) {
				this.elem = $(_tpl.format(this.name));
				this.elem.data('__fbld_vm__', this);
				_parent = target;
			}
			target.container.movement.push(new FrameDataViewModel(target, RenderType.addField, {
				field: this
			}));
		},
		dismiss: function() {
			target.container.movement.push(new FrameDataViewModel(_parent, RenderType.removeField, {
				field: this
			}));
		},
		getType: function() {
			return _type;
		},
		getVisualElement; function() {
			_visualElement.elementId = this.name;
			_visualElement.elementName = this.name;
			_visualElement.label = this.displayText;
			_visualElement.placeholder = this.placeholder;
		
			// TODO: need refactor here
			_visualElement.dataSource = this.dataSource;
			return result;
		},
		toHtml: function() {
			return this.getVisualElement().toHtml();
		},
		render: function() {
			// nothing to do
		}
	};
	$.extend(this, _methods);
});

