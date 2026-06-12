import { profileData } from "../data/profile-data.js";
import { renderMain, t } from "./render.js";

const storageKey = "ywk-profile-lang";
const storedLang = window.localStorage.getItem(storageKey);
const state = {
  lang: storedLang === "en" ? "en" : "ko",
};

const elements = {
  title: document.querySelector("title"),
  description: document.querySelector('meta[name="description"]'),
  ogTitle: document.querySelector('meta[property="og:title"]'),
  ogDescription: document.querySelector('meta[property="og:description"]'),
  langToggle: document.querySelector(".lang-toggle"),
  langCurrent: document.querySelector("[data-lang-current]"),
  langSecondary: document.querySelector("[data-lang-secondary]"),
  main: document.querySelector(".page-grid"),
  footerNote: document.querySelector("#footer-note"),
  footerSourceLabel: document.querySelector("#footer-source-label"),
  footerSourceLink: document.querySelector("#footer-source-link"),
  navLinks: document.querySelectorAll("[data-nav-key]"),
};

function renderToggle() {
  const otherLang = state.lang === "ko" ? "en" : "ko";
  elements.langCurrent.textContent = state.lang.toUpperCase();
  elements.langSecondary.textContent = otherLang.toUpperCase();
  elements.langToggle.setAttribute("aria-pressed", String(state.lang === "en"));
  elements.langToggle.setAttribute(
    "aria-label",
    state.lang === "ko" ? "영어로 전환" : "Switch to Korean"
  );
}

function renderFooter() {
  elements.footerNote.textContent = t(profileData.meta.footerNote, state.lang);
  elements.footerSourceLabel.textContent = `${t(profileData.meta.footerSourceLabel, state.lang)} `;
  elements.footerSourceLink.textContent = t(profileData.meta.sourceLinkLabel, state.lang);
  elements.footerSourceLink.href =
    state.lang === "ko"
      ? profileData.profile.contact.officialProfileKo
      : profileData.profile.contact.officialProfileEn;
}

function renderNavigation() {
  elements.navLinks.forEach((link) => {
    const key = link.getAttribute("data-nav-key");
    link.textContent = t(profileData.navigation[key], state.lang);
  });
}

function renderMetadata() {
  const title = t(profileData.meta.siteTitle, state.lang);
  const description = t(profileData.meta.description, state.lang);

  document.documentElement.lang = state.lang;
  elements.title.textContent = title;
  elements.description.setAttribute("content", description);
  elements.ogTitle.setAttribute("content", title);
  elements.ogDescription.setAttribute("content", description);
}

function renderPage() {
  renderMetadata();
  renderNavigation();
  renderToggle();
  elements.main.innerHTML = renderMain(state.lang);
  renderFooter();
}

elements.langToggle.addEventListener("click", () => {
  state.lang = state.lang === "ko" ? "en" : "ko";
  window.localStorage.setItem(storageKey, state.lang);
  renderPage();
});

renderPage();
