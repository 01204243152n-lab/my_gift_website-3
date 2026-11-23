(() => {
  const total = 20;
  const stage = document.getElementById('bookStage');
  const cover = document.getElementById('cover');
  const current = document.getElementById('currentPage');
  const incoming = document.getElementById('incomingPage');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const counter = document.getElementById('counter');
  const hint = document.getElementById('hint');
  let opened = false, index = 0, busy = false, touchX = null;

  const pageSrc = n => `page-${String(n + 1).padStart(2, '0')}.jpg`;

  function update() {
    counter.textContent = `${index + 1}`;
    prev.disabled = index === 0;
    next.disabled = index === total - 1;
  }

  function openBook() {
    if (opened || busy) return;
    opened = true;
    busy = true;
    stage.classList.add('open');
    current.src = pageSrc(0);
    current.classList.add('active');
    hint.textContent = 'استخدمي السابق والتالي أو اسحبي الصفحة للتقليب';
    window.setTimeout(() => {
      cover.style.visibility = 'hidden';
      busy = false;
    }, 1080);
    update();
  }

  function turn(direction) {
    if (!opened || busy) return;
    const target = index + direction;
    if (target < 0 || target >= total) return;
    busy = true;
    incoming.src = pageSrc(target);
    incoming.className = 'page active flip-in';
    current.className = 'page active flip-out';
    window.setTimeout(() => {
      current.src = pageSrc(target);
      current.className = 'page active';
      incoming.className = 'page';
      index = target;
      update();
      busy = false;
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
