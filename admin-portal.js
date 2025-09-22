// Admin credentials (in production, this would be handled by a secure backend)
const adminCredentials = {
    username: 'admin',
    password: 'admin123'
};

// Time slots (25 slots as requested)
const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM',
    '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM',
    '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'
];

// DOM elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const adminActions = document.getElementById('adminActions');
const adminName = document.getElementById('adminName');
const logoutBtn = document.getElementById('logoutBtn');
const totalBookingsEl = document.getElementById('totalBookings');
const todayBookingsEl = document.getElementById('todayBookings');
const availableSlotsEl = document.getElementById('availableSlots');
const slotDistrictSelect = document.getElementById('slotDistrict');
const slotDateInput = document.getElementById('slotDate');
const loadSlotsBtn = document.getElementById('loadSlotsBtn');
const slotsGrid = document.getElementById('slotsGrid');
const timeSlotsList = document.getElementById('timeSlotsList');
const bookingsTableBody = document.getElementById('bookingsTableBody');

// Set default date to today
slotDateInput.value = new Date().toISOString().split('T')[0];

// Event listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
loadSlotsBtn.addEventListener('click', loadSlots);

// Check if admin is already logged in
checkAuthStatus();

function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        loginError.style.display = 'none';
        showDashboard();
    } else {
        loginError.style.display = 'block';
    }
}

function handleLogout() {
    localStorage.removeItem('adminLoggedIn');
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    adminActions.style.display = 'none';
    loginForm.reset();
}

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    adminActions.style.display = 'flex';
    adminName.textContent = 'Welcome, Admin';
    
    loadDashboardData();
    loadBookingsTable();
}

function loadDashboardData() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const todayBookings = bookings.filter(booking => booking.date === today);
    const totalSlots = 25;
    const bookedSlotsToday = todayBookings.length;
    const availableSlots = totalSlots - bookedSlotsToday;
    
    totalBookingsEl.textContent = bookings.length;
    todayBookingsEl.textContent = todayBookings.length;
    availableSlotsEl.textContent = availableSlots;
}

function loadSlots() {
    const selectedDate = slotDateInput.value;
    const selectedDistrict = slotDistrictSelect.value;
    
    if (!selectedDate) {
        alert('Please select a date');
        return;
    }
    
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const dayBookings = bookings.filter(booking => 
        booking.date === selectedDate && 
        (selectedDistrict === '' || booking.district.toLowerCase().includes(selectedDistrict))
    );
    
    const bookedSlots = dayBookings.map(booking => booking.timeSlot);
    
    timeSlotsList.innerHTML = timeSlots.map(slot => {
        const isBooked = bookedSlots.includes(slot);
        const statusClass = isBooked ? 'btn-secondary' : 'btn-primary';
        const statusText = isBooked ? 'Booked' : 'Available';
        
        return `
            <div class="btn ${statusClass}" style="padding: 8px; text-align: center; font-size: 12px;">
                <div>${slot}</div>
                <div style="font-size: 10px; margin-top: 2px;">${statusText}</div>
            </div>
        `;
    }).join('');
    
    slotsGrid.style.display = 'block';
}

function loadBookingsTable() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Sort bookings by date and time (most recent first)
    bookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    
    bookingsTableBody.innerHTML = bookings.map(booking => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px;">${booking.id}</td>
            <td style="padding: 12px;">${booking.name}</td>
            <td style="padding: 12px;">${booking.service}</td>
            <td style="padding: 12px;">${booking.center}</td>
            <td style="padding: 12px;">${new Date(booking.date).toLocaleDateString()}</td>
            <td style="padding: 12px;">${booking.timeSlot}</td>
            <td style="padding: 12px;">
                <span class="btn btn-primary" style="padding: 4px 8px; font-size: 12px;">
                    ${booking.status}
                </span>
            </td>
            <td style="padding: 12px;">
                <button onclick="cancelBooking('${booking.id}')" class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;">
                    Cancel
                </button>
            </td>
        </tr>
    `).join('');
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings = bookings.filter(booking => booking.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Refresh dashboard
        loadDashboardData();
        loadBookingsTable();
        
        alert('Booking cancelled successfully');
    }
}

// Auto-refresh dashboard data every 30 seconds
setInterval(() => {
    if (dashboardSection.style.display !== 'none') {
        loadDashboardData();
        loadBookingsTable();
    }
}, 30000);
