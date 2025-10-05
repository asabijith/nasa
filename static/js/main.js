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
            // Initialize accurate 3D solar system with delay to ensure container is visible
            setTimeout(() => {
                if (!window.solarSystem3D && document.getElementById('solar-system-3d')) {
                    try {
                        window.solarSystem3D = new SolarSystem3D('solar-system-3d');
                        console.log('✅ Accurate Solar System 3D loaded on view switch');
                    } catch (error) {
                        console.error('❌ Failed to load Solar System 3D on view switch:', error);
                    }
                } else if (window.solarSystem3D) {
                    // Resize if already exists
                    window.solarSystem3D.onWindowResize();
                }
            }, 100);
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

/**
 * Update location display
 */
function updateLocationDisplay() {
    document.getElementById('obs-lat').textContent = `${CONFIG.OBSERVER.lat.toFixed(2)}°`;
    document.getElementById('obs-lon').textContent = `${CONFIG.OBSERVER.lon.toFixed(2)}°`;
}

/**
 * Initialize location and load location-based data
 */
function initializeLocation() {
    updateLocationDisplay();
    loadLocationBasedData();
}

/**
 * Load location-based astronomical data
 */
async function loadLocationBasedData() {
    try {
        // Load sky view data
        const skyData = await fetchAPI(`/sky-view?lat=${CONFIG.OBSERVER.lat}&lon=${CONFIG.OBSERVER.lon}`);
        updateSkyData(skyData);
        
        // Load ISS passes
        const issPasses = await fetchAPI(`/iss/passes?lat=${CONFIG.OBSERVER.lat}&lon=${CONFIG.OBSERVER.lon}`);
        updateISSPasses(issPasses);
        
    } catch (error) {
        console.error('Error loading location-based data:', error);
    }
}

/**
 * Update sky data display
 */
function updateSkyData(skyData) {
    if (!skyData) return;
    
    // Update moon phase
    if (skyData.moon) {
        document.getElementById('moon-phase').textContent = skyData.moon.phase || 'Unknown';
        document.getElementById('moon-illumination').textContent = 
            `${Math.round((skyData.moon.illumination || 0) * 100)}%`;
    }
    
    // Update sun/moon times
    if (skyData.sun) {
        document.getElementById('sunrise').textContent = skyData.sun.sunrise || '--:--';
        document.getElementById('sunset').textContent = skyData.sun.sunset || '--:--';
    }
    
    if (skyData.moon && skyData.moon.rise_time) {
        document.getElementById('moonrise').textContent = skyData.moon.rise_time || '--:--';
    }
    
    // Update visible objects
    if (skyData.planets) {
        const visiblePlanets = Object.values(skyData.planets)
            .filter(planet => planet.visible)
            .map(planet => planet.name)
            .join(', ');
        document.getElementById('visible-planets').textContent = visiblePlanets || 'None visible';
    }
}

/**
 * Update ISS passes display
 */
function updateISSPasses(passes) {
    const passesEl = document.getElementById('iss-passes');
    if (passesEl && passes && passes.length > 0) {
        passesEl.textContent = `${passes.length} today`;
    }
}

/**
 * Initialize Stellarium-like sky view
 */
function initializeStellariumView() {
    const canvas = document.getElementById('sky-canvas');
    if (!canvas) return;
    
    // Create sky visualization
    createSkyVisualization(canvas);
    
    // Setup time control
    const timeSpeedSlider = document.getElementById('time-speed');
    if (timeSpeedSlider) {
        timeSpeedSlider.addEventListener('input', (e) => {
            const speed = e.target.value;
            document.getElementById('speed-display').textContent = `${speed}x`;
            updateTimeSpeed(speed);
        });
    }
}

/**
 * Create sky visualization
 */
function createSkyVisualization(container) {
    // Simple starfield visualization
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
    // Add stars
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        star.style.width = '2px';
        star.style.height = '2px';
        star.style.backgroundColor = '#ffffff';
        star.style.borderRadius = '50%';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = Math.random() * 0.8 + 0.2;
        
        // Add twinkling animation
        star.style.animation = `twinkle ${2 + Math.random() * 4}s infinite`;
        
        container.appendChild(star);
    }
    
    // Add CSS animation for twinkling
    if (!document.getElementById('star-animations')) {
        const style = document.createElement('style');
        style.id = 'star-animations';
        style.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add constellation overlay
    addConstellationOverlay(container);
}

