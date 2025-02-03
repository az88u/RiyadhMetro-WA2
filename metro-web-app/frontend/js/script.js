// Constants
const API_URL = 'http://localhost:5000/api';

// Authentication Functions
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
    }
    return JSON.parse(user); // Return user object for use
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Navigation and Section Display
function showSection(sectionId) {
    // Admin section check
    if (sectionId === 'admin-section') {
        const user = checkAuth();
        if (!user || user.userType !== 'admin') {
            alert('Access denied: Admins only');
            return;
        }
    }

    // Hide all sections
    const sections = document.querySelectorAll('main > section');
    sections.forEach((section) => {
        section.style.display = 'none';
    });

    // Show the specified section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// Ticket Functions
async function purchaseTicket(event) {
    event.preventDefault();
    const ticketType = document.getElementById('ticketType').value;
    const token = localStorage.getItem('token');

    if (!ticketType) {
        document.getElementById('message').textContent = 'Please select a ticket type';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tickets/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ ticketType })
        });
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('message').textContent = 'Ticket purchased successfully!';
            loadTickets(); // Refresh tickets list
        } else {
            document.getElementById('message').textContent = data.message || 'Purchase failed';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'Error purchasing ticket';
    }
}


function displayTickets(tickets) {
    const ticketList = document.getElementById('ticket-list');
    if (!ticketList) return;

    ticketList.innerHTML = tickets.length ? '' : '<li>No tickets found</li>';
    tickets.forEach(ticket => {
        const li = document.createElement('li');
        li.textContent = `Type: ${ticket.ticketType}, Valid until: ${new Date(ticket.expiryDate).toLocaleString()}`;
        ticketList.appendChild(li);
    });
}

// Admin Functions
async function loadAdminData() {
    const token = localStorage.getItem('token');
    try {
        
        const [usersResponse, ticketsResponse] = await Promise.all([
            fetch(`${API_URL}/admin/users`, {
                headers: { 'x-auth-token': token }
            }),
            fetch(`${API_URL}/admin/tickets`, {
                headers: { 'x-auth-token': token }
            })
        ]);

        const [users, tickets] = await Promise.all([
            usersResponse.json(),
            ticketsResponse.json()
        ]);

        displayUsers(users);
        displayAdminTickets(tickets);
    } catch (error) {
        console.error('Error loading admin data:', error);
        alert('Error loading admin data');
    }
}

function displayUsers(users) {
    const userList = document.getElementById('user-list');
    if (!userList) return;

    userList.innerHTML = users.length ? '' : '<li>No users found</li>';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `Username: ${user.username}, Email: ${user.email}, Type: ${user.userType}`;
        userList.appendChild(li);
    });
}

