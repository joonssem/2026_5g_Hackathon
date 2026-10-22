(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const previous = document.getElementById('board-previous');
  const next = document.getElementById('board-next');
  let current = 0;
  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    document.getElementById('board-count').textContent = `${current + 1} / ${slides.length}`;
  }
  previous.onclick = () => show(current - 1);
  next.onclick = () => show(current + 1);
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (['ArrowRight', 'PageDown'].includes(event.key)) { event.preventDefault(); show(current + 1); }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
  });
  const fullscreen = document.getElementById('fullscreen');
  fullscreen.onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else document.getElementById('board-status').textContent = '이 브라우저에서는 전체 화면 버튼을 지원하지 않아요. 브라우저의 전체 화면 기능을 이용해 주세요.';
    } catch { document.getElementById('board-status').textContent = '전체 화면으로 바꾸지 못했어요. 브라우저의 전체 화면 기능을 이용해 주세요.'; }
  };
  document.addEventListener('fullscreenchange', () => { fullscreen.textContent = document.fullscreenElement ? '전체 화면 종료' : '전체 화면'; });
  show(0);
})();
