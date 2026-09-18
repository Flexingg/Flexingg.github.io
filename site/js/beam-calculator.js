// Closed-form Euler-Bernoulli beam deflection + bending stress calculator.
// Supports: simply-supported or cantilever beam, under a point or a
// uniformly distributed load, with a solid rectangular cross-section.

const MATERIALS = {
  steel: { label: "Steel (E = 200 GPa)", E: 200e9 },
  aluminum: { label: "Aluminum (E = 69 GPa)", E: 69e9 },
  titanium: { label: "Titanium (E = 114 GPa)", E: 114e9 },
  custom: { label: "Custom", E: null },
};

function sectionProps(bMm, hMm) {
  const b = bMm / 1000;
  const h = hMm / 1000;
  const I = (b * h ** 3) / 12; // m^4
  const c = h / 2; // m, distance to outer fiber
  return { I, c };
}

// Returns { deltaMax (m), Mmax (N*m), curve: [{x, y}] } for x in meters, y in meters.
function solveBeam({ beamType, loadType, L, load, E, I }) {
  const N = 60;
  const curve = [];

  if (beamType === "simple" && loadType === "point") {
    // Point load P at midspan.
    const P = load;
    for (let i = 0; i <= N; i++) {
      const x = (L * i) / N;
      let y;
      if (x <= L / 2) {
        y = (P * x * (3 * L * L - 4 * x * x)) / (48 * E * I);
      } else {
        const xr = L - x;
        y = (P * xr * (3 * L * L - 4 * xr * xr)) / (48 * E * I);
      }
      curve.push({ x, y });
    }
    return { deltaMax: (P * L ** 3) / (48 * E * I), Mmax: (P * L) / 4, curve };
  }

  if (beamType === "simple" && loadType === "distributed") {
    // Uniformly distributed load w over full span.
    const w = load;
    for (let i = 0; i <= N; i++) {
      const x = (L * i) / N;
      const y = (w * x * (L ** 3 - 2 * L * x ** 2 + x ** 3)) / (24 * E * I);
      curve.push({ x, y });
    }
    return { deltaMax: (5 * w * L ** 4) / (384 * E * I), Mmax: (w * L * L) / 8, curve };
  }

  if (beamType === "cantilever" && loadType === "point") {
    // Point load P at free end (x = L), fixed at x = 0.
    const P = load;
    for (let i = 0; i <= N; i++) {
      const x = (L * i) / N;
      const y = (P * x * x * (3 * L - x)) / (6 * E * I);
      curve.push({ x, y });
    }
    return { deltaMax: (P * L ** 3) / (3 * E * I), Mmax: P * L, curve };
  }

  // cantilever + distributed
  const w = load;
  for (let i = 0; i <= N; i++) {
    const x = (L * i) / N;
    const y = (w * x * x * (x * x - 4 * L * x + 6 * L * L)) / (24 * E * I);
    curve.push({ x, y });
  }
  return { deltaMax: (w * L ** 4) / (8 * E * I), Mmax: (w * L * L) / 2, curve };
}

