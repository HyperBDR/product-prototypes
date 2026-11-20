'use strict';
const LANGUAGE_STORAGE_KEY='hyperbdr-upgrade-gateway-language-v1';
const SUPPORTED_LANGUAGES=['zh','en'];
let currentLanguage='zh';
try{const stored=localStorage.getItem(LANGUAGE_STORAGE_KEY);if(SUPPORTED_LANGUAGES.includes(stored))currentLanguage=stored;}catch{}
function t(key,params={}){const msg=UI_MESSAGES[currentLanguage]?.[key]??UI_MESSAGES.en?.[key]??UI_MESSAGES.zh?.[key]??key;return String(msg).replace(/\{(\w+)\}/g,(m,n)=>Object.prototype.hasOwnProperty.call(params,n)?String(params[n]):m);}
function language(){return currentLanguage;}
function applyStaticTranslations(){document.documentElement.lang=currentLanguage==='en'?'en':'zh-CN';document.querySelectorAll('[data-i18n]').forEach(el=>{const textNode=[...el.childNodes].find(node=>node.nodeType===Node.TEXT_NODE);if(textNode)textNode.nodeValue=t(el.dataset.i18n);else el.textContent=t(el.dataset.i18n);});['aria-label','title','placeholder'].forEach(attr=>document.querySelectorAll(`[data-i18n-${attr}]`).forEach(el=>{const key='i18n'+attr.replace(/(^|-)([a-z])/g,(_,dash,char)=>char.toUpperCase());el.setAttribute(attr,t(el.dataset[key]));}));document.querySelectorAll('[data-language]').forEach(el=>el.setAttribute('aria-checked',String(el.dataset.language===currentLanguage)));}
function closeLanguageMenu(){const menu=document.getElementById('language-menu'),toggle=document.getElementById('language-toggle');if(menu)menu.hidden=true;document.getElementById('product-header')?.classList.remove('language-menu-open');toggle?.setAttribute('aria-expanded','false');}
function toggleLanguageMenu(){const menu=document.getElementById('language-menu'),toggle=document.getElementById('language-toggle');if(!menu||!toggle)return;const open=menu.hidden;menu.hidden=!open;document.getElementById('product-header')?.classList.toggle('language-menu-open',open);toggle.setAttribute('aria-expanded',String(open));if(open)menu.querySelector(`[data-language="${currentLanguage}"]`)?.focus();}
function setLanguage(next){if(!SUPPORTED_LANGUAGES.includes(next))return false;closeLanguageMenu();if(next===currentLanguage)return true;currentLanguage=next;try{localStorage.setItem(LANGUAGE_STORAGE_KEY,next);}catch{};applyStaticTranslations();window.dispatchEvent(new CustomEvent('languagechange',{detail:{language:next}}));return true;}
window.t=t;window.language=language;window.setLanguage=setLanguage;window.toggleLanguageMenu=toggleLanguageMenu;window.closeLanguageMenu=closeLanguageMenu;window.applyStaticTranslations=applyStaticTranslations;
window.addEventListener('DOMContentLoaded',applyStaticTranslations);
