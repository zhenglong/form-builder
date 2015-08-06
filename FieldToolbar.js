
var FieldToolbar = _class(function() {
	var _tpl = '<ul class="field-toolbar">{0}</ul>';
	var _tableTpl = '<li class="table-block"><div class="table-header">{0}</div><ul class="table-fields">{1}</ul></li>';
	var _fieldTpl = '<li draggable="true">{0}</li>';
	var _tables = null;

	var _methods = {
		init: function(tables) {
			_tables = tables;
			this.render();
			this.elem.appendTo($(document.body));
		},
		render: function() {
			var this_ = this;
			this.elem = $(_tpl.format(this._map(_tables, function(t) {
				return _tableTpl.format(t.name, this_._map(t.fields, function(f) {
					return _fieldTpl.format(f.name);
				}).join(''));
			}).join('')));
		}
	};
	$.extend(this, _methods);
});
FieldToolbar.inherit(BaseViewModel);
