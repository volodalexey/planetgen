/// <reference path="../typings/babylon.d.ts" />

/// <reference path="../util/ColorGradient.ts" />
/// <reference path="../util/ColorGradient2D.ts" />

module EDEN {
  export class TerrainColor {
    terrainGradient: ColorGradient;
    terrainGradient2D: ColorGradient2D;

    maxHeight: number;

    constructor(maxHeight: number) {
      this.maxHeight = maxHeight;

      this.setupGradient();
    }

    setupGradient() {
      this.terrainGradient = new ColorGradient(this.maxHeight + 1);

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

      this.terrainGradient2D = new ColorGradient2D(256);

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

    getColor(height: number) {
      var color: BABYLON.Color3 =  this.terrainGradient.getColorForValue(height);
      return color;
    }

    get2DColor(u: number, v: number) {
      return this.terrainGradient2D.getColorForUV(u,v);
    }
  }
}
