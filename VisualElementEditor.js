
var VisualElementEditor = _class(function() {
	var _titleFormat = '编辑字段{0}';
	var _tpl = '<div class="visual-element-editor popover fade right" role="tooltip"><div class="arrow"></div><h3 class="popover-title">{0}</h3><div class="popover-content"><form>{1}</form><button type="button" class="btn btn-primary save-element-properties">保存</button></div></div>';
	var _visualElement;

	var _methods = {
		init: function(visualElement) {
			var title, content;
			var this_ = this;
			if (visualElement) {
				_visualElement = visualElement;
				content = this._map(visualElement.getMeta(), function(m) {
					return m.toHtml();
				}).join('');
				title = visualElement.label;
			}
			if (!this.elem) {
				this.elem = $(_tpl.format(_titleFormat.format(title || ''), content || ''));
				this.elem.appendTo($(document.body));
				this.elem.on('click', '.save-element-properties', function() {
					this_.save();
					this_.hide();
					//TODO: let the field-block the remove class 'active'
				});
			} else {
				$('.popover-title', this.elem).text(_titleFormat.format(title || ''));
				$('form', this.elem).html(content || '');
			}
		},
		show: function() {
			this.elem.addClass('in');
		},
		hide: function() {
			this.elem.removeClass('in');
		},
		save: function() {
			var data = {};
			this._each(_visualElement.meta, function(i, m) {
				data[m.name] = $('#' + m.name).val();
			});
			_visualElement.setValueFromEditor(data);
		},
		load: function() {
			var values = _visualElement.getValueForEditor();
			this._each(_visualElement.meta, function(i, m) {
				$('#' + m.name).val(values[m.name]);
			});
		}
	};
	$.extend(this, _methods);
});
VisualElementEditor.inherit(BaseViewModel);
