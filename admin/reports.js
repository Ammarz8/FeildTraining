// Admin Reports Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    if (typeof initThemeToggle === 'function') {
        initThemeToggle();
    }
    
    // Load admin name if logged in
    loadAdminName();
    
    // Load and display reports
    loadReports();
    
    // Initialize filter functionality
    initFilter();
    
    // Initialize report view modal
    initReportViewModal();
});

// Load admin name from localStorage
function loadAdminName() {
    const adminNameElement = document.getElementById('adminName');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Check if user is an admin
    if (currentUser && currentUser.role === 'admin') {
        adminNameElement.textContent = currentUser.username;
        
        // Clean up any sample reports
        cleanupSampleReports();
        
        // Add logout event listener
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = '../auth/auth.html';
        });
    } else {
        // Redirect to login if not an admin
        window.location.href = '../auth/auth.html?redirect=admin';
    }
}

// Clean up sample reports
function cleanupSampleReports() {
    let reports = JSON.parse(localStorage.getItem('mentorReports') || '[]');
    
    // Keep only reports that have valid student and mentor IDs and were created by the report form
    reports = reports.filter(report => {
        return report.studentId && 
               report.mentorId && 
               report.timestamp && 
               report.content && 
               report.reportType;
    });
    
    // Save the cleaned reports back to localStorage
    localStorage.setItem('mentorReports', JSON.stringify(reports));
}

// Load reports from localStorage and display them
function loadReports() {
    const reportsTableBody = document.getElementById('reportsTableBody');
    const noReportsMessage = document.getElementById('noReportsMessage');
    
    // Get reports from localStorage
    let reports = JSON.parse(localStorage.getItem('mentorReports') || '[]');
    
    // Filter out any random/sample reports by checking if they have studentId and mentorId
    reports = reports.filter(report => report.studentId && report.mentorId);
    
    // Clear the table body
    reportsTableBody.innerHTML = '';
    
    // If there are no reports, show the message
    if (reports.length === 0) {
        noReportsMessage.style.display = 'block';
        updateReportsStats([]);
        return;
    }
    
    // Hide the message
    noReportsMessage.style.display = 'none';
    
    // Get the current filter value
    const statusFilter = document.getElementById('statusFilter').value;
    
    // Filter reports based on status
    const filteredReports = statusFilter === 'all' ? reports : reports.filter(report => report.status === statusFilter);
    
    // If there are no filtered reports, show the message
    if (filteredReports.length === 0) {
        noReportsMessage.style.display = 'block';
        updateReportsStats(reports); // Still show total stats even if filtered view is empty
        return;
    }
    
    // Sort reports by timestamp (newest first)
    filteredReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Add each report to the table
    filteredReports.forEach(report => {
        const row = createReportRow(report);
        reportsTableBody.appendChild(row);
    });
    
    // Update stats with all reports (not just filtered ones)
    updateReportsStats(reports);
}

