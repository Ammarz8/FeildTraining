// Auth Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth tabs
    initAuthTabs();
    
    // Initialize user type selector
    initUserTypeSelector();
    
    // Initialize form submissions
    initFormSubmissions();
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Create admin user if it doesn't exist
    createAdminUser();
});

// Create admin user if it doesn't exist
function createAdminUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if admin user already exists
    const adminExists = users.some(user => user.email === 'admin@gmail.com' && user.role === 'admin');
    
    if (!adminExists) {
        // Create admin user
        const adminUser = {
            username: 'Administrator',
            email: 'admin@gmail.com',
            password: 'admin',
            contact: 'N/A',
            userType: 'admin',
            role: 'admin'
        };
        
        // Add admin to users array
        users.push(adminUser);
        
        // Save updated users array
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('Admin user created successfully');
    }
}

// Initialize the authentication tabs (Login/Signup)
function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = {
        'login': document.getElementById('login-form'),
        'signup': document.getElementById('signup-form')
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all forms
            Object.values(forms).forEach(form => {
                form.style.display = 'none';
            });
            
            // Show the selected form
            const formToShow = this.getAttribute('data-tab');
            forms[formToShow].style.display = 'block';
        });
    });
}

// Initialize the user type selector (Student/Mentor)
function initUserTypeSelector() {
    const userTypeBtns = document.querySelectorAll('.user-type-btn');
    const studentForm = document.getElementById('studentSignupForm');
    const mentorForm = document.getElementById('mentorSignupForm');
    
    userTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            userTypeBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show the appropriate form
            const userType = this.getAttribute('data-type');
            if (userType === 'student') {
                studentForm.style.display = 'block';
                mentorForm.style.display = 'none';
            } else {
                studentForm.style.display = 'none';
                mentorForm.style.display = 'block';
            }
        });
    });
}

// Initialize form submissions
function initFormSubmissions() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // For demonstration purposes, we'll just log the values
            console.log('Login attempt:', { email, password });
            
            // In a real application, you would send these values to a server
            // For now, we'll simulate a successful login
            loginUser(email, password);
        });
    }
    
    // Student signup form submission
    const studentSignupForm = document.getElementById('studentSignupForm');
    if (studentSignupForm) {
        studentSignupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const username = document.getElementById('studentUsername').value;
            const email = document.getElementById('studentEmail').value;
            const password = document.getElementById('studentPassword').value;
            const contact = document.getElementById('studentContact').value;
            
            // Create student data object
            const studentData = {
                username: username,
                email: email,
                password: password,
                contact: contact,
                userType: 'student'
            };
            
            // Register the student
            registerUser(studentData);
            
            // No need to log here as studentData is not in this scope
        });
    }
    
    // Mentor signup form submission
    const mentorSignupForm = document.getElementById('mentorSignupForm');
    if (mentorSignupForm) {
        mentorSignupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const username = document.getElementById('mentorUsername').value;
            const email = document.getElementById('mentorEmail').value;
            const password = document.getElementById('mentorPassword').value;
            const contact = document.getElementById('mentorContact').value;
            const skills = document.getElementById('mentorSkills').value.split(',').map(skill => skill.trim());
            const description = document.getElementById('mentorDescription').value;
            
            // Create mentor data object
            const mentorData = {
                username: username,
                email: email,
                password: password,
                contact: contact,
                skills: skills,
                description: description,
                userType: 'mentor'
            };
            
            // Register the mentor
            registerUser(mentorData);
            
            // No need to log here as mentorData is not in this scope
        });
    }
}

// Simulate user login
function loginUser(email, password) {
    // In a real application, this would be an API call to authenticate the user
    
    // For demonstration, we'll check if the user exists in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Set the current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Get redirect parameter from URL if it exists
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect');
        
        // Redirect to the appropriate page
        if (user.role === 'admin') {
            alert('Logged in successfully as an administrator!');
            if (redirectTo === 'admin') {
                window.location.href = '../admin/reports.html';
            } else {
                window.location.href = '../admin/dashboard.html';
            }
        } else if (user.userType === 'mentor') {
            alert('Logged in successfully as a mentor!');
            window.location.href = '../home/home.html';
        } else {
            alert('Logged in successfully as a student!');
            window.location.href = '../home/home.html';
        }
    } else {
        alert('Invalid email or password. Please try again.');
    }
}

// Simulate user registration
function registerUser(userData) {
    // In a real application, this would be an API call to register the user
    
    // For demonstration, we'll store the user in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if the email is already registered
    if (users.some(u => u.email === userData.email)) {
        alert('This email is already registered. Please use a different email or log in.');
        return;
    }
    
    // Add the new user
    users.push(userData);
    
    // Save the updated users array
    localStorage.setItem('users', JSON.stringify(users));
    
    // If the user is a mentor, add them to the mentors list
    if (userData.userType === 'mentor') {
        const mentors = JSON.parse(localStorage.getItem('mentors') || '[]');
        mentors.push(userData);
        localStorage.setItem('mentors', JSON.stringify(mentors));
    }

    // Set the current user
    localStorage.setItem('currentUser', JSON.stringify(userData));

    // Show success message and redirect
    alert('Registration successful!');
    window.location.href = '../home/home.html';
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
