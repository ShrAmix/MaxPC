// =============================================
// PC BUILD — Three.js · GameMax Spark Air BK
// =============================================

const { useState, useRef, useEffect } = React;

// Case dimensions (mm as Three.js units)
const W = 195;  // width  (X)
const H = 290;  // height (Y)
const D = 378;  // depth  (Z)

// ── Texture helpers ──────────────────────────────────────────────────

function makeMeshDotTexture(repeatX, repeatY) {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 32;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 32, 32);
  ctx.fillStyle = 'rgba(160,165,185,0.35)';
  ctx.beginPath();
  ctx.arc(16, 16, 1.4, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0,   'rgba(255,46,61,0.7)');
  g.addColorStop(0.4, 'rgba(255,46,61,0.25)');
  g.addColorStop(1,   'rgba(255,46,61,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// ── Scene builder ────────────────────────────────────────────────────
// Layout (local coords, origin = bottom-left-back corner):
//   X = width  (0..195): left wall x=0, right wall (glass side) x=195
//   Y = height (0..290): bottom y=0, top y=290
//   Z = depth  (0..378): front face z=0, rear face z=378
//
// Real case details from photos:
//   - LEFT side (x=0):  large tempered glass panel, black frame ~15mm
//   - RIGHT side (x=W): solid steel, mesh strip top ~18% + mesh strip bottom ~18%
//   - FRONT (z=0):      full mesh (round holes), thin steel frame
//   - REAR (z=D):       mesh zone top ~60%, 4 expansion slots bottom-right, PSU cutout top-left
//   - TOP (y=H):        solid steel + handle arch centered
//   - BOTTOM (y=0):     steel + 4 rubber feet corners
//   - I/O strip (front-right edge, x=W): power btn, USB-A (blue), jack — vertical

function buildScene(threeRef) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.sortObjects = true; // прозорі рендеряться після непрозорих за renderOrder

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(28, 1, 1, 4000);
  // Default view: front-left-above — shows glass panel (left) + front mesh
  // X negative = left side (glass), Z negative = front face side
  // Camera: front-left-above — sees front mesh panel (Z=D) + glass side (X=0)
  camera.position.set(-300, 220, 700);
  camera.lookAt(0, 0, 0);

  // ── Lights ──
  scene.add(new THREE.AmbientLight(0x111118, 2.8));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(-300, 600, 500);
  keyLight.castShadow = true;
  scene.add(keyLight);

  // Fill from right
  const fillLight = new THREE.DirectionalLight(0x1a1a2e, 0.8);
  fillLight.position.set(400, 200, 300);
  scene.add(fillLight);

  // Rim from behind
  const rimLight = new THREE.DirectionalLight(0x0a0a18, 0.5);
  rimLight.position.set(0, 300, -500);
  scene.add(rimLight);

  const floorLight = new THREE.PointLight(0xff2e3d, 0.35, 800);
  floorLight.position.set(0, -150, 0);
  scene.add(floorLight);

  const spotLight = new THREE.PointLight(0xffffff, 0, 480);
  scene.add(spotLight);

  // ── Materials ──
  const mat = (color, roughness = 0.65, metalness = 0.5) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  const matBody    = mat(0x131316, 0.7, 0.45);   // main dark steel
  const matFrame   = mat(0x1a1a1f, 0.6, 0.55);   // slightly lighter edges/frame
  const matHandle  = mat(0x252530, 0.35, 0.75);   // handle — more metallic
  const matFoot    = mat(0x0a0a0c, 0.95, 0.02);   // rubber feet
  const matSlot    = mat(0x1c1c22, 0.6, 0.4);
  const matUSBA    = mat(0x003a8a, 0.3, 0.3);
  const matLED     = new THREE.MeshStandardMaterial({
    color: 0xff2e3d, emissive: 0xff2e3d, emissiveIntensity: 0.9, roughness: 0.2,
  });

  // Glass: dark tinted, slightly blue, barely transparent
  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0x0d1520,
    roughness: 0.04,
    metalness: 0.05,
    transparent: true,
    opacity: 0.52,
    side: THREE.FrontSide,
    depthWrite: false,
    depthTest: true,
  });

  // Glass frame (black border around glass)
  const matGlassFrame = mat(0x0e0e11, 0.7, 0.4);

  // Mesh overlay (round-hole perforated panels)
  const makeMeshMat = (rX, rY) => new THREE.MeshBasicMaterial({
    map: makeMeshDotTexture(rX, rY), transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });

  // ── Case group (origin: bottom-left-back corner, centered at world 0,0,0) ──
  const caseGroup = new THREE.Group();
  caseGroup.position.set(-W / 2, -H / 2, -D / 2);
  scene.add(caseGroup);

  const addBox = (parent, material, w, h, d, cx, cy, cz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(cx, cy, cz);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  const addPlane = (parent, material, w, h, px, py, pz, rx = 0, ry = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    m.position.set(px, py, pz);
    m.rotation.set(rx, ry, 0);
    m.renderOrder = 1;
    parent.add(m);
    return m;
  };

  const bodyMeshes = [];
  const T = 3.5; // wall thickness

  // ── Explode groups (для анімації розкриття) ──
  // ── НАЛАШТУВАННЯ ЗМІЩЕННЯ ──────────────────
  const EXPLODE_FRONT = 160;   // передня панель — вперед (по Z)
  const EXPLODE_GLASS = 380;   // скляна бічна   — вліво  (по X)
  const EXPLODE_TOP   = 120;   // верхня + ручка — вгору  (по Y)
  // ────────────────────────────────────────────

  const frontGroup = new THREE.Group();  // передня панель
  const glassGroup = new THREE.Group();  // скляна бічна
  const topGroup   = new THREE.Group();  // верхня панель + ручка
  caseGroup.add(frontGroup, glassGroup, topGroup);

  // ── Structural walls (steel shell) ──
  // Top panel — у topGroup
  addBox(topGroup, matBody.clone(), W, T, D - T*2, W/2, H - T/2, D/2);
  // Bottom panel — залишається в caseGroup
  bodyMeshes.push(addBox(caseGroup, matBody.clone(), W, T, D - T*2, W/2, T/2, D/2));

  // Front face (лицева, перфорація) — у frontGroup
  const matFront = new THREE.MeshStandardMaterial({
    color: 0x131316, roughness: 0.7, metalness: 0.45,
    map: makeMeshDotTexture(28, 38),
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });
  bodyMeshes.push(addBox(frontGroup, matFront, W, H, T, W/2, H/2, D - T/2));

  // Rear face — залишається в caseGroup
  bodyMeshes.push(addBox(caseGroup, matBody.clone(), W, H, T, W/2, H/2, T/2));
  // Right side wall — solid steel, в caseGroup
  bodyMeshes.push(addBox(caseGroup, matBody.clone(), T, H, D, W - T/2, H/2, D/2));

  // Left side wall — рама скла — у glassGroup
  const GF = 15;
  addBox(glassGroup, matGlassFrame.clone(), T, GF, D - GF*2, T/2, H - GF/2, D/2);
  addBox(glassGroup, matGlassFrame.clone(), T, GF, D - GF*2, T/2, GF/2, D/2);
  addBox(glassGroup, matGlassFrame.clone(), T, H, GF, T/2, H/2, GF/2);
  addBox(glassGroup, matGlassFrame.clone(), T, H, GF, T/2, H/2, D - GF/2);

  // ── Glass panel — у glassGroup ──
  const glassW = D - GF * 2;
  const glassH = H - GF * 2;
  const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(glassW, glassH), matGlass);
  glassMesh.rotation.y = -Math.PI / 2;
  glassMesh.position.set(T/2 + 0.5, H/2, D/2);
  glassMesh.renderOrder = 10;
  glassGroup.add(glassMesh);
  bodyMeshes.push(glassMesh);

  // Glass glare — у glassGroup
  const glareMat = new THREE.MeshBasicMaterial({
    color: 0x5588aa, transparent: true, opacity: 0.08, depthWrite: false,
  });
  const glare = new THREE.Mesh(new THREE.PlaneGeometry(glassW * 0.18, glassH * 0.8), glareMat);
  glare.rotation.set(0, -Math.PI / 2, 0.3);
  glare.position.set(T/2 + 1, H * 0.55, D * 0.28);
  glare.renderOrder = 11;
  glassGroup.add(glare);

  // ── Mesh (perforated) overlays ──

  // Right side — mesh strip top ~18% of height
  const meshStripH = H * 0.18;
  addPlane(caseGroup, makeMeshMat(9, 1.8), D - 4, meshStripH,
    D/2, H - meshStripH/2 - T, W - T + 0.5, 0, Math.PI / 2);
  // Right side — mesh strip bottom
  addPlane(caseGroup, makeMeshMat(9, 1.8), D - 4, meshStripH,
    D/2, meshStripH/2 + T, W - T + 0.5, 0, Math.PI / 2);

  // Rear face (Z=0) — mesh zone top 60%
  const rearMeshH = H * 0.62;
  addPlane(caseGroup, makeMeshMat(4.5, 5), W - 4, rearMeshH,
    W/2, H - rearMeshH/2 - T, T - 0.5, 0, Math.PI);


  // ── Handle ──
  const handleGroup = new THREE.Group();
  // Position group at top-center of case, rotated 90° so handle runs front-to-back (Z axis)
  handleGroup.position.set(W / 2, H, D / 2);
  handleGroup.rotation.y = Math.PI / 2;
  topGroup.add(handleGroup);

  const matBracket = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.15 });
  const matGrip    = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.1, roughness: 0.8 });

  // Scale: handle spans ~120mm along Z (now X after rotation), depth ~20mm
  const hSpan   = 120; // total span between bracket outer edges
  const brkW    = 14;  // bracket width along span axis
  const brkH    = 18;  // bracket height
  const brkD    = 20;  // bracket depth (extrusion)
  const innerOff = hSpan / 2 - brkW; // X position of inner edge of bracket

  // Bracket profile: trapezoid — flat bottom, vertical outer edge, angled inner edge
  const makeBracketShape = () => {
    const s = new THREE.Shape();
    // outer-bottom → inner-bottom → inner-top(angled) → outer-top → back
    s.moveTo(0, 0);
    s.lineTo(brkW, 0);
    s.lineTo(brkW * 0.4, brkH);
    s.lineTo(0, brkH);
    s.closePath();
    return s;
  };

  const extOpts = { depth: brkD, bevelEnabled: false };

  // Left bracket (negative X side) — mirrored
  const brkShapeL = makeBracketShape();
  const brkGeoL   = new THREE.ExtrudeGeometry(brkShapeL, extOpts);
  const brkMeshL  = new THREE.Mesh(brkGeoL, matBracket);
  brkMeshL.position.set(-hSpan / 2, 0, -brkD / 2);
  handleGroup.add(brkMeshL);

  // Right bracket — mirror of left (scale X by -1)
  const brkGeoR  = new THREE.ExtrudeGeometry(makeBracketShape(), extOpts);
  const brkMeshR = new THREE.Mesh(brkGeoR, matBracket);
  brkMeshR.scale.x = -1;
  brkMeshR.position.set(hSpan / 2, 0, -brkD / 2);
  handleGroup.add(brkMeshR);

  // Grip — extruded trapezoidal cross-section along an arched CatmullRom curve
  const gripLen  = hSpan - brkW * 0.5; // extended to touch brackets
  const archH    = 7; // how high the arch rises in the middle
  const numPts   = 20;
  const curvePts = [];
  for (let i = 0; i <= numPts; i++) {
    const t  = i / numPts;
    const x  = (t - 0.5) * gripLen;
    const y  = brkH - 4 + Math.sin(t * Math.PI) * archH;
    curvePts.push(new THREE.Vector3(x, y, 0));
  }
  const gripCurve = new THREE.CatmullRomCurve3(curvePts);

  // Cross-section: trapezoid (wider bottom, narrower top)
  const gripShape = new THREE.Shape();
  const gW = brkD, gT = 9; // full width, thickness
  gripShape.moveTo(-gW / 2, 0);
  gripShape.lineTo( gW / 2, 0);
  gripShape.lineTo( gW / 2 - 3, gT);
  gripShape.lineTo(-gW / 2 + 3, gT);
  gripShape.closePath();

  const gripGeo  = new THREE.ExtrudeGeometry(gripShape, {
    steps: numPts, bevelEnabled: false, extrudePath: gripCurve,
  });
  const gripMesh = new THREE.Mesh(gripGeo, matGrip);
  handleGroup.add(gripMesh);

  const handleMeshes = [brkMeshL, brkMeshR, gripMesh];

  // ── Rubber feet (4 corners) ──
  const footSize = 18, footH = 10;
  [[footSize, footH/2, footSize], [W - footSize, footH/2, footSize],
   [footSize, footH/2, D - footSize], [W - footSize, footH/2, D - footSize]
  ].forEach(([x, y, z]) => addBox(caseGroup, matFoot.clone(), footSize, footH, footSize, x, y, z));

  // ── I/O strip (on the RIGHT side wall, near the front edge) ──
  // Based on photos: power btn, USB-A, jack are on the RIGHT side (x=W face),
  // vertically stacked, positioned near the front (small Z value)
  // I/O on FRONT face (Z=D), right side, vertical stack top→bottom:
  // power btn → USB-A → jack → USB-C
  const ioX  = W - 18;
  const ioZf = D - T/2 + 1;
  const gap  = 16; // spacing between elements
  let   ioY  = H * 0.35; // start Y (top of stack)

  // 1. Power button — round
  const pwrMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 });
  const pwrBtn = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 3, 24), pwrMat);
  pwrBtn.rotation.x = Math.PI / 2;
  pwrBtn.position.set(ioX, ioY, ioZf);
  frontGroup.add(pwrBtn);
  bodyMeshes.push(pwrBtn);
  ioY -= gap;

  // 2. USB-A 3.0 (blue, rotated 90°)
  addBox(frontGroup, matUSBA.clone(), 8, 13, 3, ioX, ioY, ioZf);
  ioY -= gap;

  // 3. Mini-jack — cylinder with white/grey ring
  const jackBody = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 3, 16), mat(0x0d0d10, 0.5));
  jackBody.rotation.x = Math.PI / 2;
  jackBody.position.set(ioX, ioY, ioZf);
  frontGroup.add(jackBody);
  const jackRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.9, 8, 20),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.6 })
  );
  jackRing.position.set(ioX, ioY, ioZf + 0.5);
  frontGroup.add(jackRing);
  ioY -= gap;

  // 4. USB-C (rotated 90°, grey)
  const matUSBC = mat(0x444450, 0.3, 0.5);
  addBox(frontGroup, matUSBC, 6, 10, 3, ioX, ioY, ioZf);

  // no HDD LED
  const hddLed = null;

  // ── Rear panel details (Z=0 face) ──
  const rZ = T / 2; // rear face Z center

  // 1. Motherboard I/O cutout — large dark rectangle, left side, upper area
  const mioW = W * 0.42, mioH = H * 0.32;
  addBox(caseGroup, mat(0x080809, 0.95, 0.1), mioW, mioH, T + 1,
    W * 0.26, H * 0.68, rZ);

  // 2. Fan/ventilation grille — top-right area (large mesh zone)
  const grillW = W * 0.48, grillH = H * 0.44;
  const matGrill = new THREE.MeshStandardMaterial({
    color: 0x0e0e11, roughness: 0.7, metalness: 0.3,
    map: makeMeshDotTexture(10, 10),
  });
  addBox(caseGroup, matGrill, grillW, grillH, T + 0.5,
    W * 0.73, H * 0.72, rZ);

  // 3. PSU power connector (trapezoid-ish, top center)
  addBox(caseGroup, mat(0x0a0a0c, 0.9, 0.2), 28, 20, T + 1, W * 0.5, H * 0.93, rZ);
  // connector pins detail
  addBox(caseGroup, mat(0x1a1a22, 0.5, 0.4), 22, 14, T + 2, W * 0.5, H * 0.93, rZ);

  // 4. Four expansion slots — bottom right (for GPU etc)
  const slotW = W * 0.52, slotH = 13, slotGap = 17;
  [0,1,2,3].forEach(i => {
    // slot frame
    addBox(caseGroup, mat(0x1c1c22, 0.6, 0.4), slotW, slotH, T + 0.5,
      W * 0.72, 30 + i * slotGap, rZ);
    // slot mesh texture strip
    const slotMeshMat = new THREE.MeshStandardMaterial({
      color: 0x141418, roughness: 0.8, metalness: 0.2,
      map: makeMeshDotTexture(8, 1),
    });
    addBox(caseGroup, slotMeshMat, slotW - 6, slotH - 4, T + 1,
      W * 0.72, 30 + i * slotGap, rZ);
  });

  // 5. USB/charging port area — bottom right corner (small vertical strip)
  addBox(caseGroup, mat(0x111114, 0.5, 0.4), 14, 40, T + 1, W * 0.92, 30, rZ);
  // USB port inside
  addBox(caseGroup, matUSBA.clone(), 8, 6, T + 2, W * 0.92, 28, rZ);

  // 6. Screw holes — 4 corners of rear panel
  const screwMat = mat(0x2a2a32, 0.3, 0.8);
  [[W*0.08, H*0.95], [W*0.92, H*0.95], [W*0.08, H*0.05], [W*0.92, H*0.05]].forEach(([x, y]) => {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, T + 1, 8), screwMat);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, rZ);
    caseGroup.add(screw);
  });

  // ── Motherboard: Gigabyte B550M Aorus Elite ──
  // Плата стоїть вертикально паралельно правій стінці
  // Вид через скло (з лівого боку):
  //   Z↑ = "вліво" на фото (задній край корпусу = Z мале)
  //   Y↑ = "вгору" на фото
  // mb(mat, protrude, h, d, oy, oz):
  //   oy = відступ від НИЗУ плати по Y
  //   oz = відступ від ЗАДНЬОГО краю плати по Z
  //   Тому: oz=0 → задній край (лівий на фото), oz=MB → передній (правий на фото)
  //         oy=0 → низ плати,                   oy=MB → верх
  // ── Motherboard: Gigabyte B550M Aorus Elite (mATX 244×244mm) ──
  // ── НАЛАШТУВАННЯ ЗМІЩЕННЯ МАТЕРИНКИ ──
 const EXPLODE_MOBO = 120; // вліво (до скла) при розкритті
  const EXPLODE_SSD = 160;  // Трішки менше ніж CPU (який на 180)

  const moboGroup = new THREE.Group();
  const ssdGroup = new THREE.Group();
  caseGroup.add(moboGroup, ssdGroup);

  const MB  = 220;        // розмір плати (мм)
  const mpX = W - T - 4;  // X поверхні PCB
  const mpY = 20;         // нижній край плати
  const mpZ = T + 12;     // задній край плати

  const ms = (color, r = 0.5, m = 0.7) =>
    new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m, emissive: 0x000000, emissiveIntensity: 0 });

  // mb: box helper (кубічні елементи)
  const mb = (mat, protrude, h, d, oy, oz) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(protrude, h, d), mat);
    mesh.position.set(mpX - protrude / 2, mpY + oy + h / 2, mpZ + oz + d / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    moboGroup.add(mesh);
    return mesh;
  };

  // mc: cylinder helper (для круглих елементів: конденсаторів, батарейки)
  const mc = (mat, r, h, oy, oz) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), mat);
    mesh.rotation.z = Math.PI / 2; // розвертаємо вздовж осі X, щоб стирчали від плати
    mesh.position.set(mpX - h / 2, mpY + oy, mpZ + oz);
    mesh.castShadow = true;
    moboGroup.add(mesh);
    return mesh;
  };

  // ══ PCB ══
  // Темно-сіра основа (майже чорна, як у Aorus)
  mb(ms(0x18181b, 0.85, 0.1), 3, MB, MB, 0, 0);

  // Декоративні діагональні лінії на платі (біло-сірі смуги)
  const decorMat = ms(0x5a5a65, 0.8, 0.2);
  const decor1 = new THREE.Mesh(new THREE.PlaneGeometry(160, 8), decorMat);
  decor1.rotation.set(0, -Math.PI / 2, Math.PI / 4.5);
  decor1.position.set(mpX - 1.6, mpY + 100, mpZ + 110);
  moboGroup.add(decor1);

  const decor2 = new THREE.Mesh(new THREE.PlaneGeometry(100, 4), decorMat);
  decor2.rotation.set(0, -Math.PI / 2, Math.PI / 4.5);
  decor2.position.set(mpX - 1.6, mpY + 120, mpZ + 120);
  moboGroup.add(decor2);

  // ══ МАСИВНИЙ VRM РАДІАТОР + I/O КОЖУХ (лівий верхній кут) ══
  // Основний кожух I/O (великий темний блок)
  mb(ms(0x141417, 0.4, 0.5), 28, 110, 50, 110, 0);
  // Помаранчева фірмова лінія Aorus
  mb(ms(0xe65c00, 0.4, 0.6), 29, 45, 3, 130, 45);
  // Верхній радіатор VRM (над сокетом)
  mb(ms(0x222225, 0.3, 0.7), 22, 30, 80, 190, 40);

  // ══ CPU СОКЕТ AM4 (центр верх) ══
  mb(ms(0x282828, 0.6, 0.2), 5, 54, 54, 126, 68); // Пластик сокету
  mb(ms(0xaaaaaa, 0.4, 0.8), 6, 40, 40, 133, 75); // Кришка процесора (встановлений CPU)
  mb(ms(0xcccccc, 0.3, 0.9), 7,  2, 58, 124, 66); // Металева лапка фіксатора

  // ══ DDR4 СЛОТИ (4 шт, праворуч) ══
  const ramSlots = [140, 154, 168, 182];
  for (let i = 0; i < 4; i++) {
    mb(ms(0x111111, 0.5, 0.4), 8, 95, 7, 105, ramSlots[i]);
    // Защіпки слотів (сірі)
    mb(ms(0x444444, 0.4, 0.5), 8,  6, 7, 200, ramSlots[i]);
    mb(ms(0x444444, 0.4, 0.5), 8,  6, 7,  99, ramSlots[i]);
  }

  // ══ 24-PIN ATX ЖИВЛЕННЯ (правий край) ══
  mb(ms(0x0a0a0a, 0.6, 0.2), 14, 45, 12, 130, 202);
  // 8-PIN CPU ЖИВЛЕННЯ (верхній лівий кут)
  mb(ms(0x0a0a0a, 0.6, 0.2), 12, 16, 22, 200, 60);

  // ══ PCIe x16 СЛОТ #1 — АРМОВАНИЙ (срібний) ══
  mb(ms(0xaaaaaa, 0.2, 0.9),  9, 14, 116, 85, 15); // Металевий екран
  mb(ms(0x0a0a0a, 0.5, 0.4), 10, 10, 112, 87, 17); // Сам чорний слот всередині

  // ══ PCIe x1 СЛОТ (короткий) ══
  mb(ms(0x111111, 0.5, 0.4), 8, 10, 30, 65, 15);

  // ══ PCIe x16 СЛОТ #2 (нижній, чорний) ══
  mb(ms(0x111111, 0.5, 0.4), 8, 14, 116, 40, 15);

  // ══ M.2 СЛОТИ (над і під основним PCIe) ══
  mb(ms(0x1f1f1f, 0.6, 0.3), 4, 18, 75, 105, 30); // M.2 над GPU
  mb(ms(0xd0d0d0, 0.4, 0.9), 5,  4,  4, 112, 101); // Гвинт M.2

  mb(ms(0x1f1f1f, 0.6, 0.3), 4, 18, 75,  60, 30); // M.2 під GPU
  mb(ms(0xd0d0d0, 0.4, 0.9), 5,  4,  4,  67, 101); // Гвинт M.2

  // ══ ЧІПСЕТ B550 (правий нижній кут) ══
  // Темний квадратний радіатор
  mb(ms(0x18181a, 0.4, 0.6), 10, 48, 48, 25, 135);
  // Металева декоративна пластина з логотипом (імітація)
  mb(ms(0x2a2a2e, 0.3, 0.8), 11, 35, 35, 30, 142);

  // ══ CMOS БАТАРЕЙКА (кругла, блискуча) ══
  // Знаходиться трохи вище нижнього PCIe слоту
  mc(ms(0xd4d4d4, 0.3, 0.95), 8, 3, 56, 115);

  // ══ АУДІО КОНДЕНСАТОРИ (золоті циліндри, лівий нижній кут) ══
  const goldMat = ms(0xc9a418, 0.3, 0.8);
  mc(goldMat, 2.5, 7, 28, 15);
  mc(goldMat, 2.5, 7, 18, 15);
  mc(goldMat, 2.5, 7, 28, 25);
  mc(goldMat, 2.5, 7, 18, 25);
  // Розділова лінія аудіотракту (підсвічується червоним/жовтим на платі)
  mb(ms(0xccaa00, 0.2, 0.2), 3.5, 40, 2, 5, 32);

  // ══ SATA ПОРТИ (нижній правий край) ══
  mb(ms(0x1a1a1a, 0.5, 0.3), 8, 12, 18, 10, 190);
  mb(ms(0x1a1a1a, 0.5, 0.3), 8, 12, 18, 10, 165);

  // ══ I/O ПАНЕЛЬ (роз'єми на задній стінці) ══
  mb(ms(0x0a0a0a, 0.5, 0.2), 12, 35, 72, 110, -5); // заглушка портів всередині кожуха
