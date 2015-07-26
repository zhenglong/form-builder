"use strict";

function _main() {
	var grid = new GridViewModel();
	grid.init(3, 4);
	var toolbar = new ToolBarViewModel();
	toolbar.init($(document.body), grid);
}
$(function() {
	_main();
});
