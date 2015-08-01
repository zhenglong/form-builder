
var HtmlPreviewModal = _class(function() {
	var _modalId = 'output-modal';
	var _outputId = 'output';
	var _init = false;
	this.elem = $('<div class="modal fade" id="{0}"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">预览</h4></div><div class="modal-body"><div id="{1}"></div></div><div class="modal-footer"><button class="btn btn-default" type="button" data-dismiss="modal">关闭</button></div></div></div></div>'.format(_modalId, _outputId));

	var _methods = {
		init: function() {
			if (_init) return;
			_init = true;
			this.elem.appendTo($(document.body));
			$('#' + _modalId).modal();
		},
		show: function() {
			$('#' + _modalId).modal('show');
		},
		hide: function() {
			$('#' + _modalId).modal('hide');
		},
		setOutput: function(html) {
			$('#' + _outputId).html(html);
		}
	};
	$.extend(this, _methods);
});
HtmlPreviewModal.inherit(BaseViewModel);