function drawBeam(canvas, { beamType, loadType, L, curve, deltaMax }) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const styles = getComputedStyle(document.documentElement);
  const border = styles.getPropertyValue("--border").trim() || "#232b3d";
  const textDim = styles.getPropertyValue("--text-dim").trim() || "#9aa5b8";
  const accent = styles.getPropertyValue("--accent").trim() || "#a855f7";

  const marginX = 40;
  const beamY = h * 0.35;
  const beamLength = w - marginX * 2;

  // Undeflected beam (reference line)
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(marginX, beamY);
  ctx.lineTo(marginX + beamLength, beamY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Supports
  ctx.fillStyle = textDim;
  if (beamType === "simple") {
    drawTriangleSupport(ctx, marginX, beamY);
    drawTriangleSupport(ctx, marginX + beamLength, beamY);
  } else {
    ctx.fillRect(marginX - 10, beamY - 30, 10, 60);
  }

  // Load arrows
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 2;
  if (loadType === "point") {
    const px = beamType === "simple" ? marginX + beamLength / 2 : marginX + beamLength;
    drawArrowDown(ctx, px, beamY - 34, beamY - 4);
  } else {
    const count = 9;
    for (let i = 0; i <= count; i++) {
      const x = marginX + (beamLength * i) / count;
      drawArrowDown(ctx, x, beamY - 22, beamY - 4);
    }
  }

  // Deflection curve, scaled so max deflection is a visible ~48px
  const scale = deltaMax > 0 ? 48 / deltaMax : 0;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  curve.forEach((pt, i) => {
    const cx = marginX + (pt.x / L) * beamLength;
    const cy = beamY + pt.y * scale;
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.stroke();

  ctx.fillStyle = textDim;
  ctx.font = "11px sans-serif";
  ctx.fillText("Deflection curve exaggerated for visibility", marginX, h - 12);
}

function drawTriangleSupport(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 12, y + 20);
  ctx.lineTo(x + 12, y + 20);
  ctx.closePath();
  ctx.fill();
}

function drawArrowDown(ctx, x, yStart, yEnd) {
  ctx.beginPath();
  ctx.moveTo(x, yStart);
  ctx.lineTo(x, yEnd);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, yEnd + 6);
  ctx.lineTo(x - 5, yEnd - 4);
  ctx.lineTo(x + 5, yEnd - 4);
  ctx.closePath();
  ctx.fill();
}

function fmt(value, digits = 3) {
  if (!isFinite(value)) return "–";
  return value.toPrecision(digits).replace(/\.?0+$/, (m) => (m.includes(".") ? "" : m));
}

export function initBeamCalculator() {
  const form = document.getElementById("beam-form");
  if (!form) return;
  const canvas = document.getElementById("beam-canvas");

  const beamTypeEl = document.getElementById("beam-type");
  const loadTypeEl = document.getElementById("beam-load-type");
  const materialEl = document.getElementById("beam-material");
  const customEWrap = document.getElementById("beam-custom-e-wrap");
  const lengthEl = document.getElementById("beam-length");
  const loadEl = document.getElementById("beam-load");
  const loadLabelEl = document.getElementById("beam-load-label");
  const bEl = document.getElementById("beam-width");
  const hEl = document.getElementById("beam-height");
  const customEEl = document.getElementById("beam-custom-e");

  function currentE() {
    const key = materialEl.value;
    if (key === "custom") {
      return (parseFloat(customEEl.value) || 0) * 1e9;
    }
    return MATERIALS[key].E;
  }

  function update() {
    const beamType = beamTypeEl.value;
    const loadType = loadTypeEl.value;
    const L = parseFloat(lengthEl.value) || 0.001;
    const loadRaw = parseFloat(loadEl.value) || 0;
    const E = currentE();
    const { I, c } = sectionProps(parseFloat(bEl.value) || 1, parseFloat(hEl.value) || 1);

    loadLabelEl.textContent = loadType === "point" ? "Point load P (N)" : "Distributed load w (N/m)";
    customEWrap.style.display = materialEl.value === "custom" ? "block" : "none";

    const { deltaMax, Mmax, curve } = solveBeam({ beamType, loadType, L, load: loadRaw, E, I });
    const sigmaMax = (Mmax * c) / I;

    document.getElementById("beam-deflection-result").textContent = `${fmt(deltaMax * 1000)} mm`;
    document.getElementById("beam-stress-result").textContent = `${fmt(sigmaMax / 1e6)} MPa`;
    document.getElementById("beam-moment-result").textContent = `${fmt(Mmax)} N·m`;

    drawBeam(canvas, { beamType, loadType, L, curve, deltaMax });
  }

  form.addEventListener("input", update);
  window.addEventListener("resize", update);
  update();
}
