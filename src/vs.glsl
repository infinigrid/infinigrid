attribute highp vec2 a_xy;
attribute highp vec2 a_qr;

uniform mat3 u_transform;

varying highp vec2 v_qr;
varying highp vec2 v_xy;

void main(void) {
  gl_Position = vec4(a_xy, 0.0, 1.0);
  v_qr = (u_transform * vec3(a_qr, 1.0)).xy;
  v_xy = a_xy;
}
