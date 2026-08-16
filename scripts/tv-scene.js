import * as THREE from "three";

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
  const bodyGeometry = new THREE.ExtrudeGeometry(createRoundedRectShape(3.7, 2.65, 0.35), {
    depth: 1.25,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.12,
    bevelThickness: 0.12,
    curveSegments: 12,
  });
  bodyGeometry.center();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b0b0b,
    roughness: 0.72,
    metalness: 0.08,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  tv.add(body);

  const screenGeometry = new THREE.PlaneGeometry(2.5, 1.65, 28, 20);
  const positions = screenGeometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index) / 1.25;
    const y = positions.getY(index) / 0.825;
    positions.setZ(index, 0.13 * Math.max(0, 1 - x * x) * Math.max(0, 1 - y * y));
  }
  screenGeometry.computeVertexNormals();
  const screen = new THREE.Mesh(screenGeometry, createScreenMaterial());
  screen.position.set(-0.32, 0.12, 0.755);
  tv.add(screen);

  const bezelGeometry = new THREE.RingGeometry(1.04, 1.13, 48);
  bezelGeometry.scale(1.25, 0.83, 1);
  const bezel = new THREE.Mesh(bezelGeometry, new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.85 }));
  bezel.position.set(-0.32, 0.12, 0.73);
  tv.add(bezel);

  const dialMaterial = new THREE.MeshStandardMaterial({ color: 0xc8c8c8, roughness: 0.38, metalness: 0.28 });
  for (const y of [0.52, -0.22]) {
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.13, 32), dialMaterial);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(1.34, y, 0.78);
    dial.castShadow = true;
    tv.add(dial);
  }

  const slotMaterial = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 });
  for (let index = 0; index < 5; index += 1) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.035, 0.035), slotMaterial);
    slot.position.set(1.33, -0.72 - index * 0.09, 0.75);
    tv.add(slot);
  }

  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.8 });
  for (const x of [-1.25, 1.25]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.62, 0.22), legMaterial);
    leg.position.set(x, -1.55, 0.02);
    leg.rotation.z = x < 0 ? -0.16 : 0.16;
    leg.castShadow = true;
    tv.add(leg);
  }

  const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.48, metalness: 0.32 });
  for (const direction of [-1, 1]) {
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.25, 12), antennaMaterial);
    antenna.position.set(direction * 0.43, 1.83, -0.08);
    antenna.rotation.z = direction * -0.45;
    tv.add(antenna);
  }

  return tv;
}

export function createTvScene(container, { reducedMotion = false } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.05, 7.2);

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
  floor.position.y = -1.9;
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
    tv.scale.setScalar(scale);
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
