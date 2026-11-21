/* =========================================================
   Репетитор по математике и физике — скрипты
   1. Мобильное меню
   2. Тень у шапки при прокрутке
   3. Переключатель «Онлайн / Очно» в ценах
   4. FAQ: открыт только один вопрос
   5. Появление блоков при прокрутке
   6. Форма записи на пробное
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


  /* ---------- 2. Тень у шапки ---------- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ---------- 3. Онлайн / Очно ---------- */
  // Цены лежат в HTML в атрибутах data-online и data-offline — меняйте их там.
  const HINTS = {
    online: 'Занятия в Zoom или Telegram с онлайн-доской. Запись урока остаётся у вас.',
    offline: 'Учебный кабинет в 5 минутах от метро. Все материалы — на месте.',
  };
  const switchBtns = document.querySelectorAll('.switch__btn');
  const priceGrid = document.querySelector('.prices__grid');
  const hint = document.getElementById('format-hint');

  switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;            // "online" или "offline"
      switchBtns.forEach(b => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn);
      });

      // Плавно гасим цены, подменяем числа и показываем снова
      priceGrid.classList.add('is-switching');
      setTimeout(() => {
        priceGrid.querySelectorAll('[data-online]').forEach(el => {
          el.textContent = el.dataset[format];
        });
        hint.textContent = HINTS[format];
        priceGrid.classList.remove('is-switching');
      }, 200);
    });
  });


  /* ---------- 4. FAQ: открыт только один вопрос ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach(other => { if (other !== item) other.open = false; });
    });
  });


  /* ---------- 5. Появление блоков при прокрутке ---------- */
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');   // для .bars запускает «рост» полосок
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('is-visible'));
  }


  /* ---------- 6. Форма записи ---------- */
  const form = document.getElementById('signup-form');
  const errorEl = document.getElementById('form-error');
  const successEl = document.getElementById('form-success');
  const phoneInput = form.elements.phone;

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

    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach(field => {
      let valid = field.value.trim() !== '';
      if (field === phoneInput) valid = phoneInput.value.replace(/\D/g, '').length === 11;
      field.classList.toggle('is-invalid', !valid);
      if (!valid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      errorEl.textContent = 'Заполните имя, телефон, класс и предмет.';
      firstInvalid.focus();
      return;
    }
    errorEl.textContent = '';

    const data = Object.fromEntries(new FormData(form));

    /*
      ЗДЕСЬ ПОДКЛЮЧАЕТСЯ РЕАЛЬНАЯ ОТПРАВКА ЗАЯВКИ.

      Вариант 1 — Telegram-бот: заявка приходит репетитору в личные сообщения.
        Токен бота нельзя хранить в этом файле (его увидит любой посетитель).
        Нужен маленький обработчик на хостинге (например, send.php), который вызывает
        https://api.telegram.org/bot<ТОКЕН>/sendMessage?chat_id=<ID_ЧАТА>&text=...
        Отсюда: fetch('send.php', { method: 'POST', body: new FormData(form) });

      Вариант 2 — на почту: тот же send.php с mail() или сервис форм
        (Formspree, Web3Forms и т. п.) — тогда в fetch указывается адрес сервиса.
    */
    console.log('Заявка на пробное (демо, никуда не отправляется):', data);

    form.hidden = true;
    successEl.hidden = false;
  });

  form.addEventListener('input', e => e.target.classList.remove('is-invalid'));
  form.addEventListener('change', e => e.target.classList.remove('is-invalid'));
});
