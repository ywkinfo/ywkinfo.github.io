import { profileData } from "../data/profile-data.js";

const storageKey = "ywk-profile-lang";
const currentYear = new Date().getFullYear();
const state = {
  lang: window.localStorage.getItem(storageKey) || "ko",
};

const elements = {
  title: document.querySelector("title"),
  description: document.querySelector('meta[name="description"]'),
  ogTitle: document.querySelector('meta[property="og:title"]'),
  ogDescription: document.querySelector('meta[property="og:description"]'),
  langToggle: document.querySelector(".lang-toggle"),
  langCurrent: document.querySelector("[data-lang-current]"),
  heroKicker: document.querySelector("#hero-kicker"),
  heroName: document.querySelector("#hero-name"),
  heroRole: document.querySelector("#hero-role"),
  heroSummary: document.querySelector("#hero-summary"),
  heroMeta: document.querySelector("#hero-meta"),
  heroStats: document.querySelector("#hero-stats"),
  officialProfileLink: document.querySelector("#official-profile-link"),
  emailLink: document.querySelector("#email-link"),
  app: document.querySelector("#app"),
  footerNote: document.querySelector("#footer-note"),
  footerSourceLabel: document.querySelector("#footer-source-label"),
  footerSourceLink: document.querySelector("#footer-source-link"),
  navLinks: document.querySelectorAll("[data-nav-key]"),
};

function t(value) {
  if (typeof value === "string") {
    return value;
  }
  return value?.[state.lang] ?? value?.en ?? "";
}

