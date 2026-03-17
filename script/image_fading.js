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
	const containers = document.querySelectorAll(".image-container");

	if (!containers.length) return;

	const APPROACH_MARGIN = 260;
	const OPACITY_EASING = 0.09;
	const EDGE_FADE_REM = 2;

	let mouseX = 0;
	let mouseY = 0;
	let hasPointer = false;

	function clamp(v, min, max)
	{
		return Math.max(min, Math.min(max, v));
	}

	function lerp(a, b, t)
	{
		return a + (b - a) * t;
	}

	function getRootFontSize()
	{
		return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
	}

	function createInstance(container)
	{
		const overlay = container.querySelector(".overlay");
		const hoverImg = container.querySelector(".hover");
		const flicker = container.querySelector(".flicker");

		if (!overlay || !hoverImg) return null;

		if (flicker) {
			flicker.style.display = "none";
			flicker.style.opacity = "0";
		}

		return {
			container,
			overlay,
			hoverImg,
			rect: null,
			isInside: false,
			currentOverlayOpacity: 0,
			currentHoverOpacity: 0,
			targetOverlayOpacity: 0,
			targetHoverOpacity: 0
		};
	}

	const instances = Array.from(containers)
		.map(createInstance)
		.filter(Boolean);

	function updateRect(instance)
	{
		instance.rect = instance.container.getBoundingClientRect();
	}

	function isNear(instance)
	{
		const r = instance.rect;

		return (
			mouseX >= r.left - APPROACH_MARGIN &&
			mouseX <= r.right + APPROACH_MARGIN &&
			mouseY >= r.top - APPROACH_MARGIN &&
			mouseY <= r.bottom + APPROACH_MARGIN
		);
	}

	function getEdgeProximity(instance)
	{
		const r = instance.rect;
		const edgeFadePx = EDGE_FADE_REM * getRootFontSize();

		const d = Math.min(
			mouseX - r.left,
			r.right - mouseX,
			mouseY - r.top,
			r.bottom - mouseY
		);

		return clamp(d / edgeFadePx, 0, 1);
	}

	function getApproach(instance)
	{
		const r = instance.rect;

		const dx =
			mouseX < r.left ? r.left - mouseX :
			mouseX > r.right ? mouseX - r.right : 0;

		const dy =
			mouseY < r.top ? r.top - mouseY :
			mouseY > r.bottom ? mouseY - r.bottom : 0;

		const dist = Math.sqrt(dx * dx + dy * dy);

		return clamp(1 - dist / APPROACH_MARGIN, 0, 1);
	}

	function updateTargets(instance)
	{
		if (!hasPointer || !instance.rect) {
			instance.targetOverlayOpacity = 0;
			instance.targetHoverOpacity = 0;
			return;
		}

		const near = isNear(instance);

		if (!near && !instance.isInside) {
			instance.targetOverlayOpacity = 0;
			instance.targetHoverOpacity = 0;
			return;
		}

		if (instance.isInside) {
			const edge = getEdgeProximity(instance);

			instance.targetOverlayOpacity = 0.55 + edge * 0.45;
			instance.targetHoverOpacity = 0.70 + edge * 0.30;
		}
		else {
			const a = getApproach(instance);

			instance.targetOverlayOpacity = a * 0.68;
			instance.targetHoverOpacity = a > 0.18 ? (a - 0.18) / 0.82 * 0.42 : 0;
		}
	}

	function render()
	{
		for (const inst of instances)
		{
			updateTargets(inst);

			inst.currentOverlayOpacity = lerp(inst.currentOverlayOpacity, inst.targetOverlayOpacity, OPACITY_EASING);
			inst.currentHoverOpacity = lerp(inst.currentHoverOpacity, inst.targetHoverOpacity, OPACITY_EASING);

			inst.overlay.style.opacity = inst.currentOverlayOpacity.toFixed(3);
			inst.hoverImg.style.opacity = inst.currentHoverOpacity.toFixed(3);
		}

		requestAnimationFrame(render);
	}

	function onPointerMove(e)
	{
		hasPointer = true;
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	function onResizeOrScroll()
	{
		for (const inst of instances) {
			updateRect(inst);
		}
	}

	for (const inst of instances)
	{
		inst.container.addEventListener("mouseenter", (e) =>
		{
			inst.isInside = true;
			mouseX = e.clientX;
			mouseY = e.clientY;
			updateRect(inst);
		});

		inst.container.addEventListener("mouseleave", () =>
		{
			inst.isInside = false;
		});

		updateRect(inst);
	}

	window.addEventListener("mousemove", onPointerMove, { passive: true });
	window.addEventListener("resize", onResizeOrScroll);
	window.addEventListener("scroll", onResizeOrScroll, { passive: true });

	requestAnimationFrame(render);
})();
