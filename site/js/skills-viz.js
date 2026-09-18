// Renders the per-category skill bars and the core-competency radar chart.
// Chart.js is loaded globally via a CDN <script> tag in index.html.

function renderCategories(categories) {
  const container = document.getElementById("skills-categories");
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
}

function renderRadar(radarData) {
  const canvas = document.getElementById("skills-radar");
  if (!canvas || typeof Chart === "undefined") return;

  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue("--accent").trim() || "#4fd1c5";
  const textDim = styles.getPropertyValue("--text-dim").trim() || "#9aa5b8";
  const border = styles.getPropertyValue("--border").trim() || "#232b3d";

  new Chart(canvas, {
    type: "radar",
    data: {
      labels: radarData.map((d) => d.label),
      datasets: [
        {
          label: "Proficiency",
          data: radarData.map((d) => d.value),
          backgroundColor: hexToRgba(accent, 0.18),
          borderColor: accent,
          pointBackgroundColor: accent,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false, stepSize: 20 },
          grid: { color: border },
          angleLines: { color: border },
          pointLabels: { color: textDim, font: { size: 11 } },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function initSkillsViz(skills) {
  renderCategories(skills.categories);
  renderRadar(skills.radar);
}
