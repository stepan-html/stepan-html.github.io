/* =========================================================
   Студия йоги «Листва» — скрипты
   1. Мобильное меню
   2. Тень у шапки
   3. Расписание: дни недели + фильтр по направлениям
   4. Кнопки «Записаться» в расписании и абонементах → подставляют занятие в форму
   5. Появление блоков при прокрутке
   6. Форма записи
   ========================================================= */

/* ---------- РАСПИСАНИЕ: меняйте занятия здесь ----------
   day: 0 — понедельник … 6 — воскресенье
   type: одно из «Хатха», «Виньяса», «Для спины», «Медитация» (как в кнопках-фильтрах) */
const SCHEDULE = [
  { day: 0, time: '07:30', dur: 60, name: 'Утренняя хатха',       type: 'Хатха',     teacher: 'Марина' },
  { day: 0, time: '19:00', dur: 75, name: 'Виньяса-флоу',         type: 'Виньяса',   teacher: 'Алексей' },
  { day: 0, time: '20:30', dur: 60, name: 'Йога для спины',       type: 'Для спины', teacher: 'Марина' },
  { day: 1, time: '08:00', dur: 60, name: 'Мягкая хатха',         type: 'Хатха',     teacher: 'Екатерина' },
  { day: 1, time: '19:30', dur: 75, name: 'Виньяса для начинающих', type: 'Виньяса', teacher: 'Алексей' },
  { day: 2, time: '07:30', dur: 60, name: 'Утренняя хатха',       type: 'Хатха',     teacher: 'Марина' },
  { day: 2, time: '18:30', dur: 60, name: 'Йога для спины',       type: 'Для спины', teacher: 'Марина' },
  { day: 2, time: '20:00', dur: 45, name: 'Вечерняя медитация',   type: 'Медитация', teacher: 'Екатерина' },
  { day: 3, time: '08:00', dur: 75, name: 'Виньяса-флоу',         type: 'Виньяса',   teacher: 'Алексей' },
  { day: 3, time: '19:00', dur: 60, name: 'Хатха-йога',           type: 'Хатха',     teacher: 'Екатерина' },
  { day: 4, time: '07:30', dur: 60, name: 'Утренняя хатха',       type: 'Хатха',     teacher: 'Марина' },
  { day: 4, time: '19:00', dur: 75, name: 'Виньяса-флоу',         type: 'Виньяса',   teacher: 'Алексей' },
  { day: 4, time: '20:30', dur: 45, name: 'Дыхание и медитация',  type: 'Медитация', teacher: 'Екатерина' },
  { day: 5, time: '10:00', dur: 90, name: 'Длинная практика',     type: 'Виньяса',   teacher: 'Алексей' },
  { day: 5, time: '12:00', dur: 60, name: 'Йога для спины',       type: 'Для спины', teacher: 'Марина' },
  { day: 6, time: '11:00', dur: 75, name: 'Хатха-йога',           type: 'Хатха',     teacher: 'Екатерина' },
  { day: 6, time: '18:00', dur: 45, name: 'Медитация выходного дня', type: 'Медитация', teacher: 'Екатерина' },
];

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

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


  /* ---------- 3. Расписание ---------- */
  const daysEl = document.getElementById('days');
  const lessonsEl = document.getElementById('lessons');
  const filterBtns = document.querySelectorAll('.filter');

  // Даты текущей недели: от понедельника
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7;          // getDay(): 0 — воскресенье → делаем 0 — понедельник
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayIndex);
  const weekDates = DAY_NAMES.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const dateLabel = d => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

  let currentDay = todayIndex;
  let currentType = 'all';

  // Кнопки дней
  daysEl.innerHTML = weekDates.map((d, i) => `
    <button type="button" class="day${i === currentDay ? ' is-active' : ''}" role="tab"
            aria-selected="${i === currentDay}" data-day="${i}">
      ${i === todayIndex ? 'Сегодня' : DAY_NAMES[i]}<small>${dateLabel(d)}</small>
    </button>`).join('');

  // Время окончания: «19:00» + 75 мин → «20:15»
  function endTime(start, dur) {
    const [h, m] = start.split(':').map(Number);
    const total = h * 60 + m + dur;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  function renderLessons() {
    const list = SCHEDULE
      .filter(l => l.day === currentDay && (currentType === 'all' || l.type === currentType))
      .sort((a, b) => a.time.localeCompare(b.time));

    if (!list.length) {
      lessonsEl.innerHTML = '<li class="lessons__empty">В этот день таких занятий нет — выберите другой день или направление.</li>';
      return;
    }

    lessonsEl.innerHTML = list.map((l, i) => `
      <li class="lesson" style="animation-delay:${i * 60}ms">
        <p class="lesson__time" style="margin:0">${l.time}<small>до ${endTime(l.time, l.dur)}</small></p>
        <div>
          <div class="lesson__name">${l.name}</div>
          <div class="lesson__teacher">${l.teacher} · ${l.dur} мин</div>
        </div>
        <span class="lesson__tag lesson__tag--${l.type.replace(/\s/g, '')}">${l.type}</span>
        <a href="#signup" class="btn btn--ghost lesson__btn"
           data-plan="${l.name}, ${DAY_NAMES[l.day].toLowerCase()} ${dateLabel(weekDates[l.day])}, ${l.time}">Записаться</a>
      </li>`).join('');
  }

  daysEl.addEventListener('click', e => {
    const btn = e.target.closest('.day');
    if (!btn) return;
    currentDay = Number(btn.dataset.day);
    daysEl.querySelectorAll('.day').forEach(b => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-selected', b === btn);
    });
    renderLessons();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentType = btn.dataset.type;
      filterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      renderLessons();
    });
  });

  renderLessons();


  /* ---------- 4. «Записаться» → подставляем занятие в форму ---------- */
  const lessonField = document.getElementById('signup-lesson');
  // Делегирование: кнопки расписания создаются динамически
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-plan]');
    if (!btn) return;
    lessonField.value = btn.dataset.plan;
    lessonField.classList.remove('is-filled');
    void lessonField.offsetWidth;          // перезапуск анимации подсветки
    lessonField.classList.add('is-filled');
  });


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
      errorEl.textContent = 'Укажите имя и телефон — мы перезвоним.';
      firstInvalid.focus();
      return;
    }
    errorEl.textContent = '';

    const data = Object.fromEntries(new FormData(form));

    /*
      ЗДЕСЬ ПОДКЛЮЧАЕТСЯ РЕАЛЬНАЯ ОТПРАВКА ЗАЯВКИ.

      Вариант 1 — Telegram-бот: заявка приходит администратору студии в чат.
        Токен бота нельзя хранить в этом файле (его увидит любой посетитель).
        Нужен маленький обработчик на хостинге (например, send.php), который вызывает
        https://api.telegram.org/bot<ТОКЕН>/sendMessage?chat_id=<ID_ЧАТА>&text=...
        Отсюда: fetch('send.php', { method: 'POST', body: new FormData(form) });

      Вариант 2 — на почту: тот же send.php с mail() или сервис форм
        (Formspree, Web3Forms и т. п.) — тогда в fetch адрес сервиса.
    */
    console.log('Запись в студию (демо, никуда не отправляется):', data);

    form.hidden = true;
    successEl.hidden = false;
  });

  form.addEventListener('input', e => e.target.classList.remove('is-invalid'));
});
