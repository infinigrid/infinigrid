const { Model, View, Viewport } = require('..');

const React      = require('react');
const { render } = require('react-dom');

const range = (q0,r0,q1,r1) =>
  {
    const points = [];
    for (let r = r0;r < r1;++r) {
      for (let q = q0;q <q1;++q) {
        points.push([q, r, `${q},${r}`]);
      }
    }
    return points;
  }

const Text = ({x, y, text}) =>
  <text x={x} y={y} fill="white" textAnchor="middle" alignmentBaseline="middle">{text}</text>

const Grid = ({points, transform}) =>
  <g>
    { points.map( ([q, r, id]) => [id, ...transform([q,r])]).map( ([id, x, y], i) => <Text key={i} x={x} y={y} text={id}/> ) }
  </g>

const Circle = ({cx, cy, r}) =>
  <circle cx={cx} cy={cy} r={r} fill="rgb(166,16,14)"/>

const Path = ({points, transform, size}) =>
  <g fill="none" stroke="black">
    <path d={ `M${points.map(transform).map( ([x,y]) => `${x},${y}`).join(' L') }` }/>
    { points.map(transform).map( ([cx,cy], key) => <Circle key={key} cx={cx} cy={cy} r={4*size}/> ) }
  </g>

const Overlay = ({
  width,
  height,
  style,
  model,
  transform,
  size = model.distanceBetweenCells() / 16,
  children,
  childProps = { transform, size },
}) =>
  <svg width={width} height={height} style={style}>
    <g strokeWidth={size} fontSize={size}>
      { React.Children.map(children, (child, i) => React.cloneElement(child, childProps) ) }
    </g>
  </svg>


const model = new Model()
  .mapFromArray(2, [
    222,106,218,255,
    222,106,118,255,
    37,203,237,255,
    37,203,137,255,
  ])
  // .tap(model => { model.zoomMin = 64; })
  .fitNCellsInViewport(6)
;

render((
  <Viewport model={ model }>
    <Overlay>
      <Path points={[ [-2,-1], [-1, -1], [0,0], [1, 1], [1, 0], [1, -1], [0, -2] ]}/>
      <Grid points={range(-2, -2, 2, 2)}/>
    </Overlay>
    <View/>
  </Viewport>
), document.getElementById("contents"));
