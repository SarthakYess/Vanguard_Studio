/* Vanguard Studio — 3D film reel (three.js). Drag to spin, click to kick, it ratchets as it turns. */
(function () {
  var host = document.getElementById("hero3d");
  if (!host || !window.THREE) return;
  var T = THREE, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, r;
  try { r = new T.WebGLRenderer({ alpha: true, antialias: true }); } catch (e) { return; }
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); host.appendChild(r.domElement);
  var sc = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, 0.1, 100); cam.position.z = 11;
  var css = getComputedStyle(document.documentElement);
  var c1 = css.getPropertyValue("--violet").trim() || "#e5484d", c2 = css.getPropertyValue("--cyan").trim() || "#f5a524";
  sc.add(new T.AmbientLight(0xffffff, 0.75));
  var dl = new T.DirectionalLight(0xffffff, 1.1); dl.position.set(3, 5, 6); sc.add(dl);
  var pl = new T.PointLight(new T.Color(c2), 1.8, 30); pl.position.set(-4, -2, 5); sc.add(pl);

  var rig = new T.Group(), reel = new T.Group(); rig.add(reel); sc.add(rig);
  var shape = new T.Shape(), i; shape.absarc(0, 0, 2.2, 0, Math.PI * 2, false);
  for (i = 0; i < 6; i++) { var h = new T.Path(), a = i * Math.PI / 3; h.absarc(Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0.5, 0, Math.PI * 2, true); shape.holes.push(h); }
  var ch = new T.Path(); ch.absarc(0, 0, 0.28, 0, Math.PI * 2, true); shape.holes.push(ch);
  var disc = new T.Mesh(new T.ExtrudeGeometry(shape, { depth: 0.35, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3, curveSegments: 48 }), new T.MeshStandardMaterial({ color: c1, metalness: 0.55, roughness: 0.28 }));
  disc.position.z = -0.17; reel.add(disc);
  reel.add(new T.Mesh(new T.TorusGeometry(2.25, 0.09, 16, 96), new T.MeshStandardMaterial({ color: 0x15151c, metalness: 0.8, roughness: 0.3 })));
  var hub = new T.Mesh(new T.CylinderGeometry(0.45, 0.45, 0.7, 32), new T.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 })); hub.rotation.x = Math.PI / 2; reel.add(hub);

  var fr = [];
  for (i = 0; i < 7; i++) {
    var col = i % 2 ? c1 : c2, m = new T.Mesh(new T.BoxGeometry(0.9, 0.6, 0.06), new T.MeshStandardMaterial({ color: col, metalness: 0.3, roughness: 0.4, emissive: col, emissiveIntensity: 0.25 }));
    m.userData = { a: i * 0.9, r: 3.1 + Math.random() * 0.8, s: 0.25 + Math.random() * 0.2, y: Math.random() * 2 - 1 }; fr.push(m); rig.add(m);
  }
  var N = 140, pos = new Float32Array(N * 3); for (i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * (i % 3 === 2 ? 8 : 16);
  var pg = new T.BufferGeometry(); pg.setAttribute("position", new T.BufferAttribute(pos, 3));
  var pts = new T.Points(pg, new T.PointsMaterial({ color: c2, size: 0.06, transparent: true, opacity: 0.8 })); sc.add(pts);

  function size() {
    var w = host.clientWidth || 1, hh = host.clientHeight || 1; r.setSize(w, hh, false);
    r.domElement.style.cssText = "width:100%;height:100%;display:block"; cam.aspect = w / hh; cam.updateProjectionMatrix();
    var wide = w / hh > 1.25 && w > 900;
    if (wide) { rig.position.set(3.9, 0, 0); rig.scale.setScalar(1); }
    else { var A = Math.min(w * 0.78, 340); rig.position.set(0, (-1 + A / hh) * 4.0, 0); rig.scale.setScalar(0.36 * A * 8 / (2.3 * hh)); }
    host.style.opacity = 1;
  }
  size(); addEventListener("resize", size);
  if (reduce) { r.render(sc, cam); return; }

  var auto = true, asked = false, mx = 0, my = 0, vz = 0.006, drag = false, lx = 0, moved = 0, lastStep = 0, lastTick = 0;
  addEventListener("pointermove", function (e) {
    if (e.pointerType === "mouse") auto = false;
    var b = host.getBoundingClientRect(); mx = ((e.clientX - b.left) / b.width - 0.5) * 2; my = ((e.clientY - b.top) / b.height - 0.5) * 2;
    if (drag) { vz += (e.clientX - lx) * 0.0016; moved += Math.abs(e.clientX - lx); lx = e.clientX; }
  });
  host.parentNode.addEventListener("pointerdown", function (e) { if (e.target.closest("a,button,input,select,textarea,label")) return; drag = true; lx = e.clientX; moved = 0; });
  addEventListener("pointerup", function () { if (drag && moved < 6) vz += 0.22; drag = false; });
  host.parentNode.addEventListener("click", function () { if (!asked && window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) { asked = true; DeviceOrientationEvent.requestPermission().catch(function () {}); } });
  addEventListener("deviceorientation", function (e) { if (e.gamma == null) return; auto = false; mx = Math.max(-1, Math.min(1, e.gamma / 30)); my = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 40)); });

  var vis = true, t0 = performance.now();
  new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(host);
  (function loop(now) {
    requestAnimationFrame(loop); if (!vis || document.hidden) return;
    var t = (now - t0) / 1000;
    if (auto) { mx = Math.sin(t * 0.6) * 0.6; my = Math.cos(t * 0.45) * 0.4; }
    rig.rotation.y += (mx * 0.45 - rig.rotation.y) * 0.05; rig.rotation.x += (my * 0.3 - rig.rotation.x) * 0.05;
    vz += (0.006 - vz) * 0.02; reel.rotation.z += vz;
    var step = Math.floor(reel.rotation.z / (Math.PI / 3));
    if (step !== lastStep) { lastStep = step; if (Math.abs(vz) > 0.025 && now - lastTick > 45 && window.VSound) { lastTick = now; VSound.play("tick"); } }
    fr.forEach(function (m) { var u = m.userData, a = u.a + t * u.s; m.position.set(Math.cos(a) * u.r, u.y + Math.sin(a * 1.7) * 0.4, Math.sin(a) * u.r * 0.6); m.rotation.set(a, a * 0.7, 0); });
    pts.rotation.y = t * 0.02; reel.position.y = Math.sin(t * 1.2) * 0.12;
    r.render(sc, cam);
  })(performance.now());
})();
