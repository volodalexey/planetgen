/// <reference path="../util/Noise.ts" />
/// <reference path="../util/Alea.ts" />

module EDEN {
  export class TerrainRainmap {
    prng: Alea;
    noise: Noise;

    seed: string;

    data: Array<number>;
    height: number;
    width: number;

    maxRain: number;

    constructor(seed: string, maxRain: number, height: number, width: number) {
      this.seed = seed;
      this.data = [];
      this.height = height;
      this.width = width;
      this.maxRain = maxRain;

      this.prng = new Alea(this.seed);

      this.noise = new Noise({
        amplitude: 0.1,
        frequency: .003,
        max: maxRain,
        min: 0,
        octaves: 30,
        persistence: 0.5,
        random: this.prng.random
      });

      this.generateRainmap();
    }

    generateRainmap() {
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

    getRainfall(u: number, v: number) {
      var x: number = Math.floor(u * this.width);
      var y: number = Math.floor(v * this.height);

      var idx: number = y*this.width + x;
      return Math.floor(this.data[idx]);
    }

    getRainfallNormalized(u: number, v: number) {
      return this.getRainfall(u, v) / this.maxRain;
    }
  }
}
