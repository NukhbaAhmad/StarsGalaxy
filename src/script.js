import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Gui
const gui = new dat.GUI({ width: 340, closed: true });

// Scene
const scene = new THREE.Scene();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Mesh
const parameters = {
  count: 2500,
  size: 0.01,
  radius: 4,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  RandomnessPower: 3,
  InsideColor: "#ff6030",
  OutsideColor: "#1b3984",
};
let geometry,
  Material,
  Points = null;

const generateGalaxy = () => {
  // Destroy prev Geometry
  if (Points !== null) {
    geometry.dispose();
    Material.dispose();
    scene.remove(Points);
  }

  //   Generate Particles
  geometry = new THREE.BufferGeometry();

  //   Calculate Poisition by vertex-3
  const positions = new Float32Array(parameters.count * 3);
  // Color for vertec
  const colors = new Float32Array(parameters.count * 3);

  // Color Instance
  const ColorInside = new THREE.Color(parameters.InsideColor);
  const ColorOutside = new THREE.Color(parameters.OutsideColor);

  for (let i = 1; i < parameters.count; i++) {
    // Vertex-3 (x , y , z)
    const i3 = i * 3;

    // Radius of galaxy - set the points position till radius
    const radius = Math.random() * parameters.radius;

    // Spin Angle

    // Particle Further away from centre more spin we want ----- Use the particles distance/radius * spin
    const SpinAngle = radius * parameters.spin;

    // BranchesAngle

    // 0  1       2     3   4     5     6    7      8     9  ---- i
    // 0  1       2     0   1     2     0    1      2     0  ----- i%3
    // 0  0.33    0.66  0   0.33  0.66  0    0.33   0.66  0  -----  /3
    // 0  angles                                             ----- Math.PI * 2 (Angles on full circle)

    const BranchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    // Random Particles
    const randomX =
      Math.pow(Math.random(), parameters.RandomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.RandomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.RandomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    // Position - Vertex-1 (x)
    positions[i3] = Math.cos(BranchAngle + SpinAngle) * radius + randomX;
    // Vertex-1 (y)
    positions[i3 + 1] = randomY;
    // Vertex-1 (z)
    positions[i3 + 2] = Math.sin(BranchAngle + SpinAngle) * radius + randomZ;

    // COLORS
    const mixedColor = ColorInside.clone();
    mixedColor.lerp(ColorOutside, radius / parameters.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  //   Set Positions calculated for vertex
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // Set Color For vertex
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  //   PointsMaterial
  Material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  //   pointsMesh
  Points = new THREE.Points(geometry, Material);
  scene.add(Points);
};
generateGalaxy();

// Tweaks
gui
  .add(parameters, "count")
  .min(1000)
  .max(10000)
  .step(200)
  .name("Particle Count")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .name("Particle Size")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "radius")
  .min(0.1)
  .max(4)
  .step(0.1)
  .name("Radius")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "branches")
  .min(3)
  .max(8)
  .step(1)
  .name("Galaxy Branches")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "spin")
  .min(-3)
  .max(3)
  .step(0.001)
  .name("Galaxy Spin")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.01)
  .name("Randomness")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "RandomnessPower")
  .min(3)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui.addColor(parameters, "InsideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "OutsideColor").onFinishChange(generateGalaxy);

// Size
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// Camera
const camera = new THREE.PerspectiveCamera(
  55,
  size.width / size.height,
  1,
  100
);
camera.position.z = 6;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Animate
const clock = new THREE.Clock();
const SnapShot = () => {
  //Update Controls
  controls.update();

  // ElapsedTime
  const elapsedTime = clock.getElapsedTime();

  //Galaxy Rotation
  Points.rotation.y = elapsedTime * 0.01;

  //   Scene Render
  renderer.render(scene, camera);

  //   FrameRate
  window.requestAnimationFrame(SnapShot);
};
SnapShot();

//Resize
window.addEventListener("resize", () => {
  // Update Size
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  // Update Camera Aspect
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  // Update PixelRatio
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update Renderer Size
  renderer.setSize(size.width, size.height);
});

//Handle FullScreen
window.addEventListener("dblclick", () => {
  const FullScreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;
  //To enter Full Screen
  if (!FullScreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  }
  //To exit Full Screen
  else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});
