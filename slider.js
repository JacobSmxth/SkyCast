document.addEventListener('DOMContentLoaded', () => {
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    const sliderWrapper = document.querySelector('.slider-wrapper');

    const scrollAmount = 150; // Adjust as needed

    scrollLeftBtn.addEventListener('click', () => {
        smoothScroll(sliderWrapper, -scrollAmount, 300);
    });

    scrollRightBtn.addEventListener('click', () => {
        smoothScroll(sliderWrapper, scrollAmount, 300);
    });

    function smoothScroll(element, distance, duration) {
        const start = element.scrollLeft;
        let startTime = null;

        function animation(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            element.scrollLeft = start + distance * easeInOutQuad(progress);

            if (elapsedTime < duration) {
                requestAnimationFrame(animation);
            }
        }

        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        requestAnimationFrame(animation);
    }
});
