const overlay = document.getElementById('overlay');
const flicker = document.getElementById('flicker');
const container = document.getElementById('imageContainer');
let flickerInterval = null;

// 🔍 Fade in overlay once it enters the screen
const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        overlay.classList.add('visible');
        observer.unobserve(entry.target); // fade in only once
      }
    });
  },
  {
    threshold: 0.5, // 50% of container visible
  }
);
observer.observe(container);


// 🔥 Flicker effect for candle image
function startFlicker() {
  if (flickerInterval) return;
  flicker.style.opacity = 0.8;
  flickerInterval = setInterval(() => {
    const randomOpacity = 0.8 + Math.random() * 0.8;
    flicker.style.opacity = randomOpacity.toFixed(2);
  }, 100);
}
function stopFlicker() {
  clearInterval(flickerInterval);
  flickerInterval = null;
  flicker.style.opacity = 0;
}

// Support both hover (desktop) and touch (mobile)
container.addEventListener('mouseenter', startFlicker);
container.addEventListener('mouseleave', stopFlicker);
container.addEventListener('touchstart', startFlicker);
container.addEventListener('touchend', stopFlicker);
