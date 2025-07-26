const overlay = document.getElementById('overlay');
const flicker = document.getElementById('flicker');
const overlay = document.getElementById('overlay');
const flicker = document.getElementById('flicker');
const container = document.getElementById('imageContainer');
const container2 = document.getElementById('imageContainer2');
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

const observer2 = new IntersectionObserver(
  (entries, observer2) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        overlay2.classList.add('visible');
        observer2.unobserve(entry.target); // fade in only once
      }
    });
  },
  {
    threshold: 0.5, // 50% of container visible
  }
);
observer2.observe(container2);

// 🔥 Flicker effect for candle image
function startFlicker() {
  if (flickerInterval) return;
  flicker.style.opacity = 0.8;
  flickerInterval = setInterval(() => {
    const randomOpacity = 0.8 + Math.random() * 0.8;
    flicker.style.opacity = randomOpacity.toFixed(2);
  }, 100);
}
function startFlicker2() {
  if (flickerInterval) return;
  flicker2.style.opacity = 0.8;
  flickerInterval = setInterval(() => {
    const randomOpacity = 0.8 + Math.random() * 0.8;
    flicker2.style.opacity = randomOpacity.toFixed(2);
  }, 100);
}

function stopFlicker() {
  clearInterval(flickerInterval);
  flickerInterval = null;
  flicker.style.opacity = 0;
}
function stopFlicker2() {
  clearInterval(flickerInterval);
  flickerInterval = null;
  flicker2.style.opacity = 0;
}

// Support both hover (desktop) and touch (mobile)
container.addEventListener('mouseenter', startFlicker);
container.addEventListener('mouseleave', stopFlicker);
container.addEventListener('touchstart', startFlicker);
container.addEventListener('touchend', stopFlicker);
container2.addEventListener('mouseenter', startFlicker2);
container2.addEventListener('mouseleave', stopFlicker2);
container2.addEventListener('touchstart', startFlicker2);
container2.addEventListener('touchend', stopFlicker2);
