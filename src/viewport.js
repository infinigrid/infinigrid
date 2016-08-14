const React = require('react');

const { vec2 } = require('gl-matrix');

export class Viewport extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      model: props.model,
      dragging: false,
      x: null,
      y: null,
      width:  props.width || window.innerWidth,
      height: props.height || window.innerHeight,
      selection: {
        width: 0,
        height: 0,
      }
    };

    this.handlers = {
      onMouseDown: event => {
        // event.preventDefault();
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;
        const selecting = event.shiftKey;
        this.setState({x, y, dragging: !selecting, selecting, selection: { width: 0, height: 0},})
      },
      onMouseUp: event => {
        event.preventDefault();
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;
        if (this.state.selecting) {
          const rect = [this.state.x, this.state.y, x, y];
          const viewport = [0, 0, this.state.width, this.state.height];
          const model = this.state.model.fitRectInViewport(rect, viewport);
          this.setState({model});

          // const dx = (this.state.x + x)/2;
          // const dy = (this.state.y + y)/2;
          // const s  = this.state.height / this.state.selection.height;
          // const transform = mat2d.create();
          // mat2d.mul(transform, [s, 0, 0, s, s*(1-dx) + this.state.width/2, s*(1-dy) + this.state.height/2], this.state.transform);
          // this.setState({ x, y, transform });
        }
        this.setState({dragging: false, selecting: false});
      },
      onMouseMove: event => {
        event.preventDefault();
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;
        if (this.state.dragging) {
          const dx = x - this.state.x;
          const dy = y - this.state.y;
          const model = this.state.model.pan(dx, dy);
          this.setState({x, y, model});
        }
        else if (this.state.selecting) {
          // draw box
          this.setState({selection: {width: Math.abs(x - this.state.x), height: Math.abs(y - this.state.y)}})
        }
      },
      onWheel: event => {
        event.preventDefault();
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;
        const sx = 1 - event.deltaX / 160;
        const sy = 1 - event.deltaY / 160;
        let model;
        if (event.shiftKey) {
          model = this.state.model.pan(-event.deltaX, -event.deltaY);
        }
        else model = this.state.model.zoomToPoint(sy, [x, y]);
        this.setState({model});
      },
    };

    this.handleResize = event => {
      this.setState({width: this.props.width || window.innerWidth, height: this.props.height || window.innerHeight });
    };

  }

  selection() {
    return this.state.selecting ? <rect x={this.state.x} y={this.state.y} { ... this.state.selection } stroke="rgb(156,36,5)" strokeWidth="4" fill="none"/> : null;
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.width || nextProps.height)
      this.setState({width: this.props.width || window.innerWidth, height: this.props.height || window.innerHeight });
    else this.setState({model: nextProps.model})
  }

  render() {
    const width  = this.state.width;
    const height = this.state.height;
    const zIndex = this.props.zIndex || 0;
    const model  = this.state.model;
    const children = this.props.children;
    const transform = point => vec2.transformMat2d([,,], point, model.transform);
    const childProps = i => ({
      width,
      height,
      model,
      transform,
      style: { position: 'absolute', zIndex: zIndex - 1 - i, left: 0, top: 0, width, height},
    });
    return (
      <div { ...this.handlers } style={{width, height}}>
        { React.Children.map(children, (child, i) => React.cloneElement(child, childProps(i))) }
        <svg width={width} height={height} style={{position: 'absolute', zIndex, left: 0, top: 0, width, height}}>
          { this.selection() }
        </svg>
      </div>
    );
  }

}
