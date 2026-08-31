/* ============================================================
   ACSES DKTE — 3D CENTERPIECE
   A draggable, zoomable wireframe "circuit sphere" built with
   plain Three.js (no extra addons needed — drag/zoom are
   implemented by hand so this file has zero dependencies
   beyond the core three.min.js script tag in index.html).
============================================================ */

(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const stage = canvas.parentElement;

  // ---- Renderer / scene / camera ----
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  function resize(){
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- Lighting (blue / circuit-green, matches theme) ----
  scene.add(new THREE.AmbientLight(0x223344, 1.2));
  const blueLight = new THREE.PointLight(0x4c8dff, 3.5, 20);
  blueLight.position.set(4, 3, 5);
  scene.add(blueLight);
  const greenLight = new THREE.PointLight(0x4cffb2, 2.2, 20);
  greenLight.position.set(-4, -2, 4);
  scene.add(greenLight);

  // ---- Group everything so drag rotates the whole assembly ----
  const rig = new THREE.Group();
  scene.add(rig);

  // Core wireframe sphere ("circuit sphere")
  const coreGeo = new THREE.IcosahedronGeometry(2.4, 2);
  const edges = new THREE.EdgesGeometry(coreGeo);
  const coreMat = new THREE.LineBasicMaterial({ color: 0x4c8dff, transparent: true, opacity: 0.55 });
  const core = new THREE.LineSegments(edges, coreMat);
  rig.add(core);

  // Inner glowing solid (soft emissive core)
  const innerGeo = new THREE.IcosahedronGeometry(1.55, 1);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x0b1220, emissive: 0x4cffb2, emissiveIntensity: 0.35,
    metalness: 0.4, roughness: 0.35, transparent: true, opacity: 0.85
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  rig.add(inner);

  // Glowing "node" points at each vertex of the outer icosahedron
  const nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const nodeMatBlue = new THREE.MeshBasicMaterial({ color: 0x4c8dff });
  const nodeMatGreen = new THREE.MeshBasicMaterial({ color: 0x4cffb2 });
  const positions = coreGeo.attributes.position;
  const seen = new Set();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const key = [x.toFixed(2), y.toFixed(2), z.toFixed(2)].join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    const node = new THREE.Mesh(nodeGeo, i % 3 === 0 ? nodeMatGreen : nodeMatBlue);
    node.position.set(x, y, z);
    rig.add(node);
  }

  // Slim outer ring for extra depth cue
  const ringGeo = new THREE.TorusGeometry(3.1, 0.008, 8, 96);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x4cffb2, transparent: true, opacity: 0.35 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.4;
  rig.add(ring);

  const ring2 = ring.clone();
  ring2.rotation.x = -Math.PI / 3.2;
  ring2.rotation.y = Math.PI / 5;
  rig.add(ring2);

  rig.rotation.x = 0.35;
  rig.rotation.y = 0.5;

  // ---- Soft glow sprite texture (used for bloom-like point glow) ----
  function makeGlowTexture(){
    const size = 128;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }
  const glowTex = makeGlowTexture();

  // Soft glow halo behind the core (large, dim, additive)
  const haloMat = new THREE.SpriteMaterial({ map: glowTex, color: 0x4c8dff, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.set(9, 9, 1);
  rig.add(halo);

  // ---- Ambient particle field: a slow-drifting "circuit dust" cloud ----
  const particleCount = 220;
  const particleGeo = new THREE.BufferGeometry();
  const posArr = new Float32Array(particleCount * 3);
  const colorArr = new Float32Array(particleCount * 3);
  const palette = [new THREE.Color(0x4c8dff), new THREE.Color(0x4cffb2), new THREE.Color(0xffb238)];
  for (let i = 0; i < particleCount; i++) {
    const r = 4.2 + Math.random() * 4.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    posArr[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    posArr[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    posArr[i*3+2] = r * Math.cos(phi);
    const col = palette[i % palette.length];
    colorArr[i*3] = col.r; colorArr[i*3+1] = col.g; colorArr[i*3+2] = col.b;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.055, vertexColors: true, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---- Occasional pulsing "circuit trace" arcs between random nodes ----
  const traceGroup = new THREE.Group();
  rig.add(traceGroup);
  const traceMat = new THREE.LineBasicMaterial({ color: 0x4cffb2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
  const traceGeo = new THREE.BufferGeometry();
  const tracePts = [];
  for (let i = 0; i < 6; i++) {
    const a = new THREE.Vector3().randomDirection().multiplyScalar(2.4);
    const b = new THREE.Vector3().randomDirection().multiplyScalar(2.4);
    tracePts.push(a, b);
  }
  traceGeo.setFromPoints(tracePts);
  const traceLines = new THREE.LineSegments(traceGeo, traceMat.clone());
  traceGroup.add(traceLines);
  let traceT = 0;

  // ---- Drag-to-rotate (pointer events, with inertia) ----
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let velX = 0, velY = 0;
  let autoRotate = true;

  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    autoRotate = false;
    prevX = e.clientX; prevY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    prevX = e.clientX; prevY = e.clientY;
    velY = dx * 0.005;
    velX = dy * 0.005;
    rig.rotation.y += velY;
    rig.rotation.x += velX;
  });

  function endDrag(){
    isDragging = false;
    setTimeout(() => { autoRotate = true; }, 2200);
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointerleave', () => { if (isDragging) endDrag(); });

  // ---- Scroll-to-zoom (limited range) ----
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z = Math.min(13, Math.max(5.5, camera.position.z + e.deltaY * 0.005));
  }, { passive: false });

  // ---- Subtle mouse-parallax on the camera (independent of drag) ----
  let mouseNX = 0, mouseNY = 0;   // normalized -1..1
  let camOffX = 0, camOffY = 0;
  window.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    mouseNX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouseNY = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });

  const clock = new THREE.Clock();

  // ---- Animate loop ----
  function animate(){
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (autoRotate) {
      rig.rotation.y += 0.0022;
    } else if (!isDragging) {
      // inertia decay after release
      rig.rotation.y += velY;
      rig.rotation.x += velX;
      velX *= 0.94; velY *= 0.94;
    }

    inner.rotation.y -= 0.003;
    inner.rotation.x += 0.0012;

    // gentle drifting particle cloud
    particles.rotation.y += dt * 0.015;
    particles.rotation.x += dt * 0.004;

    // breathing halo glow
    const pulse = 0.30 + Math.sin(t * 0.8) * 0.08;
    halo.material.opacity = pulse;
    const s = 8.6 + Math.sin(t * 0.8) * 0.4;
    halo.scale.set(s, s, 1);

    // pulsing circuit traces — fade in/out on a loop, re-seed occasionally
    traceT += dt;
    const cycle = traceT % 3.2;
    traceLines.material.opacity = cycle < 1.6 ? Math.sin((cycle / 1.6) * Math.PI) * 0.6 : 0;

    // camera parallax easing toward mouse position
    camOffX += (mouseNX * 0.6 - camOffX) * 0.04;
    camOffY += (-mouseNY * 0.4 - camOffY) * 0.04;
    camera.position.x = camOffX;
    camera.position.y = camOffY;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    autoRotate = false;
    renderer.render(scene, camera);
  } else {
    animate();
  }
})();
