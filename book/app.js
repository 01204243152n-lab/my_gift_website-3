(() => {
  const stage = document.getElementById('bookStage');
  const cover = document.getElementById('cover');
  const current = document.getElementById('currentPage');
  const incoming = document.getElementById('incomingPage');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const counter = document.getElementById('counter');
  const hint = document.getElementById('hint');

  let pages = [];
  let opened = false;
  let index = -1;
  let busy = false;
  let touchX = null;

  function imageExists(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }

  async function findPages() {
    const found = [];
    // Check each numbered page and support both existing JPG and newer PNG files.
    for (let number = 1; number <= 999; number += 1) {
      const base = `page-${String(number).padStart(2, '0')}`;
      let src = `${base}.jpg`;
      if (!(await imageExists(src))) {
        src = `${base}.png`;
        if (!(await imageExists(src))) break;
      }
      found.push(src);
    }
    return found;
  }

  function update() {
    const total = pages.length;
    counter.textContent = total && index >= 0 ? `${index + 1} / ${total}` : '—';
    prev.disabled = !opened || busy || index <= 0;
    next.disabled = !opened || busy || index >= total - 1;
  }

  async function openBook() {
    if (opened || busy) return;
    opened = true;
    busy = true;
    stage.classList.add('open');
    hint.textContent = 'بنجهّز صفحات الكتاب...';
    update();

    pages = await findPages();
    if (!pages.length) {
      hint.textContent = 'مش قادرين نلاقي صور صفحات الكتاب. حاولي تحديث الصفحة.';
      busy = false;
      update();
      return;
    }

    // Open directly on the newest available page.
    index = pages.length - 1;
    current.src = pages[index];
    current.className = 'page active';
    hint.textContent = 'استخدمي السابق والتالي أو اسحبي الصفحة للتقليب';

    window.setTimeout(() => {
      cover.style.visibility = 'hidden';
      busy = false;
      update();
    }, 1080);
  }

  function turn(direction) {
    if (!opened || busy) return;
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;

    busy = true;
    update();
    incoming.src = pages[target];
    incoming.className = 'page active flip-in';
    current.className = 'page active flip-out';

    window.setTimeout(() => {
      current.src = pages[target];
      current.className = 'page active';
      incoming.className = 'page';
      index = target;
      busy = false;
      update();
    }, 740);
  }

  cover.addEventListener('click', openBook);
  cover.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openBook();
    }
  });
  prev.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));

  stage.addEventListener('touchstart', event => {
    touchX = event.changedTouches[0].screenX;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (touchX === null) return;
    const distance = event.changedTouches[0].screenX - touchX;
    if (Math.abs(distance) > 45) turn(distance < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  document.addEventListener('keydown', event => {
    if (!opened) return;
    if (event.key === 'ArrowLeft') turn(1);
    if (event.key === 'ArrowRight') turn(-1);
  });

  update();
})();
