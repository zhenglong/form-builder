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
			 * @param {FrameDataViewModel or array of FrameDataViewModel} frame
			 * could be single or plural.
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
						frame.cell.elem.toggleClass(frame.cell.makeCls(
									frame.data.from.y, frame.data.from.x) + ' ' + 
									frame.cell.makeCls(frame.data.to.y, frame.data.to.x));
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