function displayAdminTickets(tickets) {
    const ticketList = document.getElementById('admin-ticket-list');
    if (!ticketList) return;

    ticketList.innerHTML = tickets.length ? '' : '<li>No tickets found</li>';
    tickets.forEach(ticket => {
        const li = document.createElement('li');
        li.textContent = `User: ${ticket.user.username}, Type: ${ticket.ticketType}, Status: ${ticket.status}`;
        ticketList.appendChild(li);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded');

    const homeButton = document.querySelector('[id="home-link"]');
    if (homeButton) {
        homeButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            window.location.reload(); 
            
            showSection('home-section'); 
        });
    }
    const menuToggle = document.getElementById('menu-toggle');
    const menuDropdown = document.querySelector('.menu-dropdown');
    const userName = document.getElementById('user-name');
    const logoutLink = document.getElementById('logout-link');
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
        userName.textContent = user.username;
    }

    
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('show');
        });

        
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target)) {
                menuDropdown.classList.remove('show');
            }
        });
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout(); 
        });
    }
    function logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Login form found');
        loginForm.addEventListener('submit', handleLogin);
    }

    if (window.location.pathname.includes('app.html')) {
        const user = checkAuth();
        if (user?.userType === 'admin') {
            const adminLink = document.getElementById('admin-link');
        if (adminLink) {
            adminLink.style.display = 'block';
        }
        }
        showSection('home-section');
    }
    //ffffffff

    const buyTicketsLink = document.getElementById('buy-tickets');
    const myTicketsLink = document.getElementById('my-tickets');

    if (buyTicketsLink) {
        buyTicketsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('purchase-section');
        });
    }

    if (myTicketsLink) {
        myTicketsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('tickets-section');
            loadTickets();
        });
    }
    const buyTicketsBtn = document.querySelector('.action-btn:has(span:contains("Buy Tickets"))');
    const myTicketsBtn = document.querySelector('.action-btn:has(span:contains("My Tickets"))');
    const routesBtn = document.querySelector('.action-btn:has(span:contains("Routes"))');
    const menuBtn = document.querySelector('.menu-icon');

    // Add click handlers for quick action buttons
    if (buyTicketsBtn) {
        buyTicketsBtn.addEventListener('click', () => {
            showSection('purchase-section');
        });
    }

    if (myTicketsBtn) {
        myTicketsBtn.addEventListener('click', () => {
            showSection('tickets-section');
            loadTickets(); // Load user's tickets
        });
    }

    if (routesBtn) {
        routesBtn.addEventListener('click', () => {
            showSection('routes-section');
        });
    }

    // Bottom navigation
    const homeNav = document.getElementById('Home');
    const mapNav = document.getElementById('Map');
    const ticketsNav = document.getElementById('Tickets');

    if (homeNav) {
        homeNav.addEventListener('click', () => {
            showSection('home-section');
        });
    }

    if (mapNav) {
        mapNav.addEventListener('click', () => {
            showSection('map-section');
        });
    }

    if (ticketsNav) {
        ticketsNav.addEventListener('click', () => {
            showSection('tickets-section');
            loadTickets();
        });
    }

    // Menu icon (top left button)
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const dropdown = document.querySelector('.menu-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });
    }
});


    // Navigation event listeners using event delegation
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, .action-btn');
        if (!target) return;

        e.preventDefault();
        
        switch(target.id) {
            case 'home-link':
                showSection('home-section');
                break;
            case 'purchase-link':
                showSection('purchase-section');
                break;
            case 'my-tickets-link':
                showSection('tickets-section');
                loadTickets();
                break;
            case 'admin-link':
                showSection('admin-section');
                loadAdminData();
                break;
            case 'logout-link':
                logout();
                break;
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
        // Handle navigation links
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('./')) {
                    e.preventDefault();
                    window.location.href = href;
                }
            });
        });
    });
    // Register form handler if present
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Ticket form handler if present
    const ticketForm = document.getElementById('ticket-form');
    if (ticketForm) {
        ticketForm.addEventListener('submit', purchaseTicket);
    }
;
    // Registration Handler
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Validation
    if (!username || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Password validation (at least 6 characters)
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    try {
        console.log('Attempting to register...'); // Debug log
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password,
                userType: 'user' // Default user type
            })
        });

        console.log('Response status:', response.status); // Debug log
        const data = await response.json();
        console.log('Response data:', data); // Debug log

        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    }
}

// Add event listener for registration form
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        console.log('Register form found'); // Debug log
        registerForm.addEventListener('submit', handleRegister);
    }
});


// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt started'); // Debug log

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Response status:', response.status); // Debug log

        const data = await response.json();
        console.log('Response data:', data); // Debug log

        if (response.ok) {
            // Store token
            localStorage.setItem('token', data.token);
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on user type
            if (data.user.userType === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'app.html';
            }
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded'); // Debug log
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Login form found'); // Debug log
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username')?.value;
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;

    if (!username || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful!');
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
    }
}


