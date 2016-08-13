'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var do_transform = function do_transform(transform) {
  return function (point) {
    return vec2.transformMat2d(mat2d.create(), point, transform);
  };
};

var Circle = function Circle(_ref) {
  var q = _ref.q;
  var r = _ref.r;
  var transform = _ref.transform;

  var args = _objectWithoutProperties(_ref, ['q', 'r', 'transform']);

  var _do_transform = do_transform(transform)([q, r]);

  var _do_transform2 = _slicedToArray(_do_transform, 2);

  var cx = _do_transform2[0];
  var cy = _do_transform2[1];

  return React.createElement('circle', _extends({ cx: cx, cy: cy, r: '5' }, args));
};

// const Line = ({q1, r1, q2, r2, ...args}) => {
//   const [x1, y1] = qr2xy([q1, r1]);
//   const [x2, y2] = qr2xy([q2, r2]);
//   return <line { ... {x1, y1, x2, y2, ...args} }/>
// };

var vec2str = function vec2str(v) {
  var sep = arguments.length <= 1 || arguments[1] === undefined ? ',' : arguments[1];
  return v[0] + ',' + v[1];
};

var Polygon = function Polygon(_ref2) {
  var transform = _ref2.transform;
  var points = _ref2.points;

  var args = _objectWithoutProperties(_ref2, ['transform', 'points']);

  return React.createElement('polygon', _extends({ points: points.map(do_transform(transform)).map(vec2str).join(' ') }, args));
};

var corners = [[1 / 3, -1 / 3], [2 / 3, 1 / 3], [1 / 3, 2 / 3], [-1 / 3, 1 / 3], [-2 / 3, -1 / 3], [-1 / 3, -2 / 3]];
var points = [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [-1, -1]];

var mat2svg = function mat2svg(t) {
  return 'matrix(' + t[0] + ',' + t[1] + ',' + t[2] + ',' + t[3] + ',' + t[4] + ',' + t[5] + ')';
};

var K = 1 / Math.sqrt(3);
var qr_transform = function qr_transform(w, h) {
  return [h * K / 2, -h / 2, h * K / 2, h / 2, w / 2, h / 2];
};

var Image = function Image(_ref3) {
  var width = _ref3.width;
  var height = _ref3.height;
  var transform = _ref3.transform;
  var style = _ref3.style;

  var t = mat2d.mul(mat2d.create(), transform, qr_transform(width, height));
  return React.createElement(
    'svg',
    { width: width, height: height, style: style },
    React.createElement(
      'g',
      { vectorEffect: 'non-scaling-stroke' },
      React.createElement(Polygon, { transform: t, points: corners, stroke: 'blue', fill: 'none' }),
      corners.map(function (_ref4, i) {
        var _ref5 = _slicedToArray(_ref4, 2);

        var q = _ref5[0];
        var r = _ref5[1];
        return React.createElement(Circle, { key: i, transform: t, q: q, r: r, fill: 'blue' });
      }),
      points.map(function (_ref6, i) {
        var _ref7 = _slicedToArray(_ref6, 2);

        var q = _ref7[0];
        var r = _ref7[1];
        return React.createElement(Circle, { key: i, transform: t, q: q, r: r, fill: 'red' });
      })
    )
  );
};