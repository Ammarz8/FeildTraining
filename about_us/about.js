// Show social icons on hover
document.querySelectorAll('.team-member').forEach(member => {
    member.addEventListener('mouseenter', function() {
        this.querySelector('.social-icons').style.opacity = '1';
    });
    member.addEventListener('mouseleave', function() {
        this.querySelector('.social-icons').style.opacity = '0';
    });
});

// Theme Toggle functionality
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const htmlElement = document.documentElement;

// Check for saved theme preference or use the system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
} else {
    // Check if user prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
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