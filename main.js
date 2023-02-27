import * as THREE from "three";
import * as CANNON from "cannon-es";

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// Set up the physics engine
const world = new CANNON.World();
world.gravity.set(0, 0, 0);

// Create the Sun mesh and its corresponding physics body
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

const sunShape = new CANNON.Sphere(10);
const sunBody = new CANNON.Body({ mass: 0 });
sunBody.addShape(sunShape);
world.addBody(sunBody);

// Create a PointLight at the position of the Sun mesh
const sunLight = new THREE.PointLight(0xffffff, 1, 0, 2);
sunLight.position.copy(sunMesh.position);
scene.add(sunLight);

// Create a DirectionalLight that is aligned with the camera
const cameraLight = new THREE.DirectionalLight(0xffffff, 1);
cameraLight.position.copy(camera.position);
cameraLight.target.position.set(0, 0, 0);
scene.add(cameraLight);

// Create an array of planets with their respective radii, distances from the Sun, and speed of rotation
const planets = [
  {
    name: "Mercury",
    radius: 0.38,
    distance: 30,
    rotationSpeed: 0.02,
    color: 0xffa500,
  },
  {
    name: "Venus",
    radius: 0.95,
    distance: 50,
    rotationSpeed: 0.01,
    color: 0xffc0cb,
  },
  {
    name: "Earth",
    radius: 1,
    distance: 70,
    rotationSpeed: 0.01,
    color: 0x0080ff,
  },
  {
    name: "Mars",
    radius: 0.53,
    distance: 90,
    rotationSpeed: 0.008,
    color: 0xff5733,
  },
  {
    name: "Jupiter",
    radius: 11.2,
    distance: 120,
    rotationSpeed: 0.005,
    color: 0xffd700,
  },
  {
    name: "Saturn",
    radius: 9.45,
    distance: 150,
    rotationSpeed: 0.004,
    color: 0xffffe0,
  },
  {
    name: "Uranus",
    radius: 4,
    distance: 180,
    rotationSpeed: 0.003,
    color: 0xafeeee,
  },
  {
    name: "Neptune",
    radius: 3.88,
    distance: 210,
    rotationSpeed: 0.002,
    color: 0x0000ff,
  },
];

const planetMaterials = planets.map(
  (planet) => new THREE.MeshLambertMaterial({ color: planet.color })
);

// Create the meshes for each planet and add them to the scene
const planetMeshes = planets.map((planet, i) => {
  const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
  const mesh = new THREE.Mesh(geometry, planetMaterials[i]);
  mesh.position.x = planet.distance;
  scene.add(mesh);
  return mesh;
});

// Define the orbits for each planet
const orbits = [
  { radius: 57.9, inclination: 7.0 }, // Mercury
  { radius: 108.2, inclination: 3.4 }, // Venus
  { radius: 149.6, inclination: 0.0 }, // Earth
  { radius: 227.9, inclination: 1.9 }, // Mars
  { radius: 778.3, inclination: 1.3 }, // Jupiter
  { radius: 1427.0, inclination: 2.5 }, // Saturn
  { radius: 2871.0, inclination: 0.8 }, // Uranus
  { radius: 4497.1, inclination: 1.8 }, // Neptune
];

// Create a mesh and a physics body for each planet, and add them to the scene and the physics engine
planets.forEach((planet) => {
  const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: planet.color });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const shape = new CANNON.Sphere(planet.radius);
  const body = new CANNON.Body({ mass: planet.radius ** 3 });
  body.addShape(shape);
  body.position.set(planet.distance, 0, 0);
  body.velocity.set(
    0,
    Math.sqrt((sunBody.mass * 6.674e-11) / planet.distance),
    0
  );
  world.addBody(body);

  planet.mesh = mesh;
  planet.body = body;
});

// Position the camera and look at the Sun
camera.position.z = 400;
camera.lookAt(sunMesh.position);

const clock = new THREE.Clock();
let delta;

// Define the animation loop
function animate() {
  requestAnimationFrame(animate);

  delta = Math.min(clock.getDelta(), 0.1);
  world.step(delta);

  // Rotate the planets around the sun
  planetMeshes.forEach((mesh, i) => {
    const planet = planets[i];
    const speed = 0.1 / planet.distance;
    mesh.position.x = planet.distance * Math.sin(Date.now() * speed);
    mesh.position.z = planet.distance * Math.cos(Date.now() * speed);
  });
  // // Rotate the planets around the sun
  // planetMeshes.forEach((mesh, i) => {
  //   const planet = mesh[i];
  //   const orbit = orbits[i];

  //   const speed = 0.05 / planet.distance;
  //   // mesh.position.x = planet.distance * Math.sin(Date.now() * speed);
  //   // mesh.position.z = planet.distance * Math.cos(Date.now() * speed);

  //   // Update the planet's position based on its current angle in its orbit
  //   // Set the initial position of the planet
  //   const angle = Math.random() * Math.PI * 2;

  //   const position = new THREE.Vector3().setFromSphericalCoords(
  //     orbit.radius,
  //     THREE.MathUtils.degToRad(angle),
  //     orbit.inclination
  //   );

  //   planet.position.set(position.x, position.y, position.z);
  //   // mesh.position.x = position.x;
  //   // mesh.position.y = position.y;
  //   // mesh.position.z = position.z;

  //   // Update the planet's angle in its orbit
  //   // planet.userData.angle = angle;
  // });

  render();
}

function render() {
  renderer.render(scene, camera);
}

animate();
