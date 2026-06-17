Protoon HTML preview — refined v17

Открыть локально:
1. Распакуйте архив.
2. Откройте index.html в браузере.

Страницы:
- index.html — главная
- auto.html — автомобильная тонировка
- architecture.html — оконные и архитектурные пленки
- portfolio.html — портфолио
- contacts.html — контакты

Что изменено в этой версии:
- Убран неоновый/пересвеченный вайб.
- Палитра стала спокойнее: premium dark + глубокий красный акцент.
- Исправлены карточки с изображениями на главной.
- Добавлены toned-версии фото для более мягкого визуала.
- Улучшены кнопки, формы, фокус-состояния и мобильное меню.
- Lightbox теперь закрывается по Escape.

Примечание:
Форма в HTML-превью не отправляется. При переносе на WordPress нужно подключить обработчик формы.


=== v18: Multilingual site + graphical admin panel ===

Добавлено:
1. Переключение языка на всех страницах: RU / EN / ET.
2. Перевод всего сайта: меню, заголовки, тексты, формы, кнопки, SEO title/description, alt-тексты изображений.
3. Новая графическая админ-панель: admin.html.
4. В админ-панели можно редактировать:
   - все переводы RU / EN / ET;
   - телефон, e-mail, WhatsApp-ссылку и адрес;
   - основные цвета и визуальную тему;
   - изображения и alt-описания;
   - предпросмотр страниц в разных языках.
5. Добавлен экспорт/импорт JSON для переноса настроек между браузерами/компьютерами.

Как открыть:
- Сайт: index.html
- Админ-панель: admin.html

Важно:
Это статический HTML-сайт. Админ-панель сохраняет изменения в localStorage браузера и позволяет экспортировать JSON.
Для постоянной серверной админки с логином, базой данных и сохранением на хостинге потребуется подключать backend, WordPress или CMS.


=== v22 обновление ===
- Админ-панель заменена на Protoon Admin Panel: пульт, hero-фото, медиатека, точечный редактор фото, переводы, контакты/тема, предпросмотр.
- У всех изображений сайта добавлены стабильные data-image-id, поэтому одинаковый исходный файл можно менять отдельно на разных страницах.
- Убрано затемнение hero-фотографий: отключены overlay .hero__shade и filter brightness на .hero__media.
- Медиатека работает в браузере через localStorage/Data URL; для постоянной публикации файлов на хостинге добавляйте финальные фото в assets/images.


V20 changes:
- Removed process-pro__label pill from architecture process block.
- Rebuilt process-pro__visual-copy as a shaped glass card.
- Fixed mobile language switcher visibility.
- Reworked admin.html into a sidebar-based Admin Panel layout with stronger photo/media controls.
- Added drag-and-drop media upload and desktop/tablet/mobile preview switcher.
- Fully disabled hero dark overlays and brightness filters.
