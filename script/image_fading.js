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

	const APPROACH_MARGIN = 300;
	const OPACITY_EASING = 0.09;
	const EDGE_FADE_REM = 1.5;

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

	function getRootFontSize()
	{
		return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
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

	function getInsideEdgeProximity(clientX, clientY)
	{
		if (!rect) {
			updateRect();
		}

		const edgeFadePx = EDGE_FADE_REM * getRootFontSize();

		const distLeft = clientX - rect.left;
		const distRight = rect.right - clientX;
		const distTop = clientY - rect.top;
		const distBottom = rect.bottom - clientY;

		const minEdgeDist = Math.min(distLeft, distRight, distTop, distBottom);

		return clamp(minEdgeDist / edgeFadePx, 0, 1);
	}

	function getApproachProximity(clientX, clientY)
	{
		if (!rect) {
			updateRect();
		}

		const dx =
			clientX < rect.left ? rect.left - clientX :
			clientX > rect.right ? clientX - rect.right : 0;

		const dy =
			clientY < rect.top ? rect.top - clientY :
			clientY > rect.bottom ? clientY - rect.bottom : 0;

		const dist = Math.sqrt(dx * dx + dy * dy);

		return clamp(1 - dist / APPROACH_MARGIN, 0, 1);
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
			const edgeProximity = getInsideEdgeProximity(mouseX, mouseY);

			targetOverlayOpacity = 0.55 + edgeProximity * 0.45;
			targetHoverOpacity = 0.82 + edgeProximity * 0.18;
		} else {
			const approach = getApproachProximity(mouseX, mouseY);

			targetOverlayOpacity = approach * 0.68;
			targetHoverOpacity = approach > 0.18 ? (approach - 0.18) / 0.82 * 0.42 : 0;
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
