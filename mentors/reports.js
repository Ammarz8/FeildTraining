// Mentor Reports JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mentor report modal
    initMentorReportModal();
});

// Initialize the mentor report modal
function initMentorReportModal() {
    const modal = new bootstrap.Modal(document.getElementById('mentorReportModal'));
    const submitReportBtn = document.getElementById('submitReportBtn');
    
    submitReportBtn.addEventListener('click', function() {
        const mentorId = document.getElementById('reportMentorId').value;
        const mentorName = document.getElementById('reportMentorName').value;
        const reportType = document.getElementById('reportType').value;
        const reportContent = document.getElementById('reportContent').value;
        
        if (!reportContent.trim()) {
            alert('Please enter your report content.');
            return;
        }
        
        if (!reportType) {
            alert('Please select a report type.');
            return;
        }
        
        // Send the report
        submitMentorReport(mentorId, mentorName, reportType, reportContent);
        
        // Close the modal
        modal.hide();
    });
}

// Open the mentor report modal
function openReportModal(mentor) {
    const modalTitle = document.getElementById('mentorReportModalLabel');
    const mentorIdInput = document.getElementById('reportMentorId');
    const mentorNameInput = document.getElementById('reportMentorName');
    const reportContentInput = document.getElementById('reportContent');
    const reportTypeSelect = document.getElementById('reportType');
    
    // Set the modal title and mentor ID
    modalTitle.textContent = `Submit Report for ${mentor.username}`;
    mentorIdInput.value = mentor.email;
    mentorNameInput.value = mentor.username;
    reportContentInput.value = '';
    reportTypeSelect.selectedIndex = 0;
    
    // Check if the user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Redirect to login page if not logged in
        window.location.href = '../auth/auth.html?redirect=mentors';
        return;
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('mentorReportModal'));
    modal.show();
}

// Submit a mentor report
function submitMentorReport(mentorId, mentorName, reportType, content) {
    // Get the current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('You must be logged in to submit a report.');
        return;
    }
    
    // Create the report object
    const report = {
        id: generateUniqueId(),
        mentorId: mentorId,
        mentorName: mentorName,
        studentId: currentUser.email,
        studentName: currentUser.username,
        reportType: reportType,
        content: content,
        status: 'pending', // pending, reviewed, closed
        timestamp: new Date().toISOString(),
        adminFeedback: ''
    };
    
    // Get existing reports from localStorage
    const reports = JSON.parse(localStorage.getItem('mentorReports') || '[]');
    
    // Add the new report
    reports.push(report);
    
    // Save the updated reports to localStorage
    localStorage.setItem('mentorReports', JSON.stringify(reports));
    
    // Show success message
    alert('Your report has been submitted successfully. Thank you for your feedback!');
}

// Generate a unique ID for the report
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Add report button to mentor cards
function addReportButtonsToMentorCards() {
    // Get all mentor cards
    const mentorCards = document.querySelectorAll('.mentor-card');
    
    // Add report button to each card
    mentorCards.forEach(card => {
        const actionsDiv = card.querySelector('.mentor-actions');
        const mentorId = card.getAttribute('data-mentor-id');
        const mentorName = card.querySelector('.mentor-info h3').textContent;
        
        // Check if report button already exists
        if (!actionsDiv.querySelector('.report-btn')) {
            // Create report button
            const reportBtn = document.createElement('button');
            reportBtn.className = 'report-btn';
            reportBtn.setAttribute('data-mentor-id', mentorId);
            reportBtn.setAttribute('data-mentor-name', mentorName);
            reportBtn.innerHTML = '<i class="fas fa-flag"></i> Submit Report';
            
            // Add event listener to the report button
            reportBtn.addEventListener('click', function() {
                // Get the mentor object
                const mentors = JSON.parse(localStorage.getItem('mentors') || '[]');
                const mentor = mentors.find(m => m.email === mentorId);
                
                if (mentor) {
                    openReportModal(mentor);
                }
            });
            
            // Add the button to the actions div
            actionsDiv.appendChild(reportBtn);
        }
    });
}

// Call this function after mentors are loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for mentors to be loaded
    setTimeout(addReportButtonsToMentorCards, 500);
});
