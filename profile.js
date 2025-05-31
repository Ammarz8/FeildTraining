// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    initThemeToggle();
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = 'auth/auth.html';
        return;
    }
    
    // Load user profile data
    loadUserProfile(currentUser);
    
    // Initialize tabs
    initProfileTabs();
    
    // Load connections and requests
    loadConnections();
    loadRequests();
});

// Load user profile data
function loadUserProfile(user) {
    // Set profile name
    document.getElementById('profileName').textContent = user.username;
    
    // Set profile type
    document.getElementById('profileType').textContent = user.userType === 'mentor' ? 'Mentor' : 'Student';
    
    // Set profile email
    document.getElementById('profileEmail').textContent = user.email;
    
    // Set profile contact
    document.getElementById('profileContact').textContent = 'Contact: ' + user.contact;
    
    // Set profile avatar
    const profileAvatar = document.getElementById('profileAvatar');
    if (user.profilePic) {
        // User has a profile picture
        profileAvatar.innerHTML = `<img src="${user.profilePic}" alt="${user.username}">`;
    } else {
        // Generate initials for avatar
        const initials = user.username.split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase();
        
        const avatarColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#A5FFD6',
            '#FFC145', '#FF6B8B', '#C04CFD', '#FD4C4C', '#4CA6FD'
        ];
        
        // Use a hash function to consistently get the same color for the same username
        const colorIndex = Math.abs(user.username.split('').reduce((acc, char) => 
            acc + char.charCodeAt(0), 0) % avatarColors.length);
        
        const avatarColor = avatarColors[colorIndex];
        
        profileAvatar.style.backgroundColor = avatarColor;
        profileAvatar.textContent = initials;
    }
    
    // Show mentor-specific information if user is a mentor
    if (user.userType === 'mentor') {
        const mentorInfoSection = document.getElementById('mentorInfoSection');
        mentorInfoSection.style.display = 'block';
        
        // Set mentor skills
        const mentorSkills = document.getElementById('mentorSkills');
        mentorSkills.innerHTML = user.skills.map(skill => 
            `<span class="skill-tag">${skill}</span>`
        ).join('');
        
        // Set mentor description
        document.getElementById('mentorDescription').textContent = user.description;
    }
}

// Initialize profile tabs
function initProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    const tabContents = {
        'connections': document.getElementById('connectionsTab'),
        'requests': document.getElementById('requestsTab')
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            Object.values(tabContents).forEach(content => {
                content.style.display = 'none';
            });
            
            // Show the selected tab content
            const tabToShow = this.getAttribute('data-tab');
            tabContents[tabToShow].style.display = 'block';
        });
    });
}

// Load connections
function loadConnections() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const connectionsList = document.getElementById('connectionsList');
    const noConnectionsMessage = document.getElementById('noConnectionsMessage');
    
    // Get connections from localStorage
    const connections = JSON.parse(localStorage.getItem('connections') || '[]');
    
    // Filter connections for the current user
    const userConnections = connections.filter(connection => 
        connection.mentorId === currentUser.email || connection.studentId === currentUser.email
    );
    
    // Clear the connections list
    connectionsList.innerHTML = '';
    
    // Show or hide the no connections message
    if (userConnections.length === 0) {
        noConnectionsMessage.style.display = 'block';
        return;
    }
    
    noConnectionsMessage.style.display = 'none';
    
    // Get all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Add each connection to the list
    userConnections.forEach(connection => {
        // Determine the other user in the connection
        const otherUserId = connection.mentorId === currentUser.email ? connection.studentId : connection.mentorId;
        const otherUser = users.find(user => user.email === otherUserId);
        
        if (otherUser) {
            const connectionCard = createConnectionCard(otherUser);
            connectionsList.appendChild(connectionCard);
        }
    });
}

// Create a connection card
function createConnectionCard(user) {
    const card = document.createElement('div');
    card.className = 'connection-card';
    
    // Create avatar
    let avatarHTML = '';
    if (user.profilePic) {
        avatarHTML = `<img src="${user.profilePic}" alt="${user.username}">`;
    } else {
        // Generate initials for avatar
        const initials = user.username.split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase();
        
        avatarHTML = initials;
    }
    
    card.innerHTML = `
        <div class="connection-avatar">${avatarHTML}</div>
        <div class="connection-info">
            <h3>${user.username}</h3>
            <p class="connection-type">${user.userType === 'mentor' ? 'Mentor' : 'Student'}</p>
            <p>${user.email}</p>
        </div>
    `;
    
    return card;
}