function iconLabel(term, value) {
  return `
    <div class="meta-row">
      <dt>${term}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

function renderHero() {
  const { profile, meta, heroStats, sectionCopy } = profileData;
  const computedStats = heroStats.map((stat) =>
    stat.valueKey === "yearsExperience"
      ? { ...stat, value: `${currentYear - 1995}+` }
      : stat
  );

  elements.heroKicker.textContent = meta.heroKicker[state.lang];
  elements.heroName.textContent = t(profile.name);
  elements.heroRole.textContent = t(profile.role);
  elements.heroSummary.textContent = t(profile.summary);
  elements.langCurrent.textContent = state.lang.toUpperCase();
  elements.langToggle.setAttribute("aria-pressed", String(state.lang === "en"));
  elements.langToggle.setAttribute(
    "aria-label",
    state.lang === "ko"
      ? "영어로 전환"
      : "Switch to Korean"
  );

  elements.officialProfileLink.textContent =
    state.lang === "ko" ? "공식 프로필" : "Official profile";
  elements.officialProfileLink.href =
    state.lang === "ko"
      ? profile.contact.officialProfileKo
      : profile.contact.officialProfileEn;

  elements.emailLink.textContent = state.lang === "ko" ? "이메일" : "Email";
  elements.emailLink.href = `mailto:${profile.contact.email}`;

  elements.heroMeta.innerHTML = [
    iconLabel(
      t(sectionCopy.contact.phone),
      `<a href="tel:${profile.contact.phone}">${profile.contact.phone}</a>`
    ),
    iconLabel(t(sectionCopy.contact.fax), profile.contact.fax),
    iconLabel(
      t(sectionCopy.contact.email),
      `<a href="mailto:${profile.contact.email}">${profile.contact.email}</a>`
    ),
    iconLabel(t(sectionCopy.contact.office), t(profile.office))
  ].join("");

  elements.heroStats.innerHTML = computedStats
    .map(
      (stat) => `
        <article class="stat-card">
          <strong>${stat.value}</strong>
          <span>${t(stat.label)}</span>
        </article>
      `
    )
    .join("");
}

function renderAbout() {
  const { sectionCopy, profile } = profileData;

  return `
    <section class="content-section" id="about">
      <p class="section-eyebrow">${t(sectionCopy.about.eyebrow)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.about.title)}</h2>
      </div>
      <div class="prose">
        ${profile.intro.map((paragraph) => `<p>${t(paragraph)}</p>`).join("")}
      </div>
    </section>
  `;
}

function renderExpertise() {
  const { sectionCopy, expertise } = profileData;

  return `
    <section class="content-section" id="expertise">
      <p class="section-eyebrow">${t(sectionCopy.expertise.eyebrow)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.expertise.title)}</h2>
        <p>${t(sectionCopy.expertise.intro)}</p>
      </div>
      <div class="tag-grid">
        ${expertise
          .map((item) => `<span class="tag">${t(item)}</span>`)
          .join("")}
      </div>
    </section>
  `;
}

function renderTimeline() {
  const { sectionCopy, experience } = profileData;

  return `
    <section class="content-section" id="timeline">
      <p class="section-eyebrow">${t(sectionCopy.timeline.eyebrow)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.timeline.title)}</h2>
      </div>
      <div class="timeline">
        ${experience
          .map(
            (item) => `
              <article class="timeline-item">
                <div class="timeline-item__period">${item.period}</div>
                <div class="timeline-item__body">
                  <h3>${t(item.title)}</h3>
                  <p class="timeline-item__org">${t(item.org)}</p>
                  <p>${t(item.note)}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCredentialsList(items) {
  return items
    .map(
      (item) => `
        <li>
          <span>${item.year}</span>
          <strong>${t(item.item)}</strong>
        </li>
      `
    )
    .join("");
}

function renderCredentials() {
  const { sectionCopy, credentials } = profileData;

  return `
    <section class="content-section" id="credentials">
      <p class="section-eyebrow">${t(sectionCopy.credentials.eyebrow)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.credentials.title)}</h2>
      </div>
      <div class="credential-grid">
        <article class="credential-card">
          <h3>${t(sectionCopy.credentials.education)}</h3>
          <ul class="fact-list">${renderCredentialsList(credentials.education)}</ul>
        </article>
        <article class="credential-card">
          <h3>${t(sectionCopy.credentials.qualifications)}</h3>
          <ul class="fact-list">${renderCredentialsList(credentials.qualifications)}</ul>
        </article>
        <article class="credential-card credential-card--wide">
          <h3>${t(sectionCopy.credentials.languages)}</h3>
          <div class="language-list">
            ${credentials.languages
              .map((language) => `<span class="tag">${t(language)}</span>`)
              .join("")}
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderActivityList(items, detailed = false) {
  return items
    .map(
      (item) => `
        <li>
          <span>${item.year}</span>
          <div>
            <strong>${t(item.item)}</strong>
            ${detailed && item.detail ? `<p>${t(item.detail)}</p>` : ""}
          </div>
        </li>
      `
    )
    .join("");
}

function renderActivities() {
  const { sectionCopy, activities } = profileData;

  return `
    <section class="content-section" id="activities">
      <p class="section-eyebrow">${t(sectionCopy.activities.eyebrow)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.activities.title)}</h2>
      </div>
      <div class="activity-grid">
        <article class="activity-card">
          <h3>${t(sectionCopy.activities.awards)}</h3>
          <ul class="activity-list">${renderActivityList(activities.awards)}</ul>
        </article>
        <article class="activity-card">
          <h3>${t(sectionCopy.activities.publications)}</h3>
          <ul class="activity-list">${renderActivityList(activities.publications, true)}</ul>
        </article>
        <article class="activity-card">
          <h3>${t(sectionCopy.activities.speaking)}</h3>
          <ul class="activity-list">${renderActivityList(activities.speaking)}</ul>
        </article>
      </div>
    </section>
  `;
}

function renderLinks() {
  const { sectionCopy, relatedLinks } = profileData;

  return `
    <section class="content-section" id="links">
      <p class="section-eyebrow">${t(sectionCopy.links.eyebrow)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.links.title)}</h2>
      </div>
      <div class="link-grid">
        ${relatedLinks
          .map(
            (link) => `
              <a class="link-card" href="${link.url}" target="_blank" rel="noreferrer">
                <span class="link-card__source">${link.source}</span>
                <strong>${t(link.title)}</strong>
                <p>${t(link.note)}</p>
              </a>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderContact() {
  const { sectionCopy, profile } = profileData;

  return `
    <section class="content-section" id="contact">
      <p class="section-eyebrow">${t(sectionCopy.contact.eyebrow)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.contact.title)}</h2>
        <p>${t(sectionCopy.contact.note)}</p>
      </div>
      <div class="contact-card">
        <div class="contact-row">
          <span>${t(sectionCopy.contact.phone)}</span>
          <a href="tel:${profile.contact.phone}">${profile.contact.phone}</a>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.fax)}</span>
          <strong>${profile.contact.fax}</strong>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.email)}</span>
          <a href="mailto:${profile.contact.email}">${profile.contact.email}</a>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.office)}</span>
          <strong>${t(profile.office)}</strong>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.officialKo)}</span>
          <a href="${profile.contact.officialProfileKo}" target="_blank" rel="noreferrer">Kim &amp; Chang IP / KO</a>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.officialEn)}</span>
          <a href="${profile.contact.officialProfileEn}" target="_blank" rel="noreferrer">Kim &amp; Chang IP / EN</a>
        </div>
      </div>
    </section>
  `;
}

function renderFooter() {
  elements.footerNote.textContent = t(profileData.meta.footerNote);
  elements.footerSourceLabel.textContent = `${t(profileData.meta.footerSourceLabel)} `;
  elements.footerSourceLink.textContent = t(profileData.meta.sourceLinkLabel);
  elements.footerSourceLink.href =
    state.lang === "ko"
      ? profileData.profile.contact.officialProfileKo
      : profileData.profile.contact.officialProfileEn;
}

function renderNavigation() {
  elements.navLinks.forEach((link) => {
    const key = link.getAttribute("data-nav-key");
    link.textContent = t(profileData.navigation[key]);
  });
}

function renderMetadata() {
  const title = t(profileData.meta.siteTitle);
  const description = t(profileData.meta.description);

  document.documentElement.lang = state.lang;
  elements.title.textContent = title;
  elements.description.setAttribute("content", description);
  elements.ogTitle.setAttribute("content", title);
  elements.ogDescription.setAttribute("content", description);
}

function renderPage() {
  renderMetadata();
  renderNavigation();
  renderHero();
  elements.app.innerHTML = [
    renderAbout(),
    renderExpertise(),
    renderTimeline(),
    renderCredentials(),
    renderActivities(),
    renderLinks(),
    renderContact(),
  ].join("");
  renderFooter();
}

elements.langToggle.addEventListener("click", () => {
  state.lang = state.lang === "ko" ? "en" : "ko";
  window.localStorage.setItem(storageKey, state.lang);
  renderPage();
});

renderPage();
