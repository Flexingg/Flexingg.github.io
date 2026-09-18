// Filterable project grid + detail modal. Pure DOM, no dependencies.

let allProjects = [];

function uniqueCategories(projects) {
  return ["All", ...new Set(projects.map((p) => p.category))];
}

function renderChips(categories, activeCategory, onSelect) {
  const bar = document.getElementById("project-filters");
  bar.innerHTML = "";
  categories.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "filter-chip" + (cat === activeCategory ? " active" : "");
    chip.textContent = cat;
    chip.addEventListener("click", () => onSelect(cat));
    bar.appendChild(chip);
  });
}

function renderGrid(projects) {
  const grid = document.getElementById("project-grid");
  grid.innerHTML = "";
  projects.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card project-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const cat = document.createElement("div");
    cat.className = "cat";
    cat.textContent = p.category;

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

    card.appendChild(cat);
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
  const filtered =
    category === "All" ? allProjects : allProjects.filter((p) => p.category === category);
  renderGrid(filtered);
  renderChips(uniqueCategories(allProjects), category, applyFilter);
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
