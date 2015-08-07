
var FieldToolbar = _class(function() {
	var _tpl = '<ul class="field-toolbar">{0}</ul>';
	var _tableTpl = '<li class="table-block"><div class="table-header">{0}</div><ul class="table-fields">{1}</ul></li>';
	var _fieldTpl = '<li draggable="true" data-table-id="{2}" data-field-id="{1}">{0}</li>';
	this.tables = null;

	var _methods = {
		init: function(tables) {
			var this_ = this;
			this.tables = tables;
			this.render();
			this.elem.appendTo($(document.body));
		},
		render: function() {
			var this_ = this;
			this.elem = $(_tpl.format(this._map(this.tables, function(t) {
				return _tableTpl.format(t.name, this_._map(t.fields, function(f) {
					return _fieldTpl.format(f.name, f._id, t._id);
				}).join(''));
			}).join('')));
		}
	};
	$.extend(this, _methods);
});
FieldToolbar.inherit(BaseViewModel);