// ── SSD: Samsung PM981 512GB (Верхній слот M.2) ──
  // Слот знаходиться на oy=105, oz=30. Довжина слота 75. 
  // Центр слота по Y: mpY + 105 + 18/2 = mpY + 114
  // Центр слота по Z: mpZ + 30 + 75/2 = mpZ + 67.5
  const ssdW = 1.5; // товщина текстоліту
  const ssdH = 22;  // ширина M.2 2280
  const ssdD = 80;  // довжина M.2 2280
  const ssdX = mpX - 7; // Трохи вище за материнку
  const ssdY = mpY + 70; 
  const ssdZ = mpZ + 88.5;

  // 1. Зелений текстоліт (PCB)
  const ssdPCB = new THREE.Mesh(
    new THREE.BoxGeometry(ssdW, ssdH, ssdD),
    new THREE.MeshStandardMaterial({ color: 0x1d592b, roughness: 0.9, metalness: 0.1, emissive: 0x000000 })
  );
  ssdPCB.position.set(ssdX, ssdY, ssdZ);
  ssdPCB.castShadow = true;
  ssdGroup.add(ssdPCB);

  // 2. Чіпи пам'яті та контролер (чорні блоки)
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.2, emissive: 0x000000 });
  
  // Контролер (менший чіп зліва)
  const ctrlMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 14, 14), chipMat);
  ctrlMesh.position.set(ssdX - 1, ssdY, ssdZ - 25);
  ssdGroup.add(ctrlMesh);
  
  // Чіпи пам'яті (більші)
  const flash1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 18, 20), chipMat);
  flash1.position.set(ssdX - 1, ssdY, ssdZ + 5);
  ssdGroup.add(flash1);
  const flash2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 18, 20), chipMat);
  flash2.position.set(ssdX - 1, ssdY, ssdZ + 27);
  ssdGroup.add(flash2);

  // 3. Біла наклейка "Samsung PM981"
  const lblCanvas = document.createElement('canvas');
  lblCanvas.width = 256; lblCanvas.height = 64;
  const ctxL = lblCanvas.getContext('2d');
  ctxL.fillStyle = '#f0f0f0';
  ctxL.fillRect(0, 0, 256, 64);
  
  // Текст на наклейці
  ctxL.fillStyle = '#111';
  ctxL.font = 'bold 12px Arial';
  ctxL.fillText('SAMSUNG', 10, 16);
  ctxL.font = '10px Arial';
  ctxL.fillText('Model: MZ-VLB5120', 10, 30);
  ctxL.fillText('PM981 NVMe 512GB', 10, 42);
  
  // Імітація штрих-коду
  ctxL.fillRect(120, 10, 100, 20);
  ctxL.fillStyle = '#f0f0f0';
  for(let i = 122; i < 220; i += 4) {
    ctxL.fillRect(i, 10, Math.random() * 2 + 1, 20);
  }

  const lblMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(ssdD - 12, ssdH - 2),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(lblCanvas), roughness: 0.7 })
  );
  // Розвертаємо наклейку лицем до скла та вздовж планки
  lblMesh.rotation.y = -Math.PI / 2;
  lblMesh.position.set(ssdX - 1.7, ssdY, ssdZ + 5);
  ssdGroup.add(lblMesh);
  // ── SSD 2: Kingston NV3 1TB (Нижній слот M.2, під GPU) ──
  const EXPLODE_SSD2 = 160;
  const ssd2Group = new THREE.Group();
  caseGroup.add(ssd2Group);

  const ssd2X = mpX - 7;
  const ssd2Y = mpY + 25;
  const ssd2Z = mpZ + 88.5;

  // 1. Синій текстоліт (PCB)
  const ssd2PCB = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 22, 80),
    new THREE.MeshStandardMaterial({ color: 0x112266, roughness: 0.8, metalness: 0.2, emissive: 0x000000 })
  );
  ssd2PCB.position.set(ssd2X, ssd2Y, ssd2Z);
  ssd2PCB.castShadow = true;
  ssd2Group.add(ssd2PCB);

  // 2. Чіпи пам'яті
  const chipMat2 = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.2, emissive: 0x000000 });
  const ssd2f1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 16, 22), chipMat2);
  ssd2f1.position.set(ssd2X - 1, ssd2Y, ssd2Z - 15);
  ssd2Group.add(ssd2f1);
  const ssd2f2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 16, 22), chipMat2.clone());
  ssd2f2.position.set(ssd2X - 1, ssd2Y, ssd2Z + 15);
  ssd2Group.add(ssd2f2);

  // 3. Біла наклейка "Kingston NV3"
  const lblCanvas2 = document.createElement('canvas');
  lblCanvas2.width = 256; lblCanvas2.height = 64;
  const ctx2 = lblCanvas2.getContext('2d');
  ctx2.fillStyle = '#ffffff';
  ctx2.fillRect(0, 0, 256, 64);
  ctx2.fillStyle = '#111111';
  ctx2.font = 'bold 18px Arial';
  ctx2.fillText('Kingston', 10, 22);
  ctx2.fillStyle = '#2b44aa';
  ctx2.beginPath(); ctx2.arc(96, 16, 9, 0, Math.PI * 2); ctx2.fill();
  ctx2.fillStyle = '#111111';
  ctx2.font = 'bold 22px Arial';
  ctx2.textAlign = 'right';
  ctx2.fillText('1TB', 245, 24);
  ctx2.textAlign = 'left';
  ctx2.font = 'bold 20px Arial';
  ctx2.fillText('NV3', 10, 50);
  ctx2.font = '10px Arial';
  ctx2.fillText('PCIe 4.0 NVMe M.2 2280', 55, 58);
  const lblMesh2 = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 20),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(lblCanvas2), roughness: 0.6 })
  );
  lblMesh2.rotation.y = -Math.PI / 2;
  lblMesh2.position.set(ssd2X - 1.7, ssd2Y, ssd2Z);
  ssd2Group.add(lblMesh2);

  // ── RAM: Kingston FURY Beast 32GB DDR4 (2×16GB у слотах 1 і 3) ──
  const EXPLODE_RAM = 150; // вліво (між материнкою і процесором)
  const ramGroup = new THREE.Group();
  caseGroup.add(ramGroup);

  // mbr: box helper аналогічний mb(), але додає в ramGroup
  const mbr = (mat, protrude, h, d, oy, oz) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(protrude, h, d), mat);
    mesh.position.set(mpX - protrude / 2, mpY + oy + h / 2, mpZ + oz + d / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    ramGroup.add(mesh);
    return mesh;
  };

  [0, 2].forEach(i => {
    const oz = ramSlots[i];

    // 1. PCB (чорна текстолітова плата)
    mbr(ms(0x050505, 0.8, 0.1), 31, 133, 1.6, 86, oz + 2.7);

    // 2. Радіатор (дві бокові пластини)
    mbr(ms(0x1a1a1c, 0.4, 0.6), 33, 134, 2.2, 85.5, oz + 0.4);
    mbr(ms(0x1a1a1c, 0.4, 0.6), 33, 134, 2.2, 85.5, oz + 4.4);

    // 3. Центральний потовщений рельєф
    mbr(ms(0x1f1f22, 0.3, 0.7), 34, 90, 2.6, 107.5, oz + 0.2);
    mbr(ms(0x1f1f22, 0.3, 0.7), 34, 90, 2.6, 107.5, oz + 4.2);

    // 4. Верхній гребінь (зубці охолодження)
    for (let j = 0; j < 5; j++) {
      mbr(ms(0x1a1a1c, 0.4, 0.6), 35, 14, 5.8, 175 - j * 20, oz + 0.6);
    }

    // 5. Логотип "FURY"
    const furyCanvas = document.createElement('canvas');
    furyCanvas.width = 256; furyCanvas.height = 64;
    const fctx2 = furyCanvas.getContext('2d');
    fctx2.fillStyle = '#ffffff';
    fctx2.font = 'italic bold 56px Arial';
    fctx2.textAlign = 'center';
    fctx2.fillText('FURY', 128, 50);
    const furyText = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 70),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(furyCanvas), transparent: true, opacity: 0.9, depthWrite: false })
    );
    furyText.rotation.y = Math.PI / 2;
    furyText.position.set(mpX - 34, mpY + 150, mpZ + oz + 3.6);
    ramGroup.add(furyText);

    // 6. Напис "BEAST"
    const beastCanvas = document.createElement('canvas');
    beastCanvas.width = 128; beastCanvas.height = 32;
    const bctx2 = beastCanvas.getContext('2d');
    bctx2.fillStyle = '#aaaaaa';
    bctx2.font = 'bold 24px Arial';
    bctx2.textAlign = 'center';
    bctx2.fillText('BEAST', 64, 24);
    const beastText = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 35),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(beastCanvas), transparent: true, opacity: 0.7, depthWrite: false })
    );
    beastText.rotation.y = Math.PI / 2;
    beastText.position.set(mpX - 34, mpY + 110, mpZ + oz + 3.6);
    ramGroup.add(beastText);
  });

  // ── CPU: AMD Ryzen 5 5600 ──
  // Сидить на сокеті AM4: oy=126, oz=68, розмір 40×40мм (трохи менше сокету 54×54)
  const cpuGroup = new THREE.Group();
  caseGroup.add(cpuGroup);

  // ── НАЛАШТУВАННЯ ЗМІЩЕННЯ CPU ──
  const EXPLODE_CPU = 180; // вліво більше ніж материнка (щоб бути перед нею)

  const cpuOY = 126 + 7;  // центр по Y (oy сокету + зсув до центру)
  const cpuOZ = 68 + 7;   // центр по Z
  const cpuS  = 40;        // розмір IHS (мм)
  const cpuPCBExtra = 4;   // PCB виступає за IHS з кожного боку

  // Позиція центру CPU на платі
  const cpuX = mpX - 6;
  const cpuY = mpY + cpuOY + cpuS / 2;
  const cpuZ = mpZ + cpuOZ + cpuS / 2;

  // PCB підложка (зеленувато-золота, виступає за IHS)
  const cpuPCB = new THREE.Mesh(
    new THREE.BoxGeometry(3, cpuS + cpuPCBExtra*2, cpuS + cpuPCBExtra*2),
    new THREE.MeshStandardMaterial({ color: 0x2a3a10, roughness: 0.6, metalness: 0.3, emissive: 0x000000 })
  );
  cpuPCB.position.set(cpuX - 1.5, cpuY, cpuZ);
  cpuGroup.add(cpuPCB);

  // Контакти (золоті точки по периметру)
  const matContact = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.2, metalness: 0.9, emissive: 0x000000 });
  const contactRows = 8;
  for (let i = 0; i < contactRows; i++) {
    for (let side = 0; side < 4; side++) {
      const t = (i / (contactRows - 1)) - 0.5;
      const hs = (cpuS + cpuPCBExtra * 2) / 2;
      let cy2, cz2;
      if (side === 0) { cy2 = cpuY - hs + 2; cz2 = cpuZ + t * (cpuS + 4); }
      else if (side === 1) { cy2 = cpuY + hs - 2; cz2 = cpuZ + t * (cpuS + 4); }
      else if (side === 2) { cy2 = cpuY + t * (cpuS + 4); cz2 = cpuZ - hs + 2; }
      else { cy2 = cpuY + t * (cpuS + 4); cz2 = cpuZ + hs - 2; }
      const dot = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 1.5), matContact);
      dot.position.set(cpuX - 0.5, cy2, cz2);
      cpuGroup.add(dot);
    }
  }

  // IHS (сріблястий металевий щит зверху)
  const ihsMat = new THREE.MeshStandardMaterial({
    color: 0xb0b0b8, roughness: 0.18, metalness: 0.92, emissive: 0x000000,
  });
  const ihs = new THREE.Mesh(new THREE.BoxGeometry(8, cpuS, cpuS), ihsMat);
  ihs.position.set(cpuX - 5, cpuY, cpuZ);
  cpuGroup.add(ihs);

  // Фаски IHS (скошені краї — 4 тонкі смужки по периметру)
  const bevelMat = new THREE.MeshStandardMaterial({ color: 0x888898, roughness: 0.25, metalness: 0.88, emissive: 0x000000 });
  const bW = 3;
  [[0, cpuS/2 - bW/2], [0, -cpuS/2 + bW/2]].forEach(([dy, dz]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(8, bW, bW), bevelMat);
    b.position.set(cpuX - 5, cpuY + dy, cpuZ + dz * Math.sign(dz));
    cpuGroup.add(b);
  });

  // Напис "AMD RYZEN" через CanvasTexture
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 256; labelCanvas.height = 256;
  const lctx = labelCanvas.getContext('2d');
  lctx.fillStyle = '#b0b0b8';
  lctx.fillRect(0, 0, 256, 256);
  lctx.fillStyle = '#1a1a1a';
  lctx.font = 'bold 28px Arial';
  lctx.textAlign = 'center';
  lctx.fillText('AMD', 128, 90);
  lctx.font = 'bold 48px Arial';
  lctx.fillText('RYZEN', 128, 148);
  lctx.font = '20px Arial';
  lctx.fillText('5  5600', 128, 185);

  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(cpuS - 4, cpuS - 4),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.2, metalness: 0.5, emissive: 0x000000 })
  );
  labelMesh.rotation.y = -Math.PI / 2;
  labelMesh.position.set(cpuX - 9.1, cpuY, cpuZ);
  cpuGroup.add(labelMesh);

  // ── Термопрокладка Honeywell PTM7950 (окрема група, виїжджає далі за CPU) ──
  const EXPLODE_TIM = 260;
  const timGroup = new THREE.Group();
  caseGroup.add(timGroup);

  const timMat = new THREE.MeshStandardMaterial({
    color: 0x68686e, roughness: 0.9, metalness: 0.05,
    emissive: new THREE.Color(0x000000), emissiveIntensity: 0,
  });
  const timMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, cpuS * 0.72, cpuS * 0.72), timMat);
  timMesh.position.set(cpuX - 9.5, cpuY, cpuZ);
  timGroup.add(timMesh);

