(() => {
  "use strict";

  const seed = window.CV_PORTFOLIO_SEED;
  const themeKey = "retal-mohammed-portfolio-theme";
  const portfolioKey = "retal-mohammed-portfolio-v1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const byId = (id) => document.getElementById(id);
  const status = byId("status-message");

  function announce(message) {
    status.textContent = "";
    window.setTimeout(() => { status.textContent = message; }, 30);
  }

  function cloneSeed() {
    return JSON.parse(JSON.stringify(seed));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(portfolioKey);
      if (!saved) return cloneSeed();
      const parsed = JSON.parse(saved);
      return parsed && parsed.profile && Array.isArray(parsed.skills) ? parsed : cloneSeed();
    } catch {
      return cloneSeed();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(portfolioKey, JSON.stringify(state));
      return true;
    } catch {
      announce("Your browser could not save this local state.");
      return false;
    }
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function applyStagger(element, index) {
    element.classList.add("stagger-item");
    element.style.setProperty("--stagger-index", String(index));
  }

  function renderProfile(profile) {
    byId("hero-name").textContent = profile.name;
    byId("hero-title").textContent = profile.title;
    byId("hero-summary").textContent = profile.summary;
    byId("hero-location").textContent = profile.location;
    byId("about-summary").textContent = profile.summary;
  }

  function renderSkills(skills) {
    const container = byId("skills-list");
    container.replaceChildren();
    skills.forEach((skill, index) => {
      const card = createElement("article", "skill-card", undefined);
      applyStagger(card, index);
      card.tabIndex = 0;
      card.append(createElement("strong", "", skill));
      container.append(card);
    });
  }

  function renderExperience(experience) {
    const container = byId("experience-list");
    container.replaceChildren();
    experience.forEach((item, index) => {
      const wrapper = createElement("article", "timeline-item");
      applyStagger(wrapper, index);

      const toggle = createElement("button", "timeline-toggle");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", `experience-detail-${item.id}`);
      toggle.setAttribute("aria-label", `Show details for ${item.title} at ${item.organization}`);

      const text = createElement("span", "");
      text.append(
        createElement("span", "timeline-role", item.title),
        createElement("span", "timeline-org", item.organization),
        createElement("span", "timeline-period", item.period)
      );
      toggle.append(text, createElement("span", "chevron"));

      const detail = createElement("div", "timeline-detail");
      detail.id = `experience-detail-${item.id}`;
      detail.hidden = true;
      const detailInner = createElement("div", "");
      detailInner.append(createElement("p", "", item.description));
      detail.append(detailInner);

      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        detail.hidden = expanded;
      });
      wrapper.append(toggle, detail);
      container.append(wrapper);
    });
  }

  function renderEducation(education) {
    const card = byId("education-card");
    card.replaceChildren(
      createElement("p", "card-label", "Qualification"),
      createElement("h3", "", education.degree),
      createElement("p", "", education.institution),
      createElement("p", "", education.period)
    );
  }

  function renderCertifications(certifications) {
    const container = byId("certification-list");
    container.replaceChildren();
    certifications.forEach((certification, index) => {
      const item = createElement("div", "certification-item", certification);
      applyStagger(item, index);
      container.append(item);
    });
  }

  function renderProjects(projects) {
    const container = byId("projects-list");
    container.replaceChildren();
    projects.forEach((project, index) => {
      const card = createElement("article", `project-card${project.status === "coming-soon" ? " coming-soon" : ""}`);
      applyStagger(card, index);
      card.append(
        createElement("span", "project-meta", project.type),
        createElement("h3", "", project.title),
        createElement("p", "", project.description)
      );

      if (project.status === "live" && project.url) {
        const link = createElement("a", "project-link", "View project");
        link.href = project.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `Open ${project.title} in a new tab`);
        card.append(link);
      } else {
        card.append(createElement("span", "status-badge", "Coming soon"));
      }
      container.append(card);
    });
  }

  function renderLanguages(languages) {
    const container = byId("languages-list");
    container.replaceChildren();
    languages.forEach((language, index) => {
      const card = createElement("article", "language-card");
      applyStagger(card, index);
      card.append(createElement("strong", "", language.name), createElement("span", "", language.level));
      container.append(card);
    });
  }

  function render(state) {
    renderProfile(state.profile);
    renderSkills(state.skills);
    renderExperience(state.experience);
    renderEducation(state.education);
    renderCertifications(state.certifications);
    renderProjects(state.projects);
    renderLanguages(state.languages);
    byId("recommendation").textContent = state.contact.recommendation;
  }

  function setTheme(theme, shouldAnnounce = false) {
    const isLight = theme === "light";
    document.documentElement.dataset.theme = isLight ? "light" : "dark";
    const toggle = byId("theme-toggle");
    byId("theme-toggle-label").textContent = isLight ? "Dark mode" : "Light mode";
    toggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    toggle.setAttribute("aria-pressed", String(isLight));
    try { localStorage.setItem(themeKey, isLight ? "light" : "dark"); } catch { /* Browser storage is optional. */ }
    if (shouldAnnounce) announce(`Switched to ${isLight ? "light" : "dark"} mode.`);
  }

  function setupTheme() {
    let savedTheme = "dark";
    try { savedTheme = localStorage.getItem(themeKey) || "dark"; } catch { /* Dark remains the default. */ }
    setTheme(savedTheme);
    byId("theme-toggle").addEventListener("click", () => {
      const current = document.documentElement.dataset.theme;
      setTheme(current === "dark" ? "light" : "dark", true);
    });
  }

  function setupScrollProgress() {
    const bar = byId("scroll-progress-bar");
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const percent = height > 0 ? (window.scrollY / height) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function setupNavigation() {
    const links = [...document.querySelectorAll(".site-nav a")];
    const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-35% 0px -50% 0px", threshold: [0.05, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }

  function setupRevealEffects() {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, localObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          localObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13 });
    document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
  }

  function setupLoadExample() {
    byId("load-example").addEventListener("click", () => {
      const state = cloneSeed();
      saveState(state);
      render(state);
      setupRevealEffects();
      announce("The example portfolio has been restored in this browser.");
    });
  }

  const state = loadState();
  render(state);
  setupTheme();
  setupScrollProgress();
  setupNavigation();
  setupRevealEffects();
  setupLoadExample();
})();
