/* =========================================================
   Кофейня «Медная турка» — скрипты
   1. Мобильное меню (бургер)
   2. Тень у шапки при прокрутке
   3. Вкладки меню
   4. Статус «Открыто / Закрыто»
   5. Появление блоков при прокрутке
   6. Форма брони
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Мобильное меню ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  function toggleMenu(open) {
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  burger.addEventListener('click', () => {
    toggleMenu(!nav.classList.contains('is-open'));
  });

  // Закрываем меню после клика по пункту
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Закрываем по клавише Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(false);
  });


  /* ---------- 2. Тень у шапки ---------- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ---------- 3. Вкладки меню ---------- */
  const tabButtons = document.querySelectorAll('.tabs__btn');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        const isCurrent = b === btn;
        b.classList.toggle('is-active', isCurrent);
        b.setAttribute('aria-selected', isCurrent);
        // Показываем только панель текущей вкладки
        document.getElementById(b.getAttribute('aria-controls')).hidden = !isCurrent;
      });
    });
  });


  /* ---------- 4. Статус «Открыто / Закрыто» ---------- */
  // Часы работы: индекс = день недели (0 — воскресенье). Формат [открытие, закрытие] в часах.
  // Если меняете часы — поменяйте и таблицу в index.html.
  const HOURS = [
    [9, 22],  // Вс
    [8, 21],  // Пн
    [8, 21],  // Вт
    [8, 21],  // Ср
    [8, 21],  // Чт
    [8, 21],  // Пт
    [9, 22],  // Сб
  ];

  const statusEl = document.getElementById('open-status');

  function updateStatus() {
    const now = new Date();
    const [open, close] = HOURS[now.getDay()];
    const hour = now.getHours() + now.getMinutes() / 60;
    const pad = h => String(h).padStart(2, '0') + ':00';

    if (hour >= open && hour < close) {
      statusEl.textContent = `Сейчас открыто · до ${pad(close)}`;
      statusEl.className = 'status is-open';
    } else {
      // Ищем ближайшее открытие: сегодня (если ещё рано) или завтра
      const nextOpen = hour < open ? `сегодня в ${pad(open)}` : `завтра в ${pad(HOURS[(now.getDay() + 1) % 7][0])}`;
      statusEl.textContent = `Сейчас закрыто · откроемся ${nextOpen}`;
      statusEl.className = 'status is-closed';
    }
  }

  updateStatus();
  setInterval(updateStatus, 60 * 1000); // обновляем раз в минуту


  /* ---------- 5. Появление блоков при прокрутке ---------- */
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // анимируем один раз
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach(el => observer.observe(el));
  } else {
    // Старые браузеры: просто показываем всё
    revealItems.forEach(el => el.classList.add('is-visible'));
  }


  /* ---------- 6. Форма брони ---------- */
  const form = document.getElementById('booking-form');
  const errorEl = document.getElementById('form-error');
  const successEl = document.getElementById('form-success');
  const dateInput = document.getElementById('booking-date');
  const phoneInput = form.elements.phone;

  // Нельзя выбрать прошедшую дату
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);

  // Простая маска телефона: +7 (999) 000-11-22
  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    let result = '+7';
    if (digits.length > 1) result += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) result += ')';
    if (digits.length > 4) result += ' ' + digits.slice(4, 7);
    if (digits.length > 7) result += '-' + digits.slice(7, 9);
    if (digits.length > 9) result += '-' + digits.slice(9, 11);
    phoneInput.value = result;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Проверка обязательных полей
    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach(field => {
      let valid = field.value.trim() !== '';
      if (field === phoneInput) valid = phoneInput.value.replace(/\D/g, '').length === 11;
      field.classList.toggle('is-invalid', !valid);
      if (!valid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      errorEl.textContent = 'Пожалуйста, заполните все поля — проверьте телефон, дату и время.';
      firstInvalid.focus();
      return;
    }
    errorEl.textContent = '';

    const data = Object.fromEntries(new FormData(form));

    /*
      ЗДЕСЬ ПОДКЛЮЧАЕТСЯ РЕАЛЬНАЯ ОТПРАВКА ЗАЯВКИ.

      Вариант 1 — Telegram-бот (быстро, заявки приходят в чат владельцу):
        Токен бота НЕЛЬЗЯ хранить в этом файле — его увидит любой посетитель.
        Делается маленький серверный обработчик (например, send.php на хостинге),
        который принимает данные и вызывает
        https://api.telegram.org/bot<ТОКЕН>/sendMessage?chat_id=<ID_ЧАТА>&text=...
        А отсюда отправляем:
          fetch('send.php', { method: 'POST', body: new FormData(form) });

      Вариант 2 — на почту:
        тот же send.php с функцией mail(), либо сервис форм (Formspree, Web3Forms и т. п.)
        — тогда в fetch указывается адрес сервиса.
    */
    console.log('Заявка на бронь (демо, никуда не отправляется):', data);

    // Показываем сообщение об успехе
    form.hidden = true;
    successEl.hidden = false;
  });

  // Убираем красную рамку, когда пользователь исправляет поле
  form.addEventListener('input', e => e.target.classList.remove('is-invalid'));
  form.addEventListener('change', e => e.target.classList.remove('is-invalid'));
});
