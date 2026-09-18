// Thermal & Cooling Airflow Calculator for Critical Facilities and Data Centers.
// Direct application of thermodynamics: Q = m * Cp * dT
// Used for sizing airflow (CFM), sensible cooling tonnage, and PUE energy savings.

function calculateThermal({ itLoadKw, deltaTF, pue, electricityRate }) {
  // Sensible heat dissipation
  const heatKw = itLoadKw;
  const btuPerHour = heatKw * 3412.142;
  const tonsRefrig = heatKw / 3.51685;

  // Airflow required: CFM = (kW * 3160) / deltaT_F
  const cfm = deltaTF > 0 ? (heatKw * 3160) / deltaTF : 0;
  const m3PerHour = cfm * 1.69901;

  // Power & PUE analysis
  const totalFacilityKw = heatKw * pue;
  const coolingOverheadKw = totalFacilityKw - heatKw;

  // Energy savings vs standard baseline PUE of 1.50
  const baselineKw = heatKw * 1.5;
  const savedKw = Math.max(0, baselineKw - totalFacilityKw);
  const annualKwhSaved = savedKw * 8760; // 8760 hours per year
  const annualDollarsSaved = annualKwhSaved * electricityRate;

  return {
    heatKw,
    btuPerHour,
    tonsRefrig,
    cfm,
    m3PerHour,
    totalFacilityKw,
    coolingOverheadKw,
    annualKwhSaved,
    annualDollarsSaved,
  };
}

