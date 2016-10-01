const { vec2, mat2d } = require('gl-matrix');

const K1 = 1 / 2;
const K2 = Math.sqrt(3) / 2;

export class Builder {

  constructor() {
    this.borderSize = 0.1;
    this.cells = [];
    this.transform = mat2d.fromValues(
      K1, -K2,
      K1,  K2,
       0,   0
    );
  }

  addCell(cell) {
    this.cells.push(cell)
  }

  build() {

    const N = 1024;
    const startTime = new Date();

    const toVertex = cell => {
      const [x, y] = vec2.transformMat2d([,,], cell, this.transform);
      return {x, y};
    };

    const cellIndex = this.cells.reduce( (ind, cell) => { ind[cell[0] + cell[1] * N] = cell; return ind; }, {});

    const neighbours = [
      [ 0,-1],
      [-1,-1],
      [-1, 0],
      [ 0, 1],
      [ 1, 1],
      [ 1, 0],
    ];
    const vertices = this.cells.map(toVertex);
    const edges = [];
    this.cells.forEach( cell => {
      const [ q, r ] = cell;

      const lSite = cell;
      edges.push(... neighbours.map( (rSiteDelta, i) => { 
        const rSite = [ q + rSiteDelta[0], rSiteDelta[1] ];
        const rSitePrevDelta = neighbours[ (i + 5) % 6 ];
        const rSiteNextDelta = neighbours[ (i + 1) % 6 ];
        const va = toVertex([
          q + (rSiteDelta[0] + rSitePrevDelta[0]) / 3,
          r + (rSiteDelta[1] + rSitePrevDelta[1]) / 3
        ]);
        const vb = toVertex([
          (q + rSite[0] + q + rSiteNextDelta[0]) / 3,
          (r + rSite[1] + r + rSiteNextDelta[1]) / 3
        ]);
        return { lSite, rSite, va, vb };
      }));
  
    });

    console.log(edges);

    const stopTime = new Date();
    const execTime = stopTime.getTime()-startTime.getTime();

    return {
      vertices,
      edges,
      // cells,
      execTime,

    };
  }


}
