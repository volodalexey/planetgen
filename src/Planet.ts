/// <reference path="Icosphere.ts" />

module EDEN {
  interface PlanetTile {
    id: number,
    center: BABYLON.Vector3;
    corners: Array<PlanetCorner>;
  }

  interface PlanetCorner {
    position: BABYLON.Vector3;
  }

  interface PlanetData {
    faceToTile: Array<number>;
    mesh: BABYLON.Mesh;

    tiles: Array<PlanetTile>;
  }

  export class Planet {
    scale: number;
    degree: number;
    scene: BABYLON.Scene;

    icosphere: Icosphere;

    planet: PlanetData;

    selectedBorder: BABYLON.Mesh;

    constructor(scale: number, degree: number, scene: BABYLON.Scene) {
      this.scale = scale;
      this.degree = degree;
      this.scene = scene;

      this.planet = {
        faceToTile: [],
        mesh: new BABYLON.Mesh("planet", scene),
        tiles: []
      };

      this.icosphere = new Icosphere(scale, degree);
    }

    revolve() {
      this.planet.mesh.rotation.y += -0.0005;
      this.planet.mesh.rotation.x += -0.0005 / 4;

      if(this.selectedBorder != null) this.selectedBorder.rotation = this.planet.mesh.rotation;
    }

    pickTile(faceId) {
      if(this.selectedBorder != null) this.selectedBorder.dispose();


      var tileId: number = this.planet.faceToTile[faceId];
      var tile: PlanetTile = this.planet.tiles[tileId];
      var color: BABYLON.Color3 = new BABYLON.Color3(242/255,182/255,64/255);
      var linePositions: Array<BABYLON.Vector3> = [];

      for(var corner of tile.corners) {
        linePositions.push(corner.position);
      }

      linePositions.push(linePositions[0]);

      this.selectedBorder = BABYLON.Mesh.CreateLines("lines", linePositions, this.scene);
    }

    render() {
        var material: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("mat", this.scene);
        material.specularColor = new BABYLON.Color3(0, 0, 0); // No specular color

        var indices: Array<number> = [];
        var colors: Array<number> = [];
        var positions: Array<number> = [];

        // Generate dual polyhedron position and face indices
        for (var n = 0; n < this.icosphere.icosahedron.nodes.length; n++) {
            var relativeZeroIndex: number = positions.length / 3;
            var numFaces: number = this.icosphere.icosahedron.nodes[n].f.length;
            var color: BABYLON.Color3 = new BABYLON.Color3(0, Math.random() * 0.5, Math.random() * 1);

            var tile: PlanetTile = {
              id: n,
              center: new BABYLON.Vector3(0,0,0),
              corners: []
            }

            // Get all the centroids of the faces adjacent to this vertex
            for (var f = 0; f < numFaces; f++) {
                var centroid: BABYLON.Vector3 = this.icosphere.icosahedron.faces[this.icosphere.icosahedron.nodes[n].f[f]].centroid;

                var corner: PlanetCorner = {
                  position: centroid
                }

                tile.center.addInPlace(centroid.scale(1.0/numFaces));
                tile.corners.push(corner);

                positions.push(centroid.x);
                positions.push(centroid.y);
                positions.push(centroid.z);
                colors.push(color.r);
                colors.push(color.g);
                colors.push(color.b);
                colors.push(1.0);
            }

            this.planet.tiles.push(tile);

            for (var i = relativeZeroIndex; i < (positions.length / 3) - 2; i++) {
                this.planet.faceToTile[indices.length / 3] = n
                indices.push(relativeZeroIndex);
                indices.push(i + 1);
                indices.push(i + 2);
            }
        }

        this.planet.mesh.useVertexColors = true;

        var vertexData: BABYLON.VertexData = new BABYLON.VertexData();

        vertexData.indices = indices;
        vertexData.positions = positions;
        vertexData.colors = colors;

        var normals: Array<number> = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;
        vertexData.applyToMesh(this.planet.mesh, false);

        this.planet.mesh.material = material;
    }
  }
}
