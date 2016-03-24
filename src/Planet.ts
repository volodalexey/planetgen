/// <reference path="Icosphere.ts" />

module EDEN {
  interface PlanetTile {
    id: number,
    center: BABYLON.Vector3;
    corners: Array<PlanetCorner>;
  }

  interface PlanetCorner {
    position: BABYLON.Vector3;
    uv: BABYLON.Vector2;
  }

  interface PlanetData {
    faceToTile: Array<number>;
    mesh: BABYLON.Mesh;
    selectedBorder?: BABYLON.Mesh;

    tiles: Array<PlanetTile>;
  }

  export class Planet {
    scale: number;
    degree: number;
    scene: BABYLON.Scene;

    icosphere: Icosphere;
    planet: PlanetData;

    renderDiffuseTexture: boolean = true;

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

    calculateUVCoord(p: BABYLON.Vector3) {
      // Calculate the Miller Spherical Projection and map it to UV coordinates
      var lat: number = Math.asin(p.y / this.scale);
      var lon: number = Math.atan2(p.z, p.x);

      var x: number = lon / Math.PI;
      var y: number = (5/4)*Math.log(Math.tan((Math.PI / 4) + (2*lat/5))) / 2.2523234430803587;
      if(y < -1.0) y = 1.0

      x = (x + 1) / 2;
      y = (y + 1) / 2;
      return new BABYLON.Vector2(x, y);
    }

    revolve() {
      this.planet.mesh.rotation.y += -0.00005;

      if(this.planet.selectedBorder != null) this.planet.selectedBorder.rotation = this.planet.mesh.rotation;
    }

    pickTile(faceId) {
      if(this.planet.selectedBorder != null) this.planet.selectedBorder.dispose();


      var tileId: number = this.planet.faceToTile[faceId];
      var tile: PlanetTile = this.planet.tiles[tileId];
      var color: BABYLON.Color3 = new BABYLON.Color3(242/255,182/255,64/255);
      var linePositions: Array<BABYLON.Vector3> = [];

      for(var corner of tile.corners) {
        linePositions.push(corner.position);
      }

      linePositions.push(linePositions[0]);

      this.planet.selectedBorder = BABYLON.Mesh.CreateLines("lines", linePositions, this.scene);
    }

    render() {
        var material: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("mat", this.scene);
        material.specularColor = new BABYLON.Color3(0, 0, 0); // No specular color

        if(this.renderDiffuseTexture) material.diffuseTexture = new BABYLON.Texture("assets/earth.jpg", this.scene);

        var indices: Array<number> = [];
        var colors: Array<number> = [];
        var positions: Array<number> = [];
        var uvs: Array<number> = [];

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
                  position: centroid,
                  uv: this.calculateUVCoord(centroid)
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

                if(this.renderDiffuseTexture) {
                  uvs.push(corner.uv.x);
                  uvs.push(corner.uv.y);
                }
            }
            this.planet.tiles.push(tile);

            for (var i = relativeZeroIndex; i < (positions.length / 3) - 2; i++) {
                this.planet.faceToTile[indices.length / 3] = n
                indices.push(relativeZeroIndex);
                indices.push(i + 1);
                indices.push(i + 2);
            }
        }

        var vertexData: BABYLON.VertexData = new BABYLON.VertexData();

        vertexData.indices = indices;
        vertexData.positions = positions;
        vertexData.colors = colors;

        if(this.renderDiffuseTexture) vertexData.uvs = uvs;

        var normals: Array<number> = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;
        vertexData.applyToMesh(this.planet.mesh, false);

        this.planet.mesh.material = material;
    }
  }
}
