const { vec2, mat2d } = require('gl-matrix');

const K = Math.sqrt(3);

function visible(qr, transform, viewport) {
  const [x, y] = vec2.transformMat2d([,,], qr, transform);
  console.log(x,y);
  const [left, top, width, height] = viewport;
  console.log(left, top, width, height);
  return x >= left && x < left + width && y >= top && y < top + height;
}

function distanceBetweenCells(transform) {
  const [x1, y1] = vec2.transformMat2d([,,], [0, 0], transform);
  const [x2, y2] = vec2.transformMat2d([,,], [1, 1], transform);
  return Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}


export class Model {

  tap(cb) {
    cb(this);
    return this;
  }

  get gridSizeStrategy() {
    return this._gridSizeStrategy.bind(this);
  }

  set gridSizeStrategy(strategy) {
    this._gridSizeStrategy = () => strategy(this.distanceBetweenCells());
  }

  get gridColorStrategy() {
    return this._gridColorStrategy.bind(this);
  }

  set gridColorStrategy(strategy) {
    this._gridSizeStrategy = () => strategy(this.distanceBetweenCells());
  }

  get zoomStrategy() {
    return this._zoomStrategy.bind(this);
  }

  set zoomStrategy(strategy) {
    this._zoomStrategy = (newTransform) => strategy(this.distanceBetweenCells(), this.transform, newTransform);
  }

  distanceBetweenCells() {
    distanceBetweenCells(this.transform);
  }

  randomizeMap(width, height = width) {
    const data = new Uint8Array(width * height * 4);
    window.crypto.getRandomValues(data);
    for (let i = 0;i < width * height;++i) data[i * 4 + 3] = 255;
    const map = {width, height, data};
    return Object.assign(new Model(), this, {map});
  }

  mapFromImage(width, height, image) {
    const sw = image.width;
    const sh = image.height;
    const canvas = document.createElement('canvas');
    canvas.width  = sw;
    canvas.height = sh;
    const g = canvas.getContext('2d');
    g.drawImage(image, 0, 0);
    const pixels = g.getImageData(0, 0, sw, sh);
    const data = new Uint8Array(width * height * 4);


    const N = Math.floor(width / 2);
    const M = Math.floor(height / 2);
    const K0 = sw/height;
    const K1 =  K0 / Math.sqrt(3);
    const K2 = -K0;

    for (let r = -height/2;r < height/2;++r) {
      for (let q = -width/2;q < width/2;++q) {
        let x =  Math.floor( (q + r) * K1 + sw / 2);
        let y =  Math.floor( (q - r) * K2 + sh / 2);

        if (q < 0 && q-r < -width/2) {

          const qqq = q;
          const rrr = -height + r;
          x =  Math.floor( (qqq + rrr) * K1 + sw / 2);
          y =  Math.floor( (qqq - rrr) * K2 + sh / 2);

        }
        if (r < 0 && r-q < -height/2) {

          const qqq = -width + q;
          x =  Math.floor( (qqq + r) * K1 + sw / 2);
          y =  Math.floor( (qqq - r) * K2 + sh / 2);
        }
        let xx = x;
        let yy = y;
        const qq = (q + width) % width;
        const rr = (r + height) % height;
        const qr = (qq + rr * width) * 4;
        const xy = (xx + yy * sw) * 4;

        // if (x < 0 || x > pixels.width || y < 0 || y > pixels.height)
        // console.log(q, r, x, y);
        // console.log(qq, rr, xx, yy);

        let cr = pixels.data[xy + 0];
        let cg = pixels.data[xy + 1];
        let cb = pixels.data[xy + 2];

        // if (q == 0 || r == 0) cr = cg = cb = 255;
        data[qr + 0] = cr;
        data[qr + 1] = cg;
        data[qr + 2] = cb;
        data[qr + 3] = 255;
      }
    }

    // for (let r = height/2;r < 3*height/4;++r) {
    //   for (let q = width/4;q < width/2;++q) {
    //
    //     const x =  Math.floor( (q + r) * K1 + sw / 2);
    //     const y =  Math.floor( (q - r) * K2 + sh / 2);
    //     const xy = (x + y * sw) * 4;
    //
    //     // if (x < 0 || x > pixels.width || y < 0 || y > pixels.height)
    //     // console.log(q, r, x, y);
    //     // console.log(qq, rr, xx, yy);
    //
    //     let cr = pixels.data[xy + 0];
    //     let cg = pixels.data[xy + 1];
    //     let cb = pixels.data[xy + 2];
    //
    //
    //     const qr = (q + r * width) * 4;
    //     data[qr+0] = cr;
    //     data[qr+1] = cg;
    //     data[qr+2] = cb;
    //     data[qr+3] = 255;
    //   }
    // }
    // for (let r = height/4;r < height/2;++r) {
    //   for (let q = width/2;q < 3*width/4;++q) {
    //
    //     const x =  Math.floor( (q + r) * K1 + sw / 2);
    //     const y =  Math.floor( (q - r) * K2 + sh / 2);
    //     const xy = (x + y * sw) * 4;
    //
    //     // if (x < 0 || x > pixels.width || y < 0 || y > pixels.height)
    //     // console.log(q, r, x, y);
    //     // console.log(qq, rr, xx, yy);
    //
    //     let cr = pixels.data[xy + 0];
    //     let cg = pixels.data[xy + 1];
    //     let cb = pixels.data[xy + 2];
    //
    //
    //     const qr = (q + r * width) * 4;
    //     data[qr+0] = cr;
    //     data[qr+1] = cg;
    //     data[qr+2] = cb ;
    //     data[qr+3] = 255;
    //   }
    // }
    const map = {width, height, data};
    return Object.assign(new Model(), this, { map });
  }

