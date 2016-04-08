/// <reference path="../typings/babylon.d.ts" />

module EDEN {
  interface Stop {
      stop: number;
      value: number;
  }

  export class Gradient {
    stops: Array<Stop>;
    resolution: number;

    gradient: Array<number>;

    constructor(resolution: number) {
      this.stops = [];
      this.resolution = resolution;

      this.gradient = [];
    }

    addStop(stop: number, value: number) {
      this.stops.push({
        stop: stop,
        value: value
      });
    }

    getValue(index: number) {
      return this.gradient[Math.floor(index * this.resolution)];
    }

    calculate() {
      if(this.stops.length < 2) return;

      for(var stopIdx = 1; stopIdx < this.stops.length; stopIdx++) {
        var currentStop = this.stops[stopIdx - 1];
        var nextStop = this.stops[stopIdx];

        var totalSteps = Math.ceil((nextStop.stop - currentStop.stop) * this.resolution);
        var step = (nextStop.value - currentStop.value) / (totalSteps - 1);

        for(var i = 0; i < totalSteps; i++) {
          var gradIdx = i + Math.ceil(currentStop.stop * this.resolution);
          var val = currentStop.value + (step * i);
          this.gradient[gradIdx] = val;
        }
      }
    }

  }
}
