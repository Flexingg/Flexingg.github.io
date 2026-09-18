import { initProjectExplorer } from "./project-explorer.js";
import { initCadViewer } from "./cad-viewer.js";
import { initBeamCalculator } from "./beam-calculator.js";
import { initSkillsViz } from "./skills-viz.js";

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
  document.getElementById("hero-name").textContent = profile.name;
  document.getElementById("hero-title").textContent = profile.title;
  document.getElementById("hero-tagline").textContent = profile.tagline;
  document.getElementById("nav-brand").textContent = profile.name;

  const githubLink = document.getElementById("link-github");
  githubLink.href = profile.links.github;
  const linkedinLink = document.getElementById("link-linkedin");
  linkedinLink.href = profile.links.linkedin;

  document.getElementById("footer-email").textContent = profile.email;
  document.getElementById("footer-email").href = `mailto:${profile.email}`;
  document.getElementById("footer-github").href = profile.links.github;
  document.getElementById("footer-linkedin").href = profile.links.linkedin;
  document.getElementById("footer-year").textContent = new Date().getFullYear();
}

function renderSummary(data) {
  document.getElementById("summary-text").textContent = data.summary;
}

function renderExperience(data) {
  const container = document.getElementById("experience-list");
  container.innerHTML = "";
  data.experience.forEach((job) => {
    const item = el("div", "timeline-item");
    item.appendChild(el("div", "when", `${job.start} – ${job.end}`));
    const body = el("div");
    body.appendChild(el("h3", null, job.role));
    body.appendChild(el("div", "org", `${job.company} · ${job.location}`));
    const ul = el("ul");
    job.bullets.forEach((b) => ul.appendChild(el("li", null, b)));
    body.appendChild(ul);
    item.appendChild(body);
    container.appendChild(item);
  });
}

function renderEducation(data) {
  const container = document.getElementById("education-list");
  container.innerHTML = "";
  data.education.forEach((edu) => {
    const item = el("div", "timeline-item");
    item.appendChild(el("div", "when", `${edu.start} – ${edu.end}`));
    const body = el("div");
    body.appendChild(el("h3", null, edu.degree));
    body.appendChild(el("div", "org", edu.school));
    body.appendChild(el("p", null, edu.details));
    item.appendChild(body);
    container.appendChild(item);
  });

  if (data.certifications && data.certifications.length) {
    const certList = document.getElementById("certifications-list");
    certList.innerHTML = "";
    data.certifications.forEach((c) => certList.appendChild(el("li", null, c)));
  }
}

async function main() {
  let data;
  try {
    data = await loadResume();
  } catch (err) {
    console.error(err);
    document.body.innerHTML =
      '<p style="padding:40px;font-family:sans-serif;">Could not load resume data. If you are running this locally, serve the site over http:// (fetch of data/resume.json fails over file://) e.g. `npx serve site`.</p>';
    return;
  }

  renderHero(data);
  renderSummary(data);
  renderExperience(data);
  renderEducation(data);
  initSkillsViz(data.skills);
  initProjectExplorer(data.projects);
  initCadViewer();
  initBeamCalculator();

  document.querySelectorAll(".skill-bar-fill").forEach((bar) => {
    requestAnimationFrame(() => {
      bar.style.width = bar.dataset.level + "%";
    });
  });
}

main();
