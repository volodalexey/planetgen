/// <reference path="typings/babylon.d.ts" />

/// <reference path="terrain/TerrainColor.ts" />
/// <reference path="terrain/TerrainHeightmap.ts" />
/// <reference path="terrain/TerrainTemperature.ts" />

module EDEN {
  export class Terrain {
    seed: string;

    width: number;
    height: number;

    // Terrain Height Properties
    maxHeight: number = 255;

    // Terrain Temperature Properties
    maxTemp: number = 40;
    minTemp: number = -10;
    tempDistortion: number = 5;

    terrainColor: TerrainColor;
    terrainHeightmap: TerrainHeightmap;
    temperatureData: TerrainTemperature;

    constructor(seed: string) {
      this.seed = seed;
      this.width = 512;
      this.height = 512;

      this.terrainColor = new TerrainColor(this.maxHeight);
      this.terrainHeightmap = new TerrainHeightmap(this.seed, this.maxHeight, this.height, this.width);
      this.temperatureData = new TerrainTemperature(this.seed, this.maxTemp, this.minTemp, this.tempDistortion, this.height, this.width);
    }

    // Get color depending upon the tile from the TerrainColor object
    getColor(u: number, v: number) {
      var height: number = this.terrainHeightmap.getHeight(u, v);
      return this.terrainColor.getColor(height);
    }

    // Get height depending upon the tile, from the TerrainHeightmap object
    getHeight(u: number, v: number) {
      return this.terrainHeightmap.getHeightNormalized(u, v);
    }

    toggleDebugVisibility(debug: boolean) {
      var diffuseCanvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('hmCanvas');
      if(debug) {
        diffuseCanvas.style.visibility = 'visible';
        this.debugRender();
      }
      else {
        diffuseCanvas.style.visibility = 'hidden';
      }
    }

    debugRender() {
      var canv_element: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('hmCanvas');
      var canvas: any = canv_element.getContext('2d');
      canvas.fillStyle = '#eeeeee';
      canvas.fillRect(0, 0, this.width, this.height);

      var diffuseData: any = canvas.createImageData(this.width, this.height);;

      for(var i = 0; i < this.height * this.width; i++) {

        // This is a little painful, but calculate the UV coordinate of the unwrapped shere for this pixel
        // and use it to get the color that would be painted on the sphere. Keeps all the coloring logic
        // in the "getColor" function.
        var x = (i % this.width) / this.width;
        var y = Math.floor(i / this.width) / this.height;

        // 2D Heightmap Gradient
        // var color: BABYLON.Color3 = this.terrainColor.get2DColor(x, y);

        // 1D Heightmap Colored with Gradient
        // var color: BABYLON.Color3 = this.getColor(x, y);

        // Temperature Gradient
        var temp: number = this.temperatureData.getTemperatureNormalized(x, y);
        var color: BABYLON.Color3 = new BABYLON.Color3(temp, temp, temp);

        var idx = i*4;

        diffuseData.data[idx++] = color.r * 255;
        diffuseData.data[idx++] = color.g * 255;
        diffuseData.data[idx++] = color.b * 255;
        diffuseData.data[idx] = 255;
      }

      canvas.putImageData(diffuseData,0,0);

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
