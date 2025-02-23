// ===============
// DOM Elements
// ===============

const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');
const sliderWrapper = document.querySelector('.slider-wrapper');


// Constants
const scrollAmount = 150;

// ==================
// Event Listeners
// ==================

scrollLeftBtn.addEventListener('click', () => {
    smoothScroll(sliderWrapper, -scrollAmount, 300);
});
scrollRightBtn.addEventListener('click', () => {
    smoothScroll(sliderWrapper, scrollAmount, 300);
});

/**
 * Smoothly scrolls an element horizontally.
 *
 * @param {HTMLElement} element - The element to scroll.
 * @param {number} distance - The horizontal distance (in pixels) to scroll.
 *                            Positive values scroll to the right, negative to the left.
 * @param {number} duration - The duration (in milliseconds) over which the scrolling occurs.
 * @returns {void}
 */
function smoothScroll(element, distance, duration) {
    const start = element.scrollLeft;
    let startTime = null;

    /**
     * Animation function that updates the element's scroll position over time.
     *
     * @param {number} currentTime - The current time provided by requestAnimationFrame.
     * @returns {void}
     */
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Update scroll position using an easing function for a smooth effect
        element.scrollLeft = start + distance * easeInOutQuad(progress);

        // Continue animation until duration is met
        if (elapsedTime < duration) {
            requestAnimationFrame(animation);
        }
    }

    /**
     * Easing function that produces a smooth start and end (easeInOutQuad).
     *
     * @param {number} t - The current progress ratio (between 0 and 1).
     * @returns {number} The eased progress value.
     */
    function easeInOutQuad(t) {
        // For the first half, accelerate or ease in. For the second half, decelerate or ease out
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // requestAnimationFrame schedules the next frame for our animation
    // I didn't know what requestFrame was before, but it's basically needed for creating smooth animations
    // because it allows the browser to optimize the animation by syncing it with the display refresh rate.
    requestAnimationFrame(animation);
}

