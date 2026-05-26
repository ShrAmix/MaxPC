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
  ctx.fillStyle = 'rgba(185,190,215,0.22)';
  ctx.beginPath();
  ctx.arc(16, 16, 2.2, 0, Math.PI * 2);
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
  // Front = Z=D (positive Z), glass = X=0 (negative X side)
  // Camera: front-left-above
  camera.position.set(-380, 260, 560);
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
    map: makeMeshDotTexture(rX, rY), transparent: true, depthWrite: false,
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

  // ── Structural walls (steel shell) ──
  // Top panel — solid steel
  bodyMeshes.push(addBox(caseGroup, matBody.clone(), W, T, D, W/2, H - T/2, D/2));
  // Bottom panel
  bodyMeshes.push(addBox(caseGroup, matBody.clone(), W, T, D, W/2, T/2, D/2));
  // Front face (лицева, перфорація) — Z=D side
  bodyMeshes.push(addBox(caseGroup, matBody.clone(), W, H, T, W/2, H/2, D - T/2));
  // Rear face — Z=0 side
  bodyMeshes.push(addBox(caseGroup, matBody.clone(), W, H, T, W/2, H/2, T/2));
  // Right side wall — solid steel
  bodyMeshes.push(addBox(caseGroup, matBody.clone(), T, H, D, W - T/2, H/2, D/2));
  // Left side wall — steel frame behind glass (thin strips: top, bottom, front edge, rear edge)
  // Glass frame: 15mm border on all 4 sides
  const GF = 15; // glass frame width
  // top strip
  bodyMeshes.push(addBox(caseGroup, matGlassFrame.clone(), T, GF, D - GF*2, T/2, H - GF/2, D/2));
  // bottom strip
  bodyMeshes.push(addBox(caseGroup, matGlassFrame.clone(), T, GF, D - GF*2, T/2, GF/2, D/2));
  // front strip
  bodyMeshes.push(addBox(caseGroup, matGlassFrame.clone(), T, H, GF, T/2, H/2, GF/2));
  // rear strip
  bodyMeshes.push(addBox(caseGroup, matGlassFrame.clone(), T, H, GF, T/2, H/2, D - GF/2));

  // ── Glass panel (left side, x=0) ──
  const glassW = D - GF * 2;  // width of glass along Z
  const glassH = H - GF * 2;  // height of glass along Y
  const glassMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(glassW, glassH),
    matGlass
  );
  glassMesh.rotation.y = -Math.PI / 2;
  glassMesh.position.set(T/2 + 0.5, H/2, D/2);
  glassMesh.renderOrder = 2;
  caseGroup.add(glassMesh);
  bodyMeshes.push(glassMesh);

  // Glass glare streak (diagonal light reflection)
  const glareMat = new THREE.MeshBasicMaterial({
    color: 0x5588aa, transparent: true, opacity: 0.08, depthWrite: false,
  });
  const glare = new THREE.Mesh(new THREE.PlaneGeometry(glassW * 0.18, glassH * 0.8), glareMat);
  glare.rotation.set(0, -Math.PI / 2, 0.3);
  glare.position.set(T/2 + 1, H * 0.55, D * 0.28);
  glare.renderOrder = 3;
  caseGroup.add(glare);

  // ── Mesh (perforated) overlays ──
  // Front face (Z=D) — full mesh
  addPlane(caseGroup, makeMeshMat(5, 8), W - 2, H - 2, W/2, H/2, D - T + 0.5, 0, 0);

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

  // Top panel — no mesh (solid), but add subtle dot texture for realism
  addPlane(caseGroup, makeMeshMat(4, 8), W - 4, D - 4,
    W/2, H - T + 0.5, D/2, -Math.PI/2, 0);

  // ── Handle ──
  // Arch: two vertical legs + horizontal bar
  // Legs: width=12, height=28, depth=12, positioned left and right of center
  const handleGroup = new THREE.Group();
  caseGroup.add(handleGroup);

  const legW = 12, legH = 30, legD = 14;
  const barW = W * 0.52, barH = 12, barD = 14;
  const legOffset = W * 0.22; // distance from center to each leg

  const handleLegL = addBox(handleGroup, matHandle.clone(), legW, legH, legD, W/2 - legOffset, H + legH/2 - 2, D/2);
  const handleLegR = addBox(handleGroup, matHandle.clone(), legW, legH, legD, W/2 + legOffset, H + legH/2 - 2, D/2);
  const handleBar  = addBox(handleGroup, matHandle.clone(), barW, barH, barD, W/2, H + legH + barH/2 - 2, D/2);

  // Handle top cap (slightly lighter, like the silver strip on real handle)
  const capMat = new THREE.MeshStandardMaterial({ color: 0x3a3a48, roughness: 0.3, metalness: 0.8 });
  addBox(handleGroup, capMat, barW - 4, 4, barD - 4, W/2, H + legH + barH - 2, D/2);

  const handleMeshes = [handleLegL, handleLegR, handleBar];

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
  let   ioY  = H * 0.82; // start Y (top of stack)

  // 1. Power button — round
  const pwrMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 });
  const pwrBtn = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 3, 24), pwrMat);
  pwrBtn.rotation.x = Math.PI / 2;
  pwrBtn.position.set(ioX, ioY, ioZf);
  caseGroup.add(pwrBtn);
  bodyMeshes.push(pwrBtn);
  ioY -= gap;

  // 2. USB-A 3.0 (blue, rotated 90° — tall port)
  addBox(caseGroup, matUSBA.clone(), 8, 13, 3, ioX, ioY, ioZf);
  ioY -= gap;

  // 3. Mini-jack — cylinder with white/grey ring
  const jackBody = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 3, 16), mat(0x0d0d10, 0.5));
  jackBody.rotation.x = Math.PI / 2;
  jackBody.position.set(ioX, ioY, ioZf);
  caseGroup.add(jackBody);
  const jackRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.9, 8, 20),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.6 })
  );
  jackRing.rotation.x = Math.PI / 2;
  jackRing.position.set(ioX, ioY, ioZf + 0.5);
  caseGroup.add(jackRing);
  ioY -= gap;

  // 4. USB-C (rotated 90° like USB-A but smaller, grey)
  const matUSBC = mat(0x444450, 0.3, 0.5);
  addBox(caseGroup, matUSBC, 6, 10, 3, ioX, ioY, ioZf);

  // HDD LED (tiny red dot, above power button)
  const hddLed = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2, 12), matLED);
  hddLed.rotation.x = Math.PI / 2;
  hddLed.position.set(ioX - 10, H * 0.82, ioZf);
  caseGroup.add(hddLed);

  // ── Rear panel details ──
  // 4 expansion slots (bottom-right of rear = Z=0 side)
  [0,1,2,3].forEach(i => addBox(caseGroup, matSlot.clone(), W * 0.5, 14, T, W * 0.72, 42 + i*18, T/2));

  // PSU cutout area (top-left of rear)
  const psuMat = mat(0x0c0c0f, 0.8, 0.3);
  addBox(caseGroup, psuMat, W * 0.42, H * 0.28, T, W * 0.24, H * 0.78, T/2);
  // PSU connector hole
  addBox(caseGroup, mat(0x080809, 0.9), 22, 22, T, W * 0.1, H * 0.88, T/2);

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
  };
  return { scene, camera, renderer, spotLight, bodyMeshes, handleMeshes, hddLed };
}

// ── Component ────────────────────────────────────────────────────────

function PCBuild() {
  const mountRef = useRef(null);
  const threeRef = useRef({});
  const hoverRef = useRef(false);

  const [handlePinned, setHandlePinned] = useState(false);
  const [handleHover,  setHandleHover]  = useState(false);
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
    controls.enableZoom   = false;
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
    camera.position.set(-380, 260, 560);
    controls.target.set(0, 0, 0);
    controls.update();
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
