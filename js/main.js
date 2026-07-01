const header = document.querySelector('.header');
const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
const requestForm = document.querySelector('.request-form');
const requestCard = document.querySelector('.request-form-card') || document.querySelector('.request-card') || requestForm;
const commentField = requestForm ? requestForm.querySelector('textarea[name="comment"]') : null;

function getHeaderOffset() {
  return header ? header.offsetHeight + 12 : 92;
}

function scrollToSection(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - getHeaderOffset();

  window.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth'
  });
}

function scrollToElementMiddle(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const rect = element.getBoundingClientRect();

  const top =
    window.scrollY +
    rect.top -
    (window.innerHeight / 2) +
    (rect.height / 2);

  window.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth'
  });
}

function focusRequestForm() {
  if (!requestForm) return;

  const firstInput = requestForm.querySelector('input, select, textarea');

  setTimeout(() => {
    if (firstInput) firstInput.focus({ preventScroll: true });
  }, 560);
}

function goToForm(prefillText = '') {
  if (prefillText && commentField && !commentField.value.trim()) {
    commentField.value = prefillText;
  }

  scrollToElementMiddle(requestCard || '#contacts');
  focusRequestForm();
}

/* Все кнопки и кликабельные карточки ведут к середине формы */
document.querySelectorAll('.js-scroll-form, .btn-small, .hero-btn, .hero-contact, .car-card, .p-card').forEach(element => {
  element.addEventListener('click', event => {
    event.preventDefault();

    let prefill = '';

    const carCard = element.closest('.car-card');
    if (carCard) {
      const brand = carCard.querySelector('h3')?.textContent?.trim();
      if (brand) prefill = `Интересует ${brand}`;
    }

    const partnerCard = element.closest('.p-card');
    if (partnerCard) {
      const title = partnerCard.querySelector('h3')?.textContent?.trim();
      if (title) prefill = title;
    }

    goToForm(prefill);
  });

  element.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      element.click();
    }
  });
});

/* Меню шапки — обычный скролл к секции, не к форме */
navLinks.forEach(link => {
  link.addEventListener('click', event => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    scrollToSection(target);
  });
});

/* Активная линия в шапке по фактическому текущему блоку */
const sectionIds = navLinks
  .map(link => link.getAttribute('href'))
  .filter(Boolean)
  .map(href => href.replace('#', ''));

const sections = sectionIds
  .map(id => document.getElementById(id))
  .filter(Boolean)
  .sort((a, b) => a.offsetTop - b.offsetTop);

function setActiveNav(id) {
  navLinks.forEach(link => {
    const active = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('is-active', active);
    link.classList.toggle('active', active);
  });
}

function updateActiveNav() {
  if (!sections.length) return;

  const checkLine = window.scrollY + getHeaderOffset() + Math.round(window.innerHeight * 0.38);
  let activeSection = sections[0];

  for (const section of sections) {
    if (section.offsetTop <= checkLine) {
      activeSection = section;
    }
  }

  const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
  if (nearBottom) {
    activeSection = sections[sections.length - 1];
  }

  setActiveNav(activeSection.id);
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', updateActiveNav);
window.addEventListener('load', updateActiveNav);
updateActiveNav();

/* Сортировка каталога убрана — все карточки всегда видны */
document.querySelectorAll('.car-card').forEach(card => {
  card.hidden = false;
  card.classList.remove('is-hidden');
});

/* Отправка формы */
if (requestForm) {
  requestForm.addEventListener('submit', event => {
    event.preventDefault();
    alert('Заявка подготовлена. Подключите отправку формы к вашему CRM или почте.');
  });
}

/* Mobile burger menu */
const burgerToggle = document.querySelector('.burger-toggle');
const siteNav = document.querySelector('#site-nav') || document.querySelector('.header .nav');

if (burgerToggle && siteNav) {
  burgerToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    burgerToggle.classList.toggle('is-active', isOpen);
    burgerToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      burgerToggle.classList.remove('is-active');
      burgerToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      siteNav.classList.remove('is-open');
      burgerToggle.classList.remove('is-active');
      burgerToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  });
}