// Load mentorship requests
function loadRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const requestsList = document.getElementById('requestsList');
    const noRequestsMessage = document.getElementById('noRequestsMessage');
    const requestCount = document.getElementById('requestCount');
    
    // Only show requests tab for mentors
    if (currentUser.userType !== 'mentor') {
        document.querySelector('[data-tab="requests"]').style.display = 'none';
        return;
    }
    
    // Get requests from localStorage
    const requests = JSON.parse(localStorage.getItem('mentorRequests') || '[]');
    
    // Filter pending requests for the current mentor
    const pendingRequests = requests.filter(request => 
        request.mentorId === currentUser.email && request.status === 'pending'
    );
    
    // Clear the requests list
    requestsList.innerHTML = '';
    
    // Show or hide the no requests message
    if (pendingRequests.length === 0) {
        noRequestsMessage.style.display = 'block';
        requestCount.style.display = 'none';
        return;
    }
    
    noRequestsMessage.style.display = 'none';
    
    // Update request count
    requestCount.textContent = pendingRequests.length;
    requestCount.style.display = 'inline-flex';
    
    // Get all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Add each request to the list
    pendingRequests.forEach(request => {
        const student = users.find(user => user.email === request.studentId);
        
        if (student) {
            const requestCard = createRequestCard(request, student);
            requestsList.appendChild(requestCard);
        }
    });
}

// Create a request card
function createRequestCard(request, student) {
    const card = document.createElement('div');
    card.className = 'request-card';
    card.setAttribute('data-request-id', request.id);
    
    // Create avatar
    let avatarHTML = '';
    if (student.profilePic) {
        avatarHTML = `<img src="${student.profilePic}" alt="${student.username}">`;
    } else {
        // Generate initials for avatar
        const initials = student.username.split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase();
        
        avatarHTML = initials;
    }
    
    // Format date
    const requestDate = new Date(request.timestamp);
    const formattedDate = requestDate.toLocaleDateString() + ' at ' + requestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    card.innerHTML = `
        <div class="request-header">
            <div class="request-avatar">${avatarHTML}</div>
            <div class="request-info">
                <h3>${student.username}</h3>
                <p>Requested on ${formattedDate}</p>
            </div>
        </div>
        <div class="request-message">
            ${request.message}
        </div>
        <div class="request-actions">
            <button class="accept-btn" data-request-id="${request.id}">Accept Request</button>
            <button class="decline-btn" data-request-id="${request.id}">Decline</button>
        </div>
    `;
    
    // Add event listeners for accept and decline buttons
    const acceptBtn = card.querySelector('.accept-btn');
    const declineBtn = card.querySelector('.decline-btn');
    
    acceptBtn.addEventListener('click', function() {
        acceptRequest(request.id);
    });
    
    declineBtn.addEventListener('click', function() {
        declineRequest(request.id);
    });
    
    return card;
}

// Accept a mentorship request
function acceptRequest(requestId) {
    // Get all requests
    const requests = JSON.parse(localStorage.getItem('mentorRequests') || '[]');
    
    // Find the request
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex !== -1) {
        const request = requests[requestIndex];
        
        // Update request status
        request.status = 'accepted';
        requests[requestIndex] = request;
        
        // Save updated requests
        localStorage.setItem('mentorRequests', JSON.stringify(requests));
        
        // Create a new connection
        const connections = JSON.parse(localStorage.getItem('connections') || '[]');
        connections.push({
            id: Date.now().toString(),
            mentorId: request.mentorId,
            studentId: request.studentId,
            timestamp: new Date().toISOString()
        });
        
        // Save connections
        localStorage.setItem('connections', JSON.stringify(connections));
        
        // Remove the request card from the UI
        const requestCard = document.querySelector(`.request-card[data-request-id="${requestId}"]`);
        if (requestCard) {
            requestCard.remove();
        }
        
        // Reload requests and connections
        loadRequests();
        loadConnections();
        
        // Show success message
        alert('You have accepted the mentorship request. The student has been added to your connections.');
    }
}

// Decline a mentorship request
function declineRequest(requestId) {
    // Get all requests
    const requests = JSON.parse(localStorage.getItem('mentorRequests') || '[]');
    
    // Find the request
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex !== -1) {
        const request = requests[requestIndex];
        
        // Update request status
        request.status = 'declined';
        requests[requestIndex] = request;
        
        // Save updated requests
        localStorage.setItem('mentorRequests', JSON.stringify(requests));
        
        // Remove the request card from the UI
        const requestCard = document.querySelector(`.request-card[data-request-id="${requestId}"]`);
        if (requestCard) {
            requestCard.remove();
        }
        
        // Reload requests
        loadRequests();
        
        // Show success message
        alert('You have declined the mentorship request.');
    }
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
