
var FieldToolbar = _class(function() {
	var _tpl = '<ul class="field-toolbar">{0}</ul>';
	var _tableTpl = '<li class="table-block"><div class="table-header">{0}</div><ul class="table-fields">{1}</ul></li>';
	var _tables = null;

	var _methods = {
		init: function(tables) {
			_tables = tables;
		}
	};
	$.extend(this, _methods);
});
FieldToolbar.inherit(BaseViewModel);
