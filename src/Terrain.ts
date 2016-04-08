/// <reference path="typings/babylon.d.ts" />

/// <reference path="util/Noise.ts" />
/// <reference path="util/Alea.ts" />
/// <reference path="util/Gradient.ts" />
/// <reference path="util/Gradient2D.ts" />

module EDEN {
  export class Terrain {
    seed: string;
    prng: Alea;

    width: number;
    height: number;

    data: number[];
    noiseGen: Noise;

    terrainGradient: Gradient;
    terrainGradient2D: Gradient2D;

    resolution: number = 256;

    constructor(seed: string) {
      this.seed = seed;
      this.width = 512;
      this.height = 512;

      this.data = [];

      this.prng = new Alea(this.seed);

      this.noiseGen = new Noise({
        amplitude: 0.1,
        frequency: 0.004,
        max: this.resolution - 1,
        min: 0,
        octaves: 10,
        persistence: 0.5,
        random: this.prng.random
      });

      this.setupTerrainGradient();
      this.generateTerrain();
    }

    setupTerrainGradient() {
      this.terrainGradient = new Gradient(this.resolution);

      // Deep Ocean
      this.terrainGradient.addColorStop(0.0, new BABYLON.Color3(0, 0, 153/255));

      // Sea
      this.terrainGradient.addColorStop(0.4, new BABYLON.Color3(0/255, 102/255, 255/255));

      // Coast
      this.terrainGradient.addColorStop(0.46, new BABYLON.Color3(0/255, 120/255, 255/255));

      // Coastal Water
      this.terrainGradient.addColorStop(0.49, new BABYLON.Color3(153/255, 204/255, 255/255));

      // Coastal Land
      this.terrainGradient.addColorStop(0.5, new BABYLON.Color3(255/255, 255/255, 204/255));

      // Grasslands
      this.terrainGradient.addColorStop(0.51, new BABYLON.Color3(51/255, 204/255, 51/255));

      // Mountain
      this.terrainGradient.addColorStop(0.65, new BABYLON.Color3(153/255, 102/255, 51/255));

      // Mountain Peaks
      this.terrainGradient.addColorStop(0.72, new BABYLON.Color3(230/255, 255/255, 255/255));

      // Mountain Peaks
      this.terrainGradient.addColorStop(1.0, new BABYLON.Color3(230/255, 255/255, 255/255));

      this.terrainGradient.calculate();

      this.terrainGradient2D = new Gradient2D(this.resolution);

      this.terrainGradient2D.addColorStop(0.0, 0.0, new BABYLON.Color3(70/255, 97/255, 16/255));
      this.terrainGradient2D.addColorStop(0.2, 0.0, new BABYLON.Color3(92/255, 139/255, 38/255));
      this.terrainGradient2D.addColorStop(0.4, 0.0, new BABYLON.Color3(110/255, 156/255, 42/255));
      this.terrainGradient2D.addColorStop(0.6, 0.0, new BABYLON.Color3(81/255, 156/255, 52/255));
      this.terrainGradient2D.addColorStop(0.8, 0.0, new BABYLON.Color3(125/255, 184/255, 137/255));
      this.terrainGradient2D.addColorStop(1.0, 0.0, new BABYLON.Color3(230/255, 247/255, 234/255));

      this.terrainGradient2D.addColorStop(0.0, 0.25, new BABYLON.Color3(70/255, 97/255, 16/255));
      this.terrainGradient2D.addColorStop(0.2, 0.25, new BABYLON.Color3(84/255, 117/255, 30/255));
      this.terrainGradient2D.addColorStop(0.4, 0.25, new BABYLON.Color3(80/255, 156/255, 42/255));
      this.terrainGradient2D.addColorStop(0.6, 0.25, new BABYLON.Color3(42/255, 156/255, 52/255));
      this.terrainGradient2D.addColorStop(0.8, 0.25, new BABYLON.Color3(95/255, 154/255, 107/255));
      this.terrainGradient2D.addColorStop(1.0, 0.25, new BABYLON.Color3(230/255, 247/255, 234/255));

      this.terrainGradient2D.addColorStop(0.0, 0.5, new BABYLON.Color3(132/255, 194/255, 8/255));
      this.terrainGradient2D.addColorStop(0.2, 0.5, new BABYLON.Color3(96/255, 191/255, 8/255));
      this.terrainGradient2D.addColorStop(0.4, 0.5, new BABYLON.Color3(34/255, 139/255, 34/255));
      this.terrainGradient2D.addColorStop(0.6, 0.5, new BABYLON.Color3(12/255, 125/255, 12/255));
      this.terrainGradient2D.addColorStop(0.8, 0.5, new BABYLON.Color3(65/255, 124/255, 77/255));
      this.terrainGradient2D.addColorStop(1.0, 0.5, new BABYLON.Color3(230/255, 247/255, 234/255));

      this.terrainGradient2D.addColorStop(0.0, 0.75, new BABYLON.Color3(247/255, 202/255, 0/255));
      this.terrainGradient2D.addColorStop(0.2, 0.75, new BABYLON.Color3(142/255, 191/255, 8/255));
      this.terrainGradient2D.addColorStop(0.4, 0.75, new BABYLON.Color3(72/255, 156/255, 11/255));
      this.terrainGradient2D.addColorStop(0.6, 0.75, new BABYLON.Color3(57/255, 125/255, 12/255));
      this.terrainGradient2D.addColorStop(0.8, 0.75, new BABYLON.Color3(35/255, 94/255, 47/255));
      this.terrainGradient2D.addColorStop(1.0, 0.75, new BABYLON.Color3(230/255, 247/255, 234/255));

      this.terrainGradient2D.addColorStop(0.0, 1.0, new BABYLON.Color3(255/255, 223/255, 120/255));
      this.terrainGradient2D.addColorStop(0.2, 1.0, new BABYLON.Color3(214/255, 179/255, 62/255));
      this.terrainGradient2D.addColorStop(0.4, 1.0, new BABYLON.Color3(178/255, 189/255, 62/255));
      this.terrainGradient2D.addColorStop(0.6, 1.0, new BABYLON.Color3(155/255, 189/255, 62/255));
      this.terrainGradient2D.addColorStop(0.8, 1.0, new BABYLON.Color3(88/255, 148/255, 68/255));
      this.terrainGradient2D.addColorStop(1.0, 1.0, new BABYLON.Color3(230/255, 247/255, 234/255));


      this.terrainGradient2D.calculate();
    }

