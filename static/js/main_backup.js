/**
 * Main JavaScript file for the Space Exploration & Defense Platform
 * Comprehensive Stellarium-like application with NASA API integration
 */

// Global configuration
const CONFIG = {
    API_BASE: '/api',
    UPDATE_INTERVALS: {
        ISS: 30000,        // 30 seconds
        LIVE_FEED: 60000,  // 1 minute
        WEATHER: 300000    // 5 minutes
    },
    OBSERVER: {
        lat: 0,
        lon: 0,
        elevation: 0
    }
};

// Global state
let currentView = 'stellarium';
let updateIntervals = {};
let maps = {};
let scenes = {};

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('🌌 Initializing Space Explorer Pro...');
    
    // Initialize UI
    initializeNavigation();
    initializeDateTime();
    initializeLocation();
    
    // Load initial data
    loadInitialData();
    
    // Start real-time updates
    startRealTimeUpdates();
    
    console.log('✅ Space Explorer Pro initialized successfully!');
}

/**
 * Initialize navigation system
 */
function initializeNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const view = e.target.getAttribute('data-view');
            switchView(view);
        });
    });
}

/**
 * Switch between different views
 */
function switchView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        currentView = viewName;
        
        // Initialize view-specific functionality
        initializeView(viewName);
    }
}

/**
 * Initialize view-specific functionality
 */
function initializeView(viewName) {
    switch (viewName) {
        case 'stellarium':
            initializeStellariumView();
            break;
        case 'iss':
            initializeISSView();
            break;
        case 'solar-system':
            initializeSolarSystemView();
            break;
        case 'asteroids':
            initializeAsteroidsView();
            break;
        case 'missions':
            loadMissions();
            break;
        case 'live':
            loadLiveFeed();
            break;
    }
}

/**
 * Initialize date and time display
 */
function initializeDateTime() {
    function updateDateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
        
        const currentTimeEl = document.getElementById('current-time');
        if (currentTimeEl) {
            currentTimeEl.textContent = timeString;
        }
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

/**
 * Get user's location and update observer position
 */
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                CONFIG.OBSERVER.lat = position.coords.latitude;
                CONFIG.OBSERVER.lon = position.coords.longitude;
                CONFIG.OBSERVER.elevation = position.coords.altitude || 0;
                
                updateLocationDisplay();
                loadLocationBasedData();
            },
            (error) => {
                console.warn('Geolocation error:', error);
                showNotification('Unable to get location. Using default coordinates.', 'warning');
            }
        );
    } else {
        showNotification('Geolocation not supported by this browser.', 'error');
    }
}
    
    // Format dates for API
    const startDateStr = formatDate(today);
    const endDateStr = formatDate(endDate);
    
    // Fetch asteroid data
    fetch(`/api/asteroids?start_date=${startDateStr}&end_date=${endDateStr}`)
        .then(response => response.json())
        .then(data => {
            // Clear loading option
            asteroidSelect.innerHTML = '';
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select an asteroid...';
            asteroidSelect.appendChild(defaultOption);
            
            // Process asteroid data
            if (data.near_earth_objects) {
                // Flatten the objects by date into a single array
                const asteroids = [];
                Object.keys(data.near_earth_objects).forEach(date => {
                    data.near_earth_objects[date].forEach(asteroid => {
                        asteroids.push({
                            id: asteroid.id,
                            name: asteroid.name,
                            diameter: asteroid.estimated_diameter.meters.estimated_diameter_max,
                            velocity: parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second),
                            missDistance: parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers),
                            date: asteroid.close_approach_data[0].close_approach_date
                        });
                    });
                });
                
                // Sort by closest approach
                asteroids.sort((a, b) => a.missDistance - b.missDistance);
                
                // Add asteroids to select
                asteroids.forEach(asteroid => {
                    const option = document.createElement('option');
                    option.value = asteroid.id;
                    option.textContent = `${asteroid.name} - ${asteroid.date} (${Math.round(asteroid.diameter)}m)`;
                    option.dataset.asteroid = JSON.stringify(asteroid);
                    asteroidSelect.appendChild(option);
                });
            } else {
                // Handle error or empty data
                const errorOption = document.createElement('option');
                errorOption.value = '';
                errorOption.textContent = 'No asteroids found';
                asteroidSelect.appendChild(errorOption);
            }
        })
        .catch(error => {
            console.error('Error fetching asteroid data:', error);
            asteroidSelect.innerHTML = '<option value="">Error loading asteroids</option>';
        });
}

// Initialize all visualization components
function initializeComponents() {
    // Initialize Space View visualization
    initSpaceVisualization('space-canvas-container');
    
    // Initialize Atmosphere Entry visualization
    initAtmosphereVisualization('atmosphere-canvas-container');
    
    // Initialize Impact Map
    initImpactMap('impact-map-container');
    
    // Initialize Consequence charts
    initConsequenceCharts();
    
    // Initialize Game visualization
    initGameVisualization('game-canvas-container');
}

