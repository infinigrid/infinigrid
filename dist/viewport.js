'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require('gl-matrix');

var mat2d = _require.mat2d;

var Viewport = exports.Viewport = function (_React$Component) {
  _inherits(Viewport, _React$Component);

  function Viewport(props) {
    _classCallCheck(this, Viewport);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Viewport).call(this, props));

    _this.state = {
      model: props.model,
      dragging: false,
      x: null,
      y: null,
      width: props.width || window.innerWidth,
      height: props.height || window.innerHeight,
      selection: {
        width: 0,
        height: 0
      }
    };

    _this.handlers = {
      onMouseDown: function onMouseDown(event) {
        // event.preventDefault();
        var x = event.nativeEvent.offsetX;
        var y = event.nativeEvent.offsetY;
        var selecting = event.shiftKey;
        _this.setState({ x: x, y: y, dragging: !selecting, selecting: selecting, selection: { width: 0, height: 0 } });
      },
      onMouseUp: function onMouseUp(event) {
        event.preventDefault();
        var x = event.nativeEvent.offsetX;
        var y = event.nativeEvent.offsetY;
        if (_this.state.selecting) {
          var rect = [_this.state.x, _this.state.y, x, y];
          var viewport = [0, 0, _this.state.width, _this.state.height];
          var model = _this.state.model.fitRectInViewport(rect, viewport);
          _this.setState({ model: model });

          // const dx = (this.state.x + x)/2;
          // const dy = (this.state.y + y)/2;
          // const s  = this.state.height / this.state.selection.height;
          // const transform = mat2d.create();
          // mat2d.mul(transform, [s, 0, 0, s, s*(1-dx) + this.state.width/2, s*(1-dy) + this.state.height/2], this.state.transform);
          // this.setState({ x, y, transform });
        }
        _this.setState({ dragging: false, selecting: false });
      },
      onMouseMove: function onMouseMove(event) {
        event.preventDefault();
        var x = event.nativeEvent.offsetX;
        var y = event.nativeEvent.offsetY;
        if (_this.state.dragging) {
          var dx = x - _this.state.x;
          var dy = y - _this.state.y;
          var model = _this.state.model.pan(dx, dy);
          _this.setState({ x: x, y: y, model: model });
        } else if (_this.state.selecting) {
          // draw box
          _this.setState({ selection: { width: Math.abs(x - _this.state.x), height: Math.abs(y - _this.state.y) } });
        }
      },
      onWheel: function onWheel(event) {
        event.preventDefault();
        var x = event.nativeEvent.offsetX;
        var y = event.nativeEvent.offsetY;
        var sx = 1 - event.deltaX / 160;
        var sy = 1 - event.deltaY / 160;
        var model = void 0;
        if (event.shiftKey) {
          model = _this.state.model.pan(-event.deltaX, -event.deltaY);
        } else model = _this.state.model.zoomToPoint(sy, [x, y]);
        _this.setState({ model: model });
      }
    };

    _this.handleResize = function (event) {
      _this.setState({ width: _this.props.width || window.innerWidth, height: _this.props.height || window.innerHeight });
    };

    return _this;
  }

  _createClass(Viewport, [{
    key: 'selection',
    value: function selection() {
      return this.state.selecting ? React.createElement('rect', _extends({ x: this.state.x, y: this.state.y }, this.state.selection, { stroke: 'rgb(156,36,5)', strokeWidth: '4', fill: 'none' })) : null;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      window.addEventListener('resize', this.handleResize);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.width || nextProps.height) this.setState({ width: this.props.width || window.innerWidth, height: this.props.height || window.innerHeight });else this.setState({ model: nextProps.model });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var width = this.state.width;
      var height = this.state.height;
      var zIndex = this.props.zIndex || 0;
      var model = this.state.model;
      return React.createElement(
        'div',
        _extends({}, this.handlers, { style: { width: width, height: height } }),
        React.Children.map(this.props.children, function (child, i) {
          return React.cloneElement(child, _extends({}, _this2.props, { width: width, height: height, model: model,
            style: { position: 'absolute', zIndex: zIndex - 1 - i, left: 0, top: 0, width: width, height: height } }));
        }),
        React.createElement(
          'svg',
          { width: width, height: height, style: { position: 'absolute', zIndex: zIndex, left: 0, top: 0, width: width, height: height } },
          this.selection()
        )
      );
    }
  }]);

  return Viewport;
}(React.Component);