const React = require('react');

const { vec2, mat2d, mat3 } = require('gl-matrix');

const vs = require('./vs').default;
const fs = require('./fs').default;

function compileShader(gl, type, source) {

  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function buildProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const vertexShader   = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }

  return program;
}

function buildBuffer(gl, target, usage, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, new Float32Array(data), usage);
  return buffer;
}

export class View extends React.Component {

  init(w, h) {
    const canvas = this.canvas;
    const gl = canvas.getContext("webgl");

    if (!gl) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width  = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width  = "" + w + "px";
    canvas.style.height = "" + h + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);

    const vertexAttributes = buildBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, [
    // x, y, q, r
      -1, 1, 0, 0,
       1, 1, 1, 0,
       1,-1, 1, 1,
    // x, y, q, r
      -1, 1, 0, 0,
       1,-1, 1, 1,
      -1,-1, 0, 1,
    ]);


    const shaderProgram = buildProgram(gl, vs, fs);
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
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_map"), 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexAttributes);
    gl.vertexAttribPointer(xy,  2, gl.FLOAT, false, 4 * 4, 0);
    gl.vertexAttribPointer(qr,  2, gl.FLOAT, false, 4 * 4, 2 * 4);

    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    this.shaderProgram = shaderProgram;
  }

  update(width, height, {transform, map, gridColorStrategy, gridSizeStrategy}) {
    const gl = this.canvas.getContext("webgl");
    if (!gl) return;

    const m = mat2d.create();
    mat2d.invert(m, transform);
    const t = mat3.fromMat2d(mat3.create(), m);
    mat3.scale(t, t, [width, height, 1]);

    gl.uniformMatrix3fv(gl.getUniformLocation(this.shaderProgram, "u_transform"), false, t);

    const [x1, y1] = vec2.transformMat2d([,,], [0, 0], transform);
    const [x2, y2] = vec2.transformMat2d([,,], [1, 1], transform);
    const d = Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));

    gl.uniform4f(gl.getUniformLocation(this.shaderProgram, "u_EDGE_COLOR"), ... gridColorStrategy() );
    gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "u_EDGE"), gridSizeStrategy());

    if (!map) return;
    if (map != this.map) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, map.width, map.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, map.data);
      gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "u_N"), map.width);
      this.map = map;
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.width != this.props.width || nextProps.height != this.props.height) {
      this.init(nextProps.width, nextProps.height);
      this.update(nextProps.width, nextProps.height, nextProps.model);
    }
    else {
      this.update(this.props.width, this.props.height, nextProps.model);
    }
  }

  componentDidMount() {

    this.setupWebGLStateAndResources = () => {
      this.init(this.props.width, this.props.height);
      this.update(this.props.width, this.props.height, this.props.model);
    };

    this.canvas.addEventListener("webglcontextlost", event => {
        event.preventDefault();
    }, false);

    this.canvas.addEventListener("webglcontextrestored", this.setupWebGLStateAndResources, false);

    this.setupWebGLStateAndResources();

  }

  render() {
    return <canvas ref={canvas => this.canvas = canvas } width={this.props.width} height={this.props.height} style={this.props.style}/>;
  }

}
