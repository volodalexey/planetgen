/// <reference path="../typings/babylon.d.ts" />

module EDEN {
  interface ColorStop {
      stop: number;
      color: BABYLON.Color3;
  }

  export class Gradient {
    colorStops: Array<ColorStop>;
    resolution: number;

    gradient: Array<BABYLON.Color3>;

    constructor(resolution: number) {
      this.colorStops = [];
      this.resolution = resolution;

      this.gradient = [];
    }

    addColorStop(stop: number, color: BABYLON.Color3) {
      this.colorStops.push({
        stop: stop,
        color: color
      });
    }

    getColorForHeight(height: number) {
      return this.gradient[height];
    }

    calculate() {
      if(this.colorStops.length < 2) return;

      for(var stopIdx = 1; stopIdx < this.colorStops.length; stopIdx++) {
        var currentStop = this.colorStops[stopIdx - 1];
        var nextStop = this.colorStops[stopIdx];

        var totalSteps = Math.ceil((nextStop.stop - currentStop.stop) * this.resolution);

        var rStep = (nextStop.color.r - currentStop.color.r) / (totalSteps - 1);
        var gStep = (nextStop.color.g - currentStop.color.g) / (totalSteps - 1);
        var bStep = (nextStop.color.b - currentStop.color.b) / (totalSteps - 1);

        for(var i = 0; i < totalSteps; i++) {
          var gradIdx = i + Math.ceil(currentStop.stop * this.resolution);

          var gradR = currentStop.color.r + (rStep * i);
          var gradG = currentStop.color.g + (gStep * i);
          var gradB = currentStop.color.b + (bStep * i);

          this.gradient[gradIdx] = new BABYLON.Color3(gradR, gradG, gradB);
        }
      }
    }
  }
}
