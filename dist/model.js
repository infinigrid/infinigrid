'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.windowViewport = windowViewport;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('gl-matrix');

var vec2 = _require.vec2;
var mat2d = _require.mat2d;


var K = Math.sqrt(3);

function visible(qr, transform, viewport) {
  var _vec2$transformMat2d = vec2.transformMat2d([,,], qr, transform);

  var _vec2$transformMat2d2 = _slicedToArray(_vec2$transformMat2d, 2);

  var x = _vec2$transformMat2d2[0];
  var y = _vec2$transformMat2d2[1];

  console.log(x, y);

  var _viewport = _slicedToArray(viewport, 4);

  var left = _viewport[0];
  var top = _viewport[1];
  var width = _viewport[2];
  var height = _viewport[3];

  console.log(left, top, width, height);
  return x >= left && x < left + width && y >= top && y < top + height;
}

function _distanceBetweenCells(transform) {
  var _vec2$transformMat2d3 = vec2.transformMat2d([,,], [0, 0], transform);

  var _vec2$transformMat2d4 = _slicedToArray(_vec2$transformMat2d3, 2);

  var x1 = _vec2$transformMat2d4[0];
  var y1 = _vec2$transformMat2d4[1];

  var _vec2$transformMat2d5 = vec2.transformMat2d([,,], [1, 1], transform);

  var _vec2$transformMat2d6 = _slicedToArray(_vec2$transformMat2d5, 2);

  var x2 = _vec2$transformMat2d6[0];
  var y2 = _vec2$transformMat2d6[1];

  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function windowViewport() {
  return [0, 0, window.innerWidth, window.innerHeight];
}

var Model = exports.Model = function () {
  function Model() {
    _classCallCheck(this, Model);
  }

  _createClass(Model, [{
    key: 'tap',
    value: function tap(cb) {
      var o = Object.assign(new Model(), this);
      cb(o);
      return o;
    }
  }, {
    key: 'distanceBetweenCells',
    value: function distanceBetweenCells() {
      return _distanceBetweenCells(this.transform);
    }
  }, {
    key: 'randomizeMap',
    value: function randomizeMap(N) {
      var data = new Uint8Array(N * N * 4);
      for (var i = 0; i < N * N; ++i) {
        data[i * 4 + 0] = 255 * Math.random();
        data[i * 4 + 1] = 255 * Math.random();
        data[i * 4 + 2] = 255 * Math.random();
        data[i * 4 + 3] = 255;
      }
      var map = { width: N, height: N, N: N, data: data };
      return Object.assign(new Model(), this, { map: map });
    }
  }, {
    key: 'mapFromArray',
    value: function mapFromArray(N, data) {
      var map = {
        N: N,
        width: N,
        height: N,
        data: new Uint8Array(data)
      };
      return Object.assign(new Model(), this, { map: map });
    }
  }, {
    key: 'mapFromImage',
    value: function mapFromImage(width, height, image) {
      var sw = image.width;
      var sh = image.height;
      var canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      var g = canvas.getContext('2d');
      g.drawImage(image, 0, 0);
      var pixels = g.getImageData(0, 0, sw, sh);
      var data = new Uint8Array(width * height * 4);

      var N = Math.floor(width / 2);
      var M = Math.floor(height / 2);
      var K0 = sw / height;
      var K1 = K0 / Math.sqrt(3);
      var K2 = -K0;

      for (var r = -height / 2; r < height / 2; ++r) {
        for (var q = -width / 2; q < width / 2; ++q) {
          var x = Math.floor((q + r) * K1 + sw / 2);
          var y = Math.floor((q - r) * K2 + sh / 2);

          if (q < 0 && q - r < -width / 2) {

            var qqq = q;
            var rrr = -height + r;
            x = Math.floor((qqq + rrr) * K1 + sw / 2);
            y = Math.floor((qqq - rrr) * K2 + sh / 2);
          }
          if (r < 0 && r - q < -height / 2) {

            var _qqq = -width + q;
            x = Math.floor((_qqq + r) * K1 + sw / 2);
            y = Math.floor((_qqq - r) * K2 + sh / 2);
          }
          var xx = x;
          var yy = y;
          var qq = (q + width) % width;
          var rr = (r + height) % height;
          var qr = (qq + rr * width) * 4;
          var xy = (xx + yy * sw) * 4;

          // if (x < 0 || x > pixels.width || y < 0 || y > pixels.height)
          // console.log(q, r, x, y);
          // console.log(qq, rr, xx, yy);

          var cr = pixels.data[xy + 0];
          var cg = pixels.data[xy + 1];
          var cb = pixels.data[xy + 2];

          // if (q == 0 || r == 0) cr = cg = cb = 255;
          data[qr + 0] = cr;
          data[qr + 1] = cg;
          data[qr + 2] = cb;
          data[qr + 3] = 255;
        }
      }

      // for (let r = height/2;r < 3*height/4;++r) {
      //   for (let q = width/4;q < width/2;++q) {
      //
      //     const x =  Math.floor( (q + r) * K1 + sw / 2);
      //     const y =  Math.floor( (q - r) * K2 + sh / 2);
      //     const xy = (x + y * sw) * 4;
      //
      //     // if (x < 0 || x > pixels.width || y < 0 || y > pixels.height)
      //     // console.log(q, r, x, y);
      //     // console.log(qq, rr, xx, yy);
      //
      //     let cr = pixels.data[xy + 0];
      //     let cg = pixels.data[xy + 1];
      //     let cb = pixels.data[xy + 2];
      //
      //
      //     const qr = (q + r * width) * 4;
      //     data[qr+0] = cr;
      //     data[qr+1] = cg;
      //     data[qr+2] = cb;
      //     data[qr+3] = 255;
      //   }
      // }
      // for (let r = height/4;r < height/2;++r) {
      //   for (let q = width/2;q < 3*width/4;++q) {
      //
      //     const x =  Math.floor( (q + r) * K1 + sw / 2);
      //     const y =  Math.floor( (q - r) * K2 + sh / 2);
      //     const xy = (x + y * sw) * 4;
      //
      //     // if (x < 0 || x > pixels.width || y < 0 || y > pixels.height)
      //     // console.log(q, r, x, y);
      //     // console.log(qq, rr, xx, yy);
      //
      //     let cr = pixels.data[xy + 0];
      //     let cg = pixels.data[xy + 1];
      //     let cb = pixels.data[xy + 2];
      //
      //
      //     const qr = (q + r * width) * 4;
      //     data[qr+0] = cr;
      //     data[qr+1] = cg;
      //     data[qr+2] = cb ;
      //     data[qr+3] = 255;
      //   }
      // }
      var map = { width: width, height: height, data: data };
      return Object.assign(new Model(), this, { map: map });
    }
  }, {
    key: 'fitNCellsInViewport',
    value: function fitNCellsInViewport(N) {
      var viewport = arguments.length <= 1 || arguments[1] === undefined ? windowViewport() : arguments[1];

      var _viewport2 = _slicedToArray(viewport, 4);

      var w = _viewport2[2];
      var h = _viewport2[3];

      var K = Math.sqrt(3);
      var transform = mat2d.fromValues(h / (K * N), -h / N, h / (K * N), h / N, w / 2, h / 2);
      return Object.assign(new Model(), this, { transform: transform });
    }
  }, {
    key: 'fitCellInViewport',
    value: function fitCellInViewport(cell) {
      var viewport = arguments.length <= 1 || arguments[1] === undefined ? windowViewport() : arguments[1];

      var _cell = _slicedToArray(cell, 2);

      var q = _cell[0];
      var r = _cell[1];

      return this.fitNCellsInViewport(2, viewport);
    }
  }, {
    key: 'fitMapInViewport',
    value: function fitMapInViewport() {
      var viewport = arguments.length <= 0 || arguments[0] === undefined ? windowViewport() : arguments[0];

      return this.fitNCellsInViewport(this.map.width, viewport);
    }
  }, {
    key: 'centerOnCell',
    value: function centerOnCell(cell) {
      var viewport = arguments.length <= 1 || arguments[1] === undefined ? windowViewport() : arguments[1];
    }
  }, {
    key: 'fitRectInViewport',
    value: function fitRectInViewport(rect, viewport) {
      var _rect = _slicedToArray(rect, 4);

      var x1 = _rect[0];
      var y1 = _rect[1];
      var x2 = _rect[2];
      var y2 = _rect[3];

      var _viewport3 = _slicedToArray(viewport, 4);

      var w = _viewport3[2];
      var h = _viewport3[3];

      var dx = (x1 + x2) / 2;
      var dy = (y1 + y2) / 2;
      var s = h / (y2 - y1);
      var transform = mat2d.mul(mat2d.create(), [s, 0, 0, s, s * (1 - dx) + w / 2, s * (1 - dy) + h / 2], this.transform);
      return Object.assign(new Model(), this, { transform: transform });
    }
  }, {
    key: 'zoomToPoint',
    value: function zoomToPoint(zoom, point) {
      var s = zoom;

      var _point = _slicedToArray(point, 2);

      var x = _point[0];
      var y = _point[1];

      var transform = mat2d.create();
      mat2d.mul(transform, [1, 0, 0, 1, -x, -y], this.transform);
      mat2d.mul(transform, [s, 0, 0, s, 0, 0], transform);
      mat2d.mul(transform, [1, 0, 0, 1, x, y], transform);

      return Object.assign(new Model(), this, { transform: this.zoomStrategy(transform) });
    }
  }, {
    key: 'pan',
    value: function pan(dx, dy) {
      var transform = mat2d.create();
      mat2d.mul(transform, [1, 0, 0, 1, dx, dy], this.transform);
      return Object.assign(new Model(), this, { transform: transform });
    }
  }, {
    key: 'gridSizeStrategy',
    get: function get() {
      return this._gridSizeStrategy.bind(this);
    },
    set: function set(strategy) {
      var _this = this;

      this._gridSizeStrategy = function () {
        return strategy(_this.distanceBetweenCells());
      };
    }
  }, {
    key: 'gridColorStrategy',
    get: function get() {
      return this._gridColorStrategy.bind(this);
    },
    set: function set(strategy) {
      var _this2 = this;

      this._gridSizeStrategy = function () {
        return strategy(_this2.distanceBetweenCells());
      };
    }
  }, {
    key: 'zoomStrategy',
    get: function get() {
      return this._zoomStrategy.bind(this);
    },
    set: function set(strategy) {
      var _this3 = this;

      this._zoomStrategy = function (newTransform) {
        return strategy(_this3.distanceBetweenCells(), _this3.transform, newTransform);
      };
    }
  }]);

  return Model;
}();

// Defaults

Model.prototype.transform = mat2d.create();
Model.prototype.map = null; //{width: 1, height: 1, data: new Uint8Array([0, 0, 0, 255])};

Model.prototype.repeat = 'repeat'; // 'repeat', 'repeat-q', 'repeat-s', 'none'

// Grid
Model.prototype.gridSize = 0.05;
Model.prototype.gridColor = [1.0, 1.0, 1.0];
Model.prototype.gridMin = 16.0;
Model.prototype.gridMax = 64.0;
Model.prototype._gridSizeStrategy = function () {
  return this.gridSize;
};
Model.prototype._gridColorStrategy = function () {
  var d = _distanceBetweenCells(this.transform);
  var alpha = Math.min(Math.max(1.0 - (d - this.gridMin) / (this.gridMax - this.gridMin), 0.0), 1.0);
  return [].concat(_toConsumableArray(this.gridColor), [alpha]); //.slice(0,3).concat(alpha);
};

// Zoom
Model.prototype.zoomMin = 1; // Cells will be at least one pixel apart
Model.prototype.zoomMax = 1024; // Cells will at most be 1024 pixels apart
Model.prototype._zoomStrategy = function (newTransform) {
  var d = _distanceBetweenCells(newTransform);
  if (d < this.zoomMin || d > this.zoomMax) return this.transform;else return newTransform;
};