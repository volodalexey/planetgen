var sdIco,
    planet = {
      geometry: new THREE.Geometry(),
      mesh: null,
      selectedBorder: null,
      border: {
        geometry: new THREE.Geometry(),
        material: new THREE.LineBasicMaterial({
                  	color: 0x000000,
                    linewidth: 1.1
                  })
      }
    };

window.planet = planet;

function renderPlanet(scale, degree, scene)
{
  var material = new THREE.MeshPhongMaterial( { vertexColors: THREE.VertexColors,
                                                specular: 0x000000
                                              } );
  planet.geometry = new THREE.Geometry();
  sdIco = generateSubdividedIcosahedron(scale, degree);

  // Order faces so rendering can be done in CCW order
  for (var i = 0; i < sdIco.nodes.length; ++i)
  {
    var node = sdIco.nodes[i];
    var faceIndex = node.f[0];
    for (var j = 1; j < node.f.length - 1; ++j)
    {
      faceIndex = findNextFaceIndex(sdIco, i, faceIndex);
      var k = node.f.indexOf(faceIndex);
      node.f[k] = node.f[j];
      node.f[j] = faceIndex;
    }
  }

  // Generate dual polyhedron position and face indices
  for (var n = 0; n < sdIco.nodes.length; n++) {
    var relativeZeroIndex = planet.geometry.vertices.length,
        numFaces = sdIco.nodes[n].f.length;

    var color = new THREE.Color(0, Math.random() * 0.5, Math.random() * 1);

    // Get all the centroids of the faces adjacent to this vertex
    for (var f = 0; f < numFaces; f++) {
      var centroid = sdIco.faces[sdIco.nodes[n].f[f]].centroid,
          nextCentroid = (f !== numFaces - 1) ? sdIco.faces[sdIco.nodes[n].f[f+1]].centroid
                                              : sdIco.faces[sdIco.nodes[n].f[0]].centroid;

      planet.border.geometry.vertices.push(centroid);
      planet.border.geometry.vertices.push(nextCentroid);

      planet.geometry.vertices.push(centroid);
    }

    for(var i = relativeZeroIndex; i < planet.geometry.vertices.length - 2; i++) {
      var face = new THREE.Face3(relativeZeroIndex, i+2, i+1);
      face.color = color;
      face.tileId = n;
      planet.geometry.faces.push(face);
    }
  }

  planet.geometry.mergeVertices();
  planet.geometry.computeFaceNormals();

  planet.mesh = new THREE.Mesh( planet.geometry, material );
  planet.mesh.position.x = 0;
  planet.mesh.position.y = 0;
  planet.mesh.position.z = 0;

  planet.mesh.geometry.dynamic = true;
  scene.add( planet.mesh );

  var borders = new THREE.LineSegments(planet.border.geometry, planet.border.material);
  scene.add( borders );
}

function pickTile(tileId, scene) {
  if(planet.selectedBorder != null) scene.remove(planet.selectedBorder);
  var newBorder = new THREE.Geometry(),
      newBorderMat = new THREE.LineBasicMaterial({
                        color: 0xf2b640,
                        linewidth: 4
                      });

  var numFaces = sdIco.nodes[tileId].f.length;

  for (var f = 0; f < numFaces; f++) {
    var centroid = sdIco.faces[sdIco.nodes[tileId].f[f]].centroid,
        nextCentroid = (f !== numFaces - 1) ? sdIco.faces[sdIco.nodes[tileId].f[f+1]].centroid
                                            : sdIco.faces[sdIco.nodes[tileId].f[0]].centroid;

    newBorder.vertices.push(centroid);
    newBorder.vertices.push(nextCentroid);
  }

  planet.selectedBorder = new THREE.LineSegments(newBorder, newBorderMat);
  scene.add ( planet.selectedBorder );
}
