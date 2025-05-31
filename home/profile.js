document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    initThemeToggle();
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = '../auth/auth.html';
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
    // Always display initials for avatar (profile pictures removed)
    displayInitialsAvatar(user, profileAvatar);
    
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

// Helper function to display initials avatar
function displayInitialsAvatar(user, profileAvatar) {
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
            const tabName = this.getAttribute('data-tab');
            tabContents[tabName].style.display = 'block';
        });
    });
}

// Load user connections
function loadConnections() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const connections = JSON.parse(localStorage.getItem('connections') || '[]');
    const userConnections = connections.filter(conn => 
        conn.studentId === currentUser.email || conn.mentorId === currentUser.email
    );
    
    const connectionsList = document.getElementById('connectionsList');
    const noConnectionsMessage = document.getElementById('noConnectionsMessage');
    
    if (userConnections.length === 0) {
        // Show "no connections" message
        connectionsList.style.display = 'none';
        noConnectionsMessage.style.display = 'block';
        return;
    }
    
    // Hide "no connections" message and show connections list
    noConnectionsMessage.style.display = 'none';
    connectionsList.style.display = 'grid';
    
    // Get all users to find connection details
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Clear existing connections
    connectionsList.innerHTML = '';
    
    // Add each connection to the list
    userConnections.forEach(connection => {
        // Determine the other user in the connection
        const otherUserEmail = currentUser.email === connection.studentId 
            ? connection.mentorId 
            : connection.studentId;
        
        const otherUser = users.find(user => user.email === otherUserEmail);
        
        if (otherUser) {
            // Create connection card
            const connectionCard = document.createElement('div');
            connectionCard.className = 'connection-card';
            
            // Create avatar
            const avatar = document.createElement('div');
            avatar.className = 'connection-avatar';
            
            if (otherUser.profilePic) {
                // User has a profile picture
                avatar.innerHTML = `<img src="${otherUser.profilePic}" alt="${otherUser.username}">`;
            } else {
                // Generate initials for avatar
                const initials = otherUser.username.split(' ')
                    .map(name => name.charAt(0))
                    .join('')
                    .toUpperCase();
                
                const avatarColors = [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#A5FFD6',
                    '#FFC145', '#FF6B8B', '#C04CFD', '#FD4C4C', '#4CA6FD'
                ];
                
                // Use a hash function to consistently get the same color for the same username
                const colorIndex = Math.abs(otherUser.username.split('').reduce((acc, char) => 
                    acc + char.charCodeAt(0), 0) % avatarColors.length);
                
                const avatarColor = avatarColors[colorIndex];
                
                avatar.style.backgroundColor = avatarColor;
                avatar.textContent = initials;
            }
            
            // Create info container
            const infoContainer = document.createElement('div');
            infoContainer.className = 'connection-info';
            
            // Add name
            const name = document.createElement('h3');
            name.textContent = otherUser.username;
            infoContainer.appendChild(name);
            
            // Add type
            const type = document.createElement('p');
            type.className = 'connection-type';
            type.textContent = otherUser.userType === 'mentor' ? 'Mentor' : 'Student';
            infoContainer.appendChild(type);
            
            // Add skills if the connection is a mentor
            if (otherUser.userType === 'mentor' && otherUser.skills) {
                const skills = document.createElement('div');
                skills.className = 'connection-skills';
                skills.innerHTML = otherUser.skills.slice(0, 3).map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                ).join('');
                
                if (otherUser.skills.length > 3) {
                    skills.innerHTML += `<span class="skill-tag">+${otherUser.skills.length - 3} more</span>`;
                }
                
                infoContainer.appendChild(skills);
            }
            
            // Add message button
            const messageBtn = document.createElement('button');
            messageBtn.className = 'btn-secondary message-btn';
            messageBtn.innerHTML = '<i class="fas fa-comment"></i> Message';
            messageBtn.addEventListener('click', function() {
                alert('Messaging functionality coming soon!');
            });
            
            // Assemble connection card
            connectionCard.appendChild(avatar);
            connectionCard.appendChild(infoContainer);
            connectionCard.appendChild(messageBtn);
            
            // Add to connections list
            connectionsList.appendChild(connectionCard);
        }
    });
}

// Load mentorship requests
function loadRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const requests = JSON.parse(localStorage.getItem('mentorRequests') || '[]');
    
    // Filter requests based on user type
    let userRequests;
    if (currentUser.userType === 'mentor') {
        // Mentors see incoming requests
        userRequests = requests.filter(req => req.mentorId === currentUser.email && req.status === 'pending');
    } else {
        // Students see their outgoing requests
        userRequests = requests.filter(req => req.studentId === currentUser.email);
    }
    
    // Update request count badge
    const requestCount = document.getElementById('requestCount');
    if (userRequests.length > 0) {
        requestCount.textContent = userRequests.length;
        requestCount.style.display = 'inline-block';
    } else {
        requestCount.style.display = 'none';
    }
    
    const requestsList = document.getElementById('requestsList');
    const noRequestsMessage = document.getElementById('noRequestsMessage');
    
    if (userRequests.length === 0) {
        // Show "no requests" message
        requestsList.style.display = 'none';
        noRequestsMessage.style.display = 'block';
        return;
    }
    
    // Hide "no requests" message and show requests list
    noRequestsMessage.style.display = 'none';
    requestsList.style.display = 'block';
    
    // Get all users to find request details
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Clear existing requests
    requestsList.innerHTML = '';
    
    // Add each request to the list
    userRequests.forEach(request => {
        // Find the other user in the request
        const otherUserEmail = currentUser.userType === 'mentor' ? request.studentId : request.mentorId;
        const otherUser = users.find(user => user.email === otherUserEmail);
        
        if (otherUser) {
            // Create request card
            const requestCard = document.createElement('div');
            requestCard.className = 'request-card';
            
            // Create avatar
            const avatar = document.createElement('div');
            avatar.className = 'request-avatar';
            
            if (otherUser.profilePic) {
                // User has a profile picture
                avatar.innerHTML = `<img src="${otherUser.profilePic}" alt="${otherUser.username}">`;
            } else {
                // Generate initials for avatar
                const initials = otherUser.username.split(' ')
                    .map(name => name.charAt(0))
                    .join('')
                    .toUpperCase();
                
                const avatarColors = [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#A5FFD6',
                    '#FFC145', '#FF6B8B', '#C04CFD', '#FD4C4C', '#4CA6FD'
                ];
                
                // Use a hash function to consistently get the same color for the same username
                const colorIndex = Math.abs(otherUser.username.split('').reduce((acc, char) => 
                    acc + char.charCodeAt(0), 0) % avatarColors.length);
                
                const avatarColor = avatarColors[colorIndex];
                
                avatar.style.backgroundColor = avatarColor;
                avatar.textContent = initials;
            }
            
            // Create info container
            const infoContainer = document.createElement('div');
            infoContainer.className = 'request-info';
            
            // Add name
            const name = document.createElement('h3');
            name.textContent = otherUser.username;
            infoContainer.appendChild(name);
            
            // Add type
            const type = document.createElement('p');
            type.className = 'request-type';
            type.textContent = otherUser.userType === 'mentor' ? 'Mentor' : 'Student';
            infoContainer.appendChild(type);
            
            // Add message
            const message = document.createElement('p');
            message.className = 'request-message';
            message.textContent = request.message;
            infoContainer.appendChild(message);
            
            // Add status
            const status = document.createElement('p');
            status.className = `request-status ${request.status}`;
            status.textContent = request.status.charAt(0).toUpperCase() + request.status.slice(1);
            infoContainer.appendChild(status);
            
            // Add action buttons if user is a mentor and request is pending
            if (currentUser.userType === 'mentor' && request.status === 'pending') {
                const actionButtons = document.createElement('div');
                actionButtons.className = 'request-actions';
                
                // Accept button
                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'btn-primary accept-btn';
                acceptBtn.textContent = 'Accept';
                acceptBtn.addEventListener('click', function() {
                    acceptRequest(request.id);
                });
                
                // Decline button
                const declineBtn = document.createElement('button');
                declineBtn.className = 'btn-secondary decline-btn';
                declineBtn.textContent = 'Decline';
                declineBtn.addEventListener('click', function() {
                    declineRequest(request.id);
                });
                
                actionButtons.appendChild(acceptBtn);
                actionButtons.appendChild(declineBtn);
                infoContainer.appendChild(actionButtons);
            }
            
            // Assemble request card
            requestCard.appendChild(avatar);
            requestCard.appendChild(infoContainer);
            
            // Add to requests list
            requestsList.appendChild(requestCard);
        }
    });
}

// Accept a mentorship request
function acceptRequest(requestId) {
    const requests = JSON.parse(localStorage.getItem('mentorRequests') || '[]');
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex !== -1) {
        // Update request status
        requests[requestIndex].status = 'accepted';
        localStorage.setItem('mentorRequests', JSON.stringify(requests));
        
        // Add to connections
        const request = requests[requestIndex];
        const connections = JSON.parse(localStorage.getItem('connections') || '[]');
        
        connections.push({
            id: Date.now().toString(),
            mentorId: request.mentorId,
            studentId: request.studentId,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('connections', JSON.stringify(connections));
        
        // Reload requests and connections
        loadRequests();
        loadConnections();
        
        alert('Request accepted! A new connection has been established.');
    }
}

// Decline a mentorship request
function declineRequest(requestId) {
    const requests = JSON.parse(localStorage.getItem('mentorRequests') || '[]');
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex !== -1) {
        // Update request status
        requests[requestIndex].status = 'declined';
        localStorage.setItem('mentorRequests', JSON.stringify(requests));
        
        // Reload requests
        loadRequests();
        
        alert('Request declined.');
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
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}