/**
 * Add constellation overlay to sky view
 */
function addConstellationOverlay(container) {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    
    // Add some constellation markers
    const constellations = [
        { name: 'Ursa Major', x: 20, y: 30 },
        { name: 'Orion', x: 60, y: 70 },
        { name: 'Cassiopeia', x: 80, y: 20 }
    ];
    
    constellations.forEach(constellation => {
        const marker = document.createElement('div');
        marker.style.position = 'absolute';
        marker.style.left = `${constellation.x}%`;
        marker.style.top = `${constellation.y}%`;
        marker.style.color = '#00d4ff';
        marker.style.fontSize = '12px';
        marker.style.fontWeight = 'bold';
        marker.textContent = constellation.name;
        overlay.appendChild(marker);
    });
    
    container.appendChild(overlay);
}

/**
 * Initialize ISS tracking view
 */
function initializeISSView() {
    const mapContainer = document.getElementById('iss-map');
    if (!mapContainer || maps.iss) return;
    
    // Initialize Leaflet map
    const map = L.map(mapContainer).setView([0, 0], 2);
    
    // Add map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Store map reference
    maps.iss = map;
    
    // Load ISS position
    loadISSPosition();
    
    // Start ISS tracking
    if (updateIntervals.iss) clearInterval(updateIntervals.iss);
    updateIntervals.iss = setInterval(loadISSPosition, CONFIG.UPDATE_INTERVALS.ISS);
}

/**
 * Load and update ISS position
 */
async function loadISSPosition() {
    try {
        const issData = await fetchAPI('/iss/live');
        updateISSDisplay(issData);
    } catch (error) {
        console.error('Error loading ISS position:', error);
        showNotification('Unable to load ISS data', 'error');
    }
}

/**
 * Update ISS display
 */
function updateISSDisplay(issData) {
    if (!issData || !issData.position) return;
    
    const position = issData.position;
    
    // Update coordinates display
    document.getElementById('iss-coordinates').textContent = 
        `${position.latitude?.toFixed(2)}°, ${position.longitude?.toFixed(2)}°`;
    document.getElementById('iss-altitude').textContent = 
        `${position.altitude || 408} km`;
    document.getElementById('iss-speed').textContent = 
        `${position.velocity ? (position.velocity * 3.6).toFixed(0) : 27600} km/h`;
    
    // Update map if available
    if (maps.iss && position.latitude && position.longitude) {
        // Remove existing ISS marker
        if (maps.issMarker) {
            maps.iss.removeLayer(maps.issMarker);
        }
        
        // Add new ISS marker
        maps.issMarker = L.marker([position.latitude, position.longitude])
            .addTo(maps.iss)
            .bindPopup('🛰️ International Space Station')
            .openPopup();
        
        // Center map on ISS
        maps.iss.setView([position.latitude, position.longitude], maps.iss.getZoom());
    }
}

/**
 * Initialize solar system view
 */
function initializeSolarSystemView() {
    const canvas = document.getElementById('solar-system-canvas');
    if (!canvas) return;
    
    // Create solar system visualization
    createSolarSystemVisualization(canvas);
    
    // Load planet data
    loadPlanetsData();
}

/**
 * Create solar system visualization
 */
