/// <reference path="../typings/babylon.d.ts" />

module EDEN {
  interface ColorStop {
      u: number;
      v: number;
      color: BABYLON.Color3;
  }

  interface NearestNeighbors {
    topLeft: ColorStop;
    topRight: ColorStop;
    bottomLeft: ColorStop;
    bottomRight: ColorStop;
  }

  export class ColorGradient2D {
    colorStops: Array<ColorStop>;
    resolution: number;

    gradient: Array<Array<BABYLON.Color3>>;

    constructor(resolution: number) {
      this.colorStops = [];
      this.resolution = resolution;

      this.gradient = [];
    }

    addColorStop(u: number, v: number, color: BABYLON.Color3) {
      this.colorStops.push({
        u: u,
        v: v,
        color: color
      });
    }

    getColorForUV(u: number, v: number) {
      var x: number = Math.floor(u * (this.resolution - 1));
      var y: number = Math.floor(v * (this.resolution - 1));
      
      return this.gradient[y][x];
    }

    calculate() {
      if(this.colorStops.length < 4) return;

      for(var y = 0; y < this.resolution; y++) {
        this.gradient[y] = [];
        for(var x = 0; x < this.resolution; x++) {
          var u = x / this.resolution;
          var v = y / this.resolution;

          var neighbors: NearestNeighbors = this.getNearestNeighbors(u, v);

          // If this point is concentric with a color stop, choose the color stop color
          if(this.isConcentricWithColorStop(neighbors)) {
            this.gradient[y][x] = neighbors.topLeft.color;
            continue;
          }
          else if(this.onUEdge(neighbors)) {
            var y1: number = neighbors.topLeft.v;
            var y2: number = neighbors.bottomLeft.v;

            var blerpR = (neighbors.bottomLeft.color.r - neighbors.topLeft.color.r) * (v - y1) / (y2 - y1) + neighbors.topLeft.color.r;
            var blerpG = (neighbors.bottomLeft.color.g - neighbors.topLeft.color.g) * (v - y1) / (y2 - y1) + neighbors.topLeft.color.g;
            var blerpB = (neighbors.bottomLeft.color.b - neighbors.topLeft.color.b) * (v - y1) / (y2 - y1) + neighbors.topLeft.color.b;

            this.gradient[y][x] = new BABYLON.Color3(blerpR, blerpG, blerpB);
            continue;
          }
          else if(this.onVEdge(neighbors)) {
            var x1: number = neighbors.topLeft.u;
            var x2: number = neighbors.topRight.u;

            var blerpR = (neighbors.topRight.color.r - neighbors.topLeft.color.r) * (u - x1) / (x2 - x1) + neighbors.topLeft.color.r;
            var blerpG = (neighbors.topRight.color.g - neighbors.topLeft.color.g) * (u - x1) / (x2 - x1) + neighbors.topLeft.color.g;
            var blerpB = (neighbors.topRight.color.b - neighbors.topLeft.color.b) * (u - x1) / (x2 - x1) + neighbors.topLeft.color.b;

            this.gradient[y][x] = new BABYLON.Color3(blerpR, blerpG, blerpB);
            continue;
          }

          var x1: number = neighbors.bottomLeft.u;
          var y1: number = neighbors.bottomLeft.v;
          var x2: number = neighbors.topRight.u;
          var y2: number = neighbors.topRight.v;

          var blerpR: number = (1/((x2 - x1)*(y2-y1))) *
                               (
                                 neighbors.bottomLeft.color.r * (x2 - u) * (y2 - v) +
                                 neighbors.bottomRight.color.r * (u - x1) * (y2 - v) +
                                 neighbors.topLeft.color.r * (x2 - u) * (v - y1) +
                                 neighbors.topRight.color.r * (u - x1) * (v - y1)
                               )
          var blerpG: number = (1/((x2 - x1)*(y2-y1))) *
                               (
                                 neighbors.bottomLeft.color.g * (x2 - u) * (y2 - v) +
                                 neighbors.bottomRight.color.g * (u - x1) * (y2 - v) +
                                 neighbors.topLeft.color.g * (x2 - u) * (v - y1) +
                                 neighbors.topRight.color.g * (u - x1) * (v - y1)
                               )
          var blerpB: number = (1/((x2 - x1)*(y2-y1))) *
                               (
                                 neighbors.bottomLeft.color.b * (x2 - u) * (y2 - v) +
                                 neighbors.bottomRight.color.b * (u - x1) * (y2 - v) +
                                 neighbors.topLeft.color.b * (x2 - u) * (v - y1) +
                                 neighbors.topRight.color.b * (u - x1) * (v - y1)
                               )

          this.gradient[y][x] = new BABYLON.Color3(blerpR, blerpG, blerpB);

        }
      }
    }

    isConcentricWithColorStop(neighbors: NearestNeighbors) {
      return (neighbors.topRight == neighbors.topLeft &&
              neighbors.bottomLeft == neighbors.topLeft &&
              neighbors.bottomRight == neighbors.topLeft);
    }

    onUEdge(neighbors: NearestNeighbors) {
      return (neighbors.topLeft == neighbors.topRight &&
              neighbors.bottomLeft == neighbors.bottomRight);
    }

    onVEdge(neighbors: NearestNeighbors) {
      return (neighbors.topLeft == neighbors.bottomLeft &&
              neighbors.topRight == neighbors.bottomRight);
    }

    getNearestNeighbors(u: number, v: number) {
      var neighbors: NearestNeighbors = {
        topLeft: null,
        topRight: null,
        bottomLeft: null,
        bottomRight: null
      };

      for(var cs of this.colorStops) {
        if(cs.u <= u && cs.v <= v) {
          if(neighbors.topLeft == null || (neighbors.topLeft.u <= cs.u && neighbors.topLeft.v <= cs.v)) {
            neighbors.topLeft = cs;
          }
        }

        if(cs.u >= u && cs.v <= v) {
          if(neighbors.topRight == null || (neighbors.topRight.u >= cs.u && neighbors.topRight.v <= cs.v)) {
            neighbors.topRight = cs;
          }
        }

        if(cs.u <= u && cs.v >= v) {
          if(neighbors.bottomLeft == null || (neighbors.bottomLeft.u <= cs.u && neighbors.bottomLeft.v >= cs.v)) {
            neighbors.bottomLeft = cs;
          }
        }

        if(cs.u >= u && cs.v >= v) {
          if(neighbors.bottomRight == null || (neighbors.bottomRight.u >= cs.u && neighbors.bottomRight.v >= cs.v)) {
            neighbors.bottomRight = cs;
          }
        }
      }

      return neighbors;

    }
  }
}
