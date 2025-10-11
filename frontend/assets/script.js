// Login handler function
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Get the role from URL parameters
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");

    // Basic validation
    if (!username || !password) {
        alert('Please enter both username and password');
        return false;
    }

    // Simulate authentication (replace with actual authentication later)
    if (role === "admin") {
        // Redirect to adminDashboard.html (note the capital D)
        window.location.href = "adminDashboard.html";
    } else if (role === "student") {
        // TODO: Add student dashboard redirect
        window.location.href = "studentDashboard.html";
    }

    return false;
}

// Logout handler
function handleLogout() {
    // Clear any stored session/local storage if needed
    window.location.href = "index.html";
}

// Set login page title based on role
function setLoginTitle() {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    const loginTitle = document.getElementById("loginTitle");
    
    if (loginTitle && role) {
        loginTitle.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;
    }
}

// Call setLoginTitle when the page loads
document.addEventListener('DOMContentLoaded', setLoginTitle);