// Mentors Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    initThemeToggle();
    
    // Load and display mentors
    loadMentors();
    
    // Initialize search and filter functionality
    initSearchAndFilter();
    
    // Initialize mentor request modal
    initMentorRequestModal();
});

// Load mentors from localStorage and display them
function loadMentors() {
    const mentorsContainer = document.getElementById('mentorsContainer');
    const noMentorsMessage = document.querySelector('.no-mentors-message');
    
    // Get mentors from localStorage
    const mentors = JSON.parse(localStorage.getItem('mentors') || '[]');
    
    // Clear the container
    mentorsContainer.innerHTML = '';
    
    // If there are no mentors, show the message
    if (mentors.length === 0) {
        noMentorsMessage.style.display = 'block';
        return;
    }
    
    // Hide the message
    noMentorsMessage.style.display = 'none';
    
    // Add each mentor to the container
    mentors.forEach(mentor => {
        const mentorCard = createMentorCard(mentor);
        mentorsContainer.appendChild(mentorCard);
    });
}

// Create a mentor card element
function createMentorCard(mentor) {
    // Create the card element
    const card = document.createElement('div');
    card.className = 'mentor-card';
    card.setAttribute('data-mentor-id', mentor.email);
    
    // Create the skills HTML
    const skillsHTML = mentor.skills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
    
    // Generate a placeholder avatar using the mentor's initials
    const initials = mentor.username.split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase();
    
    const avatarColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#A5FFD6',
        '#FFC145', '#FF6B8B', '#C04CFD', '#FD4C4C', '#4CA6FD'
    ];
    
    // Use a hash function to consistently get the same color for the same username
    const colorIndex = Math.abs(mentor.username.split('').reduce((acc, char) => 
        acc + char.charCodeAt(0), 0) % avatarColors.length);
    
    const avatarColor = avatarColors[colorIndex];
    
    // Set the card HTML
    card.innerHTML = `
        <div class="mentor-header">
            <div class="mentor-avatar" style="background-color: ${avatarColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">
                ${initials}
            </div>
            <div class="mentor-info">
                <h3>${mentor.username}</h3>
                <div class="mentor-skills">
                    ${skillsHTML}
                </div>
            </div>
        </div>
        <div class="mentor-body">
            <p class="mentor-description">${mentor.description}</p>
            <p class="mentor-contact">
                <i class="fas fa-envelope"></i> ${mentor.email}<br>
                <i class="fas fa-phone"></i> ${mentor.contact}
            </p>
            <div class="mentor-actions">
                <button class="request-btn" data-mentor-id="${mentor.email}" data-mentor-name="${mentor.username}">
                    Request Mentorship
                </button>
            </div>
        </div>
    `;
    
    // Add event listener to the request button
    const requestBtn = card.querySelector('.request-btn');
    requestBtn.addEventListener('click', function() {
        openRequestModal(mentor);
    });
    
    return card;
}

// Initialize search and filter functionality
function initSearchAndFilter() {
    const searchInput = document.getElementById('mentorSearch');
    const searchBtn = document.getElementById('searchBtn');
    const skillFilter = document.getElementById('skillFilter');
    
    // Search function
    function searchMentors() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedSkill = skillFilter.value.toLowerCase();
        
        // Get all mentor cards
        const mentorCards = document.querySelectorAll('.mentor-card');
        const noMentorsMessage = document.querySelector('.no-mentors-message');
        
        let visibleCount = 0;
        
        // Filter the cards
        mentorCards.forEach(card => {
            const mentorName = card.querySelector('.mentor-info h3').textContent.toLowerCase();
            const mentorSkills = Array.from(card.querySelectorAll('.skill-tag'))
                .map(tag => tag.textContent.toLowerCase());
            
            // Check if the card matches the search and filter criteria
            const matchesSearch = mentorName.includes(searchTerm) || 
                mentorSkills.some(skill => skill.includes(searchTerm));
            
            const matchesFilter = selectedSkill === '' || 
                mentorSkills.some(skill => skill === selectedSkill);
            
            // Show or hide the card
            if (matchesSearch && matchesFilter) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show or hide the no mentors message
        if (visibleCount === 0) {
            noMentorsMessage.style.display = 'block';
        } else {
            noMentorsMessage.style.display = 'none';
        }
    }
    
    // Add event listeners
    searchBtn.addEventListener('click', searchMentors);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchMentors();
        }
    });
    skillFilter.addEventListener('change', searchMentors);
}

// Initialize the mentor request modal
function initMentorRequestModal() {
    const modal = new bootstrap.Modal(document.getElementById('mentorRequestModal'));
    const sendRequestBtn = document.getElementById('sendRequestBtn');
    
    sendRequestBtn.addEventListener('click', function() {
        const mentorId = document.getElementById('requestMentorId').value;
        const message = document.getElementById('requestMessage').value;
        
        if (!message.trim()) {
            alert('Please enter a message for the mentor.');
            return;
        }
        
        // In a real application, this would send the request to a server
        // For demonstration, we'll store it in localStorage
        sendMentorRequest(mentorId, message);
        
        // Close the modal
        modal.hide();
    });
}

// Open the mentor request modal
function openRequestModal(mentor) {
    const modalTitle = document.getElementById('mentorRequestModalLabel');
    const mentorIdInput = document.getElementById('requestMentorId');
    const messageInput = document.getElementById('requestMessage');
    
    // Set the modal title and mentor ID
    modalTitle.textContent = `Request Mentorship from ${mentor.username}`;
    mentorIdInput.value = mentor.email;
    messageInput.value = '';
    
    // Check if the user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in or sign up to request mentorship.');
        window.location.href = '../auth/auth.html';
        return;
    }
    
    // Check if the user is a student
    if (currentUser.userType !== 'student') {
        alert('Only students can request mentorship.');
        return;
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('mentorRequestModal'));
    modal.show();
}

// Send a mentor request
function sendMentorRequest(mentorId, message) {
    // Get the current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Create the request object
    const request = {
        id: Date.now().toString(),
        mentorId: mentorId,
        studentId: currentUser.email,
        studentName: currentUser.username,
        message: message,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    // Get existing requests
    const requests = JSON.parse(localStorage.getItem('mentorRequests') || '[]');
    
    // Add the new request
    requests.push(request);
    
    // Save the updated requests
    localStorage.setItem('mentorRequests', JSON.stringify(requests));
    
    // Show success message
    alert('Your request has been sent to the mentor!');
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
