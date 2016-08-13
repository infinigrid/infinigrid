'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require('gl-matrix');

var vec2 = _require.vec2;
var mat2d = _require.mat2d;
var mat3 = _require.mat3;


var vs = require('./vs').default;
var fs = require('./fs').default;

function compileShader(gl, type, source) {

  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function buildProgram(gl, vertexShaderSource, fragmentShaderSource) {
  var fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  var vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  return program;
}

function buildBuffer(gl, target, usage, data) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, new Float32Array(data), usage);
  return buffer;
}

var View = exports.View = function (_React$Component) {
  _inherits(View, _React$Component);

  function View() {
    _classCallCheck(this, View);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(View).apply(this, arguments));
  }

  _createClass(View, [{
    key: 'init',
    value: function init(w, h) {
      var canvas = this.canvas;
      var gl = canvas.getContext("webgl");

      if (!gl) return;

      var devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = "" + w + "px";
      canvas.style.height = "" + h + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);

      var vertexAttributes = buildBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, [
      // x, y, q, r
      -1, 1, 0, 0, 1, 1, 1, 0, 1, -1, 1, 1,
      // x, y, q, r
      -1, 1, 0, 0, 1, -1, 1, 1, -1, -1, 0, 1]);

      var shaderProgram = buildProgram(gl, vs, fs);
      gl.useProgram(shaderProgram);

      var xy = gl.getAttribLocation(shaderProgram, "a_xy");
      gl.enableVertexAttribArray(xy);

      var qr = gl.getAttribLocation(shaderProgram, "a_qr");
      gl.enableVertexAttribArray(qr);

      if (this.texture) {
        gl.deleteTexture(this.texture);
        delete this.texture;
        delete this.map;
      }
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_map"), 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexAttributes);
      gl.vertexAttribPointer(xy, 2, gl.FLOAT, false, 4 * 4, 0);
      gl.vertexAttribPointer(qr, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

      gl.clearColor(0.5, 0.5, 0.5, 1.0);

      this.shaderProgram = shaderProgram;
    }
  }, {
    key: 'update',
    value: function update(width, height, _ref) {
      var transform = _ref.transform;
      var map = _ref.map;
      var gridColorStrategy = _ref.gridColorStrategy;
      var gridSizeStrategy = _ref.gridSizeStrategy;

      var gl = this.canvas.getContext("webgl");
      if (!gl) return;

      var m = mat2d.create();
      mat2d.invert(m, transform);
      var t = mat3.fromMat2d(mat3.create(), m);
      mat3.scale(t, t, [width, height, 1]);

      gl.uniformMatrix3fv(gl.getUniformLocation(this.shaderProgram, "u_transform"), false, t);

      var _vec2$transformMat2d = vec2.transformMat2d([,,], [0, 0], transform);

      var _vec2$transformMat2d2 = _slicedToArray(_vec2$transformMat2d, 2);

      var x1 = _vec2$transformMat2d2[0];
      var y1 = _vec2$transformMat2d2[1];

      var _vec2$transformMat2d3 = vec2.transformMat2d([,,], [1, 1], transform);

      var _vec2$transformMat2d4 = _slicedToArray(_vec2$transformMat2d3, 2);

      var x2 = _vec2$transformMat2d4[0];
      var y2 = _vec2$transformMat2d4[1];

      var d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

      gl.uniform4f.apply(gl, [gl.getUniformLocation(this.shaderProgram, "u_EDGE_COLOR")].concat(_toConsumableArray(gridColorStrategy())));
      gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "u_EDGE"), gridSizeStrategy());

      if (!map) return;
      if (map != this.map) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, map.width, map.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, map.data);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "u_N"), map.width);
        this.map = map;
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      return false;
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.width != this.props.width || nextProps.height != this.props.height) {
        this.init(nextProps.width, nextProps.height);
        this.update(nextProps.width, nextProps.height, nextProps.model);
      } else {
        this.update(this.props.width, this.props.height, nextProps.model);
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.setupWebGLStateAndResources = function () {
        _this2.init(_this2.props.width, _this2.props.height);
        _this2.update(_this2.props.width, _this2.props.height, _this2.props.model);
      };

      this.canvas.addEventListener("webglcontextlost", function (event) {
        event.preventDefault();
      }, false);

      this.canvas.addEventListener("webglcontextrestored", this.setupWebGLStateAndResources, false);

      this.setupWebGLStateAndResources();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return React.createElement('canvas', { ref: function ref(canvas) {
          return _this3.canvas = canvas;
        }, width: this.props.width, height: this.props.height, style: this.props.style });
    }
  }]);

  return View;
}(React.Component);