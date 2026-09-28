(() => {
  "use strict";

  const seed = window.CV_IDENTITY_SEED;
  const themeKey = "cv-identity-theme-v2";
  const localeKey = "cv-identity-locale-v2";
  const stateKey = "cv-identity-profile-v2";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const byId = (id) => document.getElementById(id);
  const status = byId("status-message");
  let state = null;
  let locale = "en";
  let navObserver = null;
  let revealObserver = null;

  const get = (value) => value && value[locale] ? value[locale] : "";
  const ui = (path) => path.split(".").reduce((value, key) => value && value[key], state.ui);
  const text = (path) => get(ui(path));

  function announce(message) {
    status.textContent = "";
    window.setTimeout(() => { status.textContent = message; }, 20);
  }

  function cloneSeed() {
    return JSON.parse(JSON.stringify(seed));
  }

  function isLocalized(value) {
    return value && typeof value.en === "string" && typeof value.ar === "string";
  }

  function isValidState(candidate) {
    return candidate && candidate.schemaVersion === 2 && candidate.product && candidate.ui &&
      candidate.profile && isLocalized(candidate.profile.name) && isLocalized(candidate.profile.summary) &&
      Array.isArray(candidate.skills) && Array.isArray(candidate.experience) &&
      candidate.education && Array.isArray(candidate.credentials) && Array.isArray(candidate.languages) &&
      Array.isArray(candidate.projects);
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(stateKey);
      if (!saved) return cloneSeed();
      const parsed = JSON.parse(saved);
      return isValidState(parsed) ? parsed : cloneSeed();
    } catch {
      return cloneSeed();
    }
  }

  function saveState(nextState) {
    try {
      localStorage.setItem(stateKey, JSON.stringify(nextState));
      return true;
    } catch {
      announce(locale === "ar" ? "تعذر حفظ حالة الملف في هذا المتصفح." : "Your browser could not save this profile state.");
      return false;
    }
  }

  function createElement(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function applyStagger(node, index) {
    node.classList.add("stagger-item");
    node.style.setProperty("--stagger-index", String(index));
  }

  function monthYear(value) {
    if (!value) return text("privateRoute");
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-US", {
      month: "long", year: "numeric"
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  }

  function formatPeriod(period) {
    const start = monthYear(period.start);
    const end = period.end ? monthYear(period.end) : (locale === "ar" ? "حتى الآن" : "Present");
    return `${start} – ${end}`;
  }

  function setNodeText(selector, value) {
    const node = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (node) node.textContent = value;
  }

  function renderStaticCopy() {
    document.querySelectorAll("[data-i18n]").forEach((node) => setNodeText(node, text(node.dataset.i18n)));
    document.querySelectorAll("[data-i18n-aria]").forEach((node) => node.setAttribute("aria-label", text(node.dataset.i18nAria)));
    document.querySelectorAll("[data-product]").forEach((node) => setNodeText(node, get(state.product[node.dataset.product])));
    byId("theme-toggle").setAttribute("aria-label", text(document.documentElement.dataset.theme === "light" ? "darkMode" : "lightMode"));
    byId("theme-toggle-label").textContent = text(document.documentElement.dataset.theme === "light" ? "darkMode" : "lightMode");
    document.querySelector(".brand").setAttribute("aria-label", `${get(state.product.name)} ${locale === "ar" ? "الرئيسية" : "home"}`);
  }

  function renderProfile() {
    const profile = state.profile;
    setNodeText("#profile-name", get(profile.name));
    setNodeText("#profile-title", get(profile.title));
    setNodeText("#profile-location", get(profile.location));
    setNodeText("#profile-summary", get(profile.summary));
  }

  function renderSkills() {
    const list = byId("skills-list");
    list.replaceChildren();
    state.skills.forEach((skill, index) => {
      const card = createElement("article", "skill-card", get(skill));
      applyStagger(card, index);
      list.append(card);
    });
  }

  function renderExperience() {
    const list = byId("experience-list");
    list.replaceChildren();
    state.experience.forEach((item, index) => {
      const wrapper = createElement("article", "timeline-item");
      applyStagger(wrapper, index);
      const detailId = `experience-detail-${item.id}`;
      const toggle = createElement("button", "timeline-toggle");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", detailId);
      toggle.setAttribute("aria-label", `${text("collapsed")}: ${get(item.title)} — ${get(item.organization)}`);
      const heading = createElement("span");
      heading.append(
        createElement("span", "timeline-role", get(item.title)),
        createElement("span", "timeline-org", get(item.organization)),
        createElement("span", "timeline-period", formatPeriod(item.period))
      );
      toggle.append(heading, createElement("span", "chevron"));
      const detail = createElement("div", "timeline-detail");
      detail.id = detailId;
      detail.hidden = true;
      detail.append(createElement("p", "", get(item.description)));
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        toggle.setAttribute("aria-label", `${text(open ? "collapsed" : "expanded")}: ${get(item.title)} — ${get(item.organization)}`);
        detail.hidden = open;
      });
      wrapper.append(toggle, detail);
      list.append(wrapper);
    });
  }

  function renderEducation() {
    const education = state.education;
    const card = byId("education-card");
    card.replaceChildren(
      createElement("p", "card-label", text("qualification")),
      createElement("h3", "", get(education.degree)),
      createElement("p", "", get(education.institution)),
      createElement("p", "", formatPeriod(education.period))
    );
  }

  function renderCredentials() {
    const list = byId("credential-list");
    list.replaceChildren();
    state.credentials.forEach((credential, index) => {
      const row = createElement("div", "credential-item", get(credential));
      applyStagger(row, index);
      list.append(row);
    });
  }

  function renderProjects() {
    const list = byId("projects-list");
    list.replaceChildren();
    state.projects.forEach((project, index) => {
      const card = createElement("article", `project-card ${project.status === "planned" ? "planned" : ""}`);
      applyStagger(card, index);
      const title = createElement("h3", "", get(project.title));
      if (locale === "ar" && /^[\x00-\x7F]+$/.test(get(project.title))) {
        title.lang = "en";
        title.dir = "ltr";
      }
      card.append(createElement("span", "project-meta", get(project.type)), title, createElement("p", "", get(project.description)));
      if (project.status === "live" && project.url) {
        const link = createElement("a", "project-link", text("viewProject"));
        link.href = project.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", text("openProject").replace("{project}", get(project.title)));
        card.append(link);
      } else {
        card.append(createElement("span", "status-badge", text("comingSoon")));
      }
      list.append(card);
    });
  }

  function renderLanguages() {
    const list = byId("languages-list");
    list.replaceChildren();
    state.languages.forEach((language, index) => {
      const card = createElement("article", "language-card");
      applyStagger(card, index);
      card.append(createElement("strong", "", get(language.name)), createElement("span", "", get(language.level)));
      list.append(card);
    });
  }

  function renderContact() {
    setNodeText("#contact-copy", text("contactCopy"));
    setNodeText("#recommendation", text("recommendation"));
  }

  function render() {
    renderStaticCopy();
    renderProfile();
    renderSkills();
    renderExperience();
    renderEducation();
    renderCredentials();
    renderProjects();
    renderLanguages();
    renderContact();
  }

  function setTheme(theme, announceChange = false) {
    const selected = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = selected;
    const isLight = selected === "light";
    byId("theme-toggle").setAttribute("aria-pressed", String(isLight));
    try { localStorage.setItem(themeKey, selected); } catch { /* Theme remains active for this session. */ }
    renderStaticCopy();
    if (announceChange) announce(text(isLight ? "switchedLight" : "switchedDark"));
  }

  function setLocale(nextLocale, shouldAnnounce = false) {
    locale = nextLocale === "ar" ? "ar" : "en";
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
    document.title = `${get(state.product.name)} | ${get(state.profile.name)}`;
    document.querySelector('meta[name="description"]').setAttribute("content", get(state.product.supporting));
    document.querySelectorAll(".language-button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.locale === locale)));
    render();
    setupNavigation();
    setupRevealEffects();
    try { localStorage.setItem(localeKey, locale); } catch { /* Locale remains active for this session. */ }
    if (shouldAnnounce) announce(text("switchedLanguage"));
  }

  function setupControls() {
    byId("theme-toggle").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true));
    document.querySelectorAll(".language-button").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.locale === locale) return;
        const scrollY = window.scrollY;
        setLocale(button.dataset.locale, true);
        window.scrollTo({ top: scrollY, behavior: reducedMotion.matches ? "auto" : "instant" });
        button.focus();
      });
    });
    byId("load-example").addEventListener("click", () => {
      state = cloneSeed();
      saveState(state);
      render();
      setupNavigation();
      setupRevealEffects();
      announce(text("resetNotice"));
    });
    byId("print-cv").addEventListener("click", () => window.print());
  }

  function setupScrollProgress() {
    const bar = byId("scroll-progress-bar");
    const update = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.inlineSize = `${Math.max(0, Math.min(100, range ? (window.scrollY / range) * 100 : 0))}%`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function setupNavigation() {
    if (navObserver) navObserver.disconnect();
    const links = [...document.querySelectorAll(".site-nav a")];
    const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    navObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => {
        if (link.getAttribute("href") === `#${visible.target.id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-35% 0px -50% 0px", threshold: [0.05, 0.2, 0.5] });
    sections.forEach((section) => navObserver.observe(section));
  }

  function setupRevealEffects() {
    if (revealObserver) revealObserver.disconnect();
    const sections = document.querySelectorAll(".reveal");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    sections.forEach((section) => revealObserver.observe(section));
  }

  state = loadState();
  let savedLocale = "en";
  let savedTheme = "dark";
  try {
    savedLocale = localStorage.getItem(localeKey) || "en";
    savedTheme = localStorage.getItem(themeKey) || "dark";
  } catch { /* Defaults remain safe. */ }
  setTheme(savedTheme);
  setLocale(savedLocale);
  setupControls();
  setupScrollProgress();
  setupNavigation();
  setupRevealEffects();

  window.CVIdentity = {
    getState: () => state,
    getLocale: () => locale,
    getText: get,
    getUiText: text,
    formatPeriod,
    announce,
    usePrintFallback: () => window.print()
  };
})();