// ── Cooler: ID-COOLING Frozn A410 DK Black ──
  const EXPLODE_COOLER = 320;
  const coolerGroup = new THREE.Group();
  caseGroup.add(coolerGroup);

  // Правильні розміри відносно осей корпусу
  // Материнка в площині YZ. Кулер "росте" від неї вліво (вздовж -X).
  const towerThickZ = 50;  // Товщина радіатора (вісь Z) - куди кріпляться вентилятори
  const towerWidthY = 120; // Ширина радіатора (вісь Y)
  const finStackX   = 100; // Висота самих ребер (довжина вздовж осі X)
  
  // Центр башти кулера
  const clX = cpuX - 45 - finStackX / 2; // Відступ від CPU (трубки) + половина радіатора
  const clY = cpuY + 5;
  const clZ = cpuZ;

  const mc2 = (mat, r, h, px, py, pz, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat);
    m.rotation.set(rx, ry, rz);
    m.position.set(px, py, pz);
    m.castShadow = true; m.receiveShadow = true;
    coolerGroup.add(m);
    return m;
  };
  const cb = (mat, w, h, d, px, py, pz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(px, py, pz);
    m.castShadow = true; m.receiveShadow = true;
    coolerGroup.add(m);
    return m;
  };

  const matFin     = new THREE.MeshStandardMaterial({ color: 0x16161a, roughness: 0.35, metalness: 0.8, emissive: 0x000000 });
  const matTube    = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.2, metalness: 0.9, emissive: 0x000000 });
  const matFanBody = new THREE.MeshStandardMaterial({ color: 0x121214, roughness: 0.6, metalness: 0.3, emissive: 0x000000 });
  const matBlade   = new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.4, metalness: 0.4, emissive: 0x000000 });
  const matTopCover= new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.5, metalness: 0.6, emissive: 0x000000 });

  // ── Підошва та трубки ──
  cb(new THREE.MeshStandardMaterial({ color: 0x222225, roughness: 0.3, metalness: 0.8 }), 12, 36, 36, cpuX - 6, cpuY, cpuZ);
  cb(matTube, 16, 40, 40, cpuX - 20, cpuY, cpuZ);

  const tubeOffsets = [-15, -5, 5, 15];
  tubeOffsets.forEach(oz => {
    // Горизонтальні трубки, що йдуть крізь ребра (вздовж X)
    mc2(matTube, 3.5, finStackX + 35, clX + 10, clY + 20, clZ + oz, 0, 0, Math.PI/2);
    mc2(matTube, 3.5, finStackX + 35, clX + 10, clY - 20, clZ + oz, 0, 0, Math.PI/2);
    // Вертикальні трубки біля процесора
    mc2(matTube, 3.5, 40, cpuX - 20, clY, clZ + oz, 0, 0, 0);
  });

  // ── Башта (Радіатор) ──
  const finShape = new THREE.Shape();
  const hz = towerThickZ / 2; 
  const hy = towerWidthY / 2; 
  const chamfer = 6;
  const indent = 4;
  
  // Малюємо профіль радіатора
  finShape.moveTo(-hz, -hy + chamfer);
  finShape.lineTo(-hz + chamfer, -hy);
  finShape.lineTo(hz - chamfer, -hy);
  finShape.lineTo(hz, -hy + chamfer);
  // Виїмка для кліпс
  finShape.lineTo(hz, -20); finShape.lineTo(hz - indent, -10); finShape.lineTo(hz - indent, 10); finShape.lineTo(hz, 20); 
  finShape.lineTo(hz, hy - chamfer);
  finShape.lineTo(hz - chamfer, hy);
  finShape.lineTo(-hz + chamfer, hy);
  finShape.lineTo(-hz, hy - chamfer);
  // Друга виїмка
  finShape.lineTo(-hz, 20); finShape.lineTo(-hz + indent, 10); finShape.lineTo(-hz + indent, -10); finShape.lineTo(-hz, -20); 
  finShape.closePath();

  // Текстура для імітації багатьох ребер
  const finCanvas = document.createElement('canvas');
  finCanvas.width = 8; finCanvas.height = 64;
  const fctx = finCanvas.getContext('2d');
  fctx.fillStyle = '#16161a'; fctx.fillRect(0,0,8,64);
  fctx.fillStyle = '#08080a'; for(let i=0; i<64; i+=4) fctx.fillRect(0,i,8,2);
  const finTex = new THREE.CanvasTexture(finCanvas);
  finTex.wrapS = finTex.wrapT = THREE.RepeatWrapping;
  finTex.repeat.set(1, finStackX / 2);

  const towerMat = new THREE.MeshStandardMaterial({ color: 0x16161a, roughness: 0.5, metalness: 0.6, emissive: 0x000000, map: finTex });
  const mainTower = new THREE.Mesh(new THREE.ExtrudeGeometry(finShape, { depth: finStackX, bevelEnabled: false }), towerMat);
  
  // Розвертаємо радіатор так, щоб він ріс від процесора (-X)
  mainTower.rotation.y = -Math.PI / 2; 
  mainTower.position.set(clX + finStackX / 2, clY, clZ);
  mainTower.castShadow = true; mainTower.receiveShadow = true;
  coolerGroup.add(mainTower);

  // ── Верхня декоративна кришка ──
  const coverH = 8;
  const topCover = new THREE.Mesh(new THREE.ExtrudeGeometry(finShape, { depth: coverH, bevelEnabled: true, bevelSize: 1, bevelThickness: 1 }), matTopCover);
  topCover.rotation.y = -Math.PI / 2;
  topCover.position.set(clX - finStackX / 2, clY, clZ); // Ближче до скла
  topCover.castShadow = true;
  coolerGroup.add(topCover);

  // Глянцева вставка з діагоналями
  const decorShape = new THREE.Shape();
  const dW = hz - 2, dD = hy - 15;
  decorShape.moveTo(-dW, -dD); decorShape.lineTo(dW, -dD); decorShape.lineTo(dW, dD); decorShape.lineTo(-dW, dD); decorShape.closePath();
  const topDecor = new THREE.Mesh(
    new THREE.ExtrudeGeometry(decorShape, { depth: 0.5, bevelEnabled: false }), 
    new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.1, metalness: 0.9 })
  );
  topDecor.rotation.y = -Math.PI / 2;
  topDecor.position.set(clX - finStackX / 2 - coverH, clY, clZ);
  coolerGroup.add(topDecor);

  const stripeMat = new THREE.MeshBasicMaterial({ color: 0x888899 });
  for(let i=0; i<4; i++){
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(30, 2), stripeMat);
    stripe.rotation.y = -Math.PI / 2;
    stripe.rotation.x = -Math.PI / 4; 
    stripe.position.set(clX - finStackX / 2 - coverH - 0.6, clY + 20 - i*8, clZ);
    coolerGroup.add(stripe);
  }

  // ── Вентилятори (120мм, спереду і ззаду) ──
  const fanSize = 120;
  const fanDepth = 25;
  
  [-1, 1].forEach(side => {
    // side = -1 (задній вентилятор), 1 (передній)
    const fZ = clZ + side * (towerThickZ / 2 + fanDepth / 2 + 1); 
    
    // Рамка вентилятора
    const fFrameShape = new THREE.Shape();
    const hs = fanSize / 2;
    const cr = 12; 
    fFrameShape.moveTo(-hs+cr, -hs); fFrameShape.lineTo(hs-cr, -hs); fFrameShape.lineTo(hs, -hs+cr);
    fFrameShape.lineTo(hs, hs-cr); fFrameShape.lineTo(hs-cr, hs); fFrameShape.lineTo(-hs+cr, hs);
    fFrameShape.lineTo(-hs, hs-cr); fFrameShape.lineTo(-hs, -hs+cr); fFrameShape.closePath();
    
    const hole = new THREE.Path();
    hole.absarc(0, 0, fanSize/2 - 4, 0, Math.PI * 2, false);
    fFrameShape.holes.push(hole);

    const fFrame = new THREE.Mesh(new THREE.ExtrudeGeometry(fFrameShape, { depth: fanDepth, bevelEnabled: true, bevelSize: 1, bevelThickness: 1 }), matFanBody);
    fFrame.position.set(clX, clY, fZ - fanDepth/2); // Рамка малюється прямо у площині XY
    fFrame.castShadow = true;
    coolerGroup.add(fFrame);

    // Хаб
    mc2(new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.4 }), 24, fanDepth - 2, clX, clY, fZ, Math.PI/2, 0, 0);
    mc2(new THREE.MeshStandardMaterial({ color: 0x222225, roughness: 0.6 }), 18, fanDepth + 0.5, clX, clY, fZ, Math.PI/2, 0, 0);

    // 9 Лопатей
    for (let b = 0; b < 9; b++) {
      const angle = (b / 9) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(34, 2, fanDepth - 4), matBlade);
      
      const br = 42; 
      const bx = clX + Math.cos(angle) * br;
      const by = clY + Math.sin(angle) * br;
      
      blade.position.set(bx, by, fZ);
      blade.rotation.order = 'ZYX';
      blade.rotation.z = angle; // Радіальний напрямок
      blade.rotation.x = Math.PI / 4 * side; // Кут нахилу лопаті 
      blade.castShadow = true;
      coolerGroup.add(blade);
    }

    // Гумові куточки
    const padMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
    [[-1,-1], [1,-1], [1,1], [-1,1]].forEach(([sx, sy]) => {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(18, 18, fanDepth+2), padMat);
      pad.position.set(clX + sx * (hs - 8), clY + sy * (hs - 8), fZ);
      coolerGroup.add(pad);
    });
    
    // Візуалізація металевих скоб (лініями)
    const clipMat = new THREE.LineBasicMaterial({ color: 0x222222, linewidth: 2 });
    [1, -1].forEach(sy => {
      [1, -1].forEach(sx => {
        const pts = [];
        pts.push(new THREE.Vector3(clX + sx*(hs-4), clY + sy*(hs-4), fZ - side*fanDepth/2));
        pts.push(new THREE.Vector3(clX + sx*(hs+2), clY + sy*(hs-20), fZ - side*fanDepth/2 - side*5));
        pts.push(new THREE.Vector3(clX + sx*(hs+2), clY + sy*10, clZ + side*20)); 
        const clip = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), clipMat);
        coolerGroup.add(clip);
      });
    });
  });

  // ── Floor glow ──
  const floorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(580, 400),
    new THREE.MeshBasicMaterial({
      map: makeGlowTexture(), transparent: true, opacity: 0.35, depthWrite: false,
    })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.set(0, -H / 2 - 16, 0);
  scene.add(floorGlow);

  // ── Корпусні вентилятори: Arctic F12 PWM PST ──
  // Задній виїжджає по -X разом з caseFansGroup (як CPU).
  // Передній прикріплений до frontGroup — виїжджає по +Z разом з передньою панеллю.
  const EXPLODE_FANS = 170;
  const caseFansGroup = new THREE.Group(); // задній
  caseGroup.add(caseFansGroup);

  const createArcticFan = (parent, px, py, pz, rotX, rotY, rotZ) => {
    const fanGroup = new THREE.Group();
    fanGroup.position.set(px, py, pz);
    fanGroup.rotation.set(rotX, rotY, rotZ);
    parent.add(fanGroup);

    const fSize = 120;
    const fDepth = 25;

    const frameShape = new THREE.Shape();
    const hs = fSize / 2;
    const cr = 6;
    frameShape.moveTo(-hs+cr, -hs); frameShape.lineTo(hs-cr, -hs); frameShape.lineTo(hs, -hs+cr);
    frameShape.lineTo(hs, hs-cr); frameShape.lineTo(hs-cr, hs); frameShape.lineTo(-hs+cr, hs);
    frameShape.lineTo(-hs, hs-cr); frameShape.lineTo(-hs, -hs+cr); frameShape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, fSize/2 - 2, 0, Math.PI * 2, false);
    frameShape.holes.push(hole);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.8, metalness: 0.1, emissive: 0x000000 });
    const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(frameShape, { depth: fDepth, bevelEnabled: false }), frameMat);
    frame.position.set(0, 0, -fDepth/2);
    frame.castShadow = true;
    fanGroup.add(frame);

    const lCanvas = document.createElement('canvas');
    lCanvas.width = 256; lCanvas.height = 256;
    const ctx = lCanvas.getContext('2d');
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(128, 128, 128, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(128, 128, 120, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center'; ctx.fillText('ARCTIC', 128, 185);
    ctx.beginPath();
    ctx.moveTo(128, 60); ctx.lineTo(75, 140); ctx.lineTo(100, 140);
    ctx.lineTo(128, 100); ctx.lineTo(156, 140); ctx.lineTo(181, 140);
    ctx.closePath(); ctx.fill();

    const hubMat  = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, emissive: 0x000000 });
    const logoMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(lCanvas), roughness: 0.5 });

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(21, 21, fDepth - 2, 32), hubMat);
    hub.rotation.x = Math.PI / 2;
    fanGroup.add(hub);

    const logoPlane = new THREE.Mesh(new THREE.CircleGeometry(20, 32), logoMat);
    logoPlane.position.set(0, 0, fDepth/2 - 0.5);
    fanGroup.add(logoPlane);

    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.5, metalness: 0.3, emissive: 0x000000 });
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(44, 1.5, 16), bladeMat);
      blade.position.set(Math.cos(angle) * 37, Math.sin(angle) * 37, 0);
      blade.rotation.order = 'ZYX';
      blade.rotation.z = angle + Math.PI/4.5;
      blade.rotation.x = Math.PI / 3.5;
      blade.castShadow = true;
      fanGroup.add(blade);
    }

    const strutMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, emissive: 0x000000 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI/4;
      const strut = new THREE.Mesh(new THREE.BoxGeometry(60, 4, 3), strutMat);
      strut.position.set(Math.cos(angle)*30, Math.sin(angle)*30, -fDepth/2 + 1.5);
      strut.rotation.z = angle;
      fanGroup.add(strut);
    }

    return fanGroup;
  };

  // Задній — біля задньої стінки, лицем всередину корпусу
  // Задній — біля задньої стінки (Z близьке до 0, на скріні це ліва сторона)
  const fanRearGroup  = createArcticFan(caseFansGroup, W * 0.73, H * 0.72, T + 12.5, 0, 0, 0);

  // Передній вентилятор — прикріплений до frontGroup, позиція відносно неї
  // Z = D - T - 12.5 (всередину від передньої панелі), rotation.y = PI (лицем всередину)
  const fanFrontGroup = createArcticFan(frontGroup, W / 2, 70, D - T - 12.5, 0, Math.PI, 0);
  
  threeRef.current = {
    ...threeRef.current,
    scene, camera, renderer, spotLight, bodyMeshes, handleMeshes, hddLed,
    frontGroup, glassGroup, topGroup, moboGroup, cpuGroup, timGroup, timMesh, coolerGroup, ramGroup, ssdGroup, ssd2Group, caseFansGroup, fanRearGroup, fanFrontGroup,
    EXPLODE_FRONT, EXPLODE_GLASS, EXPLODE_TOP, EXPLODE_MOBO, EXPLODE_CPU, EXPLODE_TIM, EXPLODE_COOLER, EXPLODE_RAM, EXPLODE_SSD, EXPLODE_SSD2, EXPLODE_FANS,
  };
  return { scene, camera, renderer, spotLight, bodyMeshes, handleMeshes, hddLed,
    frontGroup, glassGroup, topGroup, moboGroup, cpuGroup, timGroup, timMesh, coolerGroup, ramGroup, ssdGroup, ssd2Group, caseFansGroup, fanRearGroup, fanFrontGroup,
    EXPLODE_FRONT, EXPLODE_GLASS, EXPLODE_TOP, EXPLODE_MOBO, EXPLODE_CPU, EXPLODE_TIM, EXPLODE_COOLER, EXPLODE_RAM, EXPLODE_SSD, EXPLODE_SSD2, EXPLODE_FANS };
}

