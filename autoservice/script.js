/* =========================================================
   Автосервис «Кардан» — скрипты
   1. Мобильное меню
   2. Тень у шапки
   3. Калькулятор стоимости
   4. Статус «Открыто / Закрыто»
   5. Появление блоков при прокрутке
   6. Форма записи
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Мобильное меню ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const header = document.getElementById('header');

  function toggleMenu(open) {
    // Меню открывается ровно под шапкой (над шапкой есть полоска, которая уезжает при прокрутке)
    if (open) nav.style.top = header.getBoundingClientRect().bottom + 'px';
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });


  /* ---------- 2. Тень у шапки ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ---------- 3. Калькулятор ---------- */
  // Базовые цены работ — в атрибутах data-price в index.html (для легкового авто).
  // Класс авто — множитель из value радиокнопки: 1 / 1.2 / 1.4.
  const calcForm = document.getElementById('calc-form');
  const sumEl = document.getElementById('calc-sum');
  const countEl = document.getElementById('calc-count');
  const selectedEl = document.getElementById('calc-selected');
  const bookBtn = document.getElementById('calc-book');

  // 12500 → «12 500»
  const formatPrice = n => n.toLocaleString('ru-RU');
  // Округляем до 50 ₽, чтобы цены выглядели аккуратно
  const round50 = n => Math.round(n / 50) * 50;

  // Склонение: 1 работа, 2 работы, 5 работ
  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  let currentWorks = [];   // [{ name, price }] — нужно, чтобы передать в форму записи
  let currentSum = 0;

  // Плавный «бег» цифр от старого значения к новому
  let shownSum = 0;
  function animateSum(target) {
    const start = shownSum;
    const startTime = performance.now();
    const duration = 400;
    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      shownSum = Math.round(start + (target - start) * t);
      sumEl.textContent = formatPrice(shownSum);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function updateCalc() {
    const coef = parseFloat(calcForm.querySelector('input[name="car"]:checked').value);
    const checked = [...calcForm.querySelectorAll('input[name="work"]:checked')];

    // Пересчитываем цену у каждой работы под выбранный класс авто
    calcForm.querySelectorAll('input[name="work"]').forEach(input => {
      input.parentElement.querySelector('b').textContent =
        formatPrice(round50(Number(input.dataset.price) * coef)) + ' ₽';
    });

    currentWorks = checked.map(input => ({
      name: input.value,
      price: round50(Number(input.dataset.price) * coef),
    }));
    currentSum = currentWorks.reduce((sum, w) => sum + w.price, 0);

    animateSum(currentSum);
    countEl.textContent = currentWorks.length
      ? `${currentWorks.length} ${plural(currentWorks.length, 'работа', 'работы', 'работ')}`
      : 'Выберите работы слева';

    selectedEl.innerHTML = currentWorks
      .map(w => `<li><span>${w.name}</span><b>${formatPrice(w.price)} ₽</b></li>`)
      .join('');

    bookBtn.disabled = currentWorks.length === 0;
  }

  calcForm.addEventListener('change', updateCalc);
  updateCalc();

  // «Записаться с этим расчётом» — переносим работы и сумму в форму записи
  const worksField = document.getElementById('booking-works');
  bookBtn.addEventListener('click', () => {
    const carName = calcForm.querySelector('input[name="car"]:checked').nextElementSibling.querySelector('b').textContent;
    worksField.value =
      `${carName}: ` + currentWorks.map(w => w.name.toLowerCase()).join(', ') +
      `. Предварительно ${formatPrice(currentSum)} ₽.`;
    worksField.classList.remove('is-filled');
    void worksField.offsetWidth;            // перезапуск анимации подсветки
    worksField.classList.add('is-filled');
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  });


  /* ---------- 4. Статус «Открыто / Закрыто» ---------- */
  const OPEN_HOUR = 9;    // поменяли часы — поменяйте и текст в index.html
  const CLOSE_HOUR = 21;
  const statusEl = document.getElementById('open-status');

  function updateStatus() {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    if (hour >= OPEN_HOUR && hour < CLOSE_HOUR) {
      statusEl.textContent = `Открыто · до ${CLOSE_HOUR}:00`;
      statusEl.className = 'status is-open';
    } else {
      statusEl.textContent = `Закрыто · откроемся ${hour < OPEN_HOUR ? 'сегодня' : 'завтра'} в ${OPEN_HOUR}:00`;
      statusEl.className = 'status is-closed';
    }
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);


  /* ---------- 5. Появление блоков ---------- */
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
  const phoneInput = form.elements.phone;
  const dateInput = document.getElementById('booking-date');

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

    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach(field => {
      let valid = field.value.trim() !== '';
      if (field === phoneInput) valid = phoneInput.value.replace(/\D/g, '').length === 11;
      field.classList.toggle('is-invalid', !valid);
      if (!valid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      errorEl.textContent = 'Заполните имя, телефон, марку авто и дату.';
      firstInvalid.focus();
      return;
    }
    errorEl.textContent = '';

    const data = Object.fromEntries(new FormData(form));

    /*
      ЗДЕСЬ ПОДКЛЮЧАЕТСЯ РЕАЛЬНАЯ ОТПРАВКА ЗАЯВКИ.

      Вариант 1 — Telegram-бот: заявка приходит мастеру-приёмщику в чат.
        Токен бота нельзя хранить в этом файле (его увидит любой посетитель).
        Нужен маленький обработчик на хостинге (например, send.php), который вызывает
        https://api.telegram.org/bot<ТОКЕН>/sendMessage?chat_id=<ID_ЧАТА>&text=...
        Отсюда: fetch('send.php', { method: 'POST', body: new FormData(form) });

      Вариант 2 — на почту: тот же send.php с mail() или сервис форм
        (Formspree, Web3Forms и т. п.) — тогда в fetch адрес сервиса.
    */
    console.log('Заявка на ремонт (демо, никуда не отправляется):', data);

    form.hidden = true;
    successEl.hidden = false;
  });

  form.addEventListener('input', e => e.target.classList.remove('is-invalid'));
  form.addEventListener('change', e => e.target.classList.remove('is-invalid'));
});
