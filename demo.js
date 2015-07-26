"use strict";

if (!String.prototype.format) {
	String.prototype.format = function() {
		var fmt = this;
		var params = Array.prototype.slice.call(arguments);
		return fmt.replace(/(\{(\d+)\})/g, function(match, firstCap, index) {
			return params[index] || match;
		});
	};
}

function _class(cls) {
	var result = function() {
		!this.hasOwnProperty('upper') && (this.upper = function() {
			return result.prototype;
		});
		cls.apply(this, arguments);
	};
	result.inherit = function(_super) {
		// _super must be made by _class
		this.prototype = new _super();
		return this;
	};
	return result;
}

var UniqueKey = (function() {
	var id = 1;
	return function() {
		return id++;
	}
})();

function BaseViewModel() {
	this._id = UniqueKey();
	this.elem = null;
	this._invalidated = true;
	var _methods = {
		makeCls: function(row, col, w, h) {
			var cls = [];
			if (row !== null && row !== undefined) row = row + 1;
			if (col !== null && col !== undefined) col = col + 1;
			if (row && col) {
				cls.push('cell-{0}-{1}'.format(row, col));
			} 
			if (w && h) {
				cls.push('size-{0}-{1}'.format(w, h));
			}  
			return cls.join(' ');
		},
		_grep: function(arr, cb) {
			var result = [];
			this._each(arr, function(i, item) {
				if (cb(item)) result.push(item);
			});
			return result;
		},
		_sum: function(arr, getter) {
			var result = 0;
			this._each(arr, function(i, item) {
				result += parseFloat(getter(item));
			});
			return result;
		},
		_map: function(arr, cb) {
			var result = [];
			this._each(arr, function(i, item) {
				result.push(cb(item));
			});
			return result;
		},
		_each: function(arr, cb) {
			var i = 0, len = arr.length, res;
			while (i < len) {
				res = cb(i, arr[i]);
				if (res === false) break;
				i++;
			}
		},
		_cloneArray: function(arr) {
			var result = [];
			$.each(arr, function(i, item) {
				result.push(item);
			});
			return result;
		},
		_any: function(arr, cb) {
			var result = false;
			this._each(arr, function(i, item) {
				if (cb(item)) {
					result = true;
					return false;
				}
			});
			return result;
		},
		render: function() {
			this._invalidated = false;
		},
		toString: function() {
			return this._id + '';
		}
	};
	$.extend(this, _methods);
}
var CellViewModel = _class(function () {
	this.upper().constructor.apply(this, arguments);
	this.elem = $('<div class="builder-block"></div>');
	this.size = {
		rowspan: 1,
		colspan: 1	
	};
	this.pos = {
		x: 0,
		y: 0
	};
	var _defaults = {
		backgroundColor:'#ccc',
		activeClass: 'active'
	};
	var self = this;
	var _methods = {
		init: function(container) {
			this.container = container;
			this._registerEvents();
		},
		clone: function() {
			var copiedProperties = {
				deep: ['size', 'pos'],
				nonDeep: []
			};
			var result = new CellViewModel();
			result.init(this.container);
			var this_ = this;
			this._each(copiedProperties.deep, function(i, prop) {
				result[prop] = $.extend(true, {}, this_[prop]);
			});
			this._each(copiedProperties.nonDeep, function(i, prop) {
				result[prop] = this[prop];
			});
			result._invalidated = true;
			return result;
		},
		_registerEvents: function() {
			this.elem.on('drop', function(e) {
				console.log('drop on me');
			}).on('click', function(e) {
				$(this).toggleClass('active');
				self.container.onCellActiveChange({cell:self, isActive:self.isActive()});
			});
		},
		isInRow: function(r) {
			return (r >= this.pos.y) && (r < (this.pos.y + this.size.rowspan));
		},
		isInColumn: function(col) {
			return (col >= this.pos.x) && (col < (this.pos.x + this.size.colspan));
		},
		setPos: function(pos) {
			this.elem.removeClass(this.makeCls(this.pos.y, this.pos.x));
			this.pos.x = pos.x;
			this.pos.y = pos.y;
			this._invalidated = true;
		},
		setSize: function(size) {
			this.elem.removeClass(this.makeCls(null, null, this.size.colspan, this.size.rowspan));
			this.size.rowspan = size.rowspan;
			this.size.colspan = size.colspan;
			this._invalidated = true;
		},
		setRowSpan: function(v) {
			this.size.rowspan = v;
			this._invalidated = true;
		},
		setColSpan: function(v) {
			this.size.colspan = v;
			this._invalidated = true;
		},
		setPosX: function(v) {
			this.pos.x = v;
			this._invalidated = true;
		},
		setPosY: function(v) {
			this.pos.y = v;
			this._invalidated = true;
		},
		insertAfter: function(cell) {
			this.size.rowspan = cell.size.rowspan;
			this.size.colspan = cell.size.colspan;
			this.pos.x = cell.pos.x + 1;
			this.pos.y = cell.pos.y;
			this.container.insert(cell);
		},
		insertBefore: function(cell) {
			this.size.rowspan = cell.size.rowspan;
			this.size.colspan = cell.size.colspan;
			this.pos.x = cell.pos.x - 1;
			this.pos.y = cell.pos.y;
			this.container.insert(cell);
		},
		insertAbove: function(cell) {
			this.size.rowspan = cell.size.rowspan;
			this.size.colspan = cell.size.colspan;
			this.pos.x = cell.pos.x;
			this.pos.y = cell.pos.y - 1;
			this.container.insert(cell);
		},
		insertBottom: function(cell) {
			this.size.rowspan = cell.size.rowspan;
			this.size.colspan = cell.size.colspan;
			this.pos.x = cell.pos.x;
			this.pos.y = cell.pos.y + 1;
			this.container.insert(cell);
		},
		remove: function() {
			this.container.remove(this);
		},
		vSplit: function(count) {
			this.container.vSplit(this, count);
		},
		hSplit: function(count) {
			this.container.hSplit(this, count);
		},
		isActive: function() {
			return this.elem.hasClass(_defaults.activeClass);
		},
		render: function() {
			if (this._invalidated) {
				// paint its internal DOM element
				this.elem.addClass(this.makeCls(this.pos.y, this.pos.x, this.size.colspan, this.size.rowspan));
			}
			this.upper().render.apply(this, arguments);
		}
	};
	$.extend(this, _methods);
});
CellViewModel.inherit(BaseViewModel);
var GridViewModel = _class(function() {
	this.upper().constructor.apply(this, arguments);
	var _maxRows = 12;
	var _maxCols = 12;
	this.cells = [];
	this._activeCells = [];
	this.elem = $('<div class="builder"></div>');
	this.spacing = {
		v: _makeSpacing(_maxRows, _maxCols),
		h: _makeSpacing(_maxCols, _maxRows)
	};
	this.movement = new Movement();
	this.movement.init();
	var _defaults = {
		backgroundColor: ''
	};
	var _activeCellsChangeCallback = [];
	function _makeSpacing(num, defaultSpacing) {
		var result = [];
		var i = num - 1;
		while (i--) result.push(defaultSpacing);
		return result;
	}
	var _methods = {
		init: function(col, row) {
			var i, j, c, frames = [];
			var rowspan = Math.floor(_maxRows/row),
				colspan = Math.floor(_maxCols/col);
			frames.push(new FrameDataViewModel(this, RenderType.insert, {parent:$(document.body)}));
			if (!row) row = 1;
			if (!col) col = 1;

			for(i = 0; i < col; i++) {
				for(j = 0; j < row; j++) {
					c = new CellViewModel(this);
					c.init(this);
					c.setSize({rowspan: rowspan, colspan: colspan});
					c.setPos({x: i*colspan, y: j*rowspan});
					this.insert(c);
					frames.push(this._getInsertFrame(c));
				}
			}
			this.render();
			this.movement.push(frames);
		},
		/**
		 *
		 * @param {object} data - {cell:CellViewModel, isActive: boolean}
		 *
		 */
		onCellActiveChange: function(data) {
			var this_ = this;
			if (!data.isActive) this._activeCells.splice(this._activeCells.indexOf(data.cell), 1);
			else this._activeCells.push(data.cell);
			this._each(_activeCellsChangeCallback, function(i, cb) {
				cb(this_._activeCells);
			});
		},
		subscribeActiveCellsChange: function(cb) {
			_activeCellsChangeCallback.push(cb);
		},
		getActiveCells: function() {
			//return this._grep(this.cells, function(i, c) {
			//	return c.isActive();
			//});
			return this._activeCells;
		},
		merge: function(left, right, top, bottom) {
			/* the cell should be in the area wholly */
			var cells = this._findCellsInRange({left:left, top:top, width:right-left,height:bottom-top});
			var new_ = new CellViewModel();
			new_.init(this);
			new_.setPos({x:left, y:top});
			new_.setSize({colspan:right - left, rowspan:bottom - top});
			this.replace(cells, new_);
		},
		replace: function(olds, new_) {
			var this_ = this, frames = [];
			this._each(olds, function(i, c) {
				this_.cells.splice(this_.cells.indexOf(c), 1);
				frames.push(new FrameDataViewModel(c, RenderType.delete));
			});
			this.cells.push(new_);
			frames.push(this._getInsertFrame(new_));
			this.movement.push(frames);
			this._cleanUpActiveCells(olds);
		},
		_cleanUpActiveCells: function(olds) {
			var this_ = this;
			if (olds.length) {
				this._each(olds, function(i, o) {
					this_._activeCells.splice(this_._activeCells.indexOf(o), 1);
				});
			} else {
				this._activeCells.splice(this._activeCells.indexOf(olds), 1);
			}
		},
		vSplit: function(cell, n) {
			var i = 0, cells = [], temp, frames = [new FrameDataViewModel(cell, RenderType.delete)];
			var newRowSpan = Math.floor(cell.size.rowspan / n);
			var extra = cell.size.rowspan % n;
			while (i < n) {
				temp = cell.clone();
				temp.setRowSpan(newRowSpan + ((i == (n - 1)) ? extra : 0));
				temp.setPosY(cell.pos.y + i * newRowSpan);
				cells.push(temp);
				frames.push(this._getInsertFrame(temp));
				i++;
			}
			cells.unshift(1);
			cells.unshift(this.cells.indexOf(cell));
			this.cells.splice.apply(this.cells, cells);
			this.render();
			this.movement.push(frames);
			this._cleanUpActiveCells(cell);
		},
		hSplit: function(cell, n) {
			var i = 0, cells = [], temp, frames = [new FrameDataViewModel(cell, RenderType.delete)];
			var newColSpan = Math.floor(cell.size.colspan / n);
			var extra = cell.size.colspan % n;
			while (i < n) {
				temp = cell.clone();
				temp.setColSpan(newColSpan + ((i == (n - 1)) ? extra : 0));
				temp.setPosX(cell.pos.x + i * newColSpan);
				cells.push(temp);
				frames.push(this._getInsertFrame(temp));
				i++;
			}
			cells.unshift(1);
			cells.unshift(this.cells.indexOf(cell));
			this.cells.splice.apply(this.cells, cells);
			this.render();
			this.movement.push(frames);
			this._cleanUpActiveCells(cell);
		},
		_getInsertFrame: function(cell) {
			cell.render();
			return new FrameDataViewModel(cell, RenderType.insert, {parent:this.elem});
		},
		insert: function(cell) {
			// TODO: check whether there is enough space for the cell
			/* normalize the cell's pos and size by row and col */
			var start, end, cells, sum;
			this.cells.push(cell);
			start = cell.pos.y, end = cell.pos.y + cell.size.rowspan;
			while (start < end) {/* for each row */
				cells = this._grep(this.cells, function(c) {
					return c.isInRow(start);
				});
				sum = this._sum(cells, function(c) {
					return c.size.colspan;
				});
				if (sum > this.spacing.h[start]) throw ('row spaceing is run out:' + start);
				this._adjustRow(cells);
				start++;
			}
			start = cell.pos.x, end = cell.pos.x + cell.size.colspan;
			while (start < end) { /* for each col */
				cells = this._grep(this.cells, function(c) {
					return c.isInColumn(start);
				});
				sum = this._sum(cells, function(c) {
					return c.size.rowspan;
				});
				if (sum > this.spacing.v[start]) throw ('column spacing is run out:' + start);
				this._adjustColumn(cells);
				start++;
			}
		},
		remove: function(cell) {
			this.cells.splice(this.cells.indexOf(cell), 1);
			this.movement.push(new FrameDataViewModel(cell, RenderType.delete));
			this._compactCells({left:cell.pos.x + cell.size.colspan, top:cell.pos.y, 
				width: _maxCols - cell.pos.x - cell.size.colspan, height: cell.size.rowspan}, cell.size);
			this._cleanUpActiveCells(cell);
		},
		findLeftAdjacencies: function(cell) {
			function _pointInSegment(pos, cell) {
				return(pos.y >= cell.pos.y) && (pos.y < (cell.pos.y + cell.size.rowspan));
			}
			return this._grep(this.cells, function(c) {
				return ((c.pos.x + c.size.colspan) == cell.pos.x) && (_pointInSegment(c.pos, cell) || _pointInSegment(cell.pos, c));
			});
		},
		_compactCells: function(range, offset) {
			// move left
			var frames = [];
			var cells = this._findCellsInRange(range);
			var i = 0;
			var leftAdjacencies;
			var this_ = this;
			var depends = {};
			var movingCells = [];
			var stickingCells = [];
			var prop;
			while (i < cells.length) {
				leftAdjacencies = this.findLeftAdjacencies(cells[i]);
				if (!leftAdjacencies.length) {
					for(prop in depends) {
						depends[prop].splice(depends[prop].indexOf(cells[i]), 1);
					}
					movingCells.push(cells[i]);
					cells.splice(i, 1);
				} else if (this._any(leftAdjacencies, function(adjacency) {
						return ((cells.indexOf(adjacency) < 0) && (movingCells.indexOf(adjacency) < 0)) || (stickingCells.indexOf(adjacency) > -1);
					})) {
					this_._each(Object.getOwnPropertyNames(depends), function(k, prop) {
						if (depends[prop].indexOf(cells[i]) > -1) {
							stickingCells.push($.grep(cells, function(c1) {
								return c1._id == prop;
							})[0]);
							delete depends[prop];
						}
					});
					stickingCells.push(cells[i]);
					cells.splice(i, 1);
				} else {
					depends[cells[i]] = leftAdjacencies;
					i++;
				}
			}
			var continued = true;
			var temp;
			while (continued) {
				continued = false;
				this._each(Object.getOwnPropertyNames(depends), function(i, prop) {
					depends[prop] = this_._grep(depends[prop], function(c) {
						return movingCells.indexOf(c) < 0;
					});
				});
				this._each(Object.getOwnPropertyNames(depends), function(i, prop) {
					if (!depends[prop].length) {
						// removes the key from cells
						temp = $.grep(cells, function(c) {
							return c._id == prop;
						})[0];
						this_._each(Object.getOwnPropertyNames(depends), function(j, prop1) {
							depends[prop1].splice(depends[prop1].indexOf(temp), 1);
						});
						delete depends[prop];
						movingCells.push(temp);
						cells.splice(cells.indexOf(temp), 1);
						continued = true;
					}
				});
			}
			cells = movingCells;
			var this_ = this;
			this._each(cells, function(i, cell) {
				// compute the moving offset individually
				var rightMostCell = this_._findRightMost({left:0, right:cell.pos.x - offset.colspan, 
					top:cell.pos.y, bottom:cell.pos.y + cell.size.rowspan});
				var newX = rightMostCell ? (rightMostCell.pos.x + rightMostCell.size.colspan) : 0;
				frames.push(new FrameDataViewModel(cell, RenderType.move, 
						{from: {x: cell.pos.x, y: cell.pos.y}, to: {x: newX, y: cell.pos.y}}));
				cell.setPosX(newX);
			});
			//if (!cells.length) {
			//	// move up
			//	range.top = range.top + range.height;
			//	range.height = _maxRows - range.top;
			//	cells = this._findCellsInRange(range);
			//	this._each(cells, function(i, cell) {
			//		frames.push(new FrameDataViewModel(cell, RenderType.move,
			//				{from: {x:cell.pos.x, y:cell.pos.y}, to: {x: cell.pos.x, y: cell.pos.y - offset.rowspan}}));
			//		cell.setPosY(cell.pos.y - offset.rowspan);
			//	});
			//}
			this.movement.push(frames);
		},
		/*
		 * find the right most cell which has intersection with the rect
		 *
		 * @param {Object} rect:
		 *	left, right, top, bottom
		 *
		 */
		_findRightMost: function(rect) {
			function _isRectIntersect(rect1, rect2) {
				return (Math.max(rect1.left, rect2.left) < Math.min(rect1.right, rect2.right)) &&
					(Math.max(rect1.top, rect2.top) < Math.min(rect1.bottom, rect2.bottom));
			}
			var result;
			this._each(this.cells, function(i, c) {
				if (_isRectIntersect({left:c.pos.x, right:c.pos.x+c.size.colspan, top:c.pos.y, bottom:c.pos.y+c.size.rowspan}, rect) && 
					(!result || ((result.pos.x + result.size.colspan) < (c.pos.x + c.size.colspan)))) {
					result = c;
				}
			});
			return result;
		},
		_findCellsInRange: function(range) {
			function _isPointInRange(point, range) {
				return (point.x >= range.left && point.x <= (range.left + range.width)) && 
					(point.y >= range.top && point.y <= (range.top + range.height));
			}
			return this._grep(this.cells, function(cell) {
				return _isPointInRange(cell.pos, range) && 
					_isPointInRange({x: cell.pos.x + cell.size.colspan, y: cell.pos.y + cell.size.rowspan}, range);
			});
		},
		_adjustRow: function(cells, newSum) {
			this._each(cells, function(i, cell) {
			});
		},
		_adjustColumn: function(cells, newSum) {
		},
		render: function() {
			if (this._invalidated) {
				// paint the internal DOM element
			}
			this._each(this.cells, function(i, c) {
				c.render();
			});
			this.upper().render.apply(this, arguments);
		}
	};
	$.extend(this, _methods);
});
GridViewModel.inherit(BaseViewModel);
(function() {
	var onEachFrame;
	if (window.webkitRequestAnimationFrame) {
		onEachFrame = function(cb) {
			var _cb = function() { cb(); webkitRequestAnimationFrame(_cb); }
			_cb();
		};
	} else if (window.mozRequestAnimationFrame) {
		onEachFrame = function(cb) {
			var _cb = function() { cb(); mozRequestAnimationFrame(_cb); }
			_cb();
		};
	} else {
		onEachFrame = function(cb) {
			setInterval(cb, 1000 / 60);
		}
	}
	window.onEachFrame = onEachFrame;
})();
var Movement = _class(function () {
	this._queue = [];
	this._running = false;
	this.init = function() {
		var _methods = {
			/*
			 * frame: could be single or plural.
			 */
			push: function(frames) {
				if (frames.length) this._queue.push.apply(this._queue, frames);
				else this._queue.push(frames);
				this.start();
			},
			start: function() {
				if (this._running) return;
				this._running = true;
				window.onEachFrame(this._doJob.bind(this));
			},
			_doJob: function() {
				if (!this._hasAny()) {
					this._running = false;
					return;
				}
				var frame = this._fetchFrame();
				switch(frame.type) {
					case RenderType.insert:
						frame.cell.elem.appendTo(frame.data.parent);
						break;
					case RenderType.move:
						frame.cell.elem.toggleClass(frame.cell.makeCls(frame.data.from.y, frame.data.from.x) + ' ' + frame.cell.makeCls(frame.data.to.y, frame.data.to.x));
						break;
					case RenderType.delete:
						frame.cell.elem.remove();
				}
			},
			_hasAny: function() {
				return !!this._queue.length;
			},
			_fetchFrame: function() {
				return this._queue.shift();
			}
		};
		$.extend(this, _methods);
	};
});
/*
 *
 * data's strcture
 * for move: {from:null, to:null}
 * for insert: {parent:null, after:null}
 *
 */
function FrameDataViewModel(cell, type, data) {
	this.cell = cell;
	this.data = data;
	this.type = type;
}
var RenderType = {
	insert: 1,
	delete: 10,
	move: 20 
};

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

function _main() {
	var grid = new GridViewModel();
	grid.init(3, 4);
	var toolbar = new ToolBarViewModel();
	toolbar.init($(document.body), grid);
}
$(function() {
	_main();
});
