/// <reference path="Planet.ts" />

module EDEN {
  export class Game {
    canvas: HTMLCanvasElement;
    scene: BABYLON.Scene;
    engine: BABYLON.Engine;
    planet: Planet;

    constructor() {
      if (!BABYLON.Engine.isSupported()) {
        throw "Browser does not support WebGL!";
      }

      BABYLON.Engine.ShadersRepository = "/src/Shaders/";

      this.canvas = <HTMLCanvasElement> document.getElementById("renderCanvas");
      this.engine = new BABYLON.Engine(this.canvas, true);
      this.scene = new BABYLON.Scene(this.engine);
      this.scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);

      this.createCamera();
      this.createSunAndMoon();

      this.planet = new Planet(20, 60, this.scene); //This line renders the Icosahedron planet
      this.planet.render();

      this.registerResize();
      this.registerBeforeRender();
      this.runRenderLoop();

      this.registerClick();
    }

    registerClick() {
      window.addEventListener("click", () => {
         var faceId: number = this.scene.pick(this.scene.pointerX, this.scene.pointerY).faceId;
         this.planet.pickTile(faceId);
      });
    }

    createCamera() {
      // Camera
      var camera: BABYLON.ArcRotateCamera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -0), this.scene);
      camera.setPosition(new BABYLON.Vector3(-60, 0, 0));
      camera.attachControl(this.canvas, true);
    }

    createSunAndMoon() {
      // Sun & Moon
      var sun: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("sun", new BABYLON.Vector3(0, 0, 1), this.scene);
      sun.intensity = 1.0;
      var moon: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("moon", new BABYLON.Vector3(0, 0, -1), this.scene);
      moon.intensity = 0.2;
    }

    registerResize() {
      window.addEventListener("resize", () => {
        this.engine.resize();
      });
    }

    registerBeforeRender() {
      this.scene.registerBeforeRender(() => {
          this.planet.revolve();
      });
    }

    runRenderLoop() {
      this.engine.runRenderLoop(() => {
          this.scene.render();
      });
    }
  }
}
