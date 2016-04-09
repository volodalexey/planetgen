/// <reference path="../util/Noise.ts" />
/// <reference path="../util/Alea.ts" />

module EDEN {
  export class TerrainHeightmap {
    prng: Alea;
    noise: Noise;

    seed: string;

    data: Array<number>;
    height: number;
    width: number;

    maxHeight: number;

    constructor(seed: string, maxHeight: number, height: number, width: number) {
      this.seed = seed;
      this.data = [];
      this.height = height;
      this.width = width;
      this.maxHeight = maxHeight;

      this.prng = new Alea(this.seed);

      this.noise = new Noise({
        amplitude: 0.4,
        frequency: 0.008,
        max: maxHeight,
        min: 0,
        octaves: 10,
        persistence: 0.5,
        random: this.prng.random
      });

      this.generateHeightmap();
    }

    generateHeightmap() {
      for(var x = 0; x < this.width; x++) {
      	for(var y = 0; y < this.height; y++) {
          var s: number = x/this.width;
          var t: number = y/this.height;

          var x1: number = 0;
          var x2: number = this.width;
          var y1: number = 0;
          var y2: number = this.height;
          var dx: number = x2-x1;
          var dy: number = y2-y1;

          var nx=x1+Math.cos(s*2*Math.PI)*dx/(2*Math.PI)
          var ny=y1+Math.cos(t*2*Math.PI)*dy/(2*Math.PI)
          var nz=x1+Math.sin(s*2*Math.PI)*dx/(2*Math.PI)
          var nw=y1+Math.sin(t*2*Math.PI)*dy/(2*Math.PI)
          var c = this.noise.in4D(nx, ny, nz, nw);

          this.data[y*this.width + x] = c;
        }
      }
    }

    getHeight(u: number, v: number) {
      var x: number = Math.floor(u * this.width);
      var y: number = Math.floor(v * this.height);

      var idx: number = y*this.width + x;
      return Math.floor(this.data[idx]);
    }

    getHeightNormalized(u: number, v: number) {
      return this.getHeight(u, v) / this.maxHeight;
    }
  }
}
