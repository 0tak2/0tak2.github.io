import * as THREE from "three";
import { TV_PROFILE, getBottomButtonPositions } from "./tv-profile.js";
import {
  VIDEO_SYNTH_COLORS,
  getVideoSynthFrame,
  shouldRenderScreenFrame,
} from "./tv-screen-motion.js";

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

function createScreenMaterial({ reducedMotion }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const context = canvas.getContext("2d");
  const feedbackCanvas = document.createElement("canvas");
  feedbackCanvas.width = canvas.width;
  feedbackCanvas.height = canvas.height;
  const feedbackContext = feedbackCanvas.getContext("2d");
  let hasRendered = false;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.MeshBasicMaterial({ map: texture });

  function update(elapsedMs) {
    const frame = getVideoSynthFrame(elapsedMs);
    const { width, height } = canvas;

    if (hasRendered) feedbackContext.drawImage(canvas, 0, 0);

    context.globalCompositeOperation = "source-over";
    context.fillStyle = hasRendered ? "rgba(5, 7, 16, 0.32)" : "#050710";
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = "screen";
    frame.fields.forEach((field, index) => {
      const color = VIDEO_SYNTH_COLORS[index];
      const x = field.x * width;
      const y = field.y * height;
      const radius = field.radius * Math.max(width, height);
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `${color}cc`);
      gradient.addColorStop(0.5, `${color}66`);
      gradient.addColorStop(1, "transparent");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    });

    context.globalCompositeOperation = "source-over";
    if (hasRendered) {
      context.save();
      context.globalAlpha = 0.18;
      context.translate(width / 2, height / 2);
      context.scale(frame.feedbackScale, frame.feedbackScale);
      context.translate(-width / 2, -height / 2);
      context.drawImage(feedbackCanvas, 0, 0);
      context.restore();
    }

    const jitter = Math.round((frame.glitch - 0.5) * 18);
    const codeLines = [
      "const vision = team.idea;",
      "export default compile(vision);",
      "render(signal + color);",
      "// synchronized imagination",
    ];
    context.font = "30px ui-monospace, SFMono-Regular, Menlo, monospace";
    codeLines.forEach((line, index) => {
      const y = 120 + index * 104;
      context.fillStyle = "rgba(255, 47, 179, 0.72)";
      context.fillText(line, 70 + jitter, y);
      context.fillStyle = "rgba(22, 231, 255, 0.72)";
      context.fillText(line, 70 - jitter, y + 2);
      context.fillStyle = "rgba(255, 255, 255, 0.82)";
      context.fillText(line, 70, y + 1);
    });

    context.fillStyle = `rgba(255, 255, 255, ${0.035 + frame.glitch * 0.05})`;
    for (let index = 0; index < 90; index += 1) {
      const x = (elapsedMs * (index + 3) * 0.043) % width;
      const y = (elapsedMs * (index + 11) * 0.071) % height;
      context.fillRect(x, y, 1 + (index % 3), 1);
    }

    context.fillStyle = "rgba(0, 0, 0, 0.22)";
    for (let y = frame.scanlineOffset * 8 - 8; y < height; y += 8) {
      context.fillRect(0, y, width, 2);
    }

    texture.needsUpdate = true;
    hasRendered = true;
  }

  function dispose() {
    texture.dispose();
    material.dispose();
  }

  return { material, update, dispose };
}

function createTvModel({ reducedMotion }) {
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
    roughness: 0.88,
    metalness: 0,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  tv.add(body);

  const bezel = new THREE.Mesh(
    new THREE.ShapeGeometry(createRoundedRectShape(3.78, 2.46, 0.22), 16),
    new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.92 }),
  );
  bezel.position.set(TV_PROFILE.screenCenterX, 0.28, 1.005);
  tv.add(bezel);

  const screenGeometry = new THREE.PlaneGeometry(TV_PROFILE.screenWidth, TV_PROFILE.screenHeight, 32, 22);
  const positions = screenGeometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index) / (TV_PROFILE.screenWidth / 2);
    const y = positions.getY(index) / (TV_PROFILE.screenHeight / 2);
    positions.setZ(index, 0.16 * Math.max(0, 1 - x * x) * Math.max(0, 1 - y * y));
  }
  screenGeometry.computeVertexNormals();
  const screenSurface = createScreenMaterial({ reducedMotion });
  const screen = new THREE.Mesh(screenGeometry, screenSurface.material);
  screen.position.set(TV_PROFILE.screenCenterX, 0.28, 1.025);
  tv.add(screen);

  const controlMaterial = new THREE.MeshStandardMaterial({ color: 0x303030, roughness: 0.82 });
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

  const speakerMaterial = new THREE.MeshStandardMaterial({ color: 0x272727, roughness: 0.95 });
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

  return { tv, screenSurface };
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

  const { tv, screenSurface } = createTvModel({ reducedMotion });
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
  let animationFrame = 0;
  let animationStartedAt = null;
  let hasScreenRendered = false;
  let lastScreenFrameMs = 0;

  function elapsedMsAt(time) {
    if (animationStartedAt === null) animationStartedAt = time;
    return Math.max(0, time - animationStartedAt);
  }

  function renderScreenFrame(elapsedMs) {
    if (!active || destroyed || !shouldRenderScreenFrame({
      elapsedMs,
      lastFrameMs: lastScreenFrameMs,
      reducedMotion,
      hasRendered: hasScreenRendered,
    })) return;

    screenSurface.update(elapsedMs);
    hasScreenRendered = true;
    lastScreenFrameMs = elapsedMs;
    renderer.render(scene, camera);
  }

  function requestScreenFrame() {
    if (!active || destroyed || reducedMotion || animationFrame) return;
    animationFrame = requestAnimationFrame((time) => {
      animationFrame = 0;
      renderScreenFrame(elapsedMsAt(time));
      requestScreenFrame();
    });
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderScreenFrame(elapsedMsAt(performance.now()));
  }

  function update({ x, y, rotationX, rotationY, scale }) {
    tv.position.set(x * 3.7, y * 2.2, 0);
    tv.rotation.set(rotationX, rotationY, 0);
    tv.scale.setScalar(scale * TV_PROFILE.restingScale);
    renderScreenFrame(elapsedMsAt(performance.now()));
  }

  function setActive(nextActive) {
    active = nextActive;
    if (!active && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      return;
    }

    if (active) {
      renderScreenFrame(elapsedMsAt(performance.now()));
      requestScreenFrame();
    }
  }

  function destroy() {
    destroyed = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    screenSurface.dispose();
    scene.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => {
          material.dispose();
        });
      } else {
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
  requestScreenFrame();

  return { update, resize, setActive, destroy };
}
