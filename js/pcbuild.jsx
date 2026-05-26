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
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
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
  const EXPLODE_GLASS = 140;   // скляна бічна   — вліво  (по X)
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
  glassMesh.renderOrder = 2;
  glassGroup.add(glassMesh);
  bodyMeshes.push(glassMesh);

  // Glass glare — у glassGroup
  const glareMat = new THREE.MeshBasicMaterial({
    color: 0x5588aa, transparent: true, opacity: 0.08, depthWrite: false,
  });
  const glare = new THREE.Mesh(new THREE.PlaneGeometry(glassW * 0.18, glassH * 0.8), glareMat);
  glare.rotation.set(0, -Math.PI / 2, 0.3);
  glare.position.set(T/2 + 1, H * 0.55, D * 0.28);
  glare.renderOrder = 3;
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

  threeRef.current = {
    ...threeRef.current,
    scene, camera, renderer, spotLight, bodyMeshes, handleMeshes, hddLed,
    frontGroup, glassGroup, topGroup,
    EXPLODE_FRONT, EXPLODE_GLASS, EXPLODE_TOP,
  };
  return { scene, camera, renderer, spotLight, bodyMeshes, handleMeshes, hddLed,
    frontGroup, glassGroup, topGroup,
    EXPLODE_FRONT, EXPLODE_GLASS, EXPLODE_TOP };
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
  const handleActive = handleHover || handlePinned;

  const caseData = window.BUILD_DATA?.parts?.find(p => p.id === 'case');

  // Sync handle emissive
  useEffect(() => {
    const { handleMeshes } = threeRef.current;
    if (!handleMeshes) return;
    handleMeshes.forEach(m => {
      m.material.emissive = new THREE.Color(handleActive ? 0x2244aa : 0x000000);
      m.material.emissiveIntensity = handleActive ? 0.55 : 0;
    });
  }, [handleActive]);

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
        renderer.domElement.style.cursor = nowHover ? 'pointer' : 'grab';
      }
    };
    const onMouseLeave = () => { spotLight.intensity = 0; };

    let pDownTime = 0, pMoved = false;
    const onPDown  = ()  => { pDownTime = performance.now(); pMoved = false; };
    const onPMove  = ()  => { if (performance.now() - pDownTime > 120) pMoved = true; };
    const onPUp    = (e) => {
      if (pMoved) return;
      getNDC(e);
      raycaster.setFromCamera(ndcMouse, camera);
      if (raycaster.intersectObjects(handleMeshes, false).length > 0) {
        setHandlePinned(v => !v);
      } else {
        setHandlePinned(false);
      }
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
      const { frontGroup, glassGroup, topGroup,
              EXPLODE_FRONT, EXPLODE_GLASS, EXPLODE_TOP } = threeRef.current;
      if (frontGroup && glassGroup && topGroup) {
        frontGroup.position.z += (target * EXPLODE_FRONT - frontGroup.position.z) * 0.08;
        glassGroup.position.x += (target * (-EXPLODE_GLASS) - glassGroup.position.x) * 0.08;
        topGroup.position.y   += (target * EXPLODE_TOP   - topGroup.position.y)   * 0.08;
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
              <span className="label">{handleActive && caseData ? caseData.cat : 'Натисни ручку'}</span>
              {handleActive && <span className="label" style={{ color: 'var(--red)' }}>/01/</span>}
            </div>
            {handleActive && caseData ? (
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
            ) : (
              <div className="build-panel-empty">
                <div className="ph-mark">◢</div>
                <div className="ph-h">GameMax Spark Air</div>
                <div className="ph-p">
                  Наведи або клікни на <strong>ручку зверху</strong> — характеристики та ціна.<br /><br />
                  <strong>Drag</strong> — крути корпус у будь-який бік.
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
