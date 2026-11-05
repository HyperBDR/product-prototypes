"use strict";

const LANGUAGE_STORAGE_KEY = "hyperbdr-network-language-v1";
const SUPPORTED_LANGUAGES = ["zh", "en"];
let currentLanguage = "en";
try {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(storedLanguage))
    currentLanguage = storedLanguage;
} catch (error) {
  /* Language switching also works without local storage. */
}

function t(key, parameters = {}) {
  const message =
    UI_MESSAGES[currentLanguage][key] ?? UI_MESSAGES.en[key] ?? UI_MESSAGES.zh[key] ?? key;
  return message.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(parameters, name)
      ? String(parameters[name])
      : match
  );
}
function localizedOptions(options) {
  return options.map(([value, key]) => [value, t(key)]);
}
function selectedHostsSummary(count) {
  const plural = currentLanguage === "en" && Number(count) !== 1 ? "s" : "";
  return t("drConfig.checked") + count + t("drConfig.numberHosts") + plural;
}
function parenthesized(label, value) {
  return (
    label + t("symbol.parentheses_left") + value + t("symbol.parentheses_right")
  );
}
function applyStaticTranslations() {
  if (!document.documentElement) return;
  document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-CN";
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const suffix = element.getAttribute("data-i18n-suffix");
    element.textContent =
      t(element.getAttribute("data-i18n")) + (suffix ? t(suffix) : "");
  });
  for (const attribute of ["aria-label", "title", "placeholder"]) {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
      element.setAttribute(
        attribute,
        t(element.getAttribute(`data-i18n-${attribute}`))
      );
    });
  }
  const count = document.getElementById("selected-host-count");
  const unit = document.getElementById("selected-host-count-unit");
  if (count && unit) {
    unit.textContent =
      t("drConfig.numberHosts") +
      (currentLanguage === "en" && Number(count.textContent) !== 1 ? "s" : "") +
      t("symbol.comma");
  }
  document.querySelectorAll("[data-language]").forEach(option => {
    option.setAttribute(
      "aria-checked",
      String(option.dataset.language === currentLanguage)
    );
  });
}
function closeLanguageMenu() {
  const menu = document.getElementById("language-menu");
  const toggle = document.getElementById("language-toggle");
  if (menu) menu.hidden = true;
  document
    .getElementById("product-header")
    ?.classList?.remove("language-menu-open");
  toggle?.setAttribute?.("aria-expanded", "false");
}
function toggleLanguageMenu() {
  const menu = document.getElementById("language-menu");
  const toggle = document.getElementById("language-toggle");
  if (!menu || !toggle) return;
  const open = menu.hidden;
  menu.hidden = !open;
  document
    .getElementById("product-header")
    ?.classList?.toggle("language-menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  if (open) menu.querySelector(`[data-language="${currentLanguage}"]`)?.focus();
}
function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) return false;
  closeLanguageMenu();
  if (language === currentLanguage) {
    restoreLanguageFocus();
    return true;
  }
  currentLanguage = language;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    /* In-memory fallback. */
  }
  if (typeof onLanguageChange === "function") onLanguageChange();
  else applyStaticTranslations();
  restoreLanguageFocus();
  return true;
}

function restoreLanguageFocus() {
  const dialog = document.querySelector(
    '#network-drawer-layer [role="dialog"]'
  );
  const target =
    dialog?.querySelector(
      'button[data-control]:not(:disabled),input:not(:disabled),button[data-action="close"]'
    ) || document.getElementById("language-toggle");
  target?.focus?.();
}