  fitNCellsInViewport(N, viewport) {
    const [ , , w, h] = viewport;
    const K = Math.sqrt(3);
    const transform = mat2d.fromValues(
      h / (K*N), -h / N,
      h / (K*N),  h / N,
      w / 2,      h / 2
    );
    return Object.assign(new Model(), this, {transform});
  }

  fitCellInViewport(cell, viewport) {
    const [q, r] = cell;
    return this.fitNCellsInViewport(2, viewport);
  }

  fitMapInViewport(viewport) {
    return this.fitNCellsInViewport(this.map.width, viewport);
  }

  centerOnCell(cell, viewport) {
  }

  fitRectInViewport(rect,  viewport) {
    const [x1, y1, x2, y2] = rect;
    const [ , , w, h] = viewport;
    const dx = (x1 + x2)/2;
    const dy = (y1 + y2)/2;
    const s  = h / (y2 - y1);
    const transform = mat2d.mul(mat2d.create(),
      [s, 0, 0, s, s*(1-dx) + w/2, s*(1-dy) + h/2], this.transform);
    return Object.assign(new Model(), this, {transform});
  }

  zoomToPoint(zoom, point) {
    const s = zoom;
    const [x, y] = point;
    const transform = mat2d.create();
    mat2d.mul(transform, [1, 0, 0, 1,-x,-y], this.transform);
    mat2d.mul(transform, [s, 0, 0, s, 0, 0], transform);
    mat2d.mul(transform, [1, 0, 0, 1,x,y], transform);

    return Object.assign(new Model(), this, {transform: this.zoomStrategy(transform) });
  }

  pan(dx, dy) {
    const transform = mat2d.create();
    mat2d.mul(transform, [1, 0, 0, 1, dx, dy], this.transform);
    return Object.assign(new Model(), this, {transform});
  }

}

// Defaults

Model.prototype.transform = mat2d.create();
Model.prototype.map       = null; //{width: 1, height: 1, data: new Uint8Array([0, 0, 0, 255])};

// Grid
Model.prototype.gridSize  = 0.05;
Model.prototype.gridColor = [1.0, 1.0, 1.0];
Model.prototype.gridMin   = 16.0;
Model.prototype.gridMax   = 64.0;
Model.prototype._gridSizeStrategy  = function () {
  return this.gridSize;
};
Model.prototype._gridColorStrategy = function () {
  const d = distanceBetweenCells(this.transform);
  const alpha = Math.min(Math.max(1.0 - (d-this.gridMin) / (this.gridMax - this.gridMin), 0.0), 1.0);
  return [...this.gridColor, alpha]; //.slice(0,3).concat(alpha);
};

// Zoom
Model.prototype.zoomMin = 1;   // Cells will be at least one pixel apart
Model.prototype.zoomMax = 1024; // Cells will at most be 128 pixels apart
Model.prototype._zoomStrategy = function(newTransform) {
  const d = distanceBetweenCells(newTransform);
  if (d < this.zoomMin || d > this.zoomMax) return this.transform;
  else return newTransform;
};
