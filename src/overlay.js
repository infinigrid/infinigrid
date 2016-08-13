const do_transform = (transform) =>
  (point) => vec2.transformMat2d(mat2d.create(), point, transform);

const Circle = ({q, r, transform, ...args}) => {
  const [cx, cy ] = do_transform(transform)([q, r]);
  return <circle cx={cx} cy={cy} r="5" { ...args }/>;
};

// const Line = ({q1, r1, q2, r2, ...args}) => {
//   const [x1, y1] = qr2xy([q1, r1]);
//   const [x2, y2] = qr2xy([q2, r2]);
//   return <line { ... {x1, y1, x2, y2, ...args} }/>
// };

const vec2str = (v, sep=',') =>
  `${v[0]},${v[1]}`;

const Polygon = ({transform, points, ...args}) =>
  <polygon points={ points.map( do_transform(transform) ).map( vec2str ).join(' ') } { ...args }/>;

const corners = [
  [ 1/3, -1/3],
  [ 2/3,  1/3],
  [ 1/3,  2/3],
  [-1/3,  1/3],
  [-2/3, -1/3],
  [-1/3, -2/3],
];
const points = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
  [-1, 0],
  [0, -1],
  [-1, -1],
];

const mat2svg = (t) =>
  `matrix(${t[0]},${t[1]},${t[2]},${t[3]},${t[4]},${t[5]})`;

const K = 1/Math.sqrt(3);
const qr_transform = (w, h) =>
  [ h * K/2, -h/2, h * K/2, h/2, w/2, h/2 ];

const Image = ({width, height, transform, style}) => {
  const t = mat2d.mul(mat2d.create(), transform, qr_transform(width, height));
  return <svg width={width} height={height} style={style}>
    <g vectorEffect="non-scaling-stroke">
      <Polygon transform={t} points={ corners } stroke="blue" fill="none"/>
      { corners.map( ([q, r], i) => <Circle key={i} transform={t} q={q} r={r} fill="blue" /> ) }
      { points.map( ([q, r], i)  => <Circle key={i} transform={t} q={q} r={r} fill="red"  /> ) }
    </g>
  </svg>
};