// ── Component ────────────────────────────────────────────────────────

function PCBuild() {
  const mountRef   = useRef(null);
  const threeRef   = useRef({});
  const hoverRef   = useRef(false);
  const explodeRef = useRef(0); // 0 = closed, 1 = open

  const [handlePinned, setHandlePinned] = useState(false);
  const [handleHover,  setHandleHover]  = useState(false);
  const [exploded,     setExploded]     = useState(false);
  const [moboPinned,   setMoboPinned]   = useState(false);
  const [moboHover,    setMoboHover]    = useState(false);
  const [cpuPinned,    setCpuPinned]    = useState(false);
  const [cpuHover,     setCpuHover]     = useState(false);
  const [timPinned,    setTimPinned]    = useState(false);
  const [timHover,     setTimHover]     = useState(false);
  const [coolerPinned, setCoolerPinned] = useState(false);
  const [coolerHover,  setCoolerHover]  = useState(false);
  const [ramPinned,    setRamPinned]    = useState(false);
  const [ramHover,     setRamHover]     = useState(false);
  const [ssdPinned,    setSsdPinned]    = useState(false);
  const [ssd2Pinned,   setSsd2Pinned]   = useState(false);
  const [ssd2Hover,    setSsd2Hover]    = useState(false);
  const [ssdHover,     setSsdHover]     = useState(false);
  const [fanPinned,    setFanPinned]    = useState(false);
  const [fanHover,     setFanHover]     = useState(false);
  const handleActive = handleHover || handlePinned;
  const moboActive   = moboHover   || moboPinned;
  const cpuActive    = cpuHover    || cpuPinned;
  const timActive    = timHover    || timPinned;
  const coolerActive = coolerHover || coolerPinned;
  const ramActive    = ramHover    || ramPinned;
  const ssdActive    = ssdHover    || ssdPinned;
  const ssd2Active   = ssd2Hover   || ssd2Pinned;
  const fanActive    = fanHover    || fanPinned;

  const activePanel = fanActive ? 'fan' : ssdActive ? 'ssd' : ssd2Active ? 'ssd2' : ramActive ? 'ram' : coolerActive ? 'cooler' : timActive ? 'tim' : cpuActive ? 'cpu' : moboActive ? 'mobo' : handleActive ? 'case' : null;

  const caseData   = window.BUILD_DATA?.parts?.find(p => p.id === 'case');
  const moboData   = window.BUILD_DATA?.parts?.find(p => p.id === 'mobo');
  const cpuData    = window.BUILD_DATA?.parts?.find(p => p.id === 'cpu');
  const timData    = window.BUILD_DATA?.parts?.find(p => p.id === 'tim');
  const coolerData = window.BUILD_DATA?.parts?.find(p => p.id === 'cooler');
  const ramData    = window.BUILD_DATA?.parts?.find(p => p.id === 'ram');
  const ssdData    = window.BUILD_DATA?.parts?.find(p => p.id === 'ssd1') || {
    name: 'Samsung PM981', model: '512 GB · NVMe M.2', cat: 'SSD #1 — система', price: 2700,
    desc: 'Швидкий NVMe під систему та основні програми. Boot за 8 секунд, гра запускається ще до того, як встигнеш узяти миш.',
    specs: [["Об'єм", '512 GB'], ['Інтерфейс', 'PCIe 3.0 x4'], ['Форм-фактор', 'M.2 2280'], ['Read', 'до 3500 MB/s'], ['Write', 'до 2300 MB/s']],
  };
  const fanData    = window.BUILD_DATA?.parts?.find(p => p.id === 'fan') || {
    name: 'Arctic F12 PWM PST', model: 'ACFAN00200A · 120mm · 2 шт', cat: 'Вентилятори корпусу', price: 558,
    desc: 'Два тихих 120мм вентилятора з PWM і PST синхронізацією. Один знизу на вдув, один ззаду на видув.',
    specs: [['Розмір', '120×120×25 мм'], ['Швидкість', '200–1800 RPM'], ['Роз\'єм', '4-pin PWM'], ['Шум', '0.3 Sone'], ['Статичний тиск', '1.85 mmH₂O'], ['Кількість', '2 шт']],
  };
  const ssd2Data   = window.BUILD_DATA?.parts?.find(p => p.id === 'ssd2') || {
    name: 'Kingston NV3', model: '1TB · NVMe M.2 PCIe 4.0', cat: 'SSD #2 — ігри', price: 3300,
    desc: 'Терабайт PCIe 4.0 NVMe під ігрову бібліотеку. Cyberpunk, GOW, Forza — нехай ставляться всі одразу і завантажуються за секунди.',
    specs: [["Об'єм", '1 TB'], ['Інтерфейс', 'PCIe 4.0 x4 NVMe'], ['Форм-фактор', 'M.2 2280'], ['NAND', '3D NAND'], ['Модель', 'SNV3S/1000G']],
  };

  // Sync handle emissive
  useEffect(() => {
    const { handleMeshes } = threeRef.current;
    if (!handleMeshes) return;
    handleMeshes.forEach(m => {
      m.material.emissive = new THREE.Color(handleActive ? 0x2244aa : 0x000000);
      m.material.emissiveIntensity = handleActive ? 0.55 : 0;
    });
  }, [handleActive]);

  // Sync cooler emissive
  useEffect(() => {
    const { coolerGroup } = threeRef.current;
    if (!coolerGroup) return;
    coolerGroup.traverse(m => {
      if (!m.isMesh || !m.material || !m.material.isMeshStandardMaterial) return;
      if (!m.material.emissive) m.material.emissive = new THREE.Color(0x000000);
      m.material.emissive.set(coolerActive ? 0x0033cc : 0x000000);
      m.material.emissiveIntensity = coolerActive ? 0.35 : 0;
    });
  }, [coolerActive]);

  // Sync tim emissive
  useEffect(() => {
    const { timMesh } = threeRef.current;
    if (!timMesh) return;
    timMesh.material.emissive.set(timActive ? 0x0033cc : 0x000000);
    timMesh.material.emissiveIntensity = timActive ? 0.5 : 0;
  }, [timActive]);

  // Sync cpu emissive
  useEffect(() => {
    const { cpuGroup } = threeRef.current;
    if (!cpuGroup) return;
    cpuGroup.traverse(m => {
      if (!m.isMesh || !m.material) return;
      m.material.emissive = new THREE.Color(cpuActive ? 0x0033cc : 0x000000);
      m.material.emissiveIntensity = cpuActive ? 0.4 : 0;
    });
  }, [cpuActive]);

  // Sync mobo emissive
  useEffect(() => {
    const { moboGroup } = threeRef.current;
    if (!moboGroup) return;
    moboGroup.traverse(m => {
      if (!m.isMesh || !m.material) return;
      const c = m.material.color;
      // не чіпаємо RGB смугу (червона)
      if (c && c.r > 0.8 && c.g < 0.2) return;
      m.material.emissive = new THREE.Color(moboActive ? 0x0033cc : 0x000000);
      m.material.emissiveIntensity = moboActive ? 0.35 : 0;
    });
  }, [moboActive]);

  // Sync ram emissive
  useEffect(() => {
    const { ramGroup } = threeRef.current;
    if (!ramGroup) return;
    ramGroup.traverse(m => {
      if (!m.isMesh || !m.material || !m.material.emissive) return;
      m.material.emissive = new THREE.Color(ramActive ? 0x0033cc : 0x000000);
      m.material.emissiveIntensity = ramActive ? 0.4 : 0;
    });
  }, [ramActive]);
  // Sync ssd emissive
  useEffect(() => {
    const { ssdGroup } = threeRef.current;
    if (!ssdGroup) return;
    ssdGroup.traverse(m => {
      if (!m.isMesh || !m.material || !m.material.isMeshStandardMaterial) return;
      if (!m.material.emissive) m.material.emissive = new THREE.Color(0x000000);
      m.material.emissive.set(ssdActive ? 0x0033cc : 0x000000);
      m.material.emissiveIntensity = ssdActive ? 0.5 : 0;
    });
  }, [ssdActive]);

  // Sync ssd2 emissive
  useEffect(() => {
    const { ssd2Group } = threeRef.current;
    if (!ssd2Group) return;
    ssd2Group.traverse(m => {
      if (!m.isMesh || !m.material || !m.material.isMeshStandardMaterial) return;
      if (!m.material.emissive) m.material.emissive = new THREE.Color(0x000000);
      m.material.emissive.set(ssd2Active ? 0x0033cc : 0x000000);
      m.material.emissiveIntensity = ssd2Active ? 0.5 : 0;
    });
  }, [ssd2Active]);

  // Sync fans emissive (обидва вентилятори разом)
  useEffect(() => {
    const { fanRearGroup, fanFrontGroup } = threeRef.current;
    [fanRearGroup, fanFrontGroup].forEach(g => {
      if (!g) return;
      g.traverse(m => {
        if (!m.isMesh || !m.material || !m.material.isMeshStandardMaterial) return;
        if (!m.material.emissive) m.material.emissive = new THREE.Color(0x000000);
        m.material.emissive.set(fanActive ? 0x0033cc : 0x000000);
        m.material.emissiveIntensity = fanActive ? 0.45 : 0;
      });
    });
  }, [fanActive]);

  // Three.js init
  useEffect(() => {
    if (!mountRef.current || !window.THREE) return;
    const container = mountRef.current;

    const { scene, camera, renderer, spotLight, bodyMeshes, handleMeshes, hddLed } = buildScene(threeRef);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableZoom   = true;
    controls.zoomSpeed    = 0.8;
    controls.minDistance  = 250;
    controls.maxDistance  = 1400;
    controls.enablePan    = false;
    controls.rotateSpeed  = 0.65;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = Math.PI / 2 - 0.62;  // ~35° above side
    controls.maxPolarAngle = Math.PI / 2 + 0.12;  // slight dip
    threeRef.current.controls = controls;

    const raycaster = new THREE.Raycaster();
    const ndcMouse  = new THREE.Vector2();
    const getNDC = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndcMouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
      ndcMouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
    };

    const onMouseMove = (e) => {
      getNDC(e);
      // Spotlight
      raycaster.setFromCamera(ndcMouse, camera);
      const hits = raycaster.intersectObjects(bodyMeshes, false);
      if (hits.length > 0) {
        const n = hits[0].face.normal.clone().transformDirection(hits[0].object.matrixWorld);
        spotLight.position.copy(hits[0].point).addScaledVector(n, 70);
        spotLight.intensity = 2.0;
        spotLight.distance  = 520;
      } else {
        spotLight.intensity = 0;
      }
      // Handle hover
      raycaster.setFromCamera(ndcMouse, camera);
      const hHits = raycaster.intersectObjects(handleMeshes, false);
      const nowHover = hHits.length > 0;
      if (nowHover !== hoverRef.current) {
        hoverRef.current = nowHover;
        setHandleHover(nowHover);
      }
      // Fan → RAM → Cooler → TIM → CPU → SSD → SSD2 → Mobo (пріоритет)
      const { moboGroup: mg, cpuGroup: cg, timGroup: tg, coolerGroup: clg, ramGroup: rg, ssdGroup: sg, ssd2Group: sg2, fanRearGroup: frg, fanFrontGroup: ffg } = threeRef.current;
      // вентилятори: перевіряємо обидва, але результат один стан
      const fanAllChildren = [...(frg ? frg.children : []), ...(ffg ? ffg.children : [])];
      const hitsFan  = fanAllChildren.length > 0 && raycaster.intersectObjects(fanAllChildren, true).length > 0;
      const rHits    = (!hitsFan && rg)  ? raycaster.intersectObjects(rg.children,  true) : [];
      const hitsRam  = rHits.length > 0;
      const clHits   = (!hitsFan && !hitsRam && clg) ? raycaster.intersectObjects(clg.children, true) : [];
      const hitsCooler = clHits.length > 0;
      const tHits    = (!hitsFan && !hitsRam && !hitsCooler && tg) ? raycaster.intersectObjects(tg.children, true) : [];
      const hitsTim  = tHits.length > 0;
      const cHits    = (!hitsFan && !hitsRam && !hitsCooler && !hitsTim && cg) ? raycaster.intersectObjects(cg.children, true) : [];
      const hitsCpu  = cHits.length > 0;
      const sHits    = (!hitsFan && !hitsRam && !hitsCooler && !hitsTim && !hitsCpu && sg)  ? raycaster.intersectObjects(sg.children,  true) : [];
      const hitsSsd  = sHits.length > 0;
      const s2Hits   = (!hitsFan && !hitsRam && !hitsCooler && !hitsTim && !hitsCpu && !hitsSsd && sg2) ? raycaster.intersectObjects(sg2.children, true) : [];
      const hitsSsd2 = s2Hits.length > 0;
      const mHits    = (!hitsFan && !hitsRam && !hitsCooler && !hitsTim && !hitsCpu && !hitsSsd && !hitsSsd2 && mg) ? raycaster.intersectObjects(mg.children, true) : [];
      const hitsMobo = mHits.length > 0;
      setFanHover(hitsFan);
      setRamHover(hitsRam);
      setCoolerHover(hitsCooler);
      setTimHover(hitsTim);
      setCpuHover(hitsCpu);
      setSsdHover(hitsSsd);
      setSsd2Hover(hitsSsd2);
      setMoboHover(hitsMobo);
      renderer.domElement.style.cursor = (nowHover || hitsFan || hitsRam || hitsCooler || hitsTim || hitsCpu || hitsSsd || hitsSsd2 || hitsMobo) ? 'pointer' : 'grab';
    };
    const onMouseLeave = () => { spotLight.intensity = 0; };

    let pDownTime = 0, pMoved = false;
    const onPDown  = ()  => { pDownTime = performance.now(); pMoved = false; };
    const onPMove  = ()  => { if (performance.now() - pDownTime > 120) pMoved = true; };
    const onPUp    = (e) => {
      if (pMoved) return;
      getNDC(e);
      raycaster.setFromCamera(ndcMouse, camera);
      const hitHandle = raycaster.intersectObjects(handleMeshes, false).length > 0;
      const { moboGroup: mg, cpuGroup: cg, timGroup: tg, coolerGroup: clg, ramGroup: rg, ssdGroup: sg, ssd2Group: sg2, fanRearGroup: frg, fanFrontGroup: ffg } = threeRef.current;
      const fanAll  = [...(frg ? frg.children : []), ...(ffg ? ffg.children : [])];
      const hitFan  = fanAll.length > 0 && raycaster.intersectObjects(fanAll, true).length > 0;
      const hitRam    = !hitFan && rg  ? raycaster.intersectObjects(rg.children,  true).length > 0 : false;
      const hitCooler = !hitFan && !hitRam && clg ? raycaster.intersectObjects(clg.children, true).length > 0 : false;
      const hitTim    = !hitFan && !hitRam && !hitCooler && tg  ? raycaster.intersectObjects(tg.children,  true).length > 0 : false;
      const hitCpu    = !hitFan && !hitRam && !hitCooler && !hitTim && cg  ? raycaster.intersectObjects(cg.children,  true).length > 0 : false;
      const hitSsd    = !hitFan && !hitRam && !hitCooler && !hitTim && !hitCpu && sg  ? raycaster.intersectObjects(sg.children,  true).length > 0 : false;
      const hitSsd2   = !hitFan && !hitRam && !hitCooler && !hitTim && !hitCpu && !hitSsd && sg2 ? raycaster.intersectObjects(sg2.children, true).length > 0 : false;
      const hitMobo   = !hitFan && !hitRam && !hitCooler && !hitTim && !hitCpu && !hitSsd && !hitSsd2 && mg ? raycaster.intersectObjects(mg.children, true).length > 0 : false;
      const reset = () => { setHandlePinned(false); setMoboPinned(false); setCpuPinned(false); setTimPinned(false); setCoolerPinned(false); setRamPinned(false); setSsdPinned(false); setSsd2Pinned(false); setFanPinned(false); };
      if (hitHandle)      { reset(); setHandlePinned(v => !v); }
      else if (hitFan)    { reset(); setFanPinned(v => !v); }
      else if (hitRam)    { reset(); setRamPinned(v => !v); }
      else if (hitCooler) { reset(); setCoolerPinned(v => !v); }
      else if (hitTim)    { reset(); setTimPinned(v => !v); }
      else if (hitCpu)    { reset(); setCpuPinned(v => !v); }
      else if (hitSsd)    { reset(); setSsdPinned(v => !v); }
      else if (hitSsd2)   { reset(); setSsd2Pinned(v => !v); }
      else if (hitMobo)   { reset(); setMoboPinned(v => !v); }
      else                { reset(); }
    };

    renderer.domElement.addEventListener('mousemove',   onMouseMove);
    renderer.domElement.addEventListener('mouseleave',  onMouseLeave);
    renderer.domElement.addEventListener('pointerdown', onPDown);
    renderer.domElement.addEventListener('pointermove', onPMove);
    renderer.domElement.addEventListener('pointerup',   onPUp);

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (hddLed) hddLed.material.emissiveIntensity = Math.sin(t * 2.4) * 0.38 + 0.55;

      // Плавна анімація розкриття (lerp до target)
      const target = explodeRef.current;
      const { frontGroup, glassGroup, topGroup, moboGroup, cpuGroup, timGroup, coolerGroup, ramGroup, ssdGroup, ssd2Group, caseFansGroup, fanFrontGroup,
              EXPLODE_FRONT, EXPLODE_GLASS, EXPLODE_TOP, EXPLODE_MOBO, EXPLODE_CPU, EXPLODE_TIM, EXPLODE_COOLER, EXPLODE_RAM, EXPLODE_SSD, EXPLODE_SSD2, EXPLODE_FANS } = threeRef.current;
      if (frontGroup && glassGroup && topGroup) {
        frontGroup.position.z  += (target * EXPLODE_FRONT    - frontGroup.position.z)  * 0.08;
        glassGroup.position.x  += (target * (-EXPLODE_GLASS) - glassGroup.position.x)  * 0.08;
        topGroup.position.y    += (target * EXPLODE_TOP      - topGroup.position.y)    * 0.08;
        if (moboGroup)   moboGroup.position.x    += (target * (-EXPLODE_MOBO)   - moboGroup.position.x)   * 0.08;
        if (ramGroup)    ramGroup.position.x     += (target * (-EXPLODE_RAM)    - ramGroup.position.x)    * 0.08;
        if (cpuGroup)    cpuGroup.position.x     += (target * (-EXPLODE_CPU)    - cpuGroup.position.x)    * 0.08;
        if (ssdGroup)    ssdGroup.position.x     += (target * (-EXPLODE_SSD)    - ssdGroup.position.x)    * 0.08;
        if (ssd2Group)   ssd2Group.position.x    += (target * (-EXPLODE_SSD2)   - ssd2Group.position.x)   * 0.08;
        if (timGroup)    timGroup.position.x     += (target * (-EXPLODE_TIM)    - timGroup.position.x)    * 0.08;
        if (coolerGroup)   coolerGroup.position.x   += (target * (-EXPLODE_COOLER) - coolerGroup.position.x)   * 0.08;
        if (caseFansGroup) caseFansGroup.position.x += (target * (-EXPLODE_FANS)   - caseFansGroup.position.x) * 0.08;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.domElement.removeEventListener('mousemove',   onMouseMove);
      renderer.domElement.removeEventListener('mouseleave',  onMouseLeave);
      renderer.domElement.removeEventListener('pointerdown', onPDown);
      renderer.domElement.removeEventListener('pointermove', onPMove);
      renderer.domElement.removeEventListener('pointerup',   onPUp);
      controls.dispose();
      scene.traverse(obj => {
        obj.geometry?.dispose();
        if (obj.material) {
          Array.isArray(obj.material) ? obj.material.forEach(m => m.dispose()) : obj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  const resetCamera = () => {
    const { camera, controls } = threeRef.current;
    if (!camera || !controls) return;
    camera.position.set(-300, 220, 700);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const toggleExplode = () => {
    const next = !exploded;
    setExploded(next);
    explodeRef.current = next ? 1 : 0;
  };

  return (
    <section className="build-section" id="build">
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">02 / Інтерактивна модель</span>
          <h2 className="section-title">GameMax <span className="glow-red">Spark Air</span></h2>
          <p className="section-sub">
            Mini-Tower · 378×195×290 мм · mATX/ITX.{' '}
            <strong style={{ color: 'var(--cyan)' }}>Затисни і потягни</strong> — обертай у будь-який бік.
            Наведи або клікни на <strong style={{ color: 'var(--red)' }}>ручку</strong> — характеристики.
          </p>
        </div>

        <div className="build-wrap reveal">

          <div className="build-stage corners" ref={mountRef} style={{ cursor: 'grab', position: 'relative' }}>
            <div className="br-tr"></div><div className="br-bl"></div>
            <div className="build-toolbar">
              <span>◢ GameMax Spark Air · Mini-Tower</span>
              <span className="live">SCAN ACTIVE</span>
            </div>
            <div className="build-controls">
              <button onClick={resetCamera}>↺ Reset</button>
              <button onClick={toggleExplode} style={{ marginLeft: 8 }}>
                {exploded ? '⬛ Закрити' : '⬜ Розкрити'}
              </button>
            </div>
            <div className="build-rotate-hint">
              <span className="key">DRAG</span> обертати · 360°
            </div>
          </div>

          <div className="build-panel corners">
            <div className="br-tr"></div><div className="br-bl"></div>
            <div className="build-panel-header">
              <span className="label">
                {activePanel === 'case'   && caseData   ? caseData.cat
                : activePanel === 'mobo'   && moboData   ? moboData.cat
                : activePanel === 'cpu'    && cpuData    ? cpuData.cat
                : activePanel === 'tim'    && timData    ? timData.cat
                : activePanel === 'cooler' && coolerData ? coolerData.cat
                : activePanel === 'ram'    && ramData    ? ramData.cat
                : activePanel === 'ssd'    && ssdData    ? ssdData.cat
                : activePanel === 'ssd2'   && ssd2Data   ? ssd2Data.cat
                : activePanel === 'fan'    && fanData    ? fanData.cat
                : 'Клікни на деталь'}
              </span>
              {activePanel && <span className="label" style={{ color: 'var(--red)' }}>
                {activePanel === 'case' ? '/01/' : activePanel === 'mobo' ? '/02/' : activePanel === 'cpu' ? '/03/' : activePanel === 'tim' ? '/04/' : activePanel === 'cooler' ? '/05/' : activePanel === 'ram' ? '/06/' : activePanel === 'ssd' ? '/07/' : activePanel === 'ssd2' ? '/08/' : activePanel === 'fan' ? '/09/' : ''}
              </span>}
            </div>
            {activePanel === 'case' && caseData ? (
              <>
                <div className="build-panel-title">{caseData.name}</div>
                <div className="build-panel-sub">{caseData.model}</div>
                <p className="build-panel-desc">{caseData.desc}</p>
                <div className="build-panel-specs">
                  {caseData.specs.map(([k, v], i) => (
                    <div className="row" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                </div>
                <div className="build-panel-price">
                  <span className="label">Ціна</span>
                  <span className="amount mono">{caseData.price.toLocaleString('uk-UA')} ₴</span>
                </div>
              </>
            ) : activePanel === 'cooler' && coolerData ? (
              <>
                <div className="build-panel-title">{coolerData.name}</div>
                <div className="build-panel-sub">{coolerData.model}</div>
                <p className="build-panel-desc">{coolerData.desc}</p>
                <div className="build-panel-specs">
                  {coolerData.specs.map(([k, v], i) => (
                    <div className="row" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                </div>
                <div className="build-panel-price">
                  <span className="label">Ціна</span>
                  <span className="amount mono">{coolerData.price.toLocaleString('uk-UA')} ₴</span>
                </div>
              </>
            ) : activePanel === 'tim' && timData ? (
              <>
                <div className="build-panel-title">{timData.name}</div>
                <div className="build-panel-sub">{timData.model}</div>
                <p className="build-panel-desc">{timData.desc}</p>
                <div className="build-panel-specs">
                  {timData.specs.map(([k, v], i) => (
                    <div className="row" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                </div>
                <div className="build-panel-price">
                  <span className="label">Ціна</span>
                  <span className="amount mono">{timData.price.toLocaleString('uk-UA')} ₴</span>
                </div>
              </>
              ) : activePanel === 'ssd' && ssdData ? (
              <>
                <div className="build-panel-title">{ssdData.name}</div>
                <div className="build-panel-sub">{ssdData.model}</div>
                <p className="build-panel-desc">{ssdData.desc}</p>
                <div className="build-panel-specs">
                  {ssdData.specs.map(([k, v], i) => (
                    <div className="row" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                </div>
                <div className="build-panel-price">
                  <span className="label">Ціна</span>
                  <span className="amount mono">{ssdData.price.toLocaleString('uk-UA')} ₴</span>
                </div>
              </>
            ) : activePanel === 'ssd2' && ssd2Data ? (
              <>
                <div className="build-panel-title">{ssd2Data.name}</div>
                <div className="build-panel-sub">{ssd2Data.model}</div>
                <p className="build-panel-desc">{ssd2Data.desc}</p>
                <div className="build-panel-specs">
                  {ssd2Data.specs.map(([k, v], i) => (
                    <div className="row" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                </div>
                <div className="build-panel-price">
                  <span className="label">Ціна</span>
                  <span className="amount mono">{ssd2Data.price.toLocaleString('uk-UA')} ₴</span>
                </div>
              </>
            ) : activePanel === 'fan' && fanData ? (
              <>
                <div className="build-panel-title">{fanData.name}</div>
                <div className="build-panel-sub">{fanData.model}</div>
                <p className="build-panel-desc">{fanData.desc}</p>
                <div className="build-panel-specs">
                  {fanData.specs.map(([k, v], i) => (
                    <div className="row" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                </div>
                <div className="build-panel-price">
                  <span className="label">Ціна</span>
                  <span className="amount mono">{fanData.price.toLocaleString('uk-UA')} ₴</span>
                </div>
              </>
            ) : activePanel === 'cpu' && cpuData ? (
              <>
                <div className="build-panel-title">{cpuData.name}</div>
                <div className="build-panel-sub">{cpuData.model}</div>
                <p className="build-panel-desc">{cpuData.desc}</p>
                <div className="build-panel-specs">
                  {cpuData.specs.map(([k, v], i) => (
                    <div className="row" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                </div>
                <div className="build-panel-price">
                  <span className="label">Ціна</span>
                  <span className="amount mono">{cpuData.price.toLocaleString('uk-UA')} ₴</span>
                </div>
              </>
            ) : activePanel === 'mobo' && moboData ? (
              <>
                <div className="build-panel-title">{moboData.name}</div>
                <div className="build-panel-sub">{moboData.model}</div>
                <p className="build-panel-desc">{moboData.desc}</p>
                <div className="build-panel-specs">
                  {moboData.specs.map(([k, v], i) => (
                    <div className="row" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                </div>
                <div className="build-panel-price">
                  <span className="label">Ціна</span>
                  <span className="amount mono">{moboData.price.toLocaleString('uk-UA')} ₴</span>
                </div>
              </>
            ) : activePanel === 'ram' && ramData ? (
              <>
                <div className="build-panel-title">{ramData.name}</div>
                <div className="build-panel-sub">{ramData.model}</div>
                <p className="build-panel-desc">{ramData.desc}</p>
                <div className="build-panel-specs">
                  {ramData.specs.map(([k, v], i) => (
                    <div className="row" key={i}><span className="k">{k}</span><span className="v">{v}</span></div>
                  ))}
                </div>
                <div className="build-panel-price">
                  <span className="label">Ціна</span>
                  <span className="amount mono">{ramData.price.toLocaleString('uk-UA')} ₴</span>
                </div>
              </>
            ) : (
              <div className="build-panel-empty">
                <div className="ph-mark">◢</div>
                <div className="ph-h">Інтерактивна модель</div>
                <div className="ph-p">
                  Клікни на <strong>ручку</strong> — корпус.<br/>
                  Клікни на <strong>материнську плату</strong> або <strong>процесор</strong> — характеристики.<br /><br />
                  <strong>Drag</strong> — крути · <strong>Scroll</strong> — zoom.
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

window.PCBuild = PCBuild;
