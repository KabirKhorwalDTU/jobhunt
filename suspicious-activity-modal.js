/**
 * Suspicious Activity Modal
 * Automatically displays on page load
 */

document.addEventListener('DOMContentLoaded', function() {
    // Show modal immediately on page load
    showSuspiciousActivityModal();

    // Prevent scrolling when modal is active
    document.body.style.overflow = 'hidden';
});

/**
 * Display the suspicious activity modal
 */
function showSuspiciousActivityModal() {
    const modal = document.getElementById('suspicious-activity-modal');
    const mainContent = document.getElementById('main-content');

    if (modal) {
        modal.style.display = 'flex';

        // Apply blur effect to main content
        if (mainContent) {
            mainContent.style.filter = 'blur(5px)';
            mainContent.style.pointerEvents = 'none';
        }
    }
}

/**
 * Hide the suspicious activity modal
 * (Can be called programmatically if needed)
 */
function hideSuspiciousActivityModal() {
    const modal = document.getElementById('suspicious-activity-modal');
    const mainContent = document.getElementById('main-content');

    if (modal) {
        modal.style.display = 'none';

        // Remove blur effect from main content
        if (mainContent) {
            mainContent.style.filter = 'none';
            mainContent.style.pointerEvents = 'auto';
        }

        // Re-enable scrolling
        document.body.style.overflow = 'auto';
    }
}

/**
 * Optional: Add click outside modal to close (uncomment if needed)
 */
// document.getElementById('suspicious-activity-modal').addEventListener('click', function(e) {
//     if (e.target === this) {
//         hideSuspiciousActivityModal();
//     }
// });

/**
 * Optional: Add ESC key to close modal (uncomment if needed)
 */
// document.addEventListener('keydown', function(e) {
//     if (e.key === 'Escape') {
//         hideSuspiciousActivityModal();
//     }
// });

/**
 * Global function to trigger modal programmatically
 * Usage: Call this function when suspicious activity is detected
 */
window.triggerSuspiciousActivityModal = function() {
    showSuspiciousActivityModal();
};

/**
 * Example: Trigger modal based on backend response
 * Uncomment and modify as needed for your use case
 */
/*
async function checkUserStatus() {
    try {
        const response = await fetch('/api/check-user-status');
        const data = await response.json();

        if (data.suspiciousActivity === true) {
            showSuspiciousActivityModal();
        }
    } catch (error) {
        console.error('Error checking user status:', error);
    }
}

// Call on page load
checkUserStatus();
*/
