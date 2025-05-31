// Main document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Mentors Slider functionality
    initMentorsCarousel();
    
    // FAQ functionality
    initFaqAccordion();
    
    // Theme toggle functionality
    initThemeToggle();
});

// Initialize the Mentors Carousel
function initMentorsCarousel() {
    const mentorsCarousel = new bootstrap.Carousel(document.getElementById('mentorsCarousel'), {
        interval: 5000,  // 5 seconds
        wrap: true,      
        keyboard: true  
    });

    // Pause carousel on hover
    document.getElementById('mentorsCarousel').addEventListener('mouseenter', function() {
        mentorsCarousel.pause();
    });

    document.getElementById('mentorsCarousel').addEventListener('mouseleave', function() {
        mentorsCarousel.cycle();
    });

    // Swipe functionality for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    const carousel = document.getElementById('mentorsCarousel');
    
    carousel.addEventListener('touchstart', function(event) {
        touchStartX = event.changedTouches[0].screenX;
    }, false);
    
    carousel.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swipe left
            mentorsCarousel.next();
        }
        if (touchEndX > touchStartX + 50) {
            // Swipe right
            mentorsCarousel.prev();
        }
    }
}

// Initialize the FAQ Accordion
function initFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.parentElement;
            const answer = item.querySelector('.faq-answer');
            const isOpen = item.classList.contains('open');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('open');
                const ans = i.querySelector('.faq-answer');
                ans.style.height = 0;
                ans.style.opacity = 0;
            });

            // If the clicked item was not open, open it
            if (!isOpen) {
                item.classList.add('open');
                answer.style.height = answer.scrollHeight + 'px';
                answer.style.opacity = 1;
            }
        });
    });
}

// Initialize the Theme Toggle functionality
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;
    
    // Set dark mode as default
    if (!localStorage.getItem('theme')) {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            htmlElement.setAttribute('data-theme', savedTheme);
        }
    }
    
    // Toggle theme when button is clicked
    themeToggleBtn.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        let newTheme;
        
        if (currentTheme === 'dark') {
            newTheme = 'light';
            htmlElement.removeAttribute('data-theme');
        } else {
            newTheme = 'dark';
            htmlElement.setAttribute('data-theme', 'dark');
        }
        
        localStorage.setItem('theme', newTheme);
        
        // Add animation effect
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 500);
    });
}
