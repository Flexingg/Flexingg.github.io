// A small parametric "pillow-block bracket" assembly, built from primitives
// (no external model file needed for the placeholder). Swap in a real
// STL/STEP loader here once you have an actual model to show.
// Resolved via the import map in index.html (three.js needs one for its
// examples/addons, which use bare "three" imports internally).
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const PART_COLOR = 0x4fd1c5;
const BOLT_COLOR = 0x8a94a6;
const SHAFT_COLOR = 0xc9cfda;

export function initCadViewer() {
  const holder = document.getElementById("cad-canvas-holder");
  if (!holder) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, holder.clientWidth / holder.clientHeight, 0.1, 100);
  camera.position.set(5, 4, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(holder.clientWidth, holder.clientHeight);
  holder.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 14;

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(5, 8, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4fd1c5, 0.4);
  rim.position.set(-6, 2, -4);
  scene.add(rim);

  // ---- Assembly group: base plate, two support walls, shaft, four bolts ----
  const assembly = new THREE.Group();
  scene.add(assembly);

  const solidMat = new THREE.MeshStandardMaterial({ color: PART_COLOR, metalness: 0.35, roughness: 0.5 });
  const boltMat = new THREE.MeshStandardMaterial({ color: BOLT_COLOR, metalness: 0.6, roughness: 0.4 });
  const shaftMat = new THREE.MeshStandardMaterial({ color: SHAFT_COLOR, metalness: 0.7, roughness: 0.25 });

  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 2.2), solidMat);
  basePlate.position.set(0, -0.9, 0);

  const wallGeo = new THREE.BoxGeometry(0.3, 1.6, 2.2);
  const wallLeft = new THREE.Mesh(wallGeo, solidMat);
  wallLeft.position.set(-1.5, -0.05, 0);
  const wallRight = new THREE.Mesh(wallGeo, solidMat);
  wallRight.position.set(1.5, -0.05, 0);

  const shaftGeo = new THREE.CylinderGeometry(0.35, 0.35, 4.2, 32);
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.set(0, 0.55, 0);

  const boltGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.5, 12);
  const boltOffsets = [
    [-1.75, -0.95, 0.85],
    [1.75, -0.95, 0.85],
    [-1.75, -0.95, -0.85],
    [1.75, -0.95, -0.85],
  ];
  const bolts = boltOffsets.map(([x, y, z]) => {
    const bolt = new THREE.Mesh(boltGeo, boltMat);
    bolt.position.set(x, y, z);
    return bolt;
  });

  const parts = [basePlate, wallLeft, wallRight, shaft, ...bolts];
  // Explode directions: how far each part moves outward at explode=1.
  const explodeVectors = [
    new THREE.Vector3(0, -1.4, 0), // base plate down
    new THREE.Vector3(-1.1, 0, 0), // left wall out
    new THREE.Vector3(1.1, 0, 0), // right wall out
    new THREE.Vector3(0, 1.2, 0), // shaft up
    new THREE.Vector3(-0.4, -0.9, 0.4),
    new THREE.Vector3(0.4, -0.9, 0.4),
    new THREE.Vector3(-0.4, -0.9, -0.4),
    new THREE.Vector3(0.4, -0.9, -0.4),
  ];
  const basePositions = parts.map((p) => p.position.clone());

  parts.forEach((p) => assembly.add(p));
  assembly.rotation.y = 0.4;

  let wireframe = false;
  let autoRotate = false;
  let explode = 0;

  function applyExplode(value) {
    explode = value;
    parts.forEach((p, i) => {
      const target = basePositions[i].clone().addScaledVector(explodeVectors[i], value);
      p.position.copy(target);
    });
  }

  function applyWireframe(value) {
    wireframe = value;
    [solidMat, boltMat, shaftMat].forEach((m) => (m.wireframe = value));
  }

  function resetView() {
    camera.position.set(5, 4, 6);
    controls.target.set(0, -0.2, 0);
    controls.update();
    document.getElementById("cad-explode").value = 0;
    applyExplode(0);
    if (wireframe) {
      document.getElementById("cad-wireframe").checked = false;
      applyWireframe(false);
    }
  }

  // ---- Wire up controls ----
  const explodeInput = document.getElementById("cad-explode");
  explodeInput.addEventListener("input", (e) => applyExplode(parseFloat(e.target.value)));

  const wireframeInput = document.getElementById("cad-wireframe");
  wireframeInput.addEventListener("change", (e) => applyWireframe(e.target.checked));

  const autoRotateInput = document.getElementById("cad-autorotate");
  autoRotateInput.addEventListener("change", (e) => {
    autoRotate = e.target.checked;
  });

  document.getElementById("cad-reset").addEventListener("click", resetView);

  controls.target.set(0, -0.2, 0);
  controls.update();

  function onResize() {
    const w = holder.clientWidth;
    const h = holder.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate) assembly.rotation.y += 0.006;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
