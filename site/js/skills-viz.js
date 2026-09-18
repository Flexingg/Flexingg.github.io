// Renders the per-category skill bars and the core-competency radar chart.
// Supports dynamic updates when switching career paths.
// Chart.js is loaded globally via a CDN <script> tag in index.html.

let chartInstance = null;

function renderCategories(categories) {
  const container = document.getElementById("skills-categories");
  if (!container) return;
  container.innerHTML = "";

  categories.forEach((cat) => {
    const wrap = document.createElement("div");
    wrap.className = "skill-category";

    const heading = document.createElement("h4");
    heading.textContent = cat.name;
    wrap.appendChild(heading);

    cat.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "skill-bar-row";

      const label = document.createElement("div");
      label.className = "label";
      label.textContent = item.label;

      const track = document.createElement("div");
      track.className = "skill-bar-track";
      const fill = document.createElement("div");
      fill.className = "skill-bar-fill";
      fill.dataset.level = item.level;
      track.appendChild(fill);

      row.appendChild(label);
      row.appendChild(track);
      wrap.appendChild(row);
    });

    container.appendChild(wrap);
  });

  animateSkillBars();
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getColors() {
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue("--accent").trim() || "#a855f7";
  const textDim = styles.getPropertyValue("--text-dim").trim() || "#9aa5b8";
  const border = styles.getPropertyValue("--border").trim() || "#232b3d";
  return { accent, textDim, border };
}

export function updateRadarChart(radarData) {
  const canvas = document.getElementById("skills-radar");
  if (!canvas || typeof Chart === "undefined") return;

  const { accent, textDim, border } = getColors();

  if (chartInstance) {
    chartInstance.data.labels = radarData.map((d) => d.label);
    chartInstance.data.datasets[0].data = radarData.map((d) => d.value);
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(canvas, {
    type: "radar",
    data: {
      labels: radarData.map((d) => d.label),
      datasets: [
        {
          label: "Proficiency",
          data: radarData.map((d) => d.value),
          backgroundColor: hexToRgba(accent, 0.22),
          borderColor: accent,
          pointBackgroundColor: accent,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: accent,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false, stepSize: 20 },
          grid: { color: border },
          angleLines: { color: border },
          pointLabels: {
            color: textDim,
            font: { size: 11, weight: "500" },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Rating: ${ctx.parsed.r}/100`,
          },
        },
      },
    },
  });
}

export function animateSkillBars() {
  document.querySelectorAll(".skill-bar-fill").forEach((bar) => {
    requestAnimationFrame(() => {
      bar.style.width = bar.dataset.level + "%";
    });
  });
}

export function initSkillsViz(skills) {
  renderCategories(skills.categories);
  const initialRadar = skills.radar || [];
  if (initialRadar.length) {
    updateRadarChart(initialRadar);
  }
}
