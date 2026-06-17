/* Protoon Admin Panel: visual static-site editor */
(function(){
  'use strict';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const i18n = window.PROTOON_I18N;
  const site = window.PROTOON_SITE;
  const status = $('#adminStatus');
  const pages = ['index.html','auto.html','architecture.html','portfolio.html','contacts.html'];
  const pageLabels = {'index.html':'Главная','auto.html':'Авто','architecture.html':'Окна','portfolio.html':'Портфолио','contacts.html':'Контакты'};
  const roleLabels = {hero:'Hero', photo:'Фото', logo:'Логотип'};
  const storageKeys = ['protoonI18nOverrides','protoonSiteSettings','protoonTheme','protoonImageOverrides','protoonMediaLibrary','protoonLang'];

  function read(key, fallback){ return i18n.readJson(key, fallback); }
  function write(key, value){ i18n.writeJson(key, value); }
  function escapeAttr(v){ return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function uid(){ return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function msg(text){ if(!status) return; status.textContent = text; clearTimeout(msg.timer); msg.timer = setTimeout(()=>status.textContent='', 4500); }
  function media(){ return read('protoonMediaLibrary', []); }
  function imageOverrides(){ return read('protoonImageOverrides', {}); }
  function currentImage(img){ const o=imageOverrides()[img.id] || imageOverrides()[img.src] || {}; return {src:o.src || img.src, alt:o.alt || img.alt || '', title:o.title || ''}; }
  function uniqueImages(){ const seen = new Set(); return site.imageList.filter(img => { const key=img.id || img.src; if(seen.has(key)) return false; seen.add(key); return true; }); }
  function mediaOptions(){
    const existing = uniqueImages().map(img => `<option value="${escapeAttr(img.src)}">${escapeAttr((img.pageLabel||img.page) + ' · ' + (roleLabels[img.role]||img.role) + ' · ' + img.src.split('/').pop())}</option>`).join('');
    const custom = media().map(m => `<option value="${escapeAttr(m.src)}">★ ${escapeAttr(m.name || 'uploaded image')}</option>`).join('');
    return `<option value="">Выбрать из медиатеки/сайта</option>${custom}${existing}`;
  }

  function initTabs(){
    function activate(panelId){
      $$('.admin-tab').forEach(b=>b.classList.toggle('active', b.dataset.panel===panelId));
      $$('.admin-panel').forEach(p=>p.classList.toggle('active', p.id===panelId));
      document.body.setAttribute('data-active-panel', panelId);
      if(panelId==='previewPanel') loadPreview();
    }
    $$('.admin-tab').forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.panel)));
    $$('[data-jump]').forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.jump)));
  }

  function renderDashboard(){
    const overrides=imageOverrides();
    const changed=Object.keys(overrides).length;
    const customMedia=media().length;
    const translationChanges=Object.values(read('protoonI18nOverrides', {})).reduce((sum,obj)=>sum + Object.keys(obj||{}).length,0);
    const stats=[
      ['Страниц', pages.length, 'Главная, авто, окна, портфолио, контакты'],
      ['Языков', 3, 'RU / EN / ET'],
      ['Фото на сайте', uniqueImages().length, 'Каждое фото имеет отдельный ID'],
      ['Hero-фото', site.imageList.filter(i=>i.role==='hero').length, 'Затемнение отключено'],
      ['Замен фото', changed, 'Сохранено в браузере'],
      ['Медиатека', customMedia, 'Загруженные фото'],
      ['Правок текста', translationChanges, 'Измененные переводы']
    ];
    $('#dashStats').innerHTML = stats.map(s => `<article class="admin-stat"><span>${s[0]}</span><strong>${s[1]}</strong><em>${s[2]}</em></article>`).join('');
    const heroes=site.imageList.filter(i=>i.role==='hero');
    $('#heroQuickList').innerHTML = heroes.map(img => {
      const c=currentImage(img);
      return `<div class="hero-mini"><img src="${escapeAttr(c.src)}" alt=""><div><strong>${escapeAttr(img.pageLabel||img.page)}</strong><span>${escapeAttr(c.alt || img.src)}</span></div></div>`;
    }).join('');
    const timeline = $('#miniTimeline');
    if (timeline) {
      timeline.innerHTML = [
        ['Hero', 'Затемнение отключено, фото показываются чисто.'],
        ['Mobile', 'Переключатель языка закреплен в шапке.'],
        ['Admin', 'Фото, тексты, тема и экспорт доступны из одного интерфейса.']
      ].map(row => `<div><strong>${row[0]}</strong><span>${row[1]}</span></div>`).join('');
    }
  }

  function renderTranslations(){
    const base = i18n.base;
    const overrides = read('protoonI18nOverrides', {});
    const keys = Object.keys(base.ru).filter(k => k && !/^\d+$/.test(k));
    const box = $('#translationList');
    box.innerHTML = '';
    keys.forEach((key, idx) => {
      const item = document.createElement('article');
      item.className = 'translation-item translation-item-pro';
      item.dataset.search = (key + ' ' + (base.ru[key]||'') + ' ' + (base.en[key]||'') + ' ' + (base.et[key]||'')).toLowerCase();
      item.innerHTML = `
        <div class="translation-item__head">
          <div><div class="translation-item__key"></div><div class="translation-item__meta">Текстовый ID: ${idx + 1}</div></div>
          <button class="btn btn-dark" type="button" data-copy-source>Сбросить строку</button>
        </div>
        <div class="admin-grid translation-grid">
          <div class="admin-field" data-lang-box="ru"><label>Русский</label><textarea data-lang="ru"></textarea></div>
          <div class="admin-field" data-lang-box="en"><label>English</label><textarea data-lang="en"></textarea></div>
          <div class="admin-field" data-lang-box="et"><label>Eesti</label><textarea data-lang="et"></textarea></div>
        </div>`;
      $('.translation-item__key', item).textContent = key;
      ['ru','en','et'].forEach(lang => {
        const ta = $(`textarea[data-lang="${lang}"]`, item);
        ta.dataset.key = key;
        ta.value = (overrides[lang] && overrides[lang][key]) || base[lang][key] || key;
      });
      $('[data-copy-source]', item).addEventListener('click', () => {
        ['ru','en','et'].forEach(lang => {
          const ta = $(`textarea[data-lang="${lang}"]`, item);
          ta.value = base[lang][key] || key;
        });
      });
      box.appendChild(item);
    });
    filterTranslations();
  }

  function saveTranslations(){
    const overrides = {ru:{}, en:{}, et:{}};
    $$('#translationList textarea').forEach(ta => {
      const lang = ta.dataset.lang;
      const key = ta.dataset.key;
      const baseVal = i18n.base[lang][key] || key;
      const val = ta.value.trim();
      if (val && val !== baseVal) overrides[lang][key] = val;
    });
    write('protoonI18nOverrides', overrides);
    renderDashboard();
    msg('Тексты сохранены. Обновите предпросмотр или сайт.');
  }

  function filterTranslations(){
    const q = ($('#translationSearch')?.value || '').trim().toLowerCase();
    const lang = $('#translationLangFilter')?.value || 'all';
    $$('.translation-item').forEach(item => {
      const visible = !q || item.dataset.search.includes(q);
      item.style.display = visible ? '' : 'none';
      $$('[data-lang-box]', item).forEach(box => box.style.display = (lang==='all' || box.dataset.langBox===lang) ? '' : 'none');
    });
  }

  function initTranslationTools(){
    $('#translationSearch').addEventListener('input', filterTranslations);
    $('#translationLangFilter').addEventListener('change', filterTranslations);
    $('#saveTranslations').addEventListener('click', saveTranslations);
    $('#resetTranslations').addEventListener('click', () => {
      if (!confirm('Сбросить все правки переводов?')) return;
      localStorage.removeItem('protoonI18nOverrides');
      renderTranslations(); renderDashboard();
      msg('Переводы сброшены до встроенных значений.');
    });
  }

  function renderSettings(){
    const s = Object.assign({}, site.defaultSettings, read('protoonSiteSettings', {}));
    Object.keys(s).forEach(k => { const el = $(`[name="${k}"]`); if(el) el.value = s[k]; });
    const theme = Object.assign({'--red':'#b91c24','--red-dark':'#7f1218','--black':'#0b0b0c','--dark':'#111113','--paper':'#f5f1ea','--paper-2':'#ebe4d8','--radius':'22px','--max':'1180px'}, read('protoonTheme', {}));
    Object.keys(theme).forEach(k => { const el = $(`[name="theme:${k}"]`); if(el) el.value = theme[k]; });
    updateThemePreview();
  }

  function updateThemePreview(){
    const red=$('[name="theme:--red"]')?.value || '#b91c24';
    const dark=$('[name="theme:--black"]')?.value || '#0b0b0c';
    const card=$('#themePreview');
    if(card) card.style.background = `radial-gradient(circle at 80% 20%, ${red}55, transparent 34%), linear-gradient(135deg, ${dark}, #1b1b20)`;
  }

  function initSettings(){
    $('#saveSettings').addEventListener('click', () => {
      const s = {};
      $$('#settingsPanel [name]').forEach(input => { if(!input.name.startsWith('theme:')) s[input.name] = input.value.trim(); });
      write('protoonSiteSettings', s);
      msg('Контакты и ссылки сохранены.');
    });
    $('#saveTheme').addEventListener('click', () => {
      const theme = {};
      $$('#settingsPanel [name^="theme:"]').forEach(input => { theme[input.name.replace('theme:','')] = input.value.trim(); });
      write('protoonTheme', theme);
      site.applyTheme(); updateThemePreview();
      msg('Визуальная тема сохранена.');
    });
    $$('#settingsPanel [name^="theme:"]').forEach(input => input.addEventListener('input', updateThemePreview));
    $('#resetTheme').addEventListener('click', () => {
      localStorage.removeItem('protoonTheme');
      renderSettings(); site.applyTheme();
      msg('Тема сброшена.');
    });
  }

  function makeImageCard(img, mode){
    const c=currentImage(img);
    const card=document.createElement('article');
    card.className = mode==='hero' ? 'hero-image-card' : 'image-card image-card-pro';
    card.dataset.imageId = img.id;
    card.dataset.page = img.page;
    card.dataset.role = img.role;
    card.dataset.search = `${img.id} ${img.pageLabel||img.page} ${img.src} ${img.alt}`.toLowerCase();
    card.innerHTML = `
      <div class="image-card-preview"><img src="${escapeAttr(c.src)}" alt=""><span>${escapeAttr(roleLabels[img.role]||img.role)}</span></div>
      <div class="image-card__body">
        <div class="image-card-title"><strong>${escapeAttr(img.pageLabel||img.page)}</strong><small>${escapeAttr(img.id)}</small></div>
        <div class="admin-field"><label>Оригинал</label><input value="${escapeAttr(img.src)}" readonly></div>
        <div class="admin-field"><label>Новый путь / URL / Data URL</label><input data-img-src value="${escapeAttr((imageOverrides()[img.id]||{}).src || '')}" placeholder="assets/images/photo.webp или https://..."></div>
        <div class="admin-field"><label>Быстрый выбор фото</label><select data-media-select>${mediaOptions()}</select></div>
        <div class="admin-field"><label>Alt / описание</label><input data-img-alt value="${escapeAttr(c.alt)}"></div>
        <div class="image-card-actions">
          <label class="btn btn-dark file-btn">Загрузить<input type="file" accept="image/*" data-local-upload></label>
          <button class="btn btn-dark" type="button" data-img-apply>Применить</button>
          <button class="btn btn-dark" type="button" data-img-reset>Сбросить</button>
        </div>
      </div>`;
    const preview=$('.image-card-preview img', card);
    const srcInput=$('[data-img-src]', card);
    const altInput=$('[data-img-alt]', card);
    $('[data-media-select]', card).addEventListener('change', e => { if(e.target.value){ srcInput.value=e.target.value; preview.src=e.target.value; }});
    srcInput.addEventListener('input', () => { if(srcInput.value.trim()) preview.src=srcInput.value.trim(); else preview.src=img.src; });
    $('[data-local-upload]', card).addEventListener('change', e => { if(e.target.files[0]) addFileToMedia(e.target.files[0], dataUrl => { srcInput.value=dataUrl; preview.src=dataUrl; renderMediaLibrary(); renderDashboard(); }); });
    $('[data-img-apply]', card).addEventListener('click', () => { saveSingleImage(card); msg('Фото применено к карточке.'); });
    $('[data-img-reset]', card).addEventListener('click', () => {
      srcInput.value=''; altInput.value=img.alt||''; preview.src=img.src; saveSingleImage(card, true);
      msg('Фото сброшено для ' + img.id);
    });
    return card;
  }

  function saveSingleImage(card, remove){
    const out=imageOverrides();
    if(remove){ delete out[card.dataset.imageId]; }
    else {
      const src=$('[data-img-src]', card).value.trim();
      const alt=$('[data-img-alt]', card).value.trim();
      if(src || alt) out[card.dataset.imageId] = {src, alt};
      else delete out[card.dataset.imageId];
    }
    write('protoonImageOverrides', out);
    renderDashboard();
  }

  function renderHeroImages(){
    const box=$('#heroImageList'); box.innerHTML='';
    site.imageList.filter(img=>img.role==='hero').forEach(img => box.appendChild(makeImageCard(img, 'hero')));
  }

  function renderImages(){
    const box = $('#imageList'); box.innerHTML = '';
    uniqueImages().forEach(img => box.appendChild(makeImageCard(img, 'all')));
    filterImages();
  }

  function saveAllImageCards(containerSelector){
    $$(containerSelector + ' [data-image-id]').forEach(card => saveSingleImage(card));
    renderDashboard();
    msg('Изображения сохранены.');
  }

  function filterImages(){
    const q=($('#imageSearch')?.value||'').trim().toLowerCase();
    const role=$('#imageRoleFilter')?.value||'all';
    const page=$('#imagePageFilter')?.value||'all';
    $$('#imageList .image-card').forEach(card => {
      const ok=(!q || card.dataset.search.includes(q)) && (role==='all' || card.dataset.role===role) && (page==='all' || card.dataset.page===page);
      card.style.display=ok?'':'none';
    });
  }

  function initImages(){
    const pageFilter=$('#imagePageFilter');
    pageFilter.innerHTML='<option value="all">Все страницы</option>' + pages.map(p=>`<option value="${p}">${pageLabels[p]}</option>`).join('');
    $('#imageSearch').addEventListener('input', filterImages);
    $('#imageRoleFilter').addEventListener('change', filterImages);
    $('#imagePageFilter').addEventListener('change', filterImages);
    $('#saveImages').addEventListener('click', () => saveAllImageCards('#imageList'));
    $('#saveHeroImages').addEventListener('click', () => saveAllImageCards('#heroImageList'));
    $('#resetImages').addEventListener('click', () => {
      if(!confirm('Сбросить все замены изображений?')) return;
      localStorage.removeItem('protoonImageOverrides');
      renderImages(); renderHeroImages(); renderDashboard();
      msg('Замены изображений сброшены.');
    });
  }

  function addFileToMedia(file, callback){
    const reader=new FileReader();
    reader.onload=()=>{
      const list=media();
      const item={id:uid(), name:file.name, type:file.type, size:file.size, src:reader.result, createdAt:new Date().toISOString()};
      list.unshift(item);
      write('protoonMediaLibrary', list.slice(0, 50));
      callback && callback(item.src, item);
    };
    reader.readAsDataURL(file);
  }

  function renderMediaLibrary(){
    const q=($('#mediaSearch')?.value||'').trim().toLowerCase();
    const list=media().filter(m => !q || (m.name||'').toLowerCase().includes(q));
    const box=$('#mediaLibrary');
    if(!list.length){ box.innerHTML='<div class="empty-media">Медиатека пока пустая. Загрузите фото слева.</div>'; return; }
    box.innerHTML=list.map(m => `<article class="media-tile" data-media-id="${escapeAttr(m.id)}"><img src="${escapeAttr(m.src)}" alt=""><strong>${escapeAttr(m.name)}</strong><span>${Math.round((m.size||0)/1024)} KB</span><button class="btn btn-dark" type="button" data-copy-media>Скопировать</button><button class="btn btn-dark danger" type="button" data-delete-media>Удалить</button></article>`).join('');
    $$('[data-copy-media]', box).forEach(btn => btn.addEventListener('click', e => {
      const id=e.target.closest('[data-media-id]').dataset.mediaId;
      const item=media().find(m=>m.id===id);
      if(item && navigator.clipboard) navigator.clipboard.writeText(item.src);
      msg('Data URL фото скопирован.');
    }));
    $$('[data-delete-media]', box).forEach(btn => btn.addEventListener('click', e => {
      const id=e.target.closest('[data-media-id]').dataset.mediaId;
      write('protoonMediaLibrary', media().filter(m=>m.id!==id));
      renderMediaLibrary(); renderImages(); renderHeroImages(); renderDashboard();
    }));
  }

  function addFilesToLibrary(files){
    const list = Array.from(files || []).filter(file => file && file.type && file.type.startsWith('image/'));
    if(!list.length){ msg('Загрузите файлы изображений: JPG, PNG или WebP.'); return; }
    let left = list.length;
    list.forEach(file => addFileToMedia(file, () => {
      left -= 1;
      if(left === 0){ renderMediaLibrary(); renderImages(); renderHeroImages(); renderDashboard(); msg('Фото добавлены в медиатеку.'); }
    }));
  }

  function initMedia(){
    $('#mediaUpload').addEventListener('change', e => {
      addFilesToLibrary(e.target.files);
      e.target.value='';
    });
    const drop = $('#mediaDropZone');
    if(drop){
      ['dragenter','dragover'].forEach(type => drop.addEventListener(type, e => { e.preventDefault(); drop.classList.add('dragover'); }));
      ['dragleave','drop'].forEach(type => drop.addEventListener(type, e => { e.preventDefault(); drop.classList.remove('dragover'); }));
      drop.addEventListener('drop', e => addFilesToLibrary(e.dataTransfer.files));
    }
    $('#mediaSearch').addEventListener('input', renderMediaLibrary);
    $('#clearMedia').addEventListener('click', () => {
      if(!confirm('Очистить загруженную медиатеку в этом браузере?')) return;
      localStorage.removeItem('protoonMediaLibrary');
      renderMediaLibrary(); renderImages(); renderHeroImages(); renderDashboard();
      msg('Медиатека очищена.');
    });
  }

  function initPreview(){
    const select = $('#previewPage');
    select.innerHTML='';
    pages.forEach(p => { const opt = document.createElement('option'); opt.value=p; opt.textContent=pageLabels[p]; select.appendChild(opt); });
    $('#loadPreview').addEventListener('click', loadPreview);
    $('#openPreview').addEventListener('click', () => window.open(`${select.value}?lang=${$('#previewLang').value}`, '_blank'));
    $$('[data-preview-size]').forEach(btn => btn.addEventListener('click', () => {
      $$('[data-preview-size]').forEach(b => b.classList.toggle('active', b === btn));
      const device = $('#previewDevice');
      if(device){ device.className = 'preview-device preview-device-' + btn.dataset.previewSize; }
      msg('Предпросмотр: ' + btn.textContent.trim());
    }));
    loadPreview();
  }
  function loadPreview(){
    const frame=$('#previewFrame'); if(!frame) return;
    frame.src = `${$('#previewPage').value}?lang=${$('#previewLang').value}&adminPreview=${Date.now()}`;
  }

  function saveAll(){ saveTranslations(); saveAllImageCards('#imageList'); $('#saveSettings').click(); $('#saveTheme').click(); msg('Все доступные изменения сохранены.'); }

  function exportData(){
    const data = { exportedAt: new Date().toISOString(), protoonLang: localStorage.getItem('protoonLang') || 'ru' };
    storageKeys.forEach(k => { if(k !== 'protoonLang') data[k] = read(k, k==='protoonMediaLibrary' ? [] : {}); });
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'protoon-admin-content.json';
    a.click();
    URL.revokeObjectURL(a.href);
    msg('Экспорт JSON подготовлен.');
  }

  function importData(file){
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        storageKeys.forEach(k => {
          if(k === 'protoonLang'){ if(data[k]) localStorage.setItem(k, data[k]); }
          else if(data[k] !== undefined) write(k, data[k]);
        });
        renderTranslations(); renderSettings(); renderMediaLibrary(); renderImages(); renderHeroImages(); renderDashboard();
        msg('Импорт выполнен.');
      } catch(e) { alert('Не удалось импортировать JSON: ' + e.message); }
    };
    reader.readAsText(file);
  }

  function initExportImport(){
    $('#exportData').addEventListener('click', exportData);
    $('#importDataBtn').addEventListener('click', () => $('#importData').click());
    $('#importData').addEventListener('change', e => { if(e.target.files[0]) importData(e.target.files[0]); });
    $('#saveAllFast').addEventListener('click', saveAll);
    $('#clearAll').addEventListener('click', () => {
      if(!confirm('Полностью очистить все данные админ-панели в этом браузере?')) return;
      storageKeys.forEach(k=>localStorage.removeItem(k));
      location.reload();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderDashboard();
    renderTranslations(); initTranslationTools();
    renderSettings(); initSettings();
    renderMediaLibrary(); initMedia();
    renderHeroImages(); renderImages(); initImages();
    initPreview(); initExportImport();
  });
})();
