/* ============================================================
   ACSES DKTE — AMBIENT NETWORK SCENE
   A lightweight, reusable Three.js "knowledge graph" backdrop for
   the compact page-header hero on non-home pages. Each page can
   tint it differently via the canvas's data-accent attribute
   (blue | circuit | amber) so pages feel related but distinct.
   Zero drag/zoom controls here — this is ambient, not interactive,
   so it stays out of the way of page content.
============================================================ */

(function () {
  document.querySelectorAll('canvas[data-scene="network"]').forEach(initNetwork);

  function initNetwork(canvas) {
    if (typeof THREE === 'undefined') return;
    const stage = canvas.parentElement;
    const accentName = canvas.dataset.accent || 'blue';
    const accents = { blue: 0x4c8dff, circuit: 0x4cffb2, amber: 0xffb238 };
    const accent = accents[accentName] || accents.blue;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    scene.add(new THREE.AmbientLight(0x223344, 1.4));
    const light = new THREE.PointLight(accent, 3, 20);
    light.position.set(3, 2, 6);
    scene.add(light);

    const rig = new THREE.Group();
    scene.add(rig);

    // ---- Node cloud (the "graph") ----
    const NODE_COUNT = 46;
    const nodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.055, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: accent });
    const nodeMatDim = new THREE.MeshBasicMaterial({ color: 0x4c8dff, transparent: true, opacity: 0.5 });
    for (let i = 0; i < NODE_COUNT; i++) {
      const r = 3.2 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.55,
        r * Math.cos(phi)
      );
      const mesh = new THREE.Mesh(nodeGeo, i % 4 === 0 ? nodeMat : nodeMatDim);
      mesh.position.copy(pos);
      rig.add(mesh);
      nodes.push(pos);
    }

    // ---- Connective edges between nearby nodes ----
    const edgePositions = [];
    const THRESH = 2.6;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < THRESH) {
          edgePositions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
    const edgeMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.18 });
    rig.add(new THREE.LineSegments(edgeGeo, edgeMat));

    rig.rotation.x = 0.25;

    let mouseNX = 0, mouseNY = 0;
    window.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      mouseNX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseNY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }, { passive: true });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      rig.rotation.y += dt * 0.05;
      camera.position.x += (mouseNX * 0.8 - camera.position.x) * 0.03;
      camera.position.y += (-mouseNY * 0.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderer.render(scene, camera);
    } else {
      animate();
    }
  }
})();
