
var BootstrapRowViewModel = _class(function() {
	this.top = 0;
	this.bottom = 0;
	this.columns = [];

	var _methods = {
		toHtml: function() {
			var totalColumns = 0;
			var result;
			var len = this.columns.length;
			if (len > 1) {
				totalColumns = this.columns[len - 1].right - this.columns[0].left;
				result = this._map(this.columns, function(c) {
					c.colspan = Math.floor((c.right - c.left) * GridSize.maxCols / totalColumns);
					return c.toHtml();
				});
			} else if (len == 1) {
				// could be a single CellViewModel or BootstrapColumnViewModel
				result = [this.columns[0].toHtml()];
			} else {
				result = [];
			}
			return '<div class="row">{0}</div>'.format(result.join(''));
		}
	};
	$.extend(this, _methods);
});
BootstrapRowViewModel.inherit(BaseViewModel);

var BootstrapColumnViewModel = _class(function() {
	this.left = 0;
	this.right = 0;
	this.rows = [];

	var _methods = {
		toHtml: function() {
			var result = this._map(this.rows, function(c) {
				return c.toHtml();
			});
			return '<div class="col-xs-{0}">{1}</div>'.format(this.right - this.left, result.join(''));
		}
	};
	$.extend(this, _methods);
});
BootstrapColumnViewModel.inherit(BaseViewModel);
