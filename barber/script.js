/* =========================================================
   Барбершоп «Кремень» — скрипты
   1. Мобильное меню
   2. Рамка у шапки при прокрутке
   3. Кнопка «Записаться» у мастера → подставляет мастера в форму
   4. Статус «Открыто / Закрыто»
   5. Появление блоков при прокрутке
   6. Форма записи
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

  burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });


  /* ---------- 2. Рамка у шапки ---------- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ---------- 3. Запись к конкретному мастеру ---------- */
  const masterSelect = document.getElementById('master-select');

  document.querySelectorAll('[data-master]').forEach(btn => {
    btn.addEventListener('click', () => {
      masterSelect.value = btn.dataset.master;   // имя из data-master должно совпадать с <option>
    });
  });


  /* ---------- 4. Статус «Открыто / Закрыто» ---------- */
  // Часы работы: ежедневно с 10 до 22. Поменяли часы — поменяйте и текст в index.html.
  const OPEN_HOUR = 10;
  const CLOSE_HOUR = 22;
  const statusEl = document.getElementById('open-status');

  function updateStatus() {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;

    if (hour >= OPEN_HOUR && hour < CLOSE_HOUR) {
      statusEl.textContent = `Открыто сейчас · до ${CLOSE_HOUR}:00`;
      statusEl.className = 'status is-open';
    } else {
      const when = hour < OPEN_HOUR ? 'сегодня' : 'завтра';
      statusEl.textContent = `Закрыто · откроемся ${when} в ${OPEN_HOUR}:00`;
      statusEl.className = 'status is-closed';
    }
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);


  /* ---------- 5. Появление блоков при прокрутке ---------- */
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('is-visible'));
  }


  /* ---------- 6. Форма записи ---------- */
  const form = document.getElementById('booking-form');
  const errorEl = document.getElementById('form-error');
  const successEl = document.getElementById('form-success');
  const dateInput = document.getElementById('booking-date');
  const phoneInput = form.elements.phone;

  // Нельзя выбрать прошедшую дату
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);

  // Маска телефона: +7 (999) 000-11-22
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

    // Проверяем обязательные поля
    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach(field => {
      let valid = field.value.trim() !== '';
      if (field === phoneInput) valid = phoneInput.value.replace(/\D/g, '').length === 11;
      field.classList.toggle('is-invalid', !valid);
      if (!valid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      errorEl.textContent = 'Заполните имя, телефон, услугу, дату и время.';
      firstInvalid.focus();
      return;
    }
    errorEl.textContent = '';

    const data = Object.fromEntries(new FormData(form));

    /*
      ЗДЕСЬ ПОДКЛЮЧАЕТСЯ РЕАЛЬНАЯ ОТПРАВКА ЗАПИСИ.

      Вариант 1 — Telegram-бот: заявка приходит администратору в чат.
        Токен бота нельзя хранить в этом файле (его увидит любой посетитель).
        Нужен небольшой обработчик на хостинге (например, send.php), который вызывает
        https://api.telegram.org/bot<ТОКЕН>/sendMessage?chat_id=<ID_ЧАТА>&text=...
        Отсюда: fetch('send.php', { method: 'POST', body: new FormData(form) });

      Вариант 2 — на почту: тот же send.php с mail() или сервис форм
        (Formspree, Web3Forms и т. п.) — тогда в fetch адрес сервиса.

      Вариант 3 — интеграция с онлайн-записью (YCLIENTS, DIKIDI и т. п.):
        вместо формы ставится их виджет или кнопка-ссылка.
    */
    console.log('Запись (демо, никуда не отправляется):', data);

    form.hidden = true;
    successEl.hidden = false;
  });

  // Убираем красную рамку при исправлении поля
  form.addEventListener('input', e => e.target.classList.remove('is-invalid'));
  form.addEventListener('change', e => e.target.classList.remove('is-invalid'));
});
