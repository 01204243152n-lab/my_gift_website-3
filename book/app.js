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

  async function loadPages() {
    const response = await fetch('pages.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('تعذر تحميل قائمة الصفحات');
    const data = await response.json();
    if (!Array.isArray(data.pages)) throw new Error('قائمة الصفحات غير صحيحة');

    return data.pages
      .filter(name => typeof name === 'string' && /^page-\d+\.(jpg|jpeg|png|webp)$/i.test(name))
      .sort((a, b) => Number(a.match(/^page-(\d+)/i)[1]) - Number(b.match(/^page-(\d+)/i)[1]));
  }

  function update() {
    const total = pages.length;
    counter.textContent = total && index >= 0 ? `${index + 1} / ${total}` : '—';
    prev.disabled = !opened || busy || index <= 0;
    next.disabled = !opened || busy || index >= total - 1;
  }

  async function openBook() {
    if (opened || busy) return;
    busy = true;
    hint.textContent = 'بنجهّز صفحات الكتاب...';
    update();

    try {
      pages = await loadPages();
      if (!pages.length) throw new Error('قائمة الصفحات فارغة');

      index = pages.length - 1;
      current.onload = () => {
        current.onload = null;
        current.onerror = null;
        opened = true;
        stage.classList.add('open');
        current.className = 'page active';
        hint.textContent = 'استخدمي السابق للرجوع للصفحات الأقدم، أو التالي للتقدم';
        window.setTimeout(() => {
          cover.style.visibility = 'hidden';
          busy = false;
          update();
        }, 1080);
        update();
      };
      current.onerror = () => {
        current.onload = null;
        current.onerror = null;
        busy = false;
        hint.textContent = 'في مشكلة في تحميل صورة أحدث صفحة. حاولي تحديث الصفحة.';
        update();
      };
      current.src = pages[index];
    } catch (error) {
      busy = false;
      hint.textContent = 'مش قادرين نحمّل صفحات الكتاب دلوقتي. حاولي تحديث الصفحة.';
      update();
      console.error(error);
    }
  }

  function turn(direction) {
    if (!opened || busy) return;
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;

    busy = true;
    update();
    incoming.onload = () => {
      incoming.onload = null;
      incoming.onerror = null;
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
    };
    incoming.onerror = () => {
      incoming.onload = null;
      incoming.onerror = null;
      busy = false;
      hint.textContent = 'تعذر تحميل الصفحة التالية.';
      update();
    };
    incoming.src = pages[target];
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