function drawThermalCanvas(canvas, { deltaTF, itLoadKw, cfm }) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth || 500;
  const h = 180;

  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const isDark = !document.documentElement.dataset.theme || document.documentElement.dataset.theme !== "light";
  const textColor = isDark ? "#9aa5b8" : "#5b6474";
  const titleColor = isDark ? "#e8ecf4" : "#1a1f2b";
  const rackColor = isDark ? "#1b2234" : "#e2e8f0";
  const rackBorder = isDark ? "#3b4764" : "#cbd5e1";

  // Cold aisle (left), Server Rack (center), Hot aisle (right)
  const coldWidth = Math.max(60, w * 0.22);
  const hotWidth = Math.max(60, w * 0.22);
  const rackWidth = Math.min(180, w - coldWidth - hotWidth - 40);
  const rackX = (w - rackWidth) / 2;

  // Draw Cold Aisle
  ctx.fillStyle = isDark ? "rgba(56, 189, 248, 0.08)" : "rgba(14, 165, 233, 0.1)";
  ctx.fillRect(10, 20, coldWidth, h - 40);
  ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 20, coldWidth, h - 40);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("COLD AISLE", 18, 40);
  ctx.fillStyle = textColor;
  ctx.font = "10px sans-serif";
  ctx.fillText("Supply ~65°F", 18, 56);
  ctx.fillText(`${Math.round(cfm).toLocaleString()} CFM`, 18, 72);

  // Flow arrows into rack
  drawArrow(ctx, 10 + coldWidth - 10, h / 2, rackX - 10, h / 2, "#38bdf8");

  // Draw Server Rack
  ctx.fillStyle = rackColor;
  ctx.fillRect(rackX, 15, rackWidth, h - 30);
  ctx.strokeStyle = rackBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(rackX, 15, rackWidth, h - 30);

  ctx.fillStyle = titleColor;
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CRITICAL IT RACKS", rackX + rackWidth / 2, 38);

  ctx.fillStyle = isDark ? "#a855f7" : "#7c3aed";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(`${itLoadKw} kW Load`, rackX + rackWidth / 2, 62);

  // Server slots simulation
  const slots = 4;
  const slotH = 14;
  for (let i = 0; i < slots; i++) {
    const sy = 80 + i * 18;
    ctx.fillStyle = isDark ? "#0f141f" : "#f1f5f9";
    ctx.fillRect(rackX + 12, sy, rackWidth - 24, slotH);
    ctx.strokeStyle = isDark ? "#232d42" : "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.strokeRect(rackX + 12, sy, rackWidth - 24, slotH);

    // Blinking activity LEDs
    ctx.fillStyle = i % 2 === 0 ? "#10b981" : "#38bdf8";
    ctx.beginPath();
    ctx.arc(rackX + 22, sy + slotH / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Hot Aisle
  const hotX = rackX + rackWidth + 20;
  const actualHotWidth = w - hotX - 10;
  ctx.fillStyle = isDark ? "rgba(244, 63, 94, 0.08)" : "rgba(239, 68, 68, 0.1)";
  ctx.fillRect(hotX, 20, actualHotWidth, h - 40);
  ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
  ctx.strokeRect(hotX, 20, actualHotWidth, h - 40);

  // Flow arrows out of rack
  drawArrow(ctx, rackX + rackWidth + 5, h / 2, hotX - 5, h / 2, "#f43f5e");

  ctx.textAlign = "left";
  ctx.fillStyle = "#f43f5e";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("HOT AISLE", hotX + 8, 40);
  ctx.fillStyle = textColor;
  ctx.font = "10px sans-serif";
  ctx.fillText(`ΔT = +${deltaTF}°F`, hotX + 8, 56);
  ctx.fillText(`Return ~${65 + deltaTF}°F`, hotX + 8, 72);

  ctx.restore();
}

function drawArrow(ctx, fromX, fromY, toX, toY, color) {
  const headlen = 8;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

export function initThermalCalculator() {
  const form = document.getElementById("thermal-form");
  const canvas = document.getElementById("thermal-canvas");
  if (!form) return;

  const itLoadInput = document.getElementById("thermal-it-load");
  const deltaTInput = document.getElementById("thermal-delta-t");
  const pueInput = document.getElementById("thermal-pue");
  const rateInput = document.getElementById("thermal-rate");

  const cfmResult = document.getElementById("thermal-cfm-result");
  const tonnageResult = document.getElementById("thermal-tonnage-result");
  const totalPowerResult = document.getElementById("thermal-total-power-result");
  const savingsResult = document.getElementById("thermal-savings-result");

  function update() {
    const itLoadKw = Math.max(10, parseFloat(itLoadInput.value) || 500);
    const deltaTF = Math.max(5, parseFloat(deltaTInput.value) || 20);
    const pue = Math.max(1.01, parseFloat(pueInput.value) || 1.25);
    const electricityRate = Math.max(0.01, parseFloat(rateInput.value) || 0.08);

    const res = calculateThermal({ itLoadKw, deltaTF, pue, electricityRate });

    cfmResult.textContent = `${Math.round(res.cfm).toLocaleString()} CFM`;
    tonnageResult.textContent = `${res.tonsRefrig.toFixed(1)} Tons`;
    totalPowerResult.textContent = `${Math.round(res.totalFacilityKw).toLocaleString()} kW`;

    if (res.annualDollarsSaved > 0) {
      savingsResult.textContent = `$${Math.round(res.annualDollarsSaved).toLocaleString()}/yr`;
    } else {
      savingsResult.textContent = "Baseline";
    }

    drawThermalCanvas(canvas, { deltaTF, itLoadKw, cfm: res.cfm });
  }

  form.addEventListener("input", update);
  window.addEventListener("resize", () => {
    const itLoadKw = Math.max(10, parseFloat(itLoadInput.value) || 500);
    const deltaTF = Math.max(5, parseFloat(deltaTInput.value) || 20);
    const pue = Math.max(1.01, parseFloat(pueInput.value) || 1.25);
    const electricityRate = Math.max(0.01, parseFloat(rateInput.value) || 0.08);
    const res = calculateThermal({ itLoadKw, deltaTF, pue, electricityRate });
    drawThermalCanvas(canvas, { deltaTF, itLoadKw, cfm: res.cfm });
  });

  update();
}
