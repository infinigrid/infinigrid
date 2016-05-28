
import React from 'react';

import { ComponentWithHandlers } from './component';

import { Diamond, to_xy } from './coordinates';

import { mat2d, vec2 } from 'gl-matrix';

// RED          #DC4E00
// GREY (dark)  #929487
// GREY         #C7C9BE
// GREY (light) #F4F5ED
// BLUE         #89CEDE

const DiamondComponent = (
  { q,
    r,
    points = Diamond([q, r]),
    m1 = to_xy([q + 1/2, r]),
    m2 = to_xy([q + 1, r + 0.5]),
    m3 = to_xy([q + 1/2, r + 1]),
    m4 = to_xy([q, r + 0.5]),
    c1 = to_xy([q+2/3, r + 1/3]),
    c2 = to_xy([q+1/3, r + 2/3]),
    p1 = points[0],
    p2 = points[2],
    strokeWidth,
  }) =>
  <g>
    { /*
    <polygon points={ points.map( point => point.join(' ') ).join(' ') } fill="none"/>
    <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} strokeWidth={strokeWidth}/>
    */ }
    <line x1={c1[0]} y1={c1[1]} x2={m1[0]} y2={m1[1]} strokeWidth={5*strokeWidth}/>
    <line x1={c1[0]} y1={c1[1]} x2={m2[0]} y2={m2[1]} strokeWidth={5*strokeWidth}/>
    <line x1={c1[0]} y1={c1[1]} x2={c2[0]} y2={c2[1]} strokeWidth={5*strokeWidth}/>
    <line x1={c2[0]} y1={c2[1]} x2={m3[0]} y2={m3[1]} strokeWidth={5*strokeWidth}/>
    <line x1={c2[0]} y1={c2[1]} x2={m4[0]} y2={m4[1]} strokeWidth={5*strokeWidth}/>
    { /*<circle cx={p1[0]} cy={p1[1]} r={20 * strokeWidth} strokeWidth={5*strokeWidth}/> */ }
    { /*points.map( ([x, y]) => <circle cx={x} cy={y} r={10 * strokeWidth} strokeWidth={strokeWidth}/>)*/ }
  </g>

const to_svg_transform = (m) =>
  `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;

function getVisiblePoints(m) {
  return [
    [-3, -3], [-3, -2], [-2, -3],
    [-2, -2], [-2, -1], [-1, -2],
    [-1, -1], [-1, 0], [0, -1],
    [0, 0], [1, 0], [0, 1],
    [1, 1], [1, 2], [2, 1],
    [2, 2], [2, 3], [3, 2],
  ].sort( ([q1, r1], [q2, r2]) => (q1 + r1) - (q2 + r2));
}

export class Infinigrid extends ComponentWithHandlers {

  constructor(props) {
    super(props);
    this.state = {
      transform: mat2d.scale(mat2d.create(),mat2d.create(), [0.8, -0.8]),
    };
  }

  onWheel(event) {
    event.preventDefault();
    const { deltaMode, deltaX, deltaY, deltaZ, shiftKey } = event;
    const s = 1.0 - deltaY / 160;
    const scale = mat2d.scale(mat2d.create(), mat2d.create(), [s, s]);
    const transform = mat2d.mul(scale, scale, this.state.transform);
    this.setState({ transform });
  }

  componentWillUpdate() {
    console.time('update');
  }

  componentDidUpdate() {
    console.timeEnd('update');
    if (this.props.onChange) this.props.onChange({transform: this.state.transform});
  }

  render() {
    const dim = Math.min(this.props.width, this.props.height);
    const strokeWidth = this.props.strokeWidth || 2 / dim;
    const points = getVisiblePoints(this.state.transform);
    const aspectRatio = this.props.width / this.props.height;
    return (
      <svg width={this.props.width}
           height={this.props.height}
           className={this.props.className}
           viewBox={`${-aspectRatio/2} -0.5 ${aspectRatio} 1`} fill="#DC4E00" stroke="#89CEDE"
           style={{
            //  border: '1px solid #C7C9BE',
            //  borderRadius: 30,
           }}
          { ... this.handlers }
          >
        <g transform={to_svg_transform(this.state.transform)}
           strokeWidth={strokeWidth}
           >
          { points.map( ([q, r], i) => <DiamondComponent key={i} q={q} r={r} strokeWidth={strokeWidth}/>) }
        </g>
      </svg>
    );
  }
}
