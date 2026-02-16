# Suspicious Activity Modal - Implementation Guide

This implementation creates a modal that matches the mobile app's "Suspicious Activity Detected" design for your Dealshare website.

## Files Created

1. **suspicious-activity-modal.html** - Main HTML structure
2. **suspicious-activity-modal.css** - Styling and animations
3. **suspicious-activity-modal.js** - Modal functionality

## Features

✅ **Full-page overlay** - Blocks all interaction with the page
✅ **Auto-display on page load** - Modal appears automatically
✅ **Blur background** - Main content is blurred when modal is active
✅ **Responsive design** - Works on desktop, tablet, and mobile
✅ **Smooth animations** - Fade-in and slide-up effects
✅ **Exact design match** - Recreates the mobile app design with user icon and error badge

## Design Elements

- **User silhouette icon** - Gray circular icon with simplified user shape
- **Red error badge** - Red circle with white X mark positioned at bottom-right of user icon
- **Bold title** - "Suspicious Activity Detected"
- **Descriptive message** - Warning about restricted access
- **Clean white modal** - Rounded corners, centered layout

## How to Integrate into Your Website

### Option 1: Standalone Page (Testing)
Simply open `suspicious-activity-modal.html` in your browser to see the modal in action.

### Option 2: Integration into Existing Website

Add these lines to your existing HTML page:

```html
<!-- In your <head> section -->
<link rel="stylesheet" href="suspicious-activity-modal.css">

<!-- Before closing </body> tag -->
<div id="suspicious-activity-modal" class="modal-overlay">
    <div class="modal-container">
        <div class="modal-icon">
            <div class="user-icon">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="35" r="18" fill="#8B9AA8"/>
                    <path d="M 25 75 Q 25 55 50 55 Q 75 55 75 75 Z" fill="#8B9AA8"/>
                </svg>
            </div>
            <div class="error-badge">
                <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="30" cy="30" r="28" fill="#E74C3C"/>
                    <line x1="20" y1="20" x2="40" y2="40" stroke="white" stroke-width="5" stroke-linecap="round"/>
                    <line x1="40" y1="20" x2="20" y2="40" stroke="white" stroke-width="5" stroke-linecap="round"/>
                </svg>
            </div>
        </div>

        <h2 class="modal-title">Suspicious Activity Detected</h2>

        <p class="modal-message">
            We've restricted your access due to unusual or abusive behavior. Repeated abuse may result in permanent suspension.
        </p>
    </div>
</div>

<script src="suspicious-activity-modal.js"></script>
```

## Triggering Options

### 1. Auto-display on Page Load (Current Default)
Modal appears automatically when the page loads. No additional code needed.

### 2. Trigger Programmatically
Call this function anywhere in your JavaScript:

```javascript
window.triggerSuspiciousActivityModal();
```

### 3. Backend-Triggered
Uncomment the example code in `suspicious-activity-modal.js` and modify the API endpoint:

```javascript
async function checkUserStatus() {
    const response = await fetch('/api/check-user-status');
    const data = await response.json();

    if (data.suspiciousActivity === true) {
        showSuspiciousActivityModal();
    }
}
```

### 4. Conditional Display
Show modal based on specific conditions:

```javascript
// Example: Show after 3 failed login attempts
if (failedLoginAttempts >= 3) {
    window.triggerSuspiciousActivityModal();
}
```

## Optional Features (Commented Out)

In `suspicious-activity-modal.js`, you can uncomment:

1. **Click outside to close** - Closes modal when clicking the dark overlay
2. **ESC key to close** - Closes modal when pressing the Escape key

## Customization

### Change Colors
In `suspicious-activity-modal.css`:

```css
/* User icon background */
.user-icon {
    background: linear-gradient(135deg, #8B9AA8 0%, #A8B5C2 100%);
}

/* Error badge color */
.error-badge {
    background-color: #E74C3C; /* Change to your preferred red */
}
```

### Change Text
In the HTML modal section:

```html
<h2 class="modal-title">Your Custom Title</h2>
<p class="modal-message">Your custom message here.</p>
```

### Change Animation
In `suspicious-activity-modal.css`:

```css
@keyframes slideUp {
    from {
        transform: translateY(50px); /* Adjust distance */
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- Modal is **informational only** (no action buttons as requested)
- Background content is **completely blocked** during modal display
- Modal is **fully responsive** and adapts to all screen sizes
- The design **exactly matches** the mobile app screenshot provided

## File Structure

```
Documents/
├── suspicious-activity-modal.html
├── suspicious-activity-modal.css
├── suspicious-activity-modal.js
└── README.md
```

## Need Help?

For modifications or questions, refer to the inline comments in each file or ask for assistance!
