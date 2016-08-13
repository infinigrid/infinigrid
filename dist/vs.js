"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "\nattribute highp vec2 a_xy;\nattribute highp vec2 a_qr;\n\nuniform mat3 u_transform;\n\nvarying highp vec2 v_qr;\n\nvoid main(void) {\n  gl_Position = vec4(a_xy, 0.0, 1.0);\n  v_qr = (u_transform * vec3(a_qr, 1.0)).xy;\n}\n";