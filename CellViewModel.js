"use strict";
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
		insertAfter: function(ref) {
			this.container.insertAfter(ref, this);
		},
		insertBefore: function(ref) {
			this.container.insertBefore(ref, this);
		},
		insertAbove: function(ref) {
			this.container.insertAbove(ref, this);
		},
		insertBelow: function(ref) {
			this.container.insertBelow(ref, this);
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
