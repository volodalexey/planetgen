/// <reference path="lib/babylon.d.ts" />

/// <reference path="rand/Noise.ts" />
/// <reference path="rand/Alea.ts" />

module EDEN {
  export class Terrain {
    seed: string;
    prng: Alea;

    width: number;
    height: number;

    data: number[];
    noiseGen: Noise;

    constructor(seed: string) {
      this.seed = seed;
      this.width = 512;
      this.height = 512;

      this.data = [];

      this.prng = new Alea(this.seed);

      this.noiseGen = new Noise({
        amplitude: 0.1,
        frequency: 0.004,
        max: 255,
        min: 0,
        octaves: 10,
        persistence: 0.5,
        random: this.prng.random
      });

      this.generateTerrain();
    }

    // Color depending upon the tile, currently simple land or water coloring.
    getColor(u: number, v: number) {
      var x: number = Math.floor(u*this.width);
      var y:number = Math.floor((1-v)*this.height);

      var r: number = 0;
      var g: number = 0;
      var b: number = 0;

      var idx: number = y*this.width + x;

      if(this.data[idx] <= 128) {
        r=51;
        g=204;
        b=51;
      }
      else {
        r=51;
        g=153;
        b=255;
      }

      return new BABYLON.Color3(r/255, g/255, b/255);
    }

    // Utilize 4D space in conjunction with 2 2D circles orthogonal to each other
    // to generate tileable texture: http://www.gamedev.net/blog/33/entry-2138456-seamless-noise/
    generateTerrain() {
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
          var c = this.noiseGen.in4D(nx, ny, nz, nw);

          this.data[y*this.width + x] = c;
        }
      }
    }

    toggleDebugVisibility(debug: boolean) {
      var element: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('hmCanvas');
      if(debug) {
        element.style.visibility = 'visible';
        this.debugRender();
      }
      else {
        element.style.visibility = 'hidden';
      }
    }

    debugRender() {
      var canv_element: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('hmCanvas');
      var canvas: any = canv_element.getContext('2d');
      canvas.fillStyle = '#eeeeee';
      canvas.fillRect(0, 0, this.width, this.height);

      var p: any = canvas.createImageData(this.width, this.height);

      for(var i = 0; i < this.data.length; i++) {

        // This is a little painful, but calculate the UV coordinate of the unwrapped shere for this pixel
        // and use it to get the color that would be painted on the sphere. Keeps all the coloring logic
        // in the "getColor" function.
        var x = (i % this.width) / this.width;
        var y = Math.floor(i / this.width) / this.height
        var color: BABYLON.Color3 = this.getColor(x, 1-y);

        var idx = i*4;

        p.data[idx++] = color.r * 255;
        p.data[idx++] = color.g * 255;
        p.data[idx++] = color.b * 255;
        p.data[idx] = 255;
      }

      canvas.putImageData(p,0,0);

      // Resize the output canvas to 256 pixels so that we do not take up too much screen real estate.
      var tmpImage = new Image();
      tmpImage.src = canv_element.toDataURL("image/png");
      canvas.clearRect(0, 0, this.width, this.height);
      canv_element.width = canv_element.width / 2;
      canv_element.height = canv_element.height / 2;
      canvas.drawImage(tmpImage, 0, 0, 256, 256);
    }
  }
}