function createSolarSystemVisualization(container) {
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.background = 'radial-gradient(circle at center, #001122, #000011)';
    
    // Add sun at center
    const sun = document.createElement('div');
    sun.style.position = 'absolute';
    sun.style.top = '50%';
    sun.style.left = '50%';
    sun.style.width = '30px';
    sun.style.height = '30px';
    sun.style.backgroundColor = '#ffaa00';
    sun.style.borderRadius = '50%';
    sun.style.transform = 'translate(-50%, -50%)';
    sun.style.boxShadow = '0 0 20px #ffaa00';
    sun.title = 'Sun';
    container.appendChild(sun);
    
    // Add planetary orbits and planets
    const planets = [
        { name: 'Mercury', distance: 60, size: 4, color: '#8c7853' },
        { name: 'Venus', distance: 80, size: 6, color: '#ffc649' },
        { name: 'Earth', distance: 100, size: 6, color: '#4f94cd' },
        { name: 'Mars', distance: 130, size: 5, color: '#cd5c5c' },
        { name: 'Jupiter', distance: 200, size: 20, color: '#d2691e' },
        { name: 'Saturn', distance: 250, size: 18, color: '#fad5a5' },
        { name: 'Uranus', distance: 300, size: 12, color: '#4fd0e3' },
        { name: 'Neptune', distance: 350, size: 12, color: '#4169e1' }
    ];
    
    planets.forEach((planet, index) => {
        // Create orbit
        const orbit = document.createElement('div');
        orbit.style.position = 'absolute';
        orbit.style.top = '50%';
        orbit.style.left = '50%';
        orbit.style.width = `${planet.distance * 2}px`;
        orbit.style.height = `${planet.distance * 2}px`;
        orbit.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        orbit.style.borderRadius = '50%';
        orbit.style.transform = 'translate(-50%, -50%)';
        container.appendChild(orbit);
        
        // Create planet
        const planetEl = document.createElement('div');
        planetEl.style.position = 'absolute';
        planetEl.style.top = '50%';
        planetEl.style.left = `${50 + planet.distance / container.offsetWidth * 100}%`;
        planetEl.style.width = `${planet.size}px`;
        planetEl.style.height = `${planet.size}px`;
        planetEl.style.backgroundColor = planet.color;
        planetEl.style.borderRadius = '50%';
        planetEl.style.transform = 'translate(-50%, -50%)';
        planetEl.style.cursor = 'pointer';
        planetEl.title = planet.name;
        
        // Add click handler
        planetEl.addEventListener('click', () => {
            document.getElementById('planet-select').value = planet.name.toLowerCase();
            showPlanetInfo(planet.name.toLowerCase());
        });
        
        // Add orbital animation
        planetEl.style.animation = `orbit-${index} ${10 + index * 5}s linear infinite`;
        
        container.appendChild(planetEl);
    });
    
    // Add orbital animations
    addOrbitalAnimations(planets, container);
}

/**
 * Add CSS animations for planetary orbits
 */
function addOrbitalAnimations(planets, container) {
    if (document.getElementById('orbital-animations')) return;
    
    let animationCSS = '';
    planets.forEach((planet, index) => {
        animationCSS += `
            @keyframes orbit-${index} {
                from { transform: translate(-50%, -50%) rotate(0deg) translateX(${planet.distance}px) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg) translateX(${planet.distance}px) rotate(-360deg); }
            }
        `;
    });
    
    const style = document.createElement('style');
    style.id = 'orbital-animations';
    style.textContent = animationCSS;
    document.head.appendChild(style);
}

/**
 * Initialize asteroids view
 */
function initializeAsteroidsView() {
    loadAsteroidsData();
}

/**
 * Load initial application data
 */
