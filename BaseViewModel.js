"use strict";

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
