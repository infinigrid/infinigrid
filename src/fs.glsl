precision highp float;

varying highp vec2 v_qr;
varying highp vec2 v_xy;

uniform sampler2D u_map;
uniform int u_N;
uniform float u_EDGE;
uniform vec4 u_EDGE_COLOR;

vec4 f(float a, float b, vec2 uvA, vec2 uvB, vec2 uvC) {

  float EDGE = u_EDGE;
  vec4 EDGE_COLOR = u_EDGE_COLOR;

  vec2 uv;
  float c = 1.0 - a - b;
  float ab = abs(a-b);
  float ac = abs(a-c);
  float bc = abs(b-c);
  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
  if (a > b && a > c) {
    if (ab < EDGE || ac < EDGE) color = EDGE_COLOR;
  }
  else if (b > c) {
    if (ab < EDGE || bc < EDGE) color = EDGE_COLOR;
  }
  else if (ac < EDGE || bc < EDGE) color = EDGE_COLOR;

  // a += (snoise2(uvA * float(u_N) + vec2(a,b)) + 0.0) / 5.0;
  c = 1.0 - a - b;
  if (a > b && a > c) {
    uv = uvA;
  }
  else if (b > c) {
    uv = uvB;
  }
  else {
    uv = uvC;
  }

  return color * texture2D(u_map, uv);
}


float modI(float a,float b) {
    float m=a-floor((a+0.5)/b)*b;
    return floor(m+0.5);
}

void main(void) {

  float N = float(u_N);
  vec2 uv = vec2(floor(v_qr.x) / N, floor(v_qr.y) / N);

  float q = fract(v_qr.x);
  float r = fract(v_qr.y);

  float x = modI(gl_FragCoord.x, 2.0);
  float y = modI(gl_FragCoord.y, 2.0);
  float z = max(1.0 - sqrt(v_xy.x * v_xy.x + v_xy.y *v_xy.y) / 4.0, 0.0);

  float amp = y > 0.0 ? 1.0 * z : 1.0 * z;

  if (q - r > 0.0) {
    float a = 1.0 - q;
    float b = q - r;
    float c = 1.0 - a - b;

    gl_FragColor = f(a, b, uv, uv + vec2(1.0/N, 0.0), uv + vec2(1.0/N, 1.0/N));

  }
  else {
    float a = 1.0 - r;
    float d = r - q;
    float c = 1.0 - a - d;
    gl_FragColor = f(a, c, uv, uv + vec2(1.0/N, 1.0/N), uv + vec2(0.0, 1.0/N));
  }

  gl_FragColor.rgb = amp * gl_FragColor.rgb;
}
