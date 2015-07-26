"use strict";

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