    // Get color depending upon the tile from the calculated Terrain Gradient
    getColor(u: number, v: number) {
      var x: number = Math.floor(u*this.width);
      var y:number = Math.floor((1-v)*this.height);

      var r: number = 0;
      var g: number = 0;
      var b: number = 0;

      var idx: number = y*this.width + x;
      var color: BABYLON.Color3 = this.terrainGradient.getColorForHeight(Math.floor(this.data[idx]));
      return color;
    }

    // Get height depending upon the tile, from the generated heightmap
    getHeight(u: number, v: number) {
      var x: number = Math.floor(u*this.width);
      var y:number = Math.floor((1-v)*this.height);

      var idx: number = y*this.width + x;
      return Math.floor(this.data[idx]) / (this.resolution - 1);
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
      var diffuseCanvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('hmCanvas');
      var greyCanvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('hmGreyCanvas');
      if(debug) {
        diffuseCanvas.style.visibility = 'visible';
        greyCanvas.style.visibility = 'visible';
        this.debugRender();
      }
      else {
        diffuseCanvas.style.visibility = 'hidden';
        greyCanvas.style.visibility = 'hidden';
      }
    }

    debugRender() {
      var canv_element: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('hmCanvas');
      var canvas: any = canv_element.getContext('2d');
      canvas.fillStyle = '#eeeeee';
      canvas.fillRect(0, 0, this.width, this.height);

      var diffuseData: any = canvas.createImageData(this.width, this.height);

      var grey_canv_element: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('hmGreyCanvas');
      var gCanvas: any = grey_canv_element.getContext('2d');
      gCanvas.fillStyle = '#eeeeee';
      gCanvas.fillRect(0, 0, this.width, this.height);

      var greyData: any = gCanvas.createImageData(this.width, this.height);

      for(var i = 0; i < this.data.length; i++) {

        // This is a little painful, but calculate the UV coordinate of the unwrapped shere for this pixel
        // and use it to get the color that would be painted on the sphere. Keeps all the coloring logic
        // in the "getColor" function.
        var x = (i % this.width) / this.width;
        var y = Math.floor(i / this.width) / this.height

        var color: BABYLON.Color3 = this.terrainGradient2D.getColorForUV(x, y);
        // var color: BABYLON.Color3 = this.getColor(x, 1-y);

        var idx = i*4;

        diffuseData.data[idx++] = color.r * 255;
        diffuseData.data[idx++] = color.g * 255;
        diffuseData.data[idx++] = color.b * 255;
        diffuseData.data[idx] = 255;

        idx = i*4;

        greyData.data[idx++] = this.data[i];
        greyData.data[idx++] = this.data[i];
        greyData.data[idx++] = this.data[i];
        greyData.data[idx] = 255;

      }

      canvas.putImageData(diffuseData,0,0);
      gCanvas.putImageData(greyData,0,0);

      // Resize the output canvas to 256 pixels so that we do not take up too much screen real estate.
      var tmpImage = new Image();
      tmpImage.src = canv_element.toDataURL("image/png");
      canvas.clearRect(0, 0, this.width, this.height);
      canv_element.width = canv_element.width / 2;
      canv_element.height = canv_element.height / 2;
      canvas.drawImage(tmpImage, 0, 0, 256, 256);

      tmpImage = new Image();
      tmpImage.src = grey_canv_element.toDataURL("image/png");
      gCanvas.clearRect(0, 0, this.width, this.height);
      grey_canv_element.width = grey_canv_element.width / 2;
      grey_canv_element.height = grey_canv_element.height / 2;
      gCanvas.drawImage(tmpImage, 0, 0, 256, 256);
    }
  }
}
