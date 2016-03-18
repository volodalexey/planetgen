var container;
var camera, controls, scene, renderer;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

init();
animate();

var planet = window.planet;

function init() {
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 600;

  controls = new THREE.OrbitControls( camera );
  controls.addEventListener( 'change', render );

  scene = new THREE.Scene();


  // lights
  var sun = new THREE.DirectionalLight( 0xffffff );
  sun.position.set( -1, 0, 0 );
  scene.add( sun );

  var universalLight = new THREE.AmbientLight( 0xffffff );
  universalLight.intensity = 0.3;
  scene.add( universalLight );

  //Create the planet mesh
  var start = new Date();
  renderPlanet(300, 80, scene);

  console.log("Computation done in: " + (new Date() - start) + " ms");

  // renderer
  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setClearColor( new THREE.Color(0.5, 0.5, 0.5), 1 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener( 'click', onMouseClick, false );

  render();

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  render();
}

function onMouseClick( event ) {
  var intersects = [];

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  planet.mesh.raycast(raycaster, intersects);

  for ( var i = 0; i < intersects.length; i++ ) {
    pickTile(intersects[i].face.tileId, scene);
  }

  render();
}

function animate() {
  requestAnimationFrame( animate );
  controls.update();
}

function render() {
  renderer.render( scene, camera );
}
