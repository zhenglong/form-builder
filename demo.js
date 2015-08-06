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

	grid.elem.on('click', '.field-block', function(e) {
		fieldEditor.init($(e.srcElement).data('__fbld_vm__').getVisualElement());
		fieldEditor.show();
	}).on('click', '.field-remove', function() {
		$(e.srcElement).data('__fbld_vm__').dismiss();
	});
}
$(function() {
	_main();
});
