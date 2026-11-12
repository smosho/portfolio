// Draws sketchy, hand-drawn pencil lines.
// - any element with class "underline" gets a scribbled underline
// - any <hr class="pencil-line"> becomes a wobbly horizontal stroke
// Also injects the #pencil SVG filter used in style.css.

(function () {
  const NS = "http://www.w3.org/2000/svg";

  // graphite texture filter
  document.body.insertAdjacentHTML("afterbegin",
    `<svg width="0" height="0" style="position:absolute">
       <filter id="pencil">
         <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="noise"/>
         <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6"/>
       </filter>
     </svg>`);

  const rand = (a, b) => a + Math.random() * (b - a);

  // one wobbly stroke from left to right across a 100 x 10 box
  function stroke(y, wobble) {
    let d = `M ${rand(0, 4)} ${y + rand(-wobble, wobble)}`;
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      const x = (i / steps) * 100 - (i === steps ? rand(0, 4) : 0);
      const cx = x - 100 / steps / 2;
      d += ` Q ${cx} ${y + rand(-wobble, wobble)} ${x} ${y + rand(-wobble, wobble)}`;
    }
    return d;
  }

  function draw(svg, passes, wobble) {
    svg.innerHTML = "";
    for (let i = 0; i < passes; i++) {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", stroke(5 + rand(-1.2, 1.2), wobble));
      p.setAttribute("stroke-width", rand(0.8, 1.6));
      p.setAttribute("opacity", rand(0.55, 0.9));
      p.setAttribute("vector-effect", "non-scaling-stroke");
      svg.appendChild(p);
    }
  }

  function makeSvg() {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "stroke");
    svg.setAttribute("viewBox", "0 0 100 10");
    svg.setAttribute("preserveAspectRatio", "none");
    return svg;
  }

  document.querySelectorAll(".underline").forEach(el => {
    const svg = makeSvg();
    el.appendChild(svg);
    draw(svg, 2, 1.5);
    // redraw on hover so it feels alive
    el.addEventListener("mouseenter", () => draw(svg, 3, 2));
  });

  // ---------- thin lines from the name to each category (homepage) ----------
  const name = document.getElementById("name");
  const layer = document.querySelector(".connectors");

  // point where the ray from box centre toward (tx,ty) leaves the box (+ padding)
  function edgePoint(r, tx, ty, pad) {
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = tx - cx, dy = ty - cy;
    const hw = r.width / 2 + pad, hh = r.height / 2 + pad;
    const t = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
    return [cx + dx * t, cy + dy * t];
  }

  // wobbly line between two points
  function wobblyLine(x1, y1, x2, y2) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const nx = -(y2 - y1) / len, ny = (x2 - x1) / len; // perpendicular
    const steps = Math.max(3, Math.round(len / 60));
    let d = `M ${x1 + rand(-2, 2)} ${y1 + rand(-2, 2)}`;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, tm = (i - 0.5) / steps;
      const w = rand(-2.5, 2.5);
      const mx = x1 + (x2 - x1) * tm + nx * w, my = y1 + (y2 - y1) * tm + ny * w;
      const ex = x1 + (x2 - x1) * t + nx * rand(-1, 1), ey = y1 + (y2 - y1) * t + ny * rand(-1, 1);
      d += ` Q ${mx} ${my} ${ex} ${ey}`;
    }
    return d;
  }

  function connect(cat) {
    const base = layer.getBoundingClientRect();
    const shift = r => ({ left: r.left - base.left, top: r.top - base.top, width: r.width, height: r.height });
    const a = shift(name.getBoundingClientRect());
    const b = shift(cat.getBoundingClientRect());
    const [x1, y1] = edgePoint(a, b.left + b.width / 2, b.top + b.height / 2, 14);
    const [x2, y2] = edgePoint(b, a.left + a.width / 2, a.top + a.height / 2, 10);
    let g = layer.querySelector(`[data-for="${cat.id}"]`);
    if (!g) {
      g = document.createElementNS(NS, "g");
      g.dataset.for = cat.id;
      layer.appendChild(g);
    }
    g.innerHTML = "";
    for (let i = 0; i < 2; i++) {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", wobblyLine(x1, y1, x2, y2));
      p.setAttribute("stroke-width", rand(0.5, 0.9));
      p.setAttribute("opacity", rand(0.45, 0.75));
      g.appendChild(p);
    }
  }

  if (name && layer) {
    const cats = document.querySelectorAll(".cat");
    const drawAll = () => cats.forEach(connect);
    document.fonts.ready.then(drawAll);
    window.addEventListener("resize", drawAll);
    cats.forEach(c => c.addEventListener("mouseenter", () => connect(c)));
  }

  document.querySelectorAll("hr.pencil-line").forEach(hr => {
    const svg = makeSvg();
    svg.style.width = "100%";
    svg.style.height = "24px";
    svg.style.display = "block";
    hr.replaceWith(svg);
    draw(svg, 2, 0.8);
  });
})();