// Setup event listeners for user interactions
function setupEventListeners() {
    // Asteroid selection
    document.getElementById('asteroid-select').addEventListener('change', function() {
        if (this.value === '' || this.value === 'loading') return;
        
        const selectedOption = this.options[this.selectedIndex];
        const asteroidData = JSON.parse(selectedOption.dataset.asteroid);
        
        // Update asteroid properties display
        updateAsteroidProperties(asteroidData);
        
        // Update visualizations with new asteroid
        updateSpaceVisualization(asteroidData);
    });
    
    // Entry angle slider
    document.getElementById('entry-angle').addEventListener('input', function() {
        document.getElementById('entry-angle-display').textContent = this.value + '°';
        updateAtmosphereVisualization();
    });
    
    // Asteroid composition select
    document.getElementById('composition').addEventListener('change', function() {
        updateAtmosphereVisualization();
    });
    
    // Time slider for space view
    document.getElementById('time-slider').addEventListener('input', function() {
        const value = parseInt(this.value);
        const days = value / 10; // Convert slider value to days
        
        // Update time display
        if (value === 0) {
            document.getElementById('time-display').textContent = 'Now';
        } else {
            document.getElementById('time-display').textContent = `+${days.toFixed(1)} days`;
        }
        
        // Update visualization time
        updateSpaceTime(days);
    });
    
    // Time after impact slider
    document.getElementById('time-after-impact').addEventListener('input', function() {
        const value = parseInt(this.value);
        
        // Update time display
        if (value === 0) {
            document.getElementById('time-after-display').textContent = 'Immediate';
        } else if (value <= 10) {
            document.getElementById('time-after-display').textContent = `${value} hours`;
        } else if (value <= 30) {
            document.getElementById('time-after-display').textContent = `${value - 10} days`;
        } else {
            const months = value - 30;
            document.getElementById('time-after-display').textContent = `${months} months`;
        }
        
        // Update consequence visualizations
        updateConsequenceVisualizations(value);
    });
    
    // Game mode controls
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('launch-time').addEventListener('input', function() {
        document.getElementById('launch-time-display').textContent = this.value + ' years';
    });
    document.getElementById('launch-mission').addEventListener('click', launchMission);
}

// Helper functions

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Update asteroid properties display
function updateAsteroidProperties(asteroid) {
    const propertiesDiv = document.getElementById('asteroid-properties');
    
    propertiesDiv.innerHTML = `
        <table>
            <tr>
                <td><strong>Name:</strong></td>
                <td>${asteroid.name}</td>
            </tr>
            <tr>
                <td><strong>Diameter:</strong></td>
                <td>${asteroid.diameter.toFixed(1)} meters</td>
            </tr>
            <tr>
                <td><strong>Velocity:</strong></td>
                <td>${asteroid.velocity.toFixed(2)} km/s</td>
            </tr>
            <tr>
                <td><strong>Miss Distance:</strong></td>
                <td>${(asteroid.missDistance / 1000).toFixed(2)} million km</td>
            </tr>
            <tr>
                <td><strong>Earth Radii:</strong></td>
                <td>${(asteroid.missDistance / 6371).toFixed(1)}</td>
            </tr>
            <tr>
                <td><strong>Close Approach:</strong></td>
                <td>${asteroid.date}</td>
            </tr>
        </table>
    `;
}

// Calculate impact effects
function calculateImpact(asteroid, latitude, longitude, angle, composition) {
    // Build request data
    const requestData = {
        diameter: asteroid.diameter,
        velocity: asteroid.velocity,
        density: getDensityFromComposition(composition),
        angle: angle,
        lat: latitude,
        lng: longitude
    };
    
    // Return a promise that resolves with the impact data
    return fetch('/api/impact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json());
}

// Get density value from composition selection
function getDensityFromComposition(composition) {
    switch(composition) {
        case 'rocky':
            return 3000; // kg/m³
        case 'metallic':
            return 8000; // kg/m³
        case 'icy':
            return 1000; // kg/m³
        default:
            return 3000; // Default to rocky
    }
}

// These functions would be implemented in their respective files
function initSpaceVisualization(containerId) {
    // Implemented in visualization.js
    console.log(`Initializing space visualization in ${containerId}`);
}

function updateSpaceVisualization(asteroidData) {
    // Implemented in visualization.js
    console.log('Updating space visualization with:', asteroidData);
}

function updateSpaceTime(days) {
    // Implemented in visualization.js
    console.log(`Updating space visualization time to +${days} days`);
}

function initAtmosphereVisualization(containerId) {
    // Implemented in visualization.js
    console.log(`Initializing atmosphere visualization in ${containerId}`);
}

function updateAtmosphereVisualization() {
    // Implemented in visualization.js
    const angle = document.getElementById('entry-angle').value;
    const composition = document.getElementById('composition').value;
    console.log(`Updating atmosphere visualization: angle=${angle}°, composition=${composition}`);
}

function initImpactMap(containerId) {
    // Implemented in impact.js
    console.log(`Initializing impact map in ${containerId}`);
}

function initConsequenceCharts() {
    // Implemented in impact.js
    console.log('Initializing consequence charts');
}

function updateConsequenceVisualizations(timeValue) {
    // Implemented in impact.js
    console.log(`Updating consequence visualizations for time value ${timeValue}`);
}

function initGameVisualization(containerId) {
    // Implemented in game.js
    console.log(`Initializing game visualization in ${containerId}`);
}

function startGame() {
    // Implemented in game.js
    console.log('Starting game mode');
}

function launchMission() {
    // Implemented in game.js
    const method = document.getElementById('deflection-method').value;
    const years = document.getElementById('launch-time').value;
    console.log(`Launching ${method} mission with ${years} years lead time`);
}
