function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

async function main() {
  const res = await fetch("data/resume.json");
  const data = await res.json();
  const { profile } = data;

  const sheet = document.getElementById("sheet");
  sheet.innerHTML = "";

  // Header
  const header = el("div", "resume-header");
  header.appendChild(el("h1", null, profile.name));
  header.appendChild(el("div", "title", profile.title));

  const contactParts = [
    profile.location,
    profile.phone,
    `<a href="mailto:${profile.email}">${profile.email}</a>`,
  ];
  if (profile.links.portfolio) {
    contactParts.push(`<a href="${profile.links.portfolio}">resume.randall.engineering</a>`);
  }
  if (profile.links.github) {
    contactParts.push(`<a href="${profile.links.github}">${profile.links.github.replace("https://", "")}</a>`);
  }

  header.appendChild(el("div", "contact", contactParts.join(" &middot; ")));
  sheet.appendChild(header);

  // Summary
  sheet.appendChild(el("h2", null, "Professional Summary"));
  sheet.appendChild(el("p", "summary", data.summary));

  // Experience
  sheet.appendChild(el("h2", null, "Experience"));
  data.experience.forEach((job) => {
    const entry = el("div", "entry");
    entry.appendChild(el("div", "entry-head", `<span>${job.role} &mdash; <strong>${job.company}</strong></span><span>${job.start} &ndash; ${job.end}</span>`));
    entry.appendChild(el("div", "entry-sub", job.location));

    if (job.overview) {
      entry.appendChild(el("div", "entry-overview", job.overview));
    }

    const ul = el("ul");
    job.bullets.forEach((b) => {
      const text = typeof b === "string" ? b : b.text;
      ul.appendChild(el("li", null, text));
    });
    entry.appendChild(ul);
    sheet.appendChild(entry);
  });

  // Education
  sheet.appendChild(el("h2", null, "Education"));
  data.education.forEach((edu) => {
    const entry = el("div", "entry");
    entry.appendChild(el("div", "entry-head", `<span><strong>${edu.school}</strong></span><span>${edu.start} &ndash; ${edu.end}</span>`));
    entry.appendChild(el("div", "entry-sub", edu.degree));
    if (edu.details) entry.appendChild(el("div", "edu-details", edu.details));
    sheet.appendChild(entry);
  });

  // Skills
  sheet.appendChild(el("h2", null, "Skills & Competencies"));
  data.skills.categories.forEach((cat) => {
    const line = el(
      "div",
      "skills-line",
      `<strong>${cat.name}:</strong> ${cat.items.map((i) => i.label).join(", ")}`
    );
    sheet.appendChild(line);
  });

  // References (Privacy-safe: Available upon request)
  sheet.appendChild(el("h2", null, "Professional References"));
  const refText =
    (data.references && data.references.statement) ||
    "Professional references from manufacturing and engineering leadership are available upon request.";
  const refLine = el(
    "div",
    "ref-line",
    `<em>${refText}</em> &mdash; Direct contact available via <a href="mailto:${profile.email}">${profile.email}</a>`
  );
  sheet.appendChild(refLine);

  document.getElementById("status").style.display = "none";
  sheet.style.display = "block";
  document.body.setAttribute("data-render-complete", "true");
}

main();
