// Filterable project grid + detail modal. Pure DOM, no dependencies.
// Enhanced with career-path tagging and filtering.

let allProjects = [];
let activeCategory = "All";
let activeCareerPath = "all";

function uniqueCategories(projects) {
  return ["All", ...new Set(projects.map((p) => p.category))];
}

function renderChips(categories, currentCategory, onSelect) {
  const bar = document.getElementById("project-filters");
  if (!bar) return;
  bar.innerHTML = "";
  categories.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "filter-chip" + (cat === currentCategory ? " active" : "");
    chip.textContent = cat;
    chip.addEventListener("click", () => onSelect(cat));
    bar.appendChild(chip);
  });
}

function renderGrid(projects) {
  const grid = document.getElementById("project-grid");
  if (!grid) return;
  grid.innerHTML = "";

  projects.forEach((p) => {
    const isPathMatch =
      activeCareerPath === "all" ||
      (p.paths && (p.paths.includes(activeCareerPath) || p.paths.includes("all")));

    const card = document.createElement("div");
    card.className = "card project-card" + (isPathMatch ? " path-highlight" : " path-muted");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const headerRow = document.createElement("div");
    headerRow.className = "project-card-header";

    const cat = document.createElement("div");
    cat.className = "cat";
    cat.textContent = p.category;
    headerRow.appendChild(cat);

    if (p.paths && p.paths.length) {
      const pathBadge = document.createElement("span");
      pathBadge.className = "project-path-badge";
      if (p.paths.includes("management") && activeCareerPath === "management") {
        pathBadge.textContent = "★ Management Match";
      } else if (p.paths.includes("systems") && activeCareerPath === "systems") {
        pathBadge.textContent = "★ Systems Match";
      } else if (p.paths.includes("datacenter") && activeCareerPath === "datacenter") {
        pathBadge.textContent = "★ Data Center Match";
      } else if (activeCareerPath !== "all") {
        pathBadge.textContent = "Secondary Match";
        pathBadge.classList.add("secondary");
      }
      if (pathBadge.textContent) {
        headerRow.appendChild(pathBadge);
      }
    }

    const title = document.createElement("h3");
    title.textContent = p.title;

    const summary = document.createElement("p");
    summary.textContent = p.summary;

    const tagRow = document.createElement("div");
    tagRow.className = "tag-row";
    p.tags.forEach((t) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = t;
      tagRow.appendChild(tag);
    });

    card.appendChild(headerRow);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(tagRow);

    const open = () => openModal(p);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") open();
    });

    grid.appendChild(card);
  });
}

function openModal(project) {
  const backdrop = document.getElementById("project-modal-backdrop");
  document.getElementById("modal-title").textContent = project.title;
  document.getElementById("modal-description").textContent = project.description;

  const highlightsList = document.getElementById("modal-highlights");
  highlightsList.innerHTML = "";
  project.highlights.forEach((h) => {
    const li = document.createElement("li");
    li.textContent = h;
    highlightsList.appendChild(li);
  });

  const tagRow = document.getElementById("modal-tags");
  tagRow.innerHTML = "";
  project.tags.forEach((t) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = t;
    tagRow.appendChild(tag);
  });

  backdrop.classList.add("open");
}

function closeModal() {
  document.getElementById("project-modal-backdrop").classList.remove("open");
}

function applyFilter(category) {
  activeCategory = category;
  let filtered =
    category === "All" ? allProjects : allProjects.filter((p) => p.category === category);

  // If a specific career path is selected, sort matching projects to top
  if (activeCareerPath !== "all") {
    filtered = [...filtered].sort((a, b) => {
      const aMatch = a.paths && (a.paths.includes(activeCareerPath) || a.paths.includes("all"));
      const bMatch = b.paths && (b.paths.includes(activeCareerPath) || b.paths.includes("all"));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }

  renderGrid(filtered);
  renderChips(uniqueCategories(allProjects), category, applyFilter);
}

export function updateProjectCareerPath(careerPath) {
  activeCareerPath = careerPath;
  applyFilter(activeCategory);
}

export function initProjectExplorer(projects) {
  allProjects = projects;
  applyFilter("All");

  document.getElementById("modal-close-btn").addEventListener("click", closeModal);
  document.getElementById("project-modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "project-modal-backdrop") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}
