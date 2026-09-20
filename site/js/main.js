import { initProjectExplorer, updateProjectCareerPath } from "./project-explorer.js";
import { initSkillsViz, updateRadarChart, animateSkillBars } from "./skills-viz.js";

let resumeData = null;
let currentPath = "all";

async function loadResume() {
  const res = await fetch("data/resume.json");
  if (!res.ok) throw new Error(`Failed to load resume.json: ${res.status}`);
  return res.json();
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function renderHero(data) {
  const { profile } = data;
  if (profile) {
    if (profile.title) document.title = `${profile.name} — ${profile.title}`;
    const nameEl = document.getElementById("hero-name");
    if (nameEl) nameEl.textContent = profile.name;
    const brandEl = document.getElementById("nav-brand");
    if (brandEl) brandEl.textContent = profile.name;

    const githubLink = document.getElementById("link-github");
    if (githubLink && profile.links && profile.links.github) githubLink.href = profile.links.github;

    const portfolioLink = document.getElementById("link-portfolio");
    if (portfolioLink) {
      if (profile.links && profile.links.portfolio && profile.links.portfolio.startsWith("http")) {
        portfolioLink.href = profile.links.portfolio;
        portfolioLink.style.display = "inline-flex";
      } else {
        portfolioLink.style.display = "none";
      }
    }

    const footerContactLine = document.getElementById("footer-contact-line");
    if (footerContactLine) {
      footerContactLine.innerHTML = `${profile.location} &middot; ${profile.phone} &middot; <a id="footer-email" href="mailto:${profile.email}">${profile.email}</a>`;
    } else {
      const footerEmail = document.getElementById("footer-email");
      if (footerEmail && profile.email) {
        footerEmail.textContent = profile.email;
        footerEmail.href = `mailto:${profile.email}`;
      }
    }

    const footerGithub = document.getElementById("footer-github");
    if (footerGithub && profile.links && profile.links.github) footerGithub.href = profile.links.github;

    const footerPortfolio = document.getElementById("footer-portfolio");
    if (footerPortfolio) {
      if (profile.links && profile.links.portfolio && profile.links.portfolio.startsWith("http")) {
        footerPortfolio.href = profile.links.portfolio;
        footerPortfolio.style.display = "inline";
      } else {
        footerPortfolio.style.display = "none";
      }
    }
  }

  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  renderKpis(data);
}

function renderKpis(data) {
  const container = document.getElementById("hero-kpis");
  if (!container || !data.kpis) return;
  container.innerHTML = "";
  data.kpis.forEach((kpi) => {
    const card = el("div", "kpi-card");
    card.appendChild(el("div", "kpi-num", kpi.num));
    card.appendChild(el("div", "kpi-lbl", kpi.lbl));
    container.appendChild(card);
  });
}

function applyCareerPath(pathKey) {
  if (!resumeData || !resumeData.careerPaths) return;
  const pathConfig = resumeData.careerPaths[pathKey] || resumeData.careerPaths.all;
  currentPath = pathKey;

  // Update hero texts
  const heroBadge = document.getElementById("hero-badge");
  const heroTitle = document.getElementById("hero-title");
  const heroTagline = document.getElementById("hero-tagline");
  const summaryText = document.getElementById("summary-text");

  if (heroBadge) heroBadge.textContent = pathConfig.badge || pathConfig.name;
  if (heroTitle) heroTitle.textContent = pathConfig.title;
  if (heroTagline) heroTagline.textContent = pathConfig.tagline;
  if (summaryText) summaryText.textContent = pathConfig.summary;

  // Update switcher buttons UI
  document.querySelectorAll(".path-btn").forEach((btn) => {
    const isActive = btn.dataset.path === pathKey;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  // Update radar chart
  if (pathConfig.radar) {
    updateRadarChart(pathConfig.radar);
  }

  // Update experience bullets spotlight
  updateExperienceHighlighting(pathKey);

  // Update projects
  updateProjectCareerPath(pathKey);
}

function updateExperienceHighlighting(pathKey) {
  const allBullets = document.querySelectorAll(".bullet-item");
  allBullets.forEach((li) => {
    const paths = (li.dataset.paths || "").split(",");
    if (pathKey === "all") {
      li.classList.remove("path-spotlight", "path-muted");
    } else if (paths.includes(pathKey)) {
      li.classList.add("path-spotlight");
      li.classList.remove("path-muted");
    } else {
      li.classList.remove("path-spotlight");
      li.classList.add("path-muted");
    }
  });
}

function renderExperience(data) {
  const container = document.getElementById("experience-list");
  if (!container) return;
  container.innerHTML = "";

  data.experience.forEach((job) => {
    const item = el("div", "timeline-item");
    item.appendChild(el("div", "when", `${job.start} – ${job.end}`));

    const body = el("div");
    body.appendChild(el("h3", null, job.role));
    body.appendChild(el("div", "org", `${job.company} · ${job.location}`));

    if (job.overview) {
      body.appendChild(el("div", "role-overview", job.overview));
    }

    const ul = el("ul");
    job.bullets.forEach((b) => {
      const text = typeof b === "string" ? b : b.text;
      const paths = typeof b === "string" ? [] : b.paths || [];

      const li = el("li", "bullet-item");
      li.dataset.paths = paths.join(",");

      // Add badge tag if tagged
      if (paths.length) {
        let tagLabel = "";
        if (paths.includes("management")) tagLabel = "Management";
        else if (paths.includes("datacenter")) tagLabel = "Data Center";
        else if (paths.includes("systems")) tagLabel = "Systems";

        if (tagLabel) {
          const badge = el("span", "bullet-tag", tagLabel);
          li.appendChild(badge);
        }
      }

      const textNode = document.createElement("span");
      textNode.textContent = text;
      li.appendChild(textNode);

      ul.appendChild(li);
    });

    body.appendChild(ul);
    item.appendChild(body);
    container.appendChild(item);
  });
}

function renderEducation(data) {
  const container = document.getElementById("education-list");
  if (!container) return;
  container.innerHTML = "";

  data.education.forEach((edu) => {
    const item = el("div", "timeline-item");
    item.appendChild(el("div", "when", `${edu.start} – ${edu.end}`));
    const body = el("div");
    body.appendChild(el("h3", null, edu.degree));
    body.appendChild(el("div", "org", edu.school));
    if (edu.details) {
      body.appendChild(el("p", null, edu.details));
    }
    item.appendChild(body);
    container.appendChild(item);
  });
}

function setupReferences(data) {
  const btn = document.getElementById("btn-request-ref");
  if (!btn) return;

  const email = (data.references && data.references.email) || data.profile.email;
  const subject = (data.references && data.references.subject) || "Reference Request — Jonathan Randall";
  const body =
    (data.references && data.references.body) ||
    "Hi Jonathan,\n\nI reviewed your engineering background and would like to request contact details for your professional references.\n\nCompany: \nRole: \n\nThank you,";

  btn.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function setupPathSwitcher(data) {
  const switcher = document.getElementById("path-switcher");
  if (!switcher || !data.careerPaths) return;

  switcher.innerHTML = "";
  Object.entries(data.careerPaths).forEach(([key, path]) => {
    const btn = el("button", "path-btn" + (key === currentPath ? " active" : ""), path.shortName || path.name);
    btn.dataset.path = key;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", key === currentPath ? "true" : "false");
    switcher.appendChild(btn);
  });

  switcher.addEventListener("click", (e) => {
    const btn = e.target.closest(".path-btn");
    if (!btn) return;
    const pathKey = btn.dataset.path;
    if (pathKey) {
      applyCareerPath(pathKey);
    }
  });
}

async function main() {
  try {
    resumeData = await loadResume();
  } catch (err) {
    console.error(err);
    document.body.innerHTML =
      '<p style="padding:40px;font-family:sans-serif;">Could not load resume data. Please serve over HTTP (e.g., `npm run serve`).</p>';
    return;
  }

  renderHero(resumeData);
  renderExperience(resumeData);
  renderEducation(resumeData);
  setupReferences(resumeData);

  initSkillsViz(resumeData.skills);
  initProjectExplorer(resumeData.projects);

  setupPathSwitcher(resumeData);
  applyCareerPath("all");

  animateSkillBars();
}

main();
