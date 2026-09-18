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

  sheet.appendChild(el("h1", null, profile.name));
  sheet.appendChild(el("div", "title", profile.title));
  sheet.appendChild(
    el(
      "div",
      "contact",
      `${profile.location} &middot; ${profile.email} &middot; ${profile.phone} &middot; ` +
        `<a href="${profile.links.github}">${profile.links.github.replace("https://", "")}</a> &middot; ` +
        `<a href="${profile.links.linkedin}">${profile.links.linkedin.replace("https://", "")}</a>`
    )
  );

  sheet.appendChild(el("h2", null, "Summary"));
  sheet.appendChild(el("p", "summary", data.summary));

  sheet.appendChild(el("h2", null, "Experience"));
  data.experience.forEach((job) => {
    const entry = el("div", "entry");
    entry.appendChild(el("div", "entry-head", `<span>${job.role}</span><span>${job.start} – ${job.end}</span>`));
    entry.appendChild(el("div", "entry-sub", `${job.company} — ${job.location}`));
    const ul = el("ul");
    job.bullets.forEach((b) => ul.appendChild(el("li", null, b)));
    entry.appendChild(ul);
    sheet.appendChild(entry);
  });

  sheet.appendChild(el("h2", null, "Education"));
  data.education.forEach((edu) => {
    const entry = el("div", "entry");
    entry.appendChild(el("div", "entry-head", `<span>${edu.degree}</span><span>${edu.start} – ${edu.end}</span>`));
    entry.appendChild(el("div", "entry-sub", edu.school));
    if (edu.details) entry.appendChild(el("div", null, edu.details));
    sheet.appendChild(entry);
  });

  if (data.certifications && data.certifications.length) {
    sheet.appendChild(el("h2", null, "Certifications"));
    const ul = el("ul");
    data.certifications.forEach((c) => ul.appendChild(el("li", null, c)));
    sheet.appendChild(ul);
  }

  sheet.appendChild(el("h2", null, "Skills"));
  data.skills.categories.forEach((cat) => {
    const line = el(
      "div",
      "skills-line",
      `<b>${cat.name}:</b> ${cat.items.map((i) => i.label).join(", ")}`
    );
    sheet.appendChild(line);
  });

  document.getElementById("status").style.display = "none";
  sheet.style.display = "block";
  document.body.setAttribute("data-render-complete", "true");
}

main();
