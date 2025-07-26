const overlay = document.getElementById('overlay');
const flicker = document.getElementById('flicker');
const container = document.getElementById('imageContainer');

let flickerInterval = null;

// Scroll-driven opacity for overlay image
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const maxScroll = windowHeight;
  const opacity = Math.max(0, 1 * (scrollTop / maxScroll));
  overlay.style.opacity = opacity.toFixed(2);
});

// Flicker effect logic
function startFlicker() {
  if (flickerInterval) return; // prevent duplicates
   overlay.style.opacity = 1;
  flicker.style.opacity = 0.1;
  flickerInterval = setInterval(() => {
    const randomOpacity = 0.1 + Math.random() * 0.1;
    flicker.style.opacity = randomOpacity.toFixed(2);
  }, 100);
}

function stopFlicker() {
  clearInterval(flickerInterval);
  flickerInterval = null;
  flicker.style.opacity = 0;
}

// Desktop: hover
container.addEventListener('mouseenter', startFlicker);
container.addEventListener('mouseleave', stopFlicker);

// Mobile: tap
container.addEventListener('touchstart', startFlicker);
container.addEventListener('touchend', stopFlicker);

// Optional: stop flicker if user scrolls away
window.addEventListener('scroll', () => {
  if (window.scrollY > window.innerHeight) {
    stopFlicker();
  }
});
