const nav = document.querySelector('.nav');
const toggle = document.querySelector('.menu-toggle');

if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));

  nav.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('[data-cat]').forEach(item => {
      item.style.display = (filter === 'all' || item.dataset.cat === filter) ? 'block' : 'none';
    });
  });
});

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<button aria-label="' + (window.PROTOON_I18N ? window.PROTOON_I18N.t('Закрыть') : 'Закрыть') + '">×</button><img alt="">';
document.body.appendChild(lightbox);

const lbImg = lightbox.querySelector('img');
const closeLightbox = () => lightbox.classList.remove('open');

lightbox.querySelector('button').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeLightbox();
});

document.querySelectorAll('.gallery-item img,.photo-card img,.photo-masonry__item img,.photo-pair__item img,.contact-photo img').forEach(img => {
  img.addEventListener('click', () => {
    lbImg.src = img.src;
    lbImg.alt = img.alt || (window.PROTOON_I18N ? window.PROTOON_I18N.t('Фото работы Protoon') : 'Фото работы Protoon');
    lightbox.classList.add('open');
  });
});

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    alert(window.PROTOON_I18N ? window.PROTOON_I18N.t('HTML-превью: отправка формы будет подключена на WordPress.') : 'HTML-превью: отправка формы будет подключена на WordPress.');
  });
});
