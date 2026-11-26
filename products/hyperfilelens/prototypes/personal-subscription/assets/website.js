const pricing = document.getElementById('personal-plans');
const session = pricing.querySelector('select');
const cycleInputs = [...pricing.querySelectorAll('input[name="website-plan-cycle"]')];
const cards = [...pricing.querySelectorAll('[data-plan]')].map(card => {
  const price = card.querySelector('.plan-price');
  const billing = card.querySelector('.plan-billing');
  const link = card.querySelector(':scope > a');
  return {
    plan: card.dataset.plan, price, billing, link,
    yearlyPrice: price.innerHTML, yearlyBilling: billing.innerHTML,
    monthlyPrice: card.querySelector('template[data-monthly="price"]').innerHTML,
    monthlyBilling: card.querySelector('template[data-monthly="billing"]').innerHTML,
  };
});

function updatePlans() {
  const cycle = cycleInputs.find(input => input.checked)?.value ?? 'yearly';
  for (const card of cards) {
    card.price.innerHTML = cycle === 'yearly' ? card.yearlyPrice : card.monthlyPrice;
    card.billing.innerHTML = cycle === 'yearly' ? card.yearlyBilling : card.monthlyBilling;
    const [route, query] = card.link.getAttribute('href').split('?');
    const params = new URLSearchParams(query);
    params.set('session', session.value);
    params.set('cycle', cycle);
    card.link.setAttribute('href', `${route}?${params}`);
    card.link.textContent = session.value === 'paid' && card.plan === 'plus' && cycle === 'monthly'
      ? pricing.dataset.currentLabel : card.link.dataset.defaultLabel;
  }
}
pricing.addEventListener('change', updatePlans);
updatePlans();

const mobileToggle = document.querySelector('.mobile-menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const languageToggle = document.querySelector('.lang-switcher-trigger');
const languageMenu = document.querySelector('.lang-switcher-menu');

function setMobile(open) {
  mobileToggle.setAttribute('aria-expanded', String(open));
  mobileNav.classList.toggle('open', open);
  document.body.classList.toggle('hfl-nav-open', open);
}
function setLanguage(open) {
  languageToggle.setAttribute('aria-expanded', String(open));
  languageMenu.style.display = open ? '' : 'none';
}
mobileToggle.addEventListener('click', () => setMobile(mobileToggle.getAttribute('aria-expanded') !== 'true'));
mobileNav.addEventListener('click', event => { if (event.target.closest('a')) setMobile(false); });
languageToggle.addEventListener('click', () => setLanguage(languageToggle.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('click', event => { if (!event.target.closest('.lang-switcher')) setLanguage(false); });
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (languageToggle.getAttribute('aria-expanded') === 'true') languageToggle.focus();
  else if (mobileToggle.getAttribute('aria-expanded') === 'true') mobileToggle.focus();
  setLanguage(false);
  setMobile(false);
});

const copyButton = document.querySelector('.copy-command');
copyButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.querySelector('.terminal-body code').textContent.trim());
    copyButton.classList.add('copied');
    setTimeout(() => copyButton.classList.remove('copied'), 2200);
  } catch {
    const command = document.querySelector('.terminal-body code');
    if (!command) return;
    const range = document.createRange();
    range.selectNodeContents(command);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  }
});
