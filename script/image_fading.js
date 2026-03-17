/*const overlay = document.getElementById('overlay');
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
container.addEventListener('touchend', stopFlicker);*/


(function()
{
	const container = document.getElementById("imageContainer");
	const overlay = document.getElementById("overlay");
	const hoverImg = document.getElementById("hover");
	const flicker = document.getElementById("flicker");

	if (!container || !overlay || !hoverImg) {
		return;
	}

	if (flicker) {
		flicker.style.display = "none";
		flicker.style.opacity = "0";
	}

	let rect = null;

	let mouseX = 0;
	let mouseY = 0;
	let hasPointer = false;
	let isInside = false;

	let currentOverlayOpacity = 0;
	let currentHoverOpacity = 0;
	let targetOverlayOpacity = 0;
	let targetHoverOpacity = 0;

	const APPROACH_MARGIN = 220;
	const OPACITY_EASING = 0.055;

	function clamp(value, min, max)
	{
		return Math.max(min, Math.min(max, value));
	}

	function lerp(current, target, factor)
	{
		return current + (target - current) * factor;
	}

	function updateRect()
	{
		rect = container.getBoundingClientRect();
	}

	function getCenter()
	{
		if (!rect) {
			updateRect();
		}

		return {
			x: rect.left + rect.width * 0.5,
			y: rect.top + rect.height * 0.5
		};
	}

	function getNormalizedDistance(clientX, clientY)
	{
		const center = getCenter();

		const dx = clientX - center.x;
		const dy = clientY - center.y;

		const nx = dx / (rect.width * 0.5);
		const ny = dy / (rect.height * 0.5);

		return Math.min(Math.sqrt(nx * nx + ny * ny), 1.5);
	}

	function isNearContainer(clientX, clientY)
	{
		if (!rect) {
			updateRect();
		}

		return (
			clientX >= rect.left - APPROACH_MARGIN &&
			clientX <= rect.right + APPROACH_MARGIN &&
			clientY >= rect.top - APPROACH_MARGIN &&
			clientY <= rect.bottom + APPROACH_MARGIN
		);
	}

	function updateTargets()
	{
		if (!hasPointer || !rect) {
			targetOverlayOpacity = 0;
			targetHoverOpacity = 0;
			return;
		}

		const near = isNearContainer(mouseX, mouseY);

		if (!near && !isInside) {
			targetOverlayOpacity = 0;
			targetHoverOpacity = 0;
			return;
		}

		if (isInside) {
			const insideProximity = clamp(1 - getNormalizedDistance(mouseX, mouseY), 0, 1);

			targetOverlayOpacity = 0.35 + insideProximity * 0.65;
			targetHoverOpacity = 0.18 + insideProximity * 0.82;
		} else {
			const center = getCenter();
			const dx = mouseX - center.x;
			const dy = mouseY - center.y;

			const nx = dx / ((rect.width + APPROACH_MARGIN * 2) * 0.5);
			const ny = dy / ((rect.height + APPROACH_MARGIN * 2) * 0.5);
			const dist = Math.min(Math.sqrt(nx * nx + ny * ny), 1.5);
			const approach = clamp(1 - dist, 0, 1);

			targetOverlayOpacity = approach * 0.45;
			targetHoverOpacity = approach > 0.38 ? (approach - 0.38) / 0.62 * 0.55 : 0;
		}
	}

	function render()
	{
		updateTargets();

		currentOverlayOpacity = lerp(currentOverlayOpacity, targetOverlayOpacity, OPACITY_EASING);
		currentHoverOpacity = lerp(currentHoverOpacity, targetHoverOpacity, OPACITY_EASING);

		overlay.style.opacity = currentOverlayOpacity.toFixed(3);
		hoverImg.style.opacity = currentHoverOpacity.toFixed(3);

		overlay.style.transform = "translate3d(0, 0, 0) scale(1)";
		hoverImg.style.transform = "translate3d(0, 0, 0) scale(1)";

		window.requestAnimationFrame(render);
	}

	function onPointerMove(event)
	{
		hasPointer = true;
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	function onPointerEnter(event)
	{
		isInside = true;
		hasPointer = true;
		mouseX = event.clientX;
		mouseY = event.clientY;
		updateRect();
	}

	function onPointerLeave()
	{
		isInside = false;
	}

	function onResizeOrScroll()
	{
		updateRect();
	}

	container.addEventListener("mouseenter", onPointerEnter);
	container.addEventListener("mousemove", onPointerMove);
	container.addEventListener("mouseleave", onPointerLeave);

	window.addEventListener("mousemove", onPointerMove, { passive: true });
	window.addEventListener("resize", onResizeOrScroll);
	window.addEventListener("scroll", onResizeOrScroll, { passive: true });

	updateRect();
	window.requestAnimationFrame(render);
})();
