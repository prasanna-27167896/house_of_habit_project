import Lenis from 'lenis';

export const lenis = new Lenis({
  duration: 1.5,
  lerp: 0.08,
  smoothWheel: true,
  syncTouch: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
