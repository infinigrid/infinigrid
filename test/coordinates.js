import assert from 'assert';

import { to_xy } from '../src/coordinates';

const almostEqualXY = ([x1, y1], [x2, y2], precision, message_opt) =>
  assert(Math.abs(x1 - x2 + y1 - y2) < Number.EPSILON, message_opt);

const K = Math.sqrt(3);

describe('#to_xy', () => {

  const testcase = ([q, r, x, y]) =>
    it(`should return [${x}, ${y}] when the value is [${q}, ${r}]`, () => {
      assert.deepEqual(to_xy([q, r]), [x, y]);
    });

  [ [ 0, 0, 0, 0],
    [ 1, 1, 1, 0],
    [ -1, -1, -1, 0],
    [ 1, 0, 1/2, K/2],
    [ 0, 1, 1/2,-K/2],
  ].forEach(testcase);

});
