/// <reference path="lib/babylon.d.ts" />
var POLITIK;
(function (POLITIK) {
    var Icosphere = (function () {
        function Icosphere(scale, degree) {
            this.icosahedron = {
                nodes: [],
                edges: [],
                faces: []
            };
            this.scale = scale;
            this.degree = degree;
            this.generate();
            this.subdivide();
            this.correctFaceIndices();
        }
        Icosphere.prototype.generate = function () {
            var phi = (1.0 + Math.sqrt(5.0)) / 2.0;
            var du = 1.0 / Math.sqrt(phi * phi + 1.0);
            var dv = phi * du;
            this.icosahedron.nodes =
                [
                    { p: new BABYLON.Vector3(0, +dv, +du), e: [], f: [] },
                    { p: new BABYLON.Vector3(0, +dv, -du), e: [], f: [] },
                    { p: new BABYLON.Vector3(0, -dv, +du), e: [], f: [] },
                    { p: new BABYLON.Vector3(0, -dv, -du), e: [], f: [] },
                    { p: new BABYLON.Vector3(+du, 0, +dv), e: [], f: [] },
                    { p: new BABYLON.Vector3(-du, 0, +dv), e: [], f: [] },
                    { p: new BABYLON.Vector3(+du, 0, -dv), e: [], f: [] },
                    { p: new BABYLON.Vector3(-du, 0, -dv), e: [], f: [] },
                    { p: new BABYLON.Vector3(+dv, +du, 0), e: [], f: [] },
                    { p: new BABYLON.Vector3(+dv, -du, 0), e: [], f: [] },
                    { p: new BABYLON.Vector3(-dv, +du, 0), e: [], f: [] },
                    { p: new BABYLON.Vector3(-dv, -du, 0), e: [], f: [] },
                ];
            this.icosahedron.edges =
                [
                    { n: [0, 1,], f: [] },
                    { n: [0, 4,], f: [] },
                    { n: [0, 5,], f: [] },
                    { n: [0, 8,], f: [] },
                    { n: [0, 10,], f: [] },
                    { n: [1, 6,], f: [] },
                    { n: [1, 7,], f: [] },
                    { n: [1, 8,], f: [] },
                    { n: [1, 10,], f: [] },
                    { n: [2, 3,], f: [] },
                    { n: [2, 4,], f: [] },
                    { n: [2, 5,], f: [] },
                    { n: [2, 9,], f: [] },
                    { n: [2, 11,], f: [] },
                    { n: [3, 6,], f: [] },
                    { n: [3, 7,], f: [] },
                    { n: [3, 9,], f: [] },
                    { n: [3, 11,], f: [] },
                    { n: [4, 5,], f: [] },
                    { n: [4, 8,], f: [] },
                    { n: [4, 9,], f: [] },
                    { n: [5, 10,], f: [] },
                    { n: [5, 11,], f: [] },
                    { n: [6, 7,], f: [] },
                    { n: [6, 8,], f: [] },
                    { n: [6, 9,], f: [] },
                    { n: [7, 10,], f: [] },
                    { n: [7, 11,], f: [] },
                    { n: [8, 9,], f: [] },
                    { n: [10, 11,], f: [] },
                ];
            this.icosahedron.faces =
                [
                    { n: [0, 1, 8], e: [0, 7, 3] },
                    { n: [0, 4, 5], e: [1, 18, 2] },
                    { n: [0, 5, 10], e: [2, 21, 4] },
                    { n: [0, 8, 4], e: [3, 19, 1] },
                    { n: [0, 10, 1], e: [4, 8, 0] },
                    { n: [1, 6, 8], e: [5, 24, 7] },
                    { n: [1, 7, 6], e: [6, 23, 5] },
                    { n: [1, 10, 7], e: [8, 26, 6] },
                    { n: [2, 3, 11], e: [9, 17, 13] },
                    { n: [2, 4, 9], e: [10, 20, 12] },
                    { n: [2, 5, 4], e: [11, 18, 10] },
                    { n: [2, 9, 3], e: [12, 16, 9] },
                    { n: [2, 11, 5], e: [13, 22, 11] },
                    { n: [3, 6, 7], e: [14, 23, 15] },
                    { n: [3, 7, 11], e: [15, 27, 17] },
                    { n: [3, 9, 6], e: [16, 25, 14] },
                    { n: [4, 8, 9], e: [19, 28, 20] },
                    { n: [5, 11, 10], e: [22, 29, 21] },
                    { n: [6, 9, 8], e: [25, 28, 24] },
                    { n: [7, 10, 11], e: [26, 29, 27] },
                ];
        };
        Icosphere.prototype.subdivide = function () {
            var _this = this;
            var nodes = [];
            for (var i = 0; i < this.icosahedron.nodes.length; ++i) {
                nodes.push({ p: this.icosahedron.nodes[i].p, e: [], f: [] });
            }
            var edges = [];
            for (var i = 0; i < this.icosahedron.edges.length; ++i) {
                var edge = this.icosahedron.edges[i];
                edge.subdivided_n = [];
                edge.subdivided_e = [];
                var n0 = this.icosahedron.nodes[edge.n[0]];
                var n1 = this.icosahedron.nodes[edge.n[1]];
                var p0 = n0.p;
                var p1 = n1.p;
                var delta = p1.subtract(p0);
                nodes[edge.n[0]].e.push(edges.length);
                var priorNodeIndex = edge.n[0];
                for (var s = 1; s < this.degree; ++s) {
                    var edgeIndex = edges.length;
                    var nodeIndex = nodes.length;
                    edge.subdivided_e.push(edgeIndex);
                    edge.subdivided_n.push(nodeIndex);
                    edges.push({ n: [priorNodeIndex, nodeIndex], f: [] });
                    priorNodeIndex = nodeIndex;
                    nodes.push({ p: BABYLON.Vector3.Lerp(p0, p1, s / this.degree), e: [edgeIndex, edgeIndex + 1], f: [] });
                }
                edge.subdivided_e.push(edges.length);
                nodes[edge.n[1]].e.push(edges.length);
                edges.push({ n: [priorNodeIndex, edge.n[1]], f: [] });
            }
            var faces = [];
            for (var i = 0; i < this.icosahedron.faces.length; ++i) {
                var face = this.icosahedron.faces[i];
                var edge0 = this.icosahedron.edges[face.e[0]];
                var edge1 = this.icosahedron.edges[face.e[1]];
                var edge2 = this.icosahedron.edges[face.e[2]];
                var point0 = this.icosahedron.nodes[face.n[0]].p;
                var point1 = this.icosahedron.nodes[face.n[1]].p;
                var point2 = this.icosahedron.nodes[face.n[2]].p;
                var delta = point1.subtract(point0);
                var getEdgeNode0 = (face.n[0] === edge0.n[0])
                    ? function (k) { return edge0.subdivided_n[k]; }
                    : function (k) { return edge0.subdivided_n[_this.degree - 2 - k]; };
                var getEdgeNode1 = (face.n[1] === edge1.n[0])
                    ? function (k) { return edge1.subdivided_n[k]; }
                    : function (k) { return edge1.subdivided_n[_this.degree - 2 - k]; };
                var getEdgeNode2 = (face.n[0] === edge2.n[0])
                    ? function (k) { return edge2.subdivided_n[k]; }
                    : function (k) { return edge2.subdivided_n[_this.degree - 2 - k]; };
                var faceNodes = [];
                faceNodes.push(face.n[0]);
                for (var j = 0; j < edge0.subdivided_n.length; ++j)
                    faceNodes.push(getEdgeNode0(j));
                faceNodes.push(face.n[1]);
                for (var s = 1; s < this.degree; ++s) {
                    faceNodes.push(getEdgeNode2(s - 1));
                    var p0 = nodes[getEdgeNode2(s - 1)].p;
                    var p1 = nodes[getEdgeNode1(s - 1)].p;
                    for (var t = 1; t < this.degree - s; ++t) {
                        faceNodes.push(nodes.length);
                        nodes.push({ p: BABYLON.Vector3.Lerp(p0, p1, t / (this.degree - s)), e: [], f: [] });
                    }
                    faceNodes.push(getEdgeNode1(s - 1));
                }
                faceNodes.push(face.n[2]);
                var getEdgeEdge0 = (face.n[0] === edge0.n[0])
                    ? function (k) { return edge0.subdivided_e[k]; }
                    : function (k) { return edge0.subdivided_e[_this.degree - 1 - k]; };
                var getEdgeEdge1 = (face.n[1] === edge1.n[0])
                    ? function (k) { return edge1.subdivided_e[k]; }
                    : function (k) { return edge1.subdivided_e[_this.degree - 1 - k]; };
                var getEdgeEdge2 = (face.n[0] === edge2.n[0])
                    ? function (k) { return edge2.subdivided_e[k]; }
                    : function (k) { return edge2.subdivided_e[_this.degree - 1 - k]; };
                var faceEdges0 = [];
                for (var j = 0; j < this.degree; ++j)
                    faceEdges0.push(getEdgeEdge0(j));
                var nodeIndex = this.degree + 1;
                for (var s = 1; s < this.degree; ++s) {
                    for (var t = 0; t < this.degree - s; ++t) {
                        faceEdges0.push(edges.length);
                        var edge = { n: [faceNodes[nodeIndex], faceNodes[nodeIndex + 1],], f: [] };
                        nodes[edge.n[0]].e.push(edges.length);
                        nodes[edge.n[1]].e.push(edges.length);
                        edges.push(edge);
                        ++nodeIndex;
                    }
                    ++nodeIndex;
                }
                var faceEdges1 = [];
                nodeIndex = 1;
                for (var s = 0; s < this.degree; ++s) {
                    for (var t = 1; t < this.degree - s; ++t) {
                        faceEdges1.push(edges.length);
                        var edge = { n: [faceNodes[nodeIndex], faceNodes[nodeIndex + this.degree - s],], f: [] };
                        nodes[edge.n[0]].e.push(edges.length);
                        nodes[edge.n[1]].e.push(edges.length);
                        edges.push(edge);
                        ++nodeIndex;
                    }
                    faceEdges1.push(getEdgeEdge1(s));
                    nodeIndex += 2;
                }
                var faceEdges2 = [];
                nodeIndex = 1;
                for (var s = 0; s < this.degree; ++s) {
                    faceEdges2.push(getEdgeEdge2(s));
                    for (var t = 1; t < this.degree - s; ++t) {
                        faceEdges2.push(edges.length);
                        var edge = { n: [faceNodes[nodeIndex], faceNodes[nodeIndex + this.degree - s + 1],], f: [] };
                        nodes[edge.n[0]].e.push(edges.length);
                        nodes[edge.n[1]].e.push(edges.length);
                        edges.push(edge);
                        ++nodeIndex;
                    }
                    nodeIndex += 2;
                }
                nodeIndex = 0;
                edgeIndex = 0;
                for (var s = 0; s < this.degree; ++s) {
                    for (t = 1; t < this.degree - s + 1; ++t) {
                        var subFace = {
                            n: [faceNodes[nodeIndex], faceNodes[nodeIndex + 1], faceNodes[nodeIndex + this.degree - s + 1],],
                            e: [faceEdges0[edgeIndex], faceEdges1[edgeIndex], faceEdges2[edgeIndex],]
                        };
                        nodes[subFace.n[0]].f.push(faces.length);
                        nodes[subFace.n[1]].f.push(faces.length);
                        nodes[subFace.n[2]].f.push(faces.length);
                        edges[subFace.e[0]].f.push(faces.length);
                        edges[subFace.e[1]].f.push(faces.length);
                        edges[subFace.e[2]].f.push(faces.length);
                        faces.push(subFace);
                        ++nodeIndex;
                        ++edgeIndex;
                    }
                    ++nodeIndex;
                }
                nodeIndex = 1;
                edgeIndex = 0;
                for (var s = 1; s < this.degree; ++s) {
                    for (t = 1; t < this.degree - s + 1; ++t) {
                        var subFace = {
                            n: [faceNodes[nodeIndex], faceNodes[nodeIndex + this.degree - s + 2], faceNodes[nodeIndex + this.degree - s + 1],],
                            e: [faceEdges2[edgeIndex + 1], faceEdges0[edgeIndex + this.degree - s + 1], faceEdges1[edgeIndex],]
                        };
                        nodes[subFace.n[0]].f.push(faces.length);
                        nodes[subFace.n[1]].f.push(faces.length);
                        nodes[subFace.n[2]].f.push(faces.length);
                        edges[subFace.e[0]].f.push(faces.length);
                        edges[subFace.e[1]].f.push(faces.length);
                        edges[subFace.e[2]].f.push(faces.length);
                        faces.push(subFace);
                        ++nodeIndex;
                        ++edgeIndex;
                    }
                    nodeIndex += 2;
                    edgeIndex += 1;
                }
            }
            //Project all of our points onto the unit sphere
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var n = nodes_1[_i];
                n.p.normalize().scaleInPlace(this.scale);
            }
            for (var _a = 0, faces_1 = faces; _a < faces_1.length; _a++) {
                var f = faces_1[_a];
                f.centroid = this.calculateFaceCentroid(nodes[f.n[0]].p, nodes[f.n[1]].p, nodes[f.n[2]].p);
            }
            // nodes.map(function (n) {
            //     n.p.normalize().scaleInPlace(this.scale);
            // });
            // faces.map((f) => {
            //     f.centroid = this.calculateFaceCentroid(nodes[f.n[0]].p, nodes[f.n[1]].p, nodes[f.n[2]].p)
            // });
            this.icosahedron.nodes = nodes;
            this.icosahedron.edges = edges;
            this.icosahedron.faces = faces;
        };
        Icosphere.prototype.correctFaceIndices = function () {
            for (var i = 0; i < this.icosahedron.nodes.length; ++i) {
                var node = this.icosahedron.nodes[i];
                var faceIndex = node.f[0];
                for (var j = 1; j < node.f.length - 1; ++j) {
                    faceIndex = this.findNextFaceIndex(i, faceIndex);
                    var k = node.f.indexOf(faceIndex);
                    node.f[k] = node.f[j];
                    node.f[j] = faceIndex;
                }
            }
        };
        Icosphere.prototype.calculateFaceCentroid = function (pa, pb, pc) {
            var vabHalf = pb.subtract(pa).scale(1.0 / 2.0);
            var pabHalf = pa.add(vabHalf);
            var centroid = pc.subtract(pabHalf).scale(1.0 / 3.0).add(pabHalf);
            return centroid;
        };
        Icosphere.prototype.getEdgeOppositeFaceIndex = function (edge, faceIndex) {
            if (edge.f[0] === faceIndex)
                return edge.f[1];
            if (edge.f[1] === faceIndex)
                return edge.f[0];
        };
        Icosphere.prototype.findNextFaceIndex = function (nodeIndex, faceIndex) {
            var node = this.icosahedron.nodes[nodeIndex];
            var face = this.icosahedron.faces[faceIndex];
            var nodeFaceIndex = face.n.indexOf(nodeIndex);
            var edge = this.icosahedron.edges[face.e[(nodeFaceIndex + 2) % 3]];
            return this.getEdgeOppositeFaceIndex(edge, faceIndex);
        };
        return Icosphere;
    }());
    POLITIK.Icosphere = Icosphere;
})(POLITIK || (POLITIK = {}));
/// <reference path="Icosphere.ts" />
var POLITIK;
(function (POLITIK) {
    var Planet = (function () {
        function Planet(scale, degree, scene) {
            this.scale = scale;
            this.degree = degree;
            this.scene = scene;
            this.planet = {
                faceToTile: [],
                mesh: new BABYLON.Mesh("planet", scene)
            };
            this.icosphere = new POLITIK.Icosphere(scale, degree);
        }
        Planet.prototype.revolve = function () {
            this.planet.mesh.rotation.y += -0.0005;
            this.planet.mesh.rotation.x += -0.0005 / 4;
            if (this.selectedBorder != null)
                this.selectedBorder.rotation = this.planet.mesh.rotation;
        };
        Planet.prototype.pickTile = function (faceId) {
            if (this.selectedBorder != null)
                this.selectedBorder.dispose();
            var tileId = this.planet.faceToTile[faceId];
            // var numFaces: number = this.icosphere.icosahedron.nodes[tileId].f.length;
            var color = new BABYLON.Color3(242 / 255, 182 / 255, 64 / 255);
            var linePositions = [];
            // Get all the centroids of the faces adjacent to this vertex
            // for (var f = 0; f < numFaces; f++) {
            //     var centroid = sdIco.faces[sdIco.nodes[tileId].f[f]].centroid;
            //     linePositions.push(centroid);
            // }
            for (var _i = 0, _a = this.icosphere.icosahedron.nodes[tileId].f; _i < _a.length; _i++) {
                var f = _a[_i];
                var centroid = this.icosphere.icosahedron.faces[f].centroid;
                linePositions.push(centroid);
            }
            linePositions.push(this.icosphere.icosahedron.faces[this.icosphere.icosahedron.nodes[tileId].f[0]].centroid);
            this.selectedBorder = BABYLON.Mesh.CreateLines("lines", linePositions, this.scene);
        };
        Planet.prototype.render = function () {
            var material = new BABYLON.StandardMaterial("mat", this.scene);
            material.specularColor = new BABYLON.Color3(0, 0, 0); // No specular color
            var indices = [];
            var colors = [];
            var positions = [];
            // Generate dual polyhedron position and face indices
            for (var n = 0; n < this.icosphere.icosahedron.nodes.length; n++) {
                var relativeZeroIndex = positions.length / 3;
                var numFaces = this.icosphere.icosahedron.nodes[n].f.length;
                var color = new BABYLON.Color3(0, Math.random() * 0.5, Math.random() * 1);
                // Get all the centroids of the faces adjacent to this vertex
                for (var f = 0; f < numFaces; f++) {
                    var centroid = this.icosphere.icosahedron.faces[this.icosphere.icosahedron.nodes[n].f[f]].centroid;
                    positions.push(centroid.x);
                    positions.push(centroid.y);
                    positions.push(centroid.z);
                    colors.push(color.r);
                    colors.push(color.g);
                    colors.push(color.b);
                    colors.push(1.0);
                }
                for (var i = relativeZeroIndex; i < (positions.length / 3) - 2; i++) {
                    this.planet.faceToTile[indices.length / 3] = n;
                    indices.push(relativeZeroIndex);
                    indices.push(i + 1);
                    indices.push(i + 2);
                }
            }
            this.planet.mesh.useVertexColors = true;
            var vertexData = new BABYLON.VertexData();
            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.colors = colors;
            var normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);
            vertexData.normals = normals;
            vertexData.applyToMesh(this.planet.mesh, false);
            this.planet.mesh.material = material;
        };
        return Planet;
    }());
    POLITIK.Planet = Planet;
})(POLITIK || (POLITIK = {}));
/// <reference path="Planet.ts" />
var POLITIK;
(function (POLITIK) {
    var Game = (function () {
        function Game() {
            if (!BABYLON.Engine.isSupported()) {
                throw "Browser does not support WebGL!";
            }
            BABYLON.Engine.ShadersRepository = "/src/Shaders/";
            this.canvas = document.getElementById("renderCanvas");
            this.engine = new BABYLON.Engine(this.canvas, true);
            this.scene = new BABYLON.Scene(this.engine);
            this.scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            this.createCamera();
            this.createSunAndMoon();
            this.planet = new POLITIK.Planet(20, 60, this.scene); //This line renders the Icosahedron planet
            this.planet.render();
            // camera.attachControl(canvas);
            this.registerBeforeRender();
            this.runRenderLoop();
            this.registerClick();
        }
        Game.prototype.registerClick = function () {
            var _this = this;
            window.addEventListener("click", function () {
                var faceId = _this.scene.pick(_this.scene.pointerX, _this.scene.pointerY).faceId;
                _this.planet.pickTile(faceId);
            });
        };
        Game.prototype.createCamera = function () {
            // Camera
            var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -0), this.scene);
            camera.setPosition(new BABYLON.Vector3(-60, 0, 0));
            camera.attachControl(this.canvas, true);
        };
        Game.prototype.createSunAndMoon = function () {
            // Sun & Moon
            var sun = new BABYLON.HemisphericLight("sun", new BABYLON.Vector3(0, 0, 1), this.scene);
            sun.intensity = 1.0;
            var moon = new BABYLON.HemisphericLight("moon", new BABYLON.Vector3(0, 0, -1), this.scene);
            moon.intensity = 0.2;
        };
        Game.prototype.registerBeforeRender = function () {
            var _this = this;
            this.scene.registerBeforeRender(function () {
                _this.planet.revolve();
                // if(selectedBorder != null) selectedBorder.rotation = polygon.rotation;
            });
        };
        Game.prototype.runRenderLoop = function () {
            var _this = this;
            this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
        };
        return Game;
    }());
    POLITIK.Game = Game;
})(POLITIK || (POLITIK = {}));
