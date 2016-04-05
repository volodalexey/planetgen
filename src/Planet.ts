/// <reference path="Icosphere.ts" />
/// <reference path="Terrain.ts" />

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

    terrain: Terrain;

    // Render Earth.jpg from the Asset subfolder
    renderDiffuseTexture: boolean = false;

    // Render the procedurally created heightmap texture(s) to debug canvas
    renderDebugTextureCanvas: boolean = true;

    // Deform mesh based on heightmap values
    renderDeformedMesh: boolean = true;

    constructor(scale: number, degree: number, scene: BABYLON.Scene, seed: string) {
      this.scale = scale;
      this.degree = degree;
      this.scene = scene;

      this.planet = {
        faceToTile: [],
        mesh: new BABYLON.Mesh("planet", scene),
        tiles: []
      };

      this.terrain = new EDEN.Terrain(seed)

      this.icosphere = new Icosphere(scale, degree);

      // Debug rendering
      this.terrain.toggleDebugVisibility(this.renderDebugTextureCanvas);
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
            var tile: PlanetTile = {
              id: n,
              center: new BABYLON.Vector3(0,0,0),
              corners: []
            }

            // Get all the centroids of the faces adjacent to this vertex
            for (var f = 0; f < numFaces; f++) {
                var centroid: BABYLON.Vector3 = this.icosphere.icosahedron.faces[this.icosphere.icosahedron.nodes[n].f[f]].centroid;
                var uv: BABYLON.Vector2 = this.calculateUVCoord(centroid);

                var height = (this.terrain.getHeight(uv.x, uv.y) * 2) - 1;
                var normal = centroid.clone().normalize();

                tile.center.addInPlace(centroid.scale(1.0/numFaces));
                if(this.renderDeformedMesh) centroid = centroid.add(normal.scaleInPlace(height * 2));

                var corner: PlanetCorner = {
                  position: centroid,
                  uv: this.calculateUVCoord(centroid)
                }

                tile.corners.push(corner);

                positions.push(centroid.x);
                positions.push(centroid.y);
                positions.push(centroid.z);

                if(this.renderDiffuseTexture) {
                  uvs.push(corner.uv.x);
                  uvs.push(corner.uv.y);
                }
            }
            this.planet.tiles.push(tile);

            var center_uv: BABYLON.Vector2 = this.calculateUVCoord(tile.center);
            var color = this.terrain.getColor(center_uv.x, center_uv.y);

            for(var f = 0; f < numFaces; f++) {
              colors.push(color.r);
              colors.push(color.g);
              colors.push(color.b);
              colors.push(1.0);
            }

            for (var i = relativeZeroIndex; i < (positions.length / 3) - 2; i++) {
                this.planet.faceToTile[indices.length / 3] = n
                indices.push(relativeZeroIndex);
                indices.push(i + 1);
                indices.push(i + 2);
            }

            //Fix Zipper for Legitimate Diffuse Texture
            for(var i = relativeZeroIndex; i < (uvs.length / 2) - 2; i++) {
              var i1: number = relativeZeroIndex*2;
              var i2: number = (i+1) * 2;
              var i3: number = (i+2) * 2;

              var A: BABYLON.Vector3 = new BABYLON.Vector3(uvs[i1], uvs[i1 + 1], 0);
              var BA: BABYLON.Vector3 = new BABYLON.Vector3(uvs[i2], uvs[i2 + 1], 0).subtract(A);
              var CA: BABYLON.Vector3 = new BABYLON.Vector3(uvs[i3], uvs[i3 + 1], 0).subtract(A);

              var cross: BABYLON.Vector3 = BABYLON.Vector3.Cross(BA, CA);
              if(cross.z < 0) {
                if(uvs[i1] < 0.25) uvs[i1] += 1;
                if(uvs[i2] < 0.25) uvs[i2] += 1;
                if(uvs[i3] < 0.25) uvs[i3] += 1;
              }
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