async function loadInitialData() {
    try {
        // Load NASA APOD
        loadAPOD();
        
        // Load people in space
        loadPeopleInSpace();
        
        // Load space weather
        loadSpaceWeather();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

/**
 * Load NASA Astronomy Picture of the Day
 */
async function loadAPOD() {
    try {
        const apod = await fetchAPI('/apod');
        const container = document.getElementById('apod-container');
        
        if (apod && container) {
            container.innerHTML = `
                <div class="apod-title">${apod.title || 'Space Image'}</div>
                ${apod.url ? `<img src="${apod.url}" alt="${apod.title}" onerror="this.style.display='none'">` : ''}
                <div class="apod-description">${(apod.explanation || '').substring(0, 200)}...</div>
            `;
        }
    } catch (error) {
        console.error('Error loading APOD:', error);
        document.getElementById('apod-container').innerHTML = 'Unable to load space image';
    }
}

/**
 * Load people currently in space
 */
async function loadPeopleInSpace() {
    try {
        const data = await fetchAPI('/people-in-space');
        const container = document.getElementById('people-in-space');
        
        if (data && container) {
            const count = data.number || 0;
            const people = data.people || [];
            
            let html = `<div class="metric"><span>Total:</span><span class="metric-value">${count}</span></div>`;
            
            people.slice(0, 3).forEach(person => {
                html += `<div style="font-size: 0.8rem; margin: 0.25rem 0;">👨‍🚀 ${person.name}</div>`;
            });
            
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading people in space:', error);
        document.getElementById('people-in-space').innerHTML = 'Unable to load crew data';
    }
}

/**
 * Load space weather data
 */
function loadSpaceWeather() {
    // Simulated space weather data (would connect to real APIs in production)
    const weatherData = {
        solar: ['Quiet', 'Minor', 'Moderate', 'Strong', 'Extreme'][Math.floor(Math.random() * 2)],
        geomagnetic: ['Quiet', 'Unsettled', 'Active', 'Minor Storm', 'Major Storm'][Math.floor(Math.random() * 3)],
        aurora: Math.random() > 0.7 ? 'Possible' : 'None'
    };
    
    document.getElementById('solar-activity').textContent = weatherData.solar;
    document.getElementById('geomagnetic').textContent = weatherData.geomagnetic;
    document.getElementById('aurora-alert').textContent = weatherData.aurora;
}

/**
 * Load missions data
 */
async function loadMissions() {
    try {
        const missions = await fetchAPI('/missions');
        const container = document.getElementById('missions-content');
        
        if (missions && container) {
            let html = '';
            
            Object.values(missions).forEach(mission => {
                const statusClass = mission.status === 'active' ? 'status-active' : 
                                  mission.status === 'planned' ? 'status-planned' : 'status-completed';
                
                html += `
                    <div class="mission-card">
                        <h3>${mission.name}</h3>
                        <div class="mission-status ${statusClass}">${mission.status.toUpperCase()}</div>
                        <div class="metric">
                            <span>Agency:</span>
                            <span class="metric-value">${mission.agency}</span>
                        </div>
                        <div class="metric">
                            <span>Country:</span>
                            <span class="metric-value">${mission.country}</span>
                        </div>
                        <div class="metric">
                            <span>Target:</span>
                            <span class="metric-value">${mission.target}</span>
                        </div>
                        <div class="metric">
                            <span>Launch:</span>
                            <span class="metric-value">${mission.launch_date}</span>
                        </div>
                        <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">
                            ${mission.description}
                        </p>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading missions:', error);
        document.getElementById('missions-content').innerHTML = '<p>Unable to load missions data</p>';
    }
}

/**
 * Load and display real-time space events
 */
async function loadLiveFeed() {
    try {
        const events = await fetchAPI('/events/live');
        const container = document.getElementById('live-feed');
        
        if (events && container) {
            let html = '';
            
            // ISS Location
            if (events.iss_location) {
                html += createFeedItem('ISS Position Update', 
                    `Latitude: ${events.iss_location.latitude?.toFixed(2)}°, Longitude: ${events.iss_location.longitude?.toFixed(2)}°`);
            }
            
            // People in Space
            if (events.people_in_space) {
                html += createFeedItem('Crew Update', 
                    `${events.people_in_space.number} people currently in space`);
            }
            
            // Close Approaches
            if (events.close_approaches_today) {
                html += createFeedItem('Asteroid Watch', 
                    'Monitoring near-Earth objects for today');
            }
            
            // APOD
            if (events.apod) {
                html += createFeedItem('Image of the Day', events.apod.title || 'New space image available');
            }
            
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading live feed:', error);
    }
}

/**
 * Create a feed item HTML
 */
function createFeedItem(title, description) {
    const now = new Date();
    return `
        <div class="feed-item">
            <div class="feed-time">${now.toLocaleTimeString()}</div>
            <div><strong>${title}:</strong> ${description}</div>
        </div>
    `;
}

/**
 * Start real-time updates
 */
function startRealTimeUpdates() {
    // Update live feed
    updateIntervals.liveFeed = setInterval(loadLiveFeed, CONFIG.UPDATE_INTERVALS.LIVE_FEED);
    
    // Update space weather
    updateIntervals.weather = setInterval(loadSpaceWeather, CONFIG.UPDATE_INTERVALS.WEATHER);
}

/**
 * Utility function to fetch API data
 */
async function fetchAPI(endpoint) {
    const response = await fetch(`${CONFIG.API_BASE}${endpoint}`);
    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }
    return await response.json();
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.right = '20px';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.color = 'white';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '10000';
    notification.style.maxWidth = '300px';
    notification.textContent = message;
    
    // Set color based on type
    switch (type) {
        case 'error':
            notification.style.background = 'var(--danger)';
            break;
        case 'warning':
            notification.style.background = '#ffa500';
            break;
        case 'success':
            notification.style.background = 'var(--success)';
            break;
        default:
            notification.style.background = 'var(--accent)';
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Control functions called by UI buttons
function resetTime() {
    showNotification('Time reset to now', 'info');
}

function togglePlanets() {
    showNotification('Planet visibility toggled', 'info');
}

function toggleSatellites() {
    showNotification('Satellite visibility toggled', 'info');
}

function toggleConstellations() {
    showNotification('Constellation visibility toggled', 'info');
}

function centerOnISS() {
    if (maps.iss && maps.issMarker) {
        maps.iss.setView(maps.issMarker.getLatLng(), 5);
        showNotification('Centered on ISS', 'success');
    }
}

function showISSPasses() {
    switchView('iss');
    showNotification('Showing ISS passes for your location', 'info');
}

function trackISS() {
    showNotification('ISS tracking activated', 'success');
}

function focusPlanet() {
    const selected = document.getElementById('planet-select').value;
    showNotification(`Focusing on ${selected}`, 'info');
}

function showOrbits() {
    showNotification('Orbital paths toggled', 'info');
}

function showMoons() {
    showNotification('Moon visibility toggled', 'info');
}

function refreshAsteroids() {
    loadAsteroidsData();
    showNotification('Refreshing asteroid data...', 'info');
}

function simulateImpact() {
    showNotification('Impact simulation mode activated', 'warning');
}

function defendEarth() {
    showNotification('Defense system activated!', 'success');
}

async function loadAsteroidsData() {
    try {
        const asteroids = await fetchAPI('/asteroids?page=0&size=10');
        showNotification('Asteroid data updated', 'success');
    } catch (error) {
        showNotification('Failed to load asteroid data', 'error');
    }
}

async function loadPlanetsData() {
    try {
        const planets = await fetchAPI('/planets');
        showNotification('Planet data loaded', 'success');
    } catch (error) {
        showNotification('Failed to load planet data', 'error');
    }
}

function updateTimeSpeed(speed) {
    // Implementation for time speed control
    console.log(`Time speed set to ${speed}x`);
}

function showPlanetInfo(planetName) {
    showNotification(`Showing info for ${planetName}`, 'info');
}

/**
 * Solar System 3D Controls
 */
function focusOnPlanet() {
    const select = document.getElementById('planet-select');
    const planetName = select.value;
    
    if (planetName && window.solarSystem3D) {
        window.solarSystem3D.focusPlanet(planetName);
        showNotification(`Focusing on ${planetName.charAt(0).toUpperCase() + planetName.slice(1)}`, 'success');
    }
}

function setTimeScale() {
    const select = document.getElementById('time-scale');
    const timeScale = parseFloat(select.value);
    
    if (window.solarSystem3D) {
        window.solarSystem3D.setTimeScale(timeScale);
        showNotification(`Time scale set to ${timeScale}x`, 'info');
    }
}

function resetCamera() {
    if (window.solarSystem3D) {
        window.solarSystem3D.camera.position.set(0, 50, 100);
        window.solarSystem3D.controls.target.set(0, 0, 0);
        showNotification('Camera reset to default view', 'success');
    }
}

function toggleSolarSystemInfo() {
    const infoDiv = document.getElementById('solar-system-info');
    if (infoDiv) {
        infoDiv.style.display = infoDiv.style.display === 'none' ? 'block' : 'none';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    Object.values(updateIntervals).forEach(interval => {
        if (interval) clearInterval(interval);
    });
});

/**
 * Additional Control Functions
 */
function resetTime() {
    showNotification('Time reset to current', 'info');
}

function togglePlanets() {
    showNotification('Planet visibility toggled', 'info');
}

function toggleSatellites() {
    showNotification('Satellite visibility toggled', 'info');
}

function toggleConstellations() {
    showNotification('Constellation visibility toggled', 'info');
}

function centerOnISS() {
    if (maps.iss && maps.issMarker) {
        maps.iss.setView(maps.issMarker.getLatLng(), 6);
        showNotification('Map centered on ISS', 'success');
    }
}

function showISSPasses() {
    showNotification('ISS passes modal would open here', 'info');
}

function trackISS() {
    showNotification('ISS tracking activated', 'success');
}

function refreshAsteroids() {
    loadAsteroidData();
    showNotification('Asteroid data refreshed', 'success');
}

function simulateImpact() {
    showNotification('Impact simulation would start here', 'info');
}

function defendEarth() {
    showNotification('Defense simulation would start here', 'info');
}

// Export for global access
window.SpaceExplorer = {
    CONFIG,
    initializeApp,
    switchView,
    getLocation,
    showNotification,
    focusOnPlanet,
    setTimeScale,
    resetCamera,
    toggleSolarSystemInfo,
    resetTime,
    togglePlanets,
    toggleSatellites,
    toggleConstellations,
    centerOnISS,
    showISSPasses,
    trackISS,
    refreshAsteroids,
    simulateImpact,
    defendEarth
};