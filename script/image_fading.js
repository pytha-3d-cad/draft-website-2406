const overlay = document.getElementById('overlay');
const flicker = document.getElementById('flicker');
const hover = document.getElementById('hover');
const container = document.getElementById('imageContainer');
let flickerInterval = null;

// Function to map a value to 0–1 range
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

// Scroll-driven opacity based on proximity to viewport center
function updateOpacityOnScroll() {
  const rect = container.getBoundingClientRect();
  const windowCenter = window.innerHeight / 2;
  const imageCenter = rect.top + rect.height / 2;

  // Distance from image center to screen center
  const distance = Math.abs(windowCenter - imageCenter);
  const maxDistance = window.innerHeight / 2; // max range to fully fade out

  // Opacity decreases as distance increases
  const opacity = clamp(1 - distance / maxDistance, 0, 1);
  overlay.style.opacity = opacity.toFixed(2);
}

// Track scroll and resize
window.addEventListener('scroll', updateOpacityOnScroll);
window.addEventListener('resize', updateOpacityOnScroll);
updateOpacityOnScroll(); // initial call

// Flicker logic
function startFlicker() {
  if (flickerInterval) return;
  hover.style.opacity = 1;
  
  const onTransitionEnd = (event) => {
    if (event.propertyName === 'opacity') {
      // Only trigger once
      hover.removeEventListener('transitionend', onTransitionEnd);

      // Start flicker after hover has faded in
      flickerInterval = setInterval(() => {
        const randomOpacity = 0.4 + Math.random() * 0.6;
        flicker.style.opacity = randomOpacity.toFixed(2);
      }, 100);
    }
  };
      
  hover.addEventListener('transitionend', onTransitionEnd);
}
function stopFlicker() {
  clearInterval(flickerInterval);
  flickerInterval = null;
  hover.style.opacity = 0;
  flicker.style.opacity = 0;
}

container.addEventListener('mouseenter', startFlicker);
container.addEventListener('mouseleave', stopFlicker);
container.addEventListener('touchstart', startFlicker);
container.addEventListener('touchend', stopFlicker);
