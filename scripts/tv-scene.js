import * as THREE from "three";
import { TV_PROFILE, getBottomButtonPositions } from "./tv-profile.js";

function createRoundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function createScreenMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const context = canvas.getContext("2d");

  context.fillStyle = "#101711";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const glow = context.createRadialGradient(512, 280, 20, 512, 280, 560);
  glow.addColorStop(0, "rgba(115, 215, 138, .18)");
  glow.addColorStop(1, "rgba(16, 23, 17, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#a8ecb4";
  context.font = "34px monospace";
  [
    "const vision = team.idea;",
    "",
    "export default",
    "  compile(vision);",
    "",
    "// rendering...",
  ].forEach((line, index) => context.fillText(line, 66, 100 + index * 76));

  context.fillStyle = "rgba(0, 0, 0, .2)";
  for (let y = 0; y < canvas.height; y += 8) {
    context.fillRect(0, y, canvas.width, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return new THREE.MeshBasicMaterial({ map: texture });
}

function createTvModel() {
  const tv = new THREE.Group();
  const bodyGeometry = new THREE.ExtrudeGeometry(
    createRoundedRectShape(TV_PROFILE.bodyWidth, TV_PROFILE.bodyHeight, 0.22),
    {
      depth: TV_PROFILE.bodyDepth,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
      curveSegments: 8,
    },
  );
  bodyGeometry.center();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: TV_PROFILE.bodyColor,
    roughness: 0.78,
    metalness: 0.04,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  tv.add(body);

  const bezel = new THREE.Mesh(
    new THREE.ShapeGeometry(createRoundedRectShape(3.78, 2.46, 0.22), 16),
    new THREE.MeshStandardMaterial({ color: 0x383a38, roughness: 0.9 }),
  );
  bezel.position.set(-0.18, 0.28, 1.005);
  tv.add(bezel);

  const screenGeometry = new THREE.PlaneGeometry(TV_PROFILE.screenWidth, TV_PROFILE.screenHeight, 32, 22);
  const positions = screenGeometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index) / (TV_PROFILE.screenWidth / 2);
    const y = positions.getY(index) / (TV_PROFILE.screenHeight / 2);
    positions.setZ(index, 0.16 * Math.max(0, 1 - x * x) * Math.max(0, 1 - y * y));
  }
  screenGeometry.computeVertexNormals();
  const screen = new THREE.Mesh(screenGeometry, createScreenMaterial());
  screen.position.set(-0.18, 0.28, 1.025);
  tv.add(screen);

  const controlMaterial = new THREE.MeshStandardMaterial({ color: 0x555754, roughness: 0.76 });
  for (const x of getBottomButtonPositions(TV_PROFILE.buttonCount, 0.25)) {
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.07, 20), controlMaterial);
    button.rotation.x = Math.PI / 2;
    button.position.set(x - 0.48, -1.22, 1.01);
    tv.add(button);
  }

  const powerButton = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24), controlMaterial);
  powerButton.rotation.x = Math.PI / 2;
  powerButton.position.set(1.48, -1.22, 1.015);
  tv.add(powerButton);

  const speakerMaterial = new THREE.MeshStandardMaterial({ color: 0x4b4d4b, roughness: 0.95 });
  const speaker = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.045, 48), speakerMaterial);
  speaker.rotation.z = Math.PI / 2;
  speaker.position.set(2.35, 0.08, 0.08);
  tv.add(speaker);
  for (const radius of [0.2, 0.34, 0.48]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.018, 8, 48), speakerMaterial);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(2.38, 0.08, 0.08);
    tv.add(ring);
  }

  return tv;
}

export function createTvScene(container, { reducedMotion = false } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.05, TV_PROFILE.cameraDistance);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.append(renderer.domElement);

  const tv = createTvModel();
  scene.add(tv);

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(-4, 5, 7);
  keyLight.castShadow = true;
  scene.add(keyLight);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.9));

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 5),
    new THREE.ShadowMaterial({ color: 0x0b0b0b, opacity: 0.14 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.65;
  floor.receiveShadow = true;
  scene.add(floor);

  let active = true;
  let destroyed = false;

  function render() {
    if (!active || destroyed) return;
    renderer.render(scene, camera);
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }

  function update({ x, y, rotationX, rotationY, scale }) {
    tv.position.set(x * 3.7, y * 2.2, 0);
    tv.rotation.set(rotationX, rotationY, 0);
    tv.scale.setScalar(scale * TV_PROFILE.restingScale);
    render();
  }

  function setActive(nextActive) {
    active = nextActive;
    if (active) render();
  }

  function destroy() {
    destroyed = true;
    scene.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      } else {
        object.material?.map?.dispose();
        object.material?.dispose();
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
  }

  resize();
  update({
    x: reducedMotion ? 0 : 1.35,
    y: reducedMotion ? 0 : 0.08,
    rotationX: 0,
    rotationY: -0.08,
    scale: reducedMotion ? 1 : 0.94,
  });

  return { update, resize, setActive, destroy };
}
