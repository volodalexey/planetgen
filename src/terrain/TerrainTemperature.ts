/// <reference path="../util/Alea.ts" />
/// <reference path="../util/Noise.ts" />
/// <reference path="../util/Gradient.ts" />

module EDEN {
  export class TerrainTemperature {
    prng: Alea;
    noise: Noise;
    gradient: Gradient;

    seed: string;
    minTemp: number;
    maxTemp: number;

    data: Array<number>;
    height: number;
    width: number;

    constructor(seed: string, maxTemp: number, minTemp: number, distortion: number, height: number, width: number) {
      this.seed = seed;
      this.data = [];
      this.height = height;
      this.width = width;

      this.minTemp = minTemp;
      this.maxTemp = maxTemp;

      this.prng = new Alea(this.seed);

      this.noise = new Noise({
        amplitude: 0.1,
        frequency: 0.004,
        max: distortion,
        min: -distortion,
        octaves: 10,
        persistence: 0.5,
        random: this.prng.random
      });

      this.setupTemperatureGradient();
      this.generateTemperature();
    }

    setupTemperatureGradient() {
      this.gradient = new Gradient(this.height);

      this.gradient.addStop(0.0, this.minTemp);
      this.gradient.addStop(0.2, this.minTemp);
      this.gradient.addStop(0.5, this.maxTemp);
      this.gradient.addStop(0.8, this.minTemp);
      this.gradient.addStop(1.0, this.minTemp);

      this.gradient.calculate();
    }

    generateTemperature() {
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

    // Get height depending upon the tile, from the generated heightmap
    getTemperature(u: number, v: number) {
      var x: number = Math.floor(u * this.width);
      var y: number = Math.floor(v * this.height);

      var idx: number = y*this.width + x;
      return this.data[idx] + this.gradient.getValue(v);
    }

    getTemperatureNormalized(u: number, v: number) {
      var data: number = (this.getTemperature(u,v) - this.minTemp) / (this.maxTemp - this.minTemp);
      if(data < 0) data = 0;
      else if(data > 1) data = 1;
      return data;
    }
  }
}