const riyadhLocations = {
    // Shopping Centers
    "Al Nakheel Mall": { lat: 24.7768, lng: 46.7252 },
    "Kingdom Centre": { lat: 24.7112, lng: 46.6743 },
    "Riyadh Park": { lat: 24.7747, lng: 46.6977 },
    "Granada Center": { lat: 24.7276, lng: 46.7485 },
    "Hayat Mall": { lat: 24.7699, lng: 46.7850 },
    
    // Universities
    "King Saud University": { lat: 24.7136, lng: 46.6152 },
    "Princess Nourah University": { lat: 24.8466, lng: 46.7248 },
    "Imam University": { lat: 24.8157, lng: 46.7016 },
    
    // Hospitals
    "King Faisal Hospital": { lat: 24.6741, lng: 46.6843 },
    "King Khalid Hospital": { lat: 24.6935, lng: 46.7245 },
    
    // Business Districts
    "KAFD": { lat: 24.7668, lng: 46.6430 },
    "Olaya Towers": { lat: 24.6941, lng: 46.6851 },
    
    // Landmarks
    "National Museum": { lat: 24.6287, lng: 46.7128 },
    "King Abdullah Park": { lat: 24.6913, lng: 46.7259 },
    "Diriyah": { lat: 24.7334, lng: 46.5729 },
    
    // Sports Venues
    "King Fahd Stadium": { lat: 24.7895, lng: 46.8400 },
    "King Saud University Stadium": { lat: 24.7115, lng: 46.6252 },
    
    // Transport Hubs
    "King Khalid Airport": { lat: 24.9578, lng: 46.6989 },
    "Olaya Bus Station": { lat: 24.6998, lng: 46.6841 },
    
    // Residential Areas
    "Al Olaya District": { lat: 24.7000, lng: 46.6750 },
    "Al Malqa District": { lat: 24.8183, lng: 46.6274 },
    "Al Nakheel District": { lat: 24.7704, lng: 46.7397 },
    "Al Wurud District": { lat: 24.6935, lng: 46.6851 },
    "Al Yasmin District": { lat: 24.8228, lng: 46.6446 }
};
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('destination-search');
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchInput.parentNode.appendChild(searchResults);

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();

        if (searchTerm === '') {
            searchResults.style.display = 'none';
            return;
        }

        const matches = Object.keys(riyadhLocations).filter(location => 
            location.toLowerCase().includes(searchTerm)
        );

        if (matches.length > 0) {
            searchResults.innerHTML = '';
            matches.forEach(location => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.textContent = location;
                div.addEventListener('click', function() {
                    searchInput.value = location;
                    searchResults.style.display = 'none';
                    findRouteToLocation(location); // Automatically find route when location is selected
                });
                searchResults.appendChild(div);
            });
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    No locations found
                </div>
            `;
            searchResults.style.display = 'block';
        }
    });

    // Function to find route to selected location
    async function findRouteToLocation(locationName) {
        const selectedLocation = riyadhLocations[locationName];
        if (!selectedLocation) return;

        try {
            // Get or update user location
            if (!userLocation) {
                await getUserLocation();
            }

            // Find nearest stations
            const nearestStations = findNearestStations(userLocation, selectedLocation);
            
            // Display results
            const routeResults = document.getElementById('route-results');
            routeResults.innerHTML = `
                <div class="route-summary">
                    <h3>Your Route</h3>
                    <div class="station-info">
                        <div class="from-station">
                            <i class="fas fa-walking"></i>
                            <span>Nearest station to you:</span>
                            <strong>${nearestStations.fromStation.name}</strong>
                            <small>(${nearestStations.fromStation.distance.toFixed(1)} km away)</small>
                        </div>
                        <div class="to-station">
                            <i class="fas fa-location-dot"></i>
                            <span>Nearest station to destination:</span>
                            <strong>${nearestStations.toStation.name}</strong>
                            <small>(${nearestStations.toStation.distance.toFixed(1)} km away)</small>
                        </div>
                    </div>
                </div>
            `;
            routeResults.style.display = 'block';

            // Automatically set stations and find route
            document.getElementById('start-station').value = nearestStations.fromStation.id;
            document.getElementById('end-station').value = nearestStations.toStation.id;
            document.getElementById('find-route').click();
            
        } catch (error) {
            console.error('Error finding route:', error);
            alert('Error finding route. Please try again.');
        }
    }

    // Function to find nearest stations
    function findNearestStations(userLoc, destLoc) {
        // Calculate distances to all stations
        const stations = [];
        Object.entries(metroNetwork.stations).forEach(([line, lineStations]) => {
            lineStations.forEach(station => {
                stations.push({
                    ...station,
                    line,
                    fromDistance: calculateDistance(
                        userLoc.lat, userLoc.lng,
                        station.coordinates[0], station.coordinates[1]
                    ),
                    toDistance: calculateDistance(
                        destLoc.lat, destLoc.lng,
                        station.coordinates[0], station.coordinates[1]
                    )
                });
            });
        });

        // Find nearest station to user
        const fromStation = stations.reduce((nearest, station) => 
            station.fromDistance < nearest.fromDistance ? station : nearest
        , { fromDistance: Infinity });

        // Find nearest station to destination
        const toStation = stations.reduce((nearest, station) => 
            station.toDistance < nearest.toDistance ? station : nearest
        , { toDistance: Infinity });

        return {
            fromStation: {
                id: fromStation.id,
                name: fromStation.name,
                distance: fromStation.fromDistance
            },
            toStation: {
                id: toStation.id,
                name: toStation.name,
                distance: toStation.toDistance
            }
        };
    }

    // Helper function to calculate distance
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function toRad(degrees) {
        return degrees * Math.PI / 180;
    }

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
});

let selectedTicketType = null;

function selectTicket(element) {
    // Remove selection from all cards
    document.querySelectorAll('.ticket-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    element.classList.add('selected');
    selectedTicketType = element.dataset.type;
    
    // Show purchase summary
    const summary = document.getElementById('purchase-summary');
    summary.style.display = 'block';
    
    // Update summary info
    document.getElementById('selected-ticket-info').innerHTML = `
        <div class="selected-ticket">
            <div class="ticket-type">${element.querySelector('.ticket-type').textContent}</div>
            <div class="ticket-price">${element.querySelector('.ticket-price').textContent}</div>
        </div>
    `;
}

// Generate QR code for ticket
function generateTicketQR(ticketData) {
    const qrContainer = document.createElement('div');
    new QRCode(qrContainer, {
        text: JSON.stringify(ticketData),
        width: 128,
        height: 128
    });
    return qrContainer;
}

// Purchase ticket handler
document.getElementById('confirm-purchase')?.addEventListener('click', async () => {
    if (!selectedTicketType) {
        alert('Please select a ticket type');
        return;
    }

    try {
        // Create ticket data
        const ticketData = {
            type: selectedTicketType,
            purchaseDate: new Date(),
            validUntil: new Date(Date.now() + getValidityPeriod(selectedTicketType)),
            ticketId: Math.random().toString(36).substr(2, 9)
        };

        // Add ticket to display
        const ticketList = document.getElementById('ticket-list');
        const ticketElement = document.createElement('div');
        ticketElement.className = 'ticket';
        ticketElement.innerHTML = `
            <div class="ticket-header">
                <span>${getTicketTypeName(selectedTicketType)}</span>
                <span>Active</span>
            </div>
            <div class="ticket-body">
                <div class="ticket-qr"></div>
                <div class="ticket-info">
                    <p><strong>Valid Until:</strong> ${ticketData.validUntil.toLocaleString()}</p>
                    <p><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
                </div>
            </div>
        `;

        // Add QR code
        const qrCode = generateTicketQR(ticketData);
        ticketElement.querySelector('.ticket-qr').appendChild(qrCode);
        
        ticketList.insertBefore(ticketElement, ticketList.firstChild);
        
        // Reset selection
        selectedTicketType = null;
        document.querySelectorAll('.ticket-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('purchase-summary').style.display = 'none';
        
        alert('Ticket purchased successfully!');
        
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        alert('Error purchasing ticket. Please try again.');
    }
});

function getValidityPeriod(type) {
    switch(type) {
        case '2hours': return 2 * 60 * 60 * 1000;
        case '1day': return 24 * 60 * 60 * 1000;
        case '1month': return 30 * 24 * 60 * 60 * 1000;
        default: return 0;
    }
}

function getTicketTypeName(type) {
    switch(type) {
        case '2hours': return '2 Hour Pass';
        case '1day': return 'Day Pass';
        case '1month': return 'Month Pass';
        default: return 'Ticket';
    }
}


function saveTicket(ticketData) {
    // Get existing tickets or initialize empty array
    const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    // Add new ticket
    existingTickets.push(ticketData);
    // Save back to localStorage
    localStorage.setItem('userTickets', JSON.stringify(existingTickets));
}

function loadUserTickets() {
    const tickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    const ticketList = document.getElementById('ticket-list');
    if (!ticketList) return;

    ticketList.innerHTML = ''; // Clear existing tickets

    if (tickets.length === 0) {
        ticketList.innerHTML = '<div class="no-tickets">No tickets found</div>';
        return;
    }

    tickets.forEach(ticket => {
        const ticketElement = document.createElement('div');
        ticketElement.className = 'ticket';
        ticketElement.innerHTML = `
            <div class="ticket-header">
                <span>${getTicketTypeName(ticket.type)}</span>
                <span>${isTicketValid(ticket.validUntil) ? 'Active' : 'Expired'}</span>
            </div>
            <div class="ticket-body">
                <div class="ticket-qr" id="qr-${ticket.ticketId}"></div>
                <div class="ticket-info">
                    <p><strong>Valid Until:</strong> ${new Date(ticket.validUntil).toLocaleString()}</p>
                    <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
                </div>
            </div>
        `;

        ticketList.appendChild(ticketElement);

        // Generate QR code
        new QRCode(document.getElementById(`qr-${ticket.ticketId}`), {
            text: JSON.stringify(ticket),
            width: 128,
            height: 128
        });
    });
}

function isTicketValid(validUntil) {
    return new Date(validUntil) > new Date();
}

// Update the purchase handler
document.getElementById('confirm-purchase')?.addEventListener('click', async () => {
    if (!selectedTicketType) {
        alert('Please select a ticket type');
        return;
    }

    try {
        // Create ticket data
        const ticketData = {
            type: selectedTicketType,
            purchaseDate: new Date().toISOString(),
            validUntil: new Date(Date.now() + getValidityPeriod(selectedTicketType)).toISOString(),
            ticketId: Math.random().toString(36).substr(2, 9)
        };

        // Save ticket
        saveTicket(ticketData);

        // Reset selection
        selectedTicketType = null;
        document.querySelectorAll('.ticket-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('purchase-summary').style.display = 'none';

        // Show success message and reload tickets
        alert('Ticket purchased successfully!');
        loadUserTickets();
        
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        alert('Error purchasing ticket. Please try again.');
    }
});






// Function to handle ticket purchase
document.addEventListener('DOMContentLoaded', () => {
    const confirmPurchaseBtn = document.getElementById('confirm-purchase');
    if (confirmPurchaseBtn) {
        confirmPurchaseBtn.addEventListener('click', () => {
            if (!selectedTicketType) {
                alert('Please select a ticket type');
                return;
            }

            try {
                // Create ticket data
                const ticketData = {
                    type: selectedTicketType,
                    purchaseDate: new Date().toISOString(),
                    validUntil: new Date(Date.now() + getValidityPeriod(selectedTicketType)).toISOString(),
                    ticketId: Math.random().toString(36).substr(2, 9)
                };

                // Save ticket to localStorage
                saveTicket(ticketData);

                // Reset selection
                selectedTicketType = null;
                document.querySelectorAll('.ticket-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                const summary = document.getElementById('purchase-summary');
                if (summary) {
                    summary.style.display = 'none';
                }

                alert('Ticket purchased successfully!');
                displayUserTickets(); // Show updated tickets
            } catch (error) {
                console.error('Error purchasing ticket:', error);
                alert('Error purchasing ticket. Please try again.');
            }
        });
    }

    // Load tickets initially
    displayUserTickets();
});

// Helper Functions
function saveTicket(ticketData) {
    const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    existingTickets.push(ticketData);
    localStorage.setItem('userTickets', JSON.stringify(existingTickets));
}

function displayUserTickets() {
    const ticketList = document.getElementById('ticket-list');
    if (!ticketList) return;

    const tickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    
    if (tickets.length === 0) {
        ticketList.innerHTML = '<div class="no-tickets">No tickets found</div>';
        return;
    }

    ticketList.innerHTML = '';
    tickets.forEach(ticket => {
        const ticketElement = document.createElement('div');
        ticketElement.className = 'ticket';
        ticketElement.innerHTML = `
            <div class="ticket-header">
                <span>${getTicketTypeName(ticket.type)}</span>
                <span>${isTicketValid(ticket.validUntil) ? 'Active' : 'Expired'}</span>
            </div>
            <div class="ticket-body">
                <div class="ticket-qr" id="qr-${ticket.ticketId}"></div>
                <div class="ticket-info">
                    <p><strong>Valid Until:</strong> ${new Date(ticket.validUntil).toLocaleString()}</p>
                    <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
                </div>
            </div>
        `;
        ticketList.appendChild(ticketElement);

        // Generate QR code
        new QRCode(document.getElementById(`qr-${ticket.ticketId}`), {
            text: JSON.stringify(ticket),
            width: 128,
            height: 128
        });
    });
}

function getTicketTypeName(type) {
    switch(type) {
        case '2hours': return '2 Hour Pass';
        case '1day': return 'Day Pass';
        case '1month': return 'Month Pass';
        default: return 'Ticket';
    }
}

function getValidityPeriod(type) {
    switch(type) {
        case '2hours': return 2 * 60 * 60 * 1000;
        case '1day': return 24 * 60 * 60 * 1000;
        case '1month': return 30 * 24 * 60 * 60 * 1000;
        default: return 0;
    }
}

function isTicketValid(validUntil) {
    return new Date(validUntil) > new Date();
}
