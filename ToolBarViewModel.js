"use strict";

var ToolBarViewModel = _class(function () {
	this.upper().constructor.apply(this, arguments);
	this.elem = $('<ul class="tool-bar"></ul>');
	var btnTemplate = '<li class="tool-item {2}"><button id="{0}">{1}</button></li>';
	var self = this;
	var buttons = [{
		id: 'insert-after',
		text: '之后插入',
		classes: 'hide',
		click: function() {
			var cells = self._cloneArray(self.grid.getActiveCells()), inserting;
			$.each(cells, function(i, c) {
				inserting = new CellViewModel();
				inserting.init(self.grid);
				inserting.insertAfter(c);
			});
		}
	},{
		id: 'insert-before',
		text: '之前插入',
		classes: 'hide',
		click: function() {
			var cells = self._cloneArray(self.grid.getActiveCells()), inserting;
			$.each(cells, function(i, c) {
				inserting = new CellViewModel();
				inserting.init(self.grid);
				inserting.insertBefore(c);
			});
		}
	},{
		id: 'remove',
		text: '删除',
		classes: 'hide',
		click: function() {
			var cells = self._cloneArray(self.grid.getActiveCells()), inserting;
			$.each(cells, function(i, c) {
				c.remove();
			});
		}
	},{
		id: 'split-h',
		text: '水平拆分',
		classes: 'hide',
		click: function() {
			var cells = self._cloneArray(self.grid.getActiveCells());
			$.each(cells, function(i, c) {
				c.hSplit(2);
			});
		}
	},{
		id: 'split-v',
		text: '垂直拆分',
		classes: 'hide',
		click: function() {
			var cells = self._cloneArray(self.grid.getActiveCells());
			$.each(cells, function(i, c) {
				c.vSplit(2);
			});
		}
	},{
		id: 'merge',
		text: '合并',
		classes: 'hide',
		click: function() {
			var left = 10000, top = 10000, right = 0, bottom = 0;
			var cells = self._cloneArray(self.grid.getActiveCells());
			self._each(cells, function(i, c) {
				left = Math.min(left, c.pos.x);
				right = Math.max(right, c.pos.x + c.size.colspan);
				top = Math.min(top, c.pos.y);
				bottom = Math.max(bottom, c.pos.y + c.size.rowspan);
			});
			self.grid.merge(left, right, top, bottom);
		}
	}];
	
	var _methods = {
		init: function($container, grid) {

			this.grid = grid;
			this.render();
			this.elem.appendTo($container);
			this._registerEvents();
			this.grid.subscribeActiveCellsChange(this._onActiveCellsChange.bind(this));
		},
		_isRect: function(cells) {
			var i, l = 10000, r = 0, t = 10000, b = 0, sum = 0;
			for (i = 0; i < cells.length; i++) {
				sum += cells[i].size.rowspan * cells[i].size.colspan;
				l = Math.min(l, cells[i].pos.x);
				r = Math.max(r, cells[i].pos.x + cells[i].size.colspan);
				t = Math.min(t, cells[i].pos.y);
				b = Math.max(b, cells[i].pos.y + cells[i].size.rowspan);
			}
			return ((r - l) * (b - t) == sum);
		},
		_onActiveCellsChange: function(cells) {
			var isAnySelected = !!cells.length;
			var canSplitV = isAnySelected, canSplitH = isAnySelected, canMerge = true;
			var canInsertAfter = isAnySelected, canInsertBefore = isAnySelected;
			var canDelete = isAnySelected;
			this._each(cells, function(i, c) {
				canSplitH = canSplitH && (c.size.colspan > 1);
				canSplitV = canSplitV && (c.size.rowspan > 1);
			});
			canMerge = (cells.length > 1) && this._isRect(cells);

			this._btnVisible('insert-after', canInsertAfter);
			this._btnVisible('insert-before', canInsertBefore);
			this._btnVisible('remove', canDelete);
			this._btnVisible('split-v', canSplitV);
			this._btnVisible('split-h', canSplitH);
			this._btnVisible('merge', canMerge);
		},
		_btnVisible: function(id, isShow) {
			$('#' + id).parent()[isShow ? 'removeClass' : 'addClass']('hide');
		},
		_registerEvents: function() {
			this._each(buttons, function(i, btn) {
				$('#' + btn.id).click(btn.click);
			});
		},
		render: function() {
			this.elem.html(this._map(buttons, function(btn) {
				return btnTemplate.format(btn.id, btn.text, btn.classes || '');
			}).join(''));
		}
	};

	$.extend(this, _methods);
});
ToolBarViewModel.inherit(BaseViewModel);
