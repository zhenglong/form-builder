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
	t.init('User');
	field = new FieldMeta();
	field.init(FieldType.string, 'name');
	t.addFields(field);

	field = new FieldMeta();
	field.init(FieldType.string, 'age');
	t.addFields(field);

	field = new FieldMeta();
	field.init(FieldType.string, 'address');
	t.addFields(field);
	tables.push(t);

	fieldToolbar.init(tables);

	var fieldEditor = new VisualElementEditor();
	fieldEditor.init();

	var currentDropTarget;
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
		fieldEditor.init($(e.target).data('__fbld_vm__').getVisualElement());
		fieldEditor.show();
	}).on('click', '.field-remove', function(e) {
		$(e.target).closest('.field-block').data('__fbld_vm__').dismiss();
		e.stopPropagation();
	});
}
$(function() {
	_main();
});
