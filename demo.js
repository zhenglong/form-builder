"use strict";

function _main() {
	var grid = new GridViewModel();
	grid.init(3, 4);
	var toolbar = new ToolBarViewModel();
	toolbar.init($(document.body), grid);
	var fieldToolbar = new FieldToolbar();
	var tables = [];
	var t = new TableMeta();
	var field;
	t.init('widgets');
	field = new FieldMeta();
	field.init(FieldType.string, 'string');
	t.addFields(field);

	field = new FieldMeta();
	field.init(FieldType.password, 'password');
	t.addFields(field);

	field = new FieldMeta();
	field.init(FieldType.textArea, 'textArea');
	t.addFields(field);

	field = new FieldMeta();
	field.init(FieldType.select, 'select');
	t.addFields(field);

	field = new FieldMeta();
	field.init(FieldType.radioButton, 'radioButton');
	t.addFields(field);

	field = new FieldMeta();
	field.init(FieldType.checkBox, 'checkBox');
	t.addFields(field);

	//field = new FieldMeta();
	//field.init(FieldType.select, 'select');
	//t.addFields(field);
	tables.push(t);
	fieldToolbar.init(tables);

	var fieldEditor = new VisualElementEditor();
	fieldEditor.init();

	var currentDropTarget;
	var currentFieldEditor;
	var currentFieldEditorTriger;
	grid.elem.on('dragover', '.builder-block', function(e) {
			e.preventDefault();
		}).on('dragenter', '.builder-block', function(e) {
			currentDropTarget = $(this).data('__fbld_vm__');
			e.preventDefault();
		});


	fieldToolbar.elem.on('dragend', '[draggable="true"]', function(e) {
		var $this = $(this), tableId = $this.data('table-id'), fieldId = $this.data('field-id');
		var dummy = new BaseViewModel();
		var field = dummy._grep(dummy._grep(fieldToolbar.tables, function(t) {
			return t._id == tableId;
		})[0].fields, function(f) {
			return f._id == fieldId;
		})[0];
		field.dropIn(currentDropTarget);
	});
	grid.elem.on('click', '.field-block', function(e) {
		fieldEditor.init($(this).data('__fbld_vm__').getVisualElement());
		fieldEditor.load();
		fieldEditor.show();
		currentFieldEditor = fieldEditor;
		currentFieldEditorTriger = e.target;
	}).on('click', '.field-remove', function(e) {
		$(e.target).closest('.field-block').data('__fbld_vm__').dismiss();

		if (currentFieldEditor) {
			currentFieldEditor.hide();
			currentFieldEditor = null;
			currentFieldEditorTriger = null;
		}
		e.stopPropagation();
	});
	fieldEditor.elem.on('click', function(e) {
		currentFieldEditorTriger = e.target;
	});
	$(document).on('click', function(e) {
		if (e.target != currentFieldEditorTriger && currentFieldEditor) {
			currentFieldEditor.hide();
			currentFieldEditor = null;
			currentFieldEditorTriger = null;
		}
	});
}
$(function() {
	_main();
});
