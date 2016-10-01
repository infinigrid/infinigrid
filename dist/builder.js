'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('gl-matrix');

var vec2 = _require.vec2;
var mat2d = _require.mat2d;


var K1 = 1 / 2;
var K2 = Math.sqrt(3) / 2;

var Builder = exports.Builder = function () {
  function Builder() {
    _classCallCheck(this, Builder);

    this.borderSize = 0.1;
    this.cells = [];
    this.transform = mat2d.fromValues(K1, -K2, K1, K2, 0, 0);
  }

  _createClass(Builder, [{
    key: 'addCell',
    value: function addCell(cell) {
      this.cells.push(cell);
    }
  }, {
    key: 'build',
    value: function build() {
      var _this = this;

      var N = 1024;
      var startTime = new Date();

      var toVertex = function toVertex(cell) {
        var _vec2$transformMat2d = vec2.transformMat2d([,,], cell, _this.transform);

        var _vec2$transformMat2d2 = _slicedToArray(_vec2$transformMat2d, 2);

        var x = _vec2$transformMat2d2[0];
        var y = _vec2$transformMat2d2[1];

        return { x: x, y: y };
      };

      var cellIndex = this.cells.reduce(function (ind, cell) {
        ind[cell[0] + cell[1] * N] = cell;return ind;
      }, {});

      var neighbours = [[0, -1], [-1, -1], [-1, 0], [0, 1], [1, 1], [1, 0]];
      var vertices = this.cells.map(toVertex);
      var edges = [];
      this.cells.forEach(function (cell) {
        var _cell = _slicedToArray(cell, 2);

        var q = _cell[0];
        var r = _cell[1];


        var lSite = cell;
        edges.push.apply(edges, _toConsumableArray(neighbours.map(function (rSiteDelta, i) {
          var rSite = [q + rSiteDelta[0], rSiteDelta[1]];
          var rSitePrevDelta = neighbours[(i + 5) % 6];
          var rSiteNextDelta = neighbours[(i + 1) % 6];
          var va = toVertex([q + (rSiteDelta[0] + rSitePrevDelta[0]) / 3, r + (rSiteDelta[1] + rSitePrevDelta[1]) / 3]);
          var vb = toVertex([(q + rSite[0] + q + rSiteNextDelta[0]) / 3, (r + rSite[1] + r + rSiteNextDelta[1]) / 3]);
          return { lSite: lSite, rSite: rSite, va: va, vb: vb };
        })));
      });

      console.log(edges);

      var stopTime = new Date();
      var execTime = stopTime.getTime() - startTime.getTime();

      return {
        vertices: vertices,
        edges: edges,
        // cells,
        execTime: execTime

      };
    }
  }]);

  return Builder;
}();