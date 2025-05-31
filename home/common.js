// Common JavaScript functions for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and update navigation
    updateNavigation();
});

// Update navigation based on user login status
function updateNavigation() {
    const navContainer = document.querySelector('.main-header .container');
    const getStartedBtn = document.querySelector('.nav-btn');
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // User is logged in, replace "Get started" with user profile
        if (getStartedBtn) {
            // Create user profile element
            const userProfileElement = document.createElement('div');
            userProfileElement.className = 'user-profile';
            
            // Determine if user has a profile picture
            let profileHTML = '';
            if (currentUser.profilePic) {
                profileHTML = `<img src="${currentUser.profilePic}" alt="${currentUser.username}" class="user-avatar">`;
            } else {
                // Generate initials for avatar
                const initials = currentUser.username.split(' ')
                    .map(name => name.charAt(0))
                    .join('')
                    .toUpperCase();
                
                const avatarColors = [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#A5FFD6',
                    '#FFC145', '#FF6B8B', '#C04CFD', '#FD4C4C', '#4CA6FD'
                ];
                
                // Use a hash function to consistently get the same color for the same username
                const colorIndex = Math.abs(currentUser.username.split('').reduce((acc, char) => 
                    acc + char.charCodeAt(0), 0) % avatarColors.length);
                
                const avatarColor = avatarColors[colorIndex];
                
                profileHTML = `<div class="user-avatar-initials" style="background-color: ${avatarColor};">${initials}</div>`;
            }
            
            // Set the HTML for the user profile
            userProfileElement.innerHTML = `
                ${profileHTML}
                <div class="user-info">
                    <span class="user-name">${currentUser.username}</span>
                    <span class="user-type">${currentUser.userType === 'mentor' ? 'Mentor' : 'Student'}</span>
                </div>
                <div class="user-dropdown">
                    <button class="dropdown-btn"><i class="fas fa-chevron-down"></i></button>
                    <div class="dropdown-content">
                        <a href="" id="profileLink">My Profile</a>
                        <a href="#" id="logoutLink">Logout</a>
                    </div>
                </div>
            `;
            
            // Replace the "Get started" button with the user profile
            navContainer.replaceChild(userProfileElement, getStartedBtn);
            
            // Check for pending requests if user is a mentor
            if (currentUser.userType === 'mentor') {
                checkPendingRequests(userProfileElement);
            }
            
            // Add event listeners for the dropdown
            const dropdownBtn = userProfileElement.querySelector('.dropdown-btn');
            const dropdownContent = userProfileElement.querySelector('.dropdown-content');
            
            dropdownBtn.addEventListener('click', function() {
                dropdownContent.classList.toggle('show');
            });
            
            // Close the dropdown when clicking outside
            window.addEventListener('click', function(e) {
                if (!e.target.matches('.dropdown-btn') && !e.target.matches('.fa-chevron-down')) {
                    if (dropdownContent.classList.contains('show')) {
                        dropdownContent.classList.remove('show');
                    }
                }
            });
            
            // Add event listener for logout
            const logoutLink = document.getElementById('logoutLink');
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove current user from localStorage
                localStorage.removeItem('currentUser');
                
                // Redirect to home page
                window.location.href = getHomePagePath();
            });
            
            // Add event listener for profile link and set correct path
            const profileLink = document.getElementById('profileLink');
            
            // Set the correct path to profile.html based on current location
            if (window.location.pathname.includes('/roadmaps/') || 
                window.location.pathname.includes('/about_us/') ||
                window.location.pathname.includes('/mentors/') ||
                window.location.pathname.includes('/auth/') ||
                window.location.pathname.includes('/admin/')) {
                profileLink.href = '../profile.html';
            } else {
                profileLink.href = 'profile.html';
            }
            
            profileLink.addEventListener('click', function(e) {
                // No need to prevent default as we want to navigate to the profile page
            });
        }
    }
}

// Helper function to get the path to the home page based on current location
function getHomePagePath() {
    // Check if we're in a subdirectory
    if (window.location.pathname.includes('/roadmaps/') || 
        window.location.pathname.includes('/about_us/')) {
        return '../home/home.html';
    } else {
        return 'home.html';
    }
}

// Check for pending mentorship requests
function checkPendingRequests(userProfileElement) {
    // Get requests from localStorage
    const requests = JSON.parse(localStorage.getItem('mentorRequests') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Filter pending requests for the current mentor
    const pendingRequests = requests.filter(request => 
        request.mentorId === currentUser.email && request.status === 'pending'
    );
    
    // If there are pending requests, add a notification badge
    if (pendingRequests.length > 0) {
        // Create notification badge
        const badge = document.createElement('div');
        badge.className = 'notification-badge';
        badge.textContent = pendingRequests.length;
        
        // Add badge to user profile element
        userProfileElement.appendChild(badge);
        
        // Add notification to profile link
        const profileLink = document.getElementById('profileLink');
        profileLink.innerHTML = `My Profile <span class="notification-badge">${pendingRequests.length}</span>`;
    }
}