// Create a report row element
function createReportRow(report) {
    // Create the row element
    const row = document.createElement('tr');
    
    // Format the date
    const reportDate = new Date(report.timestamp);
    const formattedDate = reportDate.toLocaleDateString() + ' ' + reportDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Get the report type display name
    const reportTypeMap = {
        'feedback': 'General Feedback',
        'experience': 'Session Experience',
        'improvement': 'Improvement Suggestions',
        'concern': 'Concerns',
        'praise': 'Praise/Compliment'
    };
    
    const reportTypeDisplay = reportTypeMap[report.reportType] || report.reportType;
    
    // Set the row HTML
    row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${report.studentName}</td>
        <td>${report.mentorName}</td>
        <td>${reportTypeDisplay}</td>
        <td><span class="status-badge status-${report.status}">${report.status}</span></td>
        <td>
            <button class="btn btn-sm btn-primary view-report-btn" data-report-id="${report.id}">
                <i class="fas fa-eye"></i> View
            </button>
        </td>
    `;
    
    // Add event listener to the view button
    const viewBtn = row.querySelector('.view-report-btn');
    viewBtn.addEventListener('click', function() {
        openReportViewModal(report.id);
    });
    
    return row;
}

// Update the reports statistics
function updateReportsStats(reports) {
    const totalReportsElement = document.getElementById('totalReports');
    const pendingReportsElement = document.getElementById('pendingReports');
    const reviewedReportsElement = document.getElementById('reviewedReports');
    const closedReportsElement = document.getElementById('closedReports');
    
    // Count reports by status
    const totalReports = reports.length;
    const pendingReports = reports.filter(report => report.status === 'pending').length;
    const reviewedReports = reports.filter(report => report.status === 'reviewed').length;
    const closedReports = reports.filter(report => report.status === 'closed').length;
    
    // Update the elements
    totalReportsElement.textContent = totalReports;
    pendingReportsElement.textContent = pendingReports;
    reviewedReportsElement.textContent = reviewedReports;
    closedReportsElement.textContent = closedReports;
}

// Initialize filter functionality
function initFilter() {
    const statusFilter = document.getElementById('statusFilter');
    
    // Add event listener to the filter
    statusFilter.addEventListener('change', loadReports);
}

// Initialize the report view modal
function initReportViewModal() {
    const saveReportBtn = document.getElementById('saveReportBtn');
    const markPendingBtn = document.getElementById('markPendingBtn');
    const markReviewedBtn = document.getElementById('markReviewedBtn');
    const markClosedBtn = document.getElementById('markClosedBtn');
    
    // Add event listener to the save button
    saveReportBtn.addEventListener('click', function() {
        saveReportChanges();
    });
    
    // Add event listeners to the status buttons
    markPendingBtn.addEventListener('click', function() {
        document.getElementById('viewReportStatus').textContent = 'pending';
        updateStatusButtonsState('pending');
    });
    
    markReviewedBtn.addEventListener('click', function() {
        document.getElementById('viewReportStatus').textContent = 'reviewed';
        updateStatusButtonsState('reviewed');
    });
    
    markClosedBtn.addEventListener('click', function() {
        document.getElementById('viewReportStatus').textContent = 'closed';
        updateStatusButtonsState('closed');
    });
}

// Open the report view modal
function openReportViewModal(reportId) {
    // Get the report from localStorage
    const reports = JSON.parse(localStorage.getItem('mentorReports') || '[]');
    const report = reports.find(r => r.id === reportId);
    
    if (!report) {
        alert('Report not found.');
        return;
    }
    
    // Get the modal elements
    const viewReportId = document.getElementById('viewReportId');
    const viewReportDate = document.getElementById('viewReportDate');
    const viewReportStatus = document.getElementById('viewReportStatus');
    const viewStudentName = document.getElementById('viewStudentName');
    const viewStudentId = document.getElementById('viewStudentId');
    const viewMentorName = document.getElementById('viewMentorName');
    const viewMentorId = document.getElementById('viewMentorId');
    const viewReportType = document.getElementById('viewReportType');
    const viewReportContent = document.getElementById('viewReportContent');
    const adminFeedback = document.getElementById('adminFeedback');
    
    // Format the date
    const reportDate = new Date(report.timestamp);
    const formattedDate = reportDate.toLocaleDateString() + ' ' + reportDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Get the report type display name
    const reportTypeMap = {
        'feedback': 'General Feedback',
        'experience': 'Session Experience',
        'improvement': 'Improvement Suggestions',
        'concern': 'Concerns',
        'praise': 'Praise/Compliment'
    };
    
    const reportTypeDisplay = reportTypeMap[report.reportType] || report.reportType;
    
    // Set the modal content
    viewReportId.textContent = report.id;
    viewReportDate.textContent = formattedDate;
    viewReportStatus.textContent = report.status;
    viewReportStatus.className = 'report-status status-' + report.status;
    viewStudentName.textContent = report.studentName;
    viewStudentId.textContent = report.studentId;
    viewMentorName.textContent = report.mentorName;
    viewMentorId.textContent = report.mentorId;
    viewReportType.textContent = reportTypeDisplay;
    viewReportContent.textContent = report.content;
    adminFeedback.value = report.adminFeedback || '';
    
    // Update the status buttons state
    updateStatusButtonsState(report.status);
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('reportViewModal'));
    modal.show();
}

// Update the status buttons state
function updateStatusButtonsState(status) {
    const markPendingBtn = document.getElementById('markPendingBtn');
    const markReviewedBtn = document.getElementById('markReviewedBtn');
    const markClosedBtn = document.getElementById('markClosedBtn');
    
    // Reset all buttons
    markPendingBtn.classList.remove('active');
    markReviewedBtn.classList.remove('active');
    markClosedBtn.classList.remove('active');
    
    // Set the active button based on the status
    if (status === 'pending') {
        markPendingBtn.classList.add('active');
    } else if (status === 'reviewed') {
        markReviewedBtn.classList.add('active');
    } else if (status === 'closed') {
        markClosedBtn.classList.add('active');
    }
}

// Save the report changes
function saveReportChanges() {
    // Get the report ID
    const reportId = document.getElementById('viewReportId').textContent;
    
    // Get the new status and admin feedback
    const newStatus = document.getElementById('viewReportStatus').textContent;
    const adminFeedback = document.getElementById('adminFeedback').value;
    
    // Get the reports from localStorage
    const reports = JSON.parse(localStorage.getItem('mentorReports') || '[]');
    
    // Find the report
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) {
        alert('Report not found.');
        return;
    }
    
    // Update the report
    reports[reportIndex].status = newStatus;
    reports[reportIndex].adminFeedback = adminFeedback;
    
    // Save the updated reports to localStorage
    localStorage.setItem('mentorReports', JSON.stringify(reports));
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('reportViewModal'));
    modal.hide();
    
    // Reload the reports
    loadReports();
    
    // Show success message
    alert('Report updated successfully.');
}
