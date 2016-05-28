const K1 = 1 / 2;
const K2 = Math.sqrt(3) / 2;
const K3 = K1;
const K4 = -K2;

// K1 K3 × q = x
// K2 K4   r   y

export const to_xy = ([q, r]) =>
  [ K1 * q + K3 * r, K2 * q + K4 * r ];

export const Diamond = ([q, r]) =>
  [ to_xy([    q,     r]),
    to_xy([1 + q,     r]),
    to_xy([1 + q, 1 + r]),
    to_xy([    q, 1 + r]),
  ];
