"use strict";

function _main() {
	var grid = new GridViewModel();
	grid.init(3, 4);
	var toolbar = new ToolBarViewModel();
	toolbar.init($(document.body), grid);
	var fieldToolbar = new fieldToolbar();
	var tables = [];
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
