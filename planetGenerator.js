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

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( -1, -1, -1 );
  scene.add( light );

  light = new THREE.AmbientLight( 0x222222 );
  scene.add( light );

  //Create the planet mesh
  renderPlanet(300, 20, scene);

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
