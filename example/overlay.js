const { Model, View, Viewport } = require('../src');

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
  <text x={x} y={y} fill="white" textAnchor="middle" alignmentBaseline="middle" fontFamily="Hack">{text}</text>

const Grid = ({width, height, transform}) =>
  <g>
    { range(-width, -height, width, height).map( ([q, r, id]) => [id, ...transform([q,r])]).map( ([id, x, y], i) => <Text key={i} x={x} y={y} text={id}/> ) }
  </g>

const Circle = ({cx, cy, r}) =>
  <circle cx={cx} cy={cy} r={r} fill="rgb(166,16,14)" stroke="black"/>

const Path = ({points, transform, size}) =>
  <g>
    <path d={ `M${points.map(transform).map( ([x,y]) => `${x},${y}`).join(' L') }` } fill="none" stroke="black"/>
    { points.map(transform).map( ([cx,cy], key) => <Circle key={key} cx={cx} cy={cy} r={4*size}/> ) }
  </g>

const Overlay = ({width, height, style, model, transform, children, size = model.distanceBetweenCells() / 16 }) =>
  <svg width={width} height={height} style={style}>
    <g strokeWidth={size} fontSize={size} fontFamily="Hack">
      { React.Children.map(children, (child, i) => React.cloneElement(child, { model, transform, size } ) ) }
    </g>
  </svg>




const model = new Model()
  .mapFromArray(2, [
    222,106,218,255,
    222,106,118,255,
    37,203,237,255,
    37,203,137,255,
  ])
  .tap(model => { model.zoomMin = 64; })
  .fitNCellsInViewport(6)
;

render((
  <Viewport model={ model }>
    <Overlay>
      <Path points={[ [-2,-1], [-1, -1], [0,0], [1, 1], [1, 0], [1, -1], [0, -2] ]}/>
      <Grid width={2} height={2}/>
    </Overlay>
    <View/>
  </Viewport>
), document.getElementById("contents"));
