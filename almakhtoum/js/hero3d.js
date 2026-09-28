/* Almakhtoum — 3D hero banner.
   A leather handbag, a shoe box, a gold hanger and the Almakhtoum seal
   float and turn in a warm studio light. Follows the pointer; pauses offscreen. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const canvas = document.getElementById('hero3d');
const stage = document.getElementById('heroStage');
const skeleton = document.getElementById('stageSkeleton');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
}

if (canvas && webglOK()) init();
else dispatchEvent(new Event('hero3d:fail'));

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.3, 9.5);

  // Lights
  scene.add(new THREE.HemisphereLight(0xfff1d6, 0x221b2a, 0.6));
  const key = new THREE.DirectionalLight(0xffe2b0, 2.2);
  key.position.set(4, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8; key.shadow.camera.right = 8;
  key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  scene.add(key);
  const rim = new THREE.PointLight(0xc8553d, 30, 20);
  rim.position.set(-5, 1, -2);
  scene.add(rim);
  const rim2 = new THREE.PointLight(0x2f7a5b, 18, 20);
  rim2.position.set(5, -2, -3);
  scene.add(rim2);

  // Materials
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd4ae5a, metalness: 1, roughness: 0.22, clearcoat: 0.6 });
  const leather = new THREE.MeshPhysicalMaterial({ color: 0xa8442f, roughness: 0.48, clearcoat: 0.5, clearcoatRoughness: 0.35, sheen: 0.4, sheenColor: 0xffc9a8 });
  const leatherDark = new THREE.MeshPhysicalMaterial({ color: 0x7e3021, roughness: 0.5, clearcoat: 0.4 });
  const box = new THREE.MeshStandardMaterial({ color: 0xf3ebdd, roughness: 0.7 });
  const boxLid = new THREE.MeshStandardMaterial({ color: 0x141019, roughness: 0.55 });

  const world = new THREE.Group();
  scene.add(world);

  /* --- Handbag --- */
  const bag = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(2.3, 1.7, 0.95, 6, 0.28), leather);
  body.castShadow = true;
  bag.add(body);
  const flap = new THREE.Mesh(new RoundedBoxGeometry(2.34, 0.75, 1.0, 6, 0.25), leatherDark);
  flap.position.y = 0.5;
  bag.add(flap);
  const clasp = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.32, 0.12, 4, 0.05), gold);
  clasp.position.set(0, 0.15, 0.52);
  bag.add(clasp);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.075, 20, 64, Math.PI), gold);
  handle.position.y = 0.85;
  bag.add(handle);
  [-0.72, 0.72].forEach(x => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 12, 24), gold);
    ring.position.set(x, 0.88, 0);
    bag.add(ring);
  });
  // Stitch line
  const stitchPts = [];
  for (let i = 0; i <= 40; i++) stitchPts.push(new THREE.Vector3(-1.02 + i * 0.051, -0.72, 0.48));
  const stitches = new THREE.Points(new THREE.BufferGeometry().setFromPoints(stitchPts), new THREE.PointsMaterial({ color: 0xe9cf8a, size: 0.03 }));
  bag.add(stitches);
  bag.position.set(0.2, 0.1, 0);
  bag.rotation.set(0.1, -0.5, 0);
  world.add(bag);

  /* --- Shoe box --- */
  const shoeBox = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 0.95), box);
  base.castShadow = true;
  shoeBox.add(base);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.22, 1.03), boxLid);
  lid.position.y = 0.42;
  shoeBox.add(lid);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 1.06), gold);
  band.position.y = 0.05;
  shoeBox.add(band);
  shoeBox.position.set(-1.9, -1.35, -0.6);
  shoeBox.rotation.set(0.25, 0.6, -0.08);
  shoeBox.scale.setScalar(0.85);
  world.add(shoeBox);

  /* --- Hanger --- */
  const hangerCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.1, -0.55, 0), new THREE.Vector3(0, -0.02, 0), new THREE.Vector3(1.1, -0.55, 0),
  ]);
  const hanger = new THREE.Group();
  hanger.add(new THREE.Mesh(new THREE.TubeGeometry(hangerCurve, 40, 0.045, 12), gold));
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 12), gold);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = -0.55;
  hanger.add(bar);
  const hookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.02, 0), new THREE.Vector3(0, 0.25, 0), new THREE.Vector3(0.12, 0.42, 0),
    new THREE.Vector3(0.28, 0.35, 0), new THREE.Vector3(0.25, 0.2, 0),
  ]);
  hanger.add(new THREE.Mesh(new THREE.TubeGeometry(hookCurve, 30, 0.04, 10), gold));
  hanger.position.set(2.5, 1.7, -1.2);
  hanger.rotation.set(0, -0.4, 0.15);
  hanger.scale.setScalar(0.8);
  world.add(hanger);

  /* --- Seal medallion (logo on a gold coin) --- */
  const sealTex = new THREE.CanvasTexture(drawSeal());
  sealTex.colorSpace = THREE.SRGBColorSpace;
  sealTex.anisotropy = 4;
  const faceMat = new THREE.MeshPhysicalMaterial({ map: sealTex, metalness: 0.85, roughness: 0.3, clearcoat: 0.8 });
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 64), [gold, faceMat, faceMat]);
  seal.rotation.x = Math.PI / 2;
  const sealPivot = new THREE.Group();
  sealPivot.add(seal);
  sealPivot.position.set(2.2, -1.2, 0.8);
  world.add(sealPivot);

  /* --- Floating pearls & rings --- */
  const floaters = [];
  const pearlMat = new THREE.MeshPhysicalMaterial({ color: 0xfff6e8, roughness: 0.15, clearcoat: 1, sheen: 1, sheenColor: 0xffe2c4 });
  for (let i = 0; i < 14; i++) {
    const isRing = i % 3 === 0;
    const m = isRing
      ? new THREE.Mesh(new THREE.TorusGeometry(0.16 + Math.random() * 0.12, 0.03, 12, 36), gold)
      : new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 24, 24), pearlMat);
    const a = (i / 14) * Math.PI * 2;
    m.position.set(Math.cos(a) * (2.6 + Math.random() * 1.2), (Math.random() - 0.5) * 4, Math.sin(a) * 1.5 - 1);
    m.userData = { base: m.position.clone(), speed: 0.4 + Math.random() * 0.8, phase: Math.random() * 6 };
    world.add(m);
    floaters.push(m);
  }

  /* --- Shadow catcher --- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.18 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.4;
  ground.receiveShadow = true;
  scene.add(ground);

  /* --- Sizing --- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull back on narrow screens so everything stays in frame
    camera.position.z = w < 560 ? 12.5 : 9.5;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  /* --- Interaction --- */
  const pointer = { x: 0, y: 0 };
  let drag = null, spin = 0, spinVel = 0;
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (drag !== null) { spinVel = (e.clientX - drag) * 0.004; drag = e.clientX; }
  });
  stage.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; drag = null; });
  canvas.addEventListener('pointerdown', e => { drag = e.clientX; canvas.style.cursor = 'grabbing'; });
  addEventListener('pointerup', () => { drag = null; canvas.style.cursor = ''; });

  /* --- Loop --- */
  let visible = true, running = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });

  const clock = new THREE.Clock();
  let intro = 0;

  function frame() {
    if (!visible || document.hidden) { running = false; return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    intro = Math.min(1, intro + dt * 0.7);
    const ease = 1 - Math.pow(1 - intro, 3);

    world.scale.setScalar(0.6 + 0.4 * ease);
    spin += spinVel; spinVel *= 0.94;
    world.rotation.y += ((pointer.x * 0.35 + spin) - world.rotation.y) * 0.05;
    world.rotation.x += ((pointer.y * 0.15) - world.rotation.x) * 0.05;

    bag.position.y = 0.1 + Math.sin(t * 1.1) * 0.15;
    bag.rotation.y = -0.5 + Math.sin(t * 0.5) * 0.35 + (1 - ease) * 2;
    handle.rotation.x = Math.sin(t * 1.4) * 0.12;

    shoeBox.position.y = -1.35 + Math.sin(t * 0.9 + 1) * 0.12;
    shoeBox.rotation.y = 0.6 + t * 0.25;
    lid.position.y = 0.42 + Math.max(0, Math.sin(t * 0.8)) * 0.18;

    hanger.position.y = 1.7 + Math.sin(t * 0.8 + 2) * 0.14;
    hanger.rotation.z = 0.15 + Math.sin(t * 1.2) * 0.12;

    sealPivot.rotation.y = t * 0.9;
    sealPivot.position.y = -1.2 + Math.sin(t * 1.3 + 3) * 0.12;

    floaters.forEach(m => {
      const { base, speed, phase } = m.userData;
      m.position.y = base.y + Math.sin(t * speed + phase) * 0.3;
      m.rotation.x = t * speed; m.rotation.y = t * speed * 0.7;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduceMotion) return;
    running = true;
    clock.getDelta();
    requestAnimationFrame(frame);
  }

  // Reveal: swap the skeleton for the canvas
  renderer.render(scene, camera);
  canvas.classList.add('on');
  skeleton?.classList.add('gone');
  if (reduceMotion) {
    intro = 1; world.scale.setScalar(1);
    renderer.render(scene, camera);
  } else start();
}

/* Draws the Almakhtoum seal onto a canvas used as the coin face texture */
function drawSeal() {
  const s = 512, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, s, s);
  grd.addColorStop(0, '#F0D994'); grd.addColorStop(0.5, '#C9A24B'); grd.addColorStop(1, '#8E6A24');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  g.translate(s / 2, s / 2);
  g.strokeStyle = 'rgba(20,16,25,.45)';
  g.lineWidth = 6;
  g.beginPath(); g.arc(0, 0, 240, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.arc(0, 0, 168, 0, Math.PI * 2); g.stroke();
  // ring text
  g.fillStyle = 'rgba(20,16,25,.75)';
  g.font = '600 30px Georgia, serif';
  const text = 'ALMAKHTOUM · THE SEALED · ';
  for (let i = 0; i < text.length; i++) {
    g.save();
    g.rotate((i / text.length) * Math.PI * 2);
    g.fillText(text[i], -9, -190);
    g.restore();
  }
  // monogram A with hanger hook
  g.strokeStyle = '#141019';
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = 26;
  g.beginPath(); g.moveTo(-70, 80); g.lineTo(0, -64); g.lineTo(70, 80); g.stroke();
  g.lineWidth = 16;
  g.beginPath(); g.moveTo(-40, 28); g.lineTo(40, 28); g.stroke();
  g.lineWidth = 12;
  g.beginPath(); g.moveTo(0, -64); g.lineTo(0, -80);
  g.bezierCurveTo(0, -112, 48, -112, 48, -84); g.bezierCurveTo(48, -68, 34, -62, 26, -60); g.stroke();
  return c;
}
