import { profileData } from "../data/profile-data.js";

export function t(value, lang) {
  if (typeof value === "string") {
    return value;
  }
  return value?.[lang] ?? value?.en ?? "";
}

function metaRow(term, value) {
  return `
    <div class="meta-row">
      <dt>${term}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

function renderHero(lang) {
  const { profile, meta, heroStats, sectionCopy } = profileData;
  const officialProfile =
    lang === "ko"
      ? profile.contact.officialProfileKo
      : profile.contact.officialProfileEn;

  return `
    <aside class="hero-panel">
      <div class="hero-orb" aria-hidden="true"></div>
      <p class="section-eyebrow">${t(meta.heroKicker, lang)}</p>
      <h1 class="hero-name">${t(profile.name, lang)}</h1>
      <p class="hero-role">${t(profile.role, lang)}</p>
      <p class="hero-summary">${t(profile.summary, lang)}</p>

      <div class="hero-actions">
        <a class="button button--solid" href="${officialProfile}" target="_blank" rel="noreferrer">${
          lang === "ko" ? "공식 프로필" : "Official profile"
        }</a>
        <a class="button button--ghost" href="mailto:${profile.contact.email}">${
          lang === "ko" ? "이메일" : "Email"
        }</a>
      </div>

      <dl class="hero-meta">
        ${metaRow(
          t(sectionCopy.contact.phone, lang),
          `<a href="tel:${profile.contact.phone}">${profile.contact.phone}</a>`
        )}
        ${metaRow(t(sectionCopy.contact.fax, lang), profile.contact.fax)}
        ${metaRow(
          t(sectionCopy.contact.email, lang),
          `<a href="mailto:${profile.contact.email}">${profile.contact.email}</a>`
        )}
        ${metaRow(t(sectionCopy.contact.office, lang), t(profile.office, lang))}
      </dl>

      <div class="hero-stats">
        ${heroStats
          .map(
            (stat) => `
              <article class="stat-card">
                <strong>${stat.value}</strong>
                <span>${t(stat.label, lang)}</span>
              </article>
            `
          )
          .join("")}
      </div>
    </aside>
  `;
}

function renderAbout(lang) {
  const { sectionCopy, profile } = profileData;

  return `
    <section class="content-section" id="about">
      <p class="section-eyebrow">${t(sectionCopy.about.eyebrow, lang)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.about.title, lang)}</h2>
      </div>
      <div class="prose">
        ${profile.intro.map((paragraph) => `<p>${t(paragraph, lang)}</p>`).join("")}
      </div>
    </section>
  `;
}

function renderExpertise(lang) {
  const { sectionCopy, expertise } = profileData;

  return `
    <section class="content-section" id="expertise">
      <p class="section-eyebrow">${t(sectionCopy.expertise.eyebrow, lang)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.expertise.title, lang)}</h2>
        <p>${t(sectionCopy.expertise.intro, lang)}</p>
      </div>
      <div class="tag-grid">
        ${expertise.map((item) => `<span class="tag">${t(item, lang)}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderTimeline(lang) {
  const { sectionCopy, experience } = profileData;

  return `
    <section class="content-section" id="timeline">
      <p class="section-eyebrow">${t(sectionCopy.timeline.eyebrow, lang)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.timeline.title, lang)}</h2>
      </div>
      <div class="timeline">
        ${experience
          .map(
            (item) => `
              <article class="timeline-item">
                <div class="timeline-item__period">${item.period}</div>
                <div class="timeline-item__body">
                  <h3>${t(item.title, lang)}</h3>
                  <p class="timeline-item__org">${t(item.org, lang)}</p>
                  <p>${t(item.note, lang)}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCredentialsList(items, lang) {
  return items
    .map(
      (item) => `
        <li>
          <span>${item.year}</span>
          <strong>${t(item.item, lang)}</strong>
        </li>
      `
    )
    .join("");
}

function renderCredentials(lang) {
  const { sectionCopy, credentials } = profileData;

  return `
    <section class="content-section" id="credentials">
      <p class="section-eyebrow">${t(sectionCopy.credentials.eyebrow, lang)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.credentials.title, lang)}</h2>
      </div>
      <div class="credential-grid">
        <article class="credential-card">
          <h3>${t(sectionCopy.credentials.education, lang)}</h3>
          <ul class="fact-list">${renderCredentialsList(credentials.education, lang)}</ul>
        </article>
        <article class="credential-card">
          <h3>${t(sectionCopy.credentials.qualifications, lang)}</h3>
          <ul class="fact-list">${renderCredentialsList(credentials.qualifications, lang)}</ul>
        </article>
        <article class="credential-card credential-card--wide">
          <h3>${t(sectionCopy.credentials.languages, lang)}</h3>
          <div class="language-list">
            ${credentials.languages
              .map((language) => `<span class="tag">${t(language, lang)}</span>`)
              .join("")}
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderActivityList(items, lang, detailed = false) {
  return items
    .map(
      (item) => `
        <li>
          <span>${item.year}</span>
          <div>
            <strong>${t(item.item, lang)}</strong>
            ${detailed && item.detail ? `<p>${t(item.detail, lang)}</p>` : ""}
          </div>
        </li>
      `
    )
    .join("");
}

function renderActivities(lang) {
  const { sectionCopy, activities } = profileData;

  return `
    <section class="content-section" id="activities">
      <p class="section-eyebrow">${t(sectionCopy.activities.eyebrow, lang)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.activities.title, lang)}</h2>
      </div>
      <div class="activity-grid">
        <article class="activity-card">
          <h3>${t(sectionCopy.activities.awards, lang)}</h3>
          <ul class="activity-list">${renderActivityList(activities.awards, lang)}</ul>
        </article>
        <article class="activity-card">
          <h3>${t(sectionCopy.activities.publications, lang)}</h3>
          <ul class="activity-list">${renderActivityList(activities.publications, lang, true)}</ul>
        </article>
        <article class="activity-card">
          <h3>${t(sectionCopy.activities.speaking, lang)}</h3>
          <ul class="activity-list">${renderActivityList(activities.speaking, lang)}</ul>
        </article>
      </div>
    </section>
  `;
}

function renderLinks(lang) {
  const { sectionCopy, relatedLinks } = profileData;

  return `
    <section class="content-section" id="links">
      <p class="section-eyebrow">${t(sectionCopy.links.eyebrow, lang)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.links.title, lang)}</h2>
      </div>
      <div class="link-grid">
        ${relatedLinks
          .map(
            (link) => `
              <a class="link-card" href="${link.url}" target="_blank" rel="noreferrer">
                <span class="link-card__source">${link.source}</span>
                <strong>${t(link.title, lang)}</strong>
                <p>${t(link.note, lang)}</p>
              </a>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderContact(lang) {
  const { sectionCopy, profile } = profileData;

  return `
    <section class="content-section" id="contact">
      <p class="section-eyebrow">${t(sectionCopy.contact.eyebrow, lang)}</p>
      <div class="section-header">
        <h2>${t(sectionCopy.contact.title, lang)}</h2>
        <p>${t(sectionCopy.contact.note, lang)}</p>
      </div>
      <div class="contact-card">
        <div class="contact-row">
          <span>${t(sectionCopy.contact.phone, lang)}</span>
          <a href="tel:${profile.contact.phone}">${profile.contact.phone}</a>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.fax, lang)}</span>
          <strong>${profile.contact.fax}</strong>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.email, lang)}</span>
          <a href="mailto:${profile.contact.email}">${profile.contact.email}</a>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.office, lang)}</span>
          <strong>${t(profile.office, lang)}</strong>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.officialKo, lang)}</span>
          <a href="${profile.contact.officialProfileKo}" target="_blank" rel="noreferrer">Kim &amp; Chang IP / KO</a>
        </div>
        <div class="contact-row">
          <span>${t(sectionCopy.contact.officialEn, lang)}</span>
          <a href="${profile.contact.officialProfileEn}" target="_blank" rel="noreferrer">Kim &amp; Chang IP / EN</a>
        </div>
      </div>
    </section>
  `;
}

export function renderMain(lang) {
  return `
    ${renderHero(lang)}
    <div class="content-panel" id="app">
      ${renderAbout(lang)}
      ${renderExpertise(lang)}
      ${renderTimeline(lang)}
      ${renderCredentials(lang)}
      ${renderActivities(lang)}
      ${renderLinks(lang)}
      ${renderContact(lang)}
    </div>
  `;
}
