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
