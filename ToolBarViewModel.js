"use strict";

var ToolBarViewModel = _class(function () {
	this.upper().constructor.apply(this, arguments);
	this.elem = $('<ul class="tool-bar"></ul>');
	this.modal = new HtmlPreviewModal();
	var btnTemplate = '<li class="tool-item {2}"><button id="{0}" class="btn btn-default">{1}</button></li>';
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
				inserting.setPos({x: c.pos.x + c.size.colspan, y: c.pos.y});
				inserting.setSize({colspan: 1, rowspan: c.size.rowspan});
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
				inserting.setPos({x: c.pos.x - 1, y: c.pos.y});
				inserting.setSize({colspan: 1, rowspan: c.size.rowspan});
				inserting.insertBefore(c);
			});
		}
	},{
		id: 'insert-above',
		text: '之上插入一行',
		classes: 'hide',
		click: function() {
			var cells = self._cloneArray(self.grid.getActiveCells()), inserting;
			$.each(cells, function(i, c) {
				inserting = new CellViewModel();
				inserting.init(self.grid);
				inserting.setPos({x: 0, y: c.pos.y});
				inserting.setSize({colspan: GridSize.maxCols, rowspan: 1});
				inserting.insertAbove(c);
			});
		}
	},{
		id: 'insert-below',
		text: '之下插入一行',
		classes: 'hide',
		click: function() {
			var cells = self._cloneArray(self.grid.getActiveCells()), inserting;
			$.each(cells, function(i, c) {
				inserting = new CellViewModel();
				inserting.init(self.grid);
				inserting.setPos({x: 0, y: c.pos.y + c.size.rowspan});
				inserting.setSize({colspan: GridSize.maxCols, rowspan: 1});
				inserting.insertBelow(c);
			});
		}
	},{
		id: 'remove',
		text: '删除',
		classes: 'hide',
		click: function() {
			var cells = self._cloneArray(self.grid.getActiveCells()), inserting;
			var cellsInRange;
			$.each(cells, function(i, c) {
				c.remove();
			});
			var rows = [], start, end, r, isTrue;
			self._each(cells, function(i, c) {
				start = c.pos.y;
				end = c.pos.y + c.size.rowspan;
				while(start < end) {
					rows[start] = 1;
					start++;
				}
			});
			end = null;
			r = rows.length - 1;
			while(r > -1) {
				isTrue = rows[r];
				if (!isTrue && (end === null)) {
					r--;
					continue;
				}

				if (isTrue) {
					cellsInRange = self.grid._findIntersectedCells({
						left: 0, right: GridSize.maxCols,
						top: r, bottom: r + 1
					});
					if (!cellsInRange.length) {
						if (end === null) {
							end = r + 1;
						} else {
							if (r === 0) {
								self.grid.compactCellsUp(end, end - r);
								end = null;
							} else {
								// nothing to do, continue to expand the empty row.
							}
						}
					} else {
						if (end !== null) {
							self.grid.compactCellsUp(end, end - r - 1);
							end = null;
						} else {
							// nothing to do
						}
					}
				} else {
					self.grid.compactCellsUp(end, end - r - 1);
					end = null;
				}
				r--;
			};
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
	}, {
		id: 'preview',
		text: '预览',
		classes: '', // always show
		click: function() {
			self.modal.init();
			self.modal.setOutput(self.grid.toHtml());
			self.modal.show();
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
		_getOuterRect: function(cells) {
			var i, l = 10000, r = 0, t = 10000, b = 0, sum = 0;
			for (i = 0; i < cells.length; i++) {
				sum += cells[i].size.rowspan * cells[i].size.colspan;
				l = Math.min(l, cells[i].pos.x);
				r = Math.max(r, cells[i].pos.x + cells[i].size.colspan);
				t = Math.min(t, cells[i].pos.y);
				b = Math.max(b, cells[i].pos.y + cells[i].size.rowspan);
			}
			return {rect: {left: l, right: r, top: t, bottom: b}, diff: ((r - l) * (b - t) - sum)};
		},
		_isRect: function(cells) {
			var result = this._getOuterRect(cells);
			return result.diff == 0;
		},
		_onActiveCellsChange: function(cells) {
			var isAnySelected = !!cells.length;
			var canSplitV = isAnySelected, canSplitH = isAnySelected, canMerge = true;
			var canInsertAfter = isAnySelected, canInsertBefore = isAnySelected;
			var canInsertAbove = (cells.length == 1) && this.grid.couldInsertNewRowAbove(cells[0]), 
				canInsertBelow = (cells.length == 1) && this.grid.couldInsertNewRowBelow(cells[0]);
			var canDelete = isAnySelected;
			this._each(cells, function(i, c) {
				canSplitH = canSplitH && (c.size.colspan > 1);
				canSplitV = canSplitV && (c.size.rowspan > 1);
			});
			canMerge = (cells.length > 1) && this._isRect(cells);

			this._btnVisible('insert-after', canInsertAfter);
			this._btnVisible('insert-before', canInsertBefore);
			this._btnVisible('insert-above', canInsertAbove);
			this._btnVisible('insert-below', canInsertBelow);
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
