/**
 * Meteor Madness - Interactive Asteroid Impact Simulation
 * Advanced physics calculations and 3D visualizations
 */

class MeteorMadness {
    constructor() {
        this.asteroidParams = {
            diameter: 100,        // meters
            velocity: 20,         // km/s
            density: 3000,        // kg/m³
            angle: 45,            // degrees
            location: 'ocean'     // impact location type
        };
        
        this.deflectionParams = {
            method: 'none',
            warningTime: 5,       // years
            efficiency: 1.0       // deflection efficiency
        };
        
        this.impactResults = {};
        this.scene3D = null;
        this.impactMap = null;
        this.animationId = null;
        
        // Enhanced NASA Integration
        this.enhancedNASA = new EnhancedNASAIntegration();
        this.realTimeData = null;
        this.educationalContent = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeVisualizations();
        this.loadPresetScenarios();
        console.log('🚀 Meteor Madness initialized');
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.getElementById('start-simulation').addEventListener('click', () => {
            this.showSimulationDashboard();
        });
        
        document.getElementById('load-impactor2025').addEventListener('click', () => {
            this.loadImpactor2025();
        });
        
        // Parameter sliders
        document.getElementById('size-slider').addEventListener('input', (e) => {
            this.asteroidParams.diameter = parseInt(e.target.value);
            document.getElementById('size-value').textContent = `${this.asteroidParams.diameter}m`;
            this.updateVisualization();
        });
        
        document.getElementById('velocity-slider').addEventListener('input', (e) => {
            this.asteroidParams.velocity = parseInt(e.target.value);
            document.getElementById('velocity-value').textContent = `${this.asteroidParams.velocity} km/s`;
            this.updateVisualization();
        });
        
        document.getElementById('density-slider').addEventListener('input', (e) => {
            this.asteroidParams.density = parseInt(e.target.value);
            document.getElementById('density-value').textContent = `${this.asteroidParams.density} kg/m³`;
        });
        
        document.getElementById('angle-slider').addEventListener('input', (e) => {
            this.asteroidParams.angle = parseInt(e.target.value);
            document.getElementById('angle-value').textContent = `${this.asteroidParams.angle}°`;
        });
        
        document.getElementById('warning-time').addEventListener('input', (e) => {
            this.deflectionParams.warningTime = parseFloat(e.target.value);
            document.getElementById('warning-time-value').textContent = `${this.deflectionParams.warningTime} years`;
        });
        
        // Location and method selectors
        document.getElementById('impact-location').addEventListener('change', (e) => {
            this.asteroidParams.location = e.target.value;
            this.updateImpactMap();
        });
        
        document.getElementById('deflection-method').addEventListener('change', (e) => {
            this.deflectionParams.method = e.target.value;
            this.updateDeflectionVisualization();
        });
        
        // Action buttons
        document.getElementById('calculate-impact').addEventListener('click', () => {
            this.calculateImpact();
        });
        
        document.getElementById('simulate-deflection').addEventListener('click', () => {
            this.simulateDeflection();
        });
        
        document.getElementById('play-animation').addEventListener('click', () => {
            this.playAnimation();
        });
        
        document.getElementById('pause-animation').addEventListener('click', () => {
            this.pauseAnimation();
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetView();
        });
        
        // Modal controls
        document.getElementById('help-btn').addEventListener('click', () => {
            document.getElementById('help-modal').classList.remove('hidden');
        });
        
        document.getElementById('close-help').addEventListener('click', () => {
            document.getElementById('help-modal').classList.add('hidden');
        });
        
        // Results actions
        document.getElementById('download-results')?.addEventListener('click', () => {
            this.downloadResults();
        });
        
        document.getElementById('share-scenario')?.addEventListener('click', () => {
            this.shareScenario();
        });

        // Enhanced NASA Integration Controls
        document.getElementById('load-real-time-data')?.addEventListener('click', () => {
            this.loadRealTimeNASAData();
        });

        document.getElementById('search-asteroid-db')?.addEventListener('click', () => {
            const asteroidName = document.getElementById('asteroid-search-input').value.trim();
            if (asteroidName) {
                this.searchAsteroidDatabase(asteroidName);
            } else {
                this.showNotification('Please enter an asteroid name to search', 'error');
            }
        });

        document.getElementById('search-asteroid-btn')?.addEventListener('click', () => {
            const asteroidName = document.getElementById('asteroid-search-input').value.trim();
            if (asteroidName) {
                this.searchAsteroidDatabase(asteroidName);
            } else {
                this.showNotification('Please enter an asteroid name to search', 'error');
            }
        });

        // Enter key support for asteroid search
        document.getElementById('asteroid-search-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const asteroidName = e.target.value.trim();
                if (asteroidName) {
                    this.searchAsteroidDatabase(asteroidName);
                } else {
                    this.showNotification('Please enter an asteroid name to search', 'error');
                }
            }
        });

        document.getElementById('view-comets')?.addEventListener('click', async () => {
            try {
                this.showLoadingIndicator('Loading Near-Earth Comets data...');
                const comets = await this.enhancedNASA.getNearEarthComets();
                this.displayCometsData(comets);
                this.hideLoadingIndicator();
            } catch (error) {
                this.hideLoadingIndicator();
                this.showNotification(`Failed to load comets data: ${error.message}`, 'error');
            }
        });

        document.getElementById('earthquake-data')?.addEventListener('click', async () => {
            try {
                this.showLoadingIndicator('Loading USGS earthquake catalog...');
                const earthquakes = await this.enhancedNASA.getEarthquakeCatalog({
                    min_magnitude: 6.0,
                    start_date: '2020-01-01'
                });
                this.displayEarthquakeData(earthquakes);
                this.hideLoadingIndicator();
            } catch (error) {
                this.hideLoadingIndicator();
                this.showNotification(`Failed to load earthquake data: ${error.message}`, 'error');
            }
        });

        // 3D Diagnostic Controls
        document.getElementById('init-3d-manual')?.addEventListener('click', () => {
            this.initialize3DVisualization();
        });

        document.getElementById('3d-diagnostics')?.addEventListener('click', () => {
            this.run3DDiagnostics();
        });

        // Impact Map Diagnostic Controls
        document.getElementById('init-map-manual')?.addEventListener('click', () => {
            this.initializeImpactMap();
        });

        document.getElementById('map-diagnostics')?.addEventListener('click', () => {
            this.runMapDiagnostics();
        });

        document.getElementById('refresh-zones')?.addEventListener('click', () => {
            this.updateImpactMap();
        });
    }
    
    showSimulationDashboard() {
        document.getElementById('hero').classList.add('hidden');
        document.getElementById('simulation-dashboard').classList.remove('hidden');
        
        // Initialize visualizations when shown
        setTimeout(() => {
            this.initializeVisualizations();
        }, 100);
    }
    
    loadImpactor2025() {
        // Load predefined Impactor-2025 scenario
        this.asteroidParams = {
            diameter: 340,        // meters
            velocity: 28.5,       // km/s
            density: 2800,        // kg/m³
            angle: 60,            // degrees
            location: 'ocean'     // Pacific Ocean impact
        };
        
        this.updateParameterInputs();
        this.showSimulationDashboard();
        
        setTimeout(() => {
            this.calculateImpact();
        }, 500);
    }
    
    updateParameterInputs() {
        document.getElementById('size-slider').value = this.asteroidParams.diameter;
        document.getElementById('size-value').textContent = `${this.asteroidParams.diameter}m`;
        
        document.getElementById('velocity-slider').value = this.asteroidParams.velocity;
        document.getElementById('velocity-value').textContent = `${this.asteroidParams.velocity} km/s`;
        
        document.getElementById('density-slider').value = this.asteroidParams.density;
        document.getElementById('density-value').textContent = `${this.asteroidParams.density} kg/m³`;
        
        document.getElementById('angle-slider').value = this.asteroidParams.angle;
        document.getElementById('angle-value').textContent = `${this.asteroidParams.angle}°`;
        
        document.getElementById('impact-location').value = this.asteroidParams.location;
    }
    
    initializeVisualizations() {
        this.initialize3DVisualization();
        this.initializeImpactMap();
    }
    
    initialize3DVisualization() {
        const container = document.getElementById('orbit-visualization');
        if (!container) {
            console.error('❌ 3D container not found');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Check Three.js availability
        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js not loaded');
            container.innerHTML = `
                <div class="text-center text-red-400 p-8">
                    <p class="mb-2">⚠️ 3D Visualization Unavailable</p>
                    <p class="text-sm text-gray-400">Three.js library failed to load</p>
                    <button onclick="location.reload()" class="mt-2 px-4 py-2 bg-blue-600 rounded text-white">Reload Page</button>
                </div>
            `;
            return;
        }
        
        try {
            console.log('🚀 Initializing 3D visualization...');
            this.update3DStatus('Initializing 3D scene...', 'info');
            
            // Scene setup
            this.scene3D = new THREE.Scene();
            this.scene3D.background = new THREE.Color(0x000011);
            
            // Camera
            const aspect = container.clientWidth / container.clientHeight || 1;
            this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
            this.camera.position.set(50, 30, 50);
            
            // Renderer with fallback
            try {
                this.renderer = new THREE.WebGLRenderer({ 
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: true
                });
            } catch (webglError) {
                console.warn('WebGL failed, trying Canvas renderer...');
                this.renderer = new THREE.CanvasRenderer();
            }
            
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            this.renderer.setClearColor(0x000011, 1);
            container.appendChild(this.renderer.domElement);
            
            // Controls with better error handling
            try {
                if (typeof THREE.OrbitControls !== 'undefined') {
                    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                    this.controls.enableDamping = true;
                    this.controls.dampingFactor = 0.1;
                    this.controls.enableZoom = true;
                    console.log('✅ OrbitControls loaded');
                } else {
                    console.warn('⚠️ OrbitControls not available, using basic camera');
                    this.setupBasicCameraControls();
                }
            } catch (controlsError) {
                console.warn('⚠️ Controls setup failed:', controlsError);
                this.setupBasicCameraControls();
            }
            
            // Earth
            this.createEarth();
            
            // Asteroid trajectory
            this.createAsteroidTrajectory();
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            this.scene3D.add(ambientLight);
            
            const sunLight = new THREE.DirectionalLight(0xffffff, 1);
            sunLight.position.set(100, 100, 50);
            this.scene3D.add(sunLight);
            
            // Add starfield
            this.createStarfield();
            
            // Resize handler
            window.addEventListener('resize', () => this.onWindowResize());
            
            // Start rendering
            this.animate3D();
            
            console.log('✅ 3D visualization initialized successfully');
            this.update3DStatus('3D visualization active', 'success');
            
            // Add loading success indicator
            setTimeout(() => {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'absolute top-2 left-2 bg-green-900/80 border border-green-500 text-green-400 px-3 py-1 rounded text-xs';
                statusDiv.textContent = '✅ 3D Visualization Active';
                container.style.position = 'relative';
                container.appendChild(statusDiv);
                
                // Remove after 3 seconds
                setTimeout(() => statusDiv.remove(), 3000);
            }, 500);
            
        } catch (error) {
            console.error('❌ Failed to initialize 3D visualization:', error);
            this.update3DStatus(`3D Error: ${error.message}`, 'error');
            container.innerHTML = `
                <div class="text-center text-red-400 p-8">
                    <p class="mb-2">⚠️ 3D Visualization Error</p>
                    <p class="text-sm text-gray-400 mb-4">${error.message}</p>
                    <div class="space-y-2">
                        <button onclick="location.reload()" class="block mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
                            🔄 Reload Page
                        </button>
                        <button onclick="window.meteorMadness.initialize3DVisualization()" class="block mx-auto px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm">
                            🔄 Retry 3D Init
                        </button>
                    </div>
                </div>
            `;
        }
    }

    setupBasicCameraControls() {
        // Basic mouse controls without OrbitControls
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            // Rotate camera around Earth
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 0, 0);
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        // Zoom with mouse wheel
        canvas.addEventListener('wheel', (event) => {
            const zoomSpeed = 0.1;
            const distance = this.camera.position.length();
            const newDistance = distance + (event.deltaY > 0 ? zoomSpeed * 5 : -zoomSpeed * 5);
            
            if (newDistance > 20 && newDistance < 200) {
                this.camera.position.multiplyScalar(newDistance / distance);
            }
            
            event.preventDefault();
        });
        
        console.log('✅ Basic camera controls set up');
    }

    run3DDiagnostics() {
        const results = [];
        
        // Check Three.js
        if (typeof THREE === 'undefined') {
            results.push('❌ Three.js: Not loaded');
        } else {
            results.push(`✅ Three.js: Loaded (r${THREE.REVISION})`);
        }
        
        // Check OrbitControls
        if (typeof THREE !== 'undefined' && THREE.OrbitControls) {
            results.push('✅ OrbitControls: Available');
        } else {
            results.push('⚠️ OrbitControls: Not available (using fallback)');
        }
        
        // Check WebGL
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            results.push('✅ WebGL: Supported');
            results.push(`   Renderer: ${gl.getParameter(gl.RENDERER)}`);
        } else {
            results.push('❌ WebGL: Not supported');
        }
        
        // Check 3D Scene Status
        if (this.scene3D) {
            results.push(`✅ Scene: Active (${this.scene3D.children.length} objects)`);
        } else {
            results.push('❌ Scene: Not initialized');
        }
        
        if (this.renderer) {
            results.push('✅ Renderer: Active');
        } else {
            results.push('❌ Renderer: Not initialized');
        }
        
        if (this.camera) {
            results.push('✅ Camera: Active');
        } else {
            results.push('❌ Camera: Not initialized');
        }
        
        // Display results
        const diagnosticHtml = `
            <div class="bg-gray-900/90 border border-gray-500 rounded-lg p-6 mb-4">
                <h4 class="text-yellow-400 font-bold text-xl mb-4">🔧 3D System Diagnostics</h4>
                <div class="space-y-1 text-sm font-mono">
                    ${results.map(result => `<div class="text-gray-300">${result}</div>`).join('')}
                </div>
                <div class="mt-4 flex space-x-2">
                    <button onclick="window.meteorMadness.initialize3DVisualization()" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm">
                        🔄 Reinitialize 3D
                    </button>
                    <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm">
                        🔄 Reload Page
                    </button>
                </div>
            </div>
        `;
        
        const educationalPanel = document.getElementById('educational-content');
        if (educationalPanel) {
            educationalPanel.innerHTML = diagnosticHtml;
        }
    }

    update3DStatus(message, type = 'info') {
        const statusElement = document.getElementById('3d-status-text');
        if (statusElement) {
            const icon = type === 'success' ? '✅' : 
                        type === 'error' ? '❌' : 
                        type === 'warning' ? '⚠️' : '🔄';
            statusElement.textContent = `${icon} ${message}`;
            
            const statusParent = document.getElementById('3d-status');
            if (statusParent) {
                statusParent.className = `mt-2 text-xs text-center ${
                    type === 'success' ? 'text-green-400' :
                    type === 'error' ? 'text-red-400' :
                    type === 'warning' ? 'text-yellow-400' :
                    'text-gray-400'
                }`;
            }
        }
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const container = document.getElementById('orbit-visualization');
        if (!container) return;
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.8
        });
        
        const starsVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene3D.add(starField);
    }
    
    createEarth() {
        // Earth geometry and material
        const earthGeometry = new THREE.SphereGeometry(10, 64, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x4444ff,
            shininess: 100
        });
        
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene3D.add(this.earth);
        
        // Earth atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(10.5, 64, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.2
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene3D.add(atmosphere);
    }
    
    createAsteroidTrajectory() {
        // Asteroid object
        const asteroidGeometry = new THREE.SphereGeometry(0.5, 16, 8);
        const asteroidMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 30
        });
        
        this.asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        
        // Position asteroid based on current parameters
        this.updateAsteroidPosition();
        this.scene3D.add(this.asteroid);
        
        // Trajectory line
        this.createTrajectoryLine();
    }
    
    createTrajectoryLine() {
        const points = [];
        const startDistance = 50;
        const endDistance = 10; // Earth surface
        
        // Calculate trajectory points
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const distance = startDistance - (startDistance - endDistance) * t;
            
            const x = distance * Math.cos(this.asteroidParams.angle * Math.PI / 180);
            const y = distance * Math.sin(this.asteroidParams.angle * Math.PI / 180);
            const z = 0;
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        // Remove existing trajectory
        if (this.trajectoryLine) {
            this.scene3D.remove(this.trajectoryLine);
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xff4466,
            linewidth: 2
        });
        
        this.trajectoryLine = new THREE.Line(geometry, material);
        this.scene3D.add(this.trajectoryLine);
    }
    
    updateAsteroidPosition() {
        if (!this.asteroid) return;
        
        const distance = 50;
        const x = distance * Math.cos(this.asteroidParams.angle * Math.PI / 180);
        const y = distance * Math.sin(this.asteroidParams.angle * Math.PI / 180);
        
        this.asteroid.position.set(x, y, 0);
        
        // Scale asteroid based on diameter
        const scale = Math.max(0.2, Math.log(this.asteroidParams.diameter) / 10);
        this.asteroid.scale.setScalar(scale);
    }
    
    initializeImpactMap() {
        const container = document.getElementById('impact-map');
        if (!container) {
            console.error('❌ Impact map container not found');
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Check Leaflet availability
        if (typeof L === 'undefined') {
            console.error('❌ Leaflet not loaded');
            container.innerHTML = `
                <div class="text-center text-red-400 p-8">
                    <p class="mb-2">⚠️ Impact Map Unavailable</p>
                    <p class="text-sm text-gray-400">Leaflet library failed to load</p>
                    <button onclick="window.meteorMadness.initializeImpactMap()" class="mt-2 px-4 py-2 bg-blue-600 rounded text-white">Retry Map</button>
                </div>
            `;
            return;
        }
        
        try {
            console.log('🗺️ Initializing impact map...');
            
            // Create Leaflet map with better error handling
            this.impactMap = L.map(container, {
                zoomControl: true,
                attributionControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: true
            }).setView([0, 0], 2);

            // Add multiple tile layer options with fallbacks
            const tileLayerOptions = {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
                errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
            };

            // Try primary tile server
            const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', tileLayerOptions);
            
            // Add fallback tile servers
            tileLayer.on('tileerror', () => {
                console.warn('Primary tile server failed, trying fallback...');
                this.impactMap.removeLayer(tileLayer);
                
                const fallbackLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                    ...tileLayerOptions,
                    attribution: '© OpenStreetMap © CartoDB'
                });
                
                fallbackLayer.addTo(this.impactMap);
            });
            
            tileLayer.addTo(this.impactMap);
            
            // Add map loaded indicator
            this.impactMap.whenReady(() => {
                console.log('✅ Impact map tiles loaded');
                this.updateMapStatus('Map ready', 'success');
            });
            
            // Initialize with default impact location
            this.updateImpactMap();
            
            // Add resize handler
            setTimeout(() => {
                this.impactMap.invalidateSize();
            }, 100);
            
            console.log('✅ Impact map initialized successfully');
            this.updateMapStatus('Impact map active', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize impact map:', error);
            this.updateMapStatus(`Map error: ${error.message}`, 'error');
            container.innerHTML = `
                <div class="text-center text-red-400 p-8">
                    <p class="mb-2">⚠️ Impact Map Error</p>
                    <p class="text-sm text-gray-400 mb-4">${error.message}</p>
                    <button onclick="window.meteorMadness.initializeImpactMap()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
                        🔄 Retry Map
                    </button>
                </div>
            `;
        }
    }

    updateMapStatus(message, type = 'info') {
        // Add status to impact map if needed
        console.log(`🗺️ Map Status: ${message}`);
    }
    
    updateImpactMap() {
        if (!this.impactMap) {
            console.warn('⚠️ Impact map not initialized, retrying...');
            this.initializeImpactMap();
            return;
        }
        
        try {
            // Clear existing impact layers (but keep base tiles)
            this.impactMap.eachLayer((layer) => {
                if (layer instanceof L.Circle || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                    this.impactMap.removeLayer(layer);
                }
            });
            
            // Enhanced impact location coordinates with names
            const locations = {
                ocean: { 
                    coords: [15.0, -140.0], 
                    name: "Pacific Ocean", 
                    zoom: 4,
                    description: "Deep ocean impact - major tsunami risk"
                },
                land: { 
                    coords: [39.5, -98.35], 
                    name: "Central Plains, USA", 
                    zoom: 6,
                    description: "Continental impact - widespread damage"
                },
                city: { 
                    coords: [40.7589, -73.9851], 
                    name: "New York City", 
                    zoom: 10,
                    description: "Urban impact - maximum casualties"
                },
                coast: { 
                    coords: [34.0522, -118.2437], 
                    name: "Los Angeles Coast", 
                    zoom: 9,
                    description: "Coastal impact - combined blast & tsunami"
                }
            };
            
            const location = locations[this.asteroidParams.location] || locations.ocean;
            const coords = location.coords;
            
            // Create custom impact marker
            const impactIcon = L.divIcon({
                html: `<div class="impact-marker">💥</div>`,
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            // Add enhanced impact marker
            const impactMarker = L.marker(coords, { icon: impactIcon }).addTo(this.impactMap);
            
            // Enhanced popup with details
            const popupContent = `
                <div class="impact-popup">
                    <h4 class="font-bold text-red-600 mb-2">💥 Impact Point</h4>
                    <p class="text-sm"><strong>Location:</strong> ${location.name}</p>
                    <p class="text-xs text-gray-600 mt-1">${location.description}</p>
                    <div class="mt-2 text-xs">
                        <div>📍 Coords: ${coords[0].toFixed(3)}°, ${coords[1].toFixed(3)}°</div>
                        <div>📏 Asteroid: ${this.asteroidParams.diameter}m diameter</div>
                        <div>🚀 Velocity: ${this.asteroidParams.velocity} km/s</div>
                    </div>
                </div>
            `;
            
            impactMarker.bindPopup(popupContent).openPopup();
            
            // Center map on impact location
            this.impactMap.setView(coords, location.zoom);
            
            // Add damage zones if impact has been calculated
            if (this.impactResults && this.impactResults.fireballRadius) {
                this.addEnhancedDamageZones(coords);
            } else {
                // Add placeholder zones based on asteroid size
                this.addEstimatedDamageZones(coords);
            }
            
            console.log(`✅ Impact map updated for ${location.name}`);
            
        } catch (error) {
            console.error('❌ Failed to update impact map:', error);
        }
    }

    addEstimatedDamageZones(coords) {
        // Quick estimation based on asteroid diameter for preview
        const diameter = this.asteroidParams.diameter;
        const velocity = this.asteroidParams.velocity;
        
        // Rough energy estimate
        const estimatedEnergy = Math.pow(diameter/100, 3) * Math.pow(velocity/20, 2);
        
        // Estimated radii (km)
        const estimatedFireball = Math.max(0.1, estimatedEnergy * 0.5);
        const estimatedBlast = Math.max(0.5, estimatedEnergy * 2);
        const estimatedThermal = Math.max(1, estimatedEnergy * 3);
        
        // Add preview zones with lower opacity
        this.addDamageZoneCircles(coords, {
            fireballRadius: estimatedFireball,
            blastRadius: estimatedBlast,
            thermalRadius: estimatedThermal
        }, true);
    }
    
    addEnhancedDamageZones(coords) {
        const { fireballRadius, blastRadius, thermalRadius } = this.impactResults;
        this.addDamageZoneCircles(coords, { fireballRadius, blastRadius, thermalRadius }, false);
    }

    addDamageZoneCircles(coords, radii, isPreview = false) {
        const { fireballRadius, blastRadius, thermalRadius } = radii;
        const opacity = isPreview ? 0.3 : 1;
        const fillOpacity = isPreview ? 0.1 : 0.3;
        const prefix = isPreview ? '[Preview] ' : '';
        
        // Thermal radiation zone (outermost - yellow)
        if (thermalRadius > 0) {
            const thermalCircle = L.circle(coords, {
                radius: thermalRadius * 1000, // Convert km to meters
                color: '#ffdd00',
                weight: 2,
                opacity: opacity * 0.8,
                fillColor: '#ffdd00',
                fillOpacity: fillOpacity * 0.5
            }).addTo(this.impactMap);
            
            thermalCircle.bindPopup(`
                <div class="damage-zone-popup">
                    <h4 class="font-bold text-yellow-600">🌡️ ${prefix}Thermal Radiation Zone</h4>
                    <p class="text-sm mt-1"><strong>Radius:</strong> ${thermalRadius.toFixed(1)} km</p>
                    <p class="text-xs text-gray-600 mt-1">3rd degree burns, fires ignite</p>
                    <p class="text-xs text-gray-600">Immediate medical attention required</p>
                </div>
            `);
        }
        
        // Blast zone (middle - orange)
        if (blastRadius > 0) {
            const blastCircle = L.circle(coords, {
                radius: blastRadius * 1000,
                color: '#ff8800',
                weight: 2,
                opacity: opacity,
                fillColor: '#ff8800',
                fillOpacity: fillOpacity * 0.7
            }).addTo(this.impactMap);
            
            blastCircle.bindPopup(`
                <div class="damage-zone-popup">
                    <h4 class="font-bold text-orange-600">💨 ${prefix}Blast Zone</h4>
                    <p class="text-sm mt-1"><strong>Radius:</strong> ${blastRadius.toFixed(1)} km</p>
                    <p class="text-xs text-gray-600 mt-1">Severe structural damage</p>
                    <p class="text-xs text-gray-600">Windows shatter, buildings collapse</p>
                </div>
            `);
        }
        
        // Fireball zone (innermost - red)
        if (fireballRadius > 0) {
            const fireballCircle = L.circle(coords, {
                radius: fireballRadius * 1000,
                color: '#ff0000',
                weight: 3,
                opacity: opacity,
                fillColor: '#ff0000',
                fillOpacity: fillOpacity
            }).addTo(this.impactMap);
            
            fireballCircle.bindPopup(`
                <div class="damage-zone-popup">
                    <h4 class="font-bold text-red-600">� ${prefix}Fireball Zone</h4>
                    <p class="text-sm mt-1"><strong>Radius:</strong> ${fireballRadius.toFixed(1)} km</p>
                    <p class="text-xs text-gray-600 mt-1">Total destruction</p>
                    <p class="text-xs text-gray-600">Complete vaporization of all matter</p>
                </div>
            `);
        }

        // Add scale reference
        this.addScaleReference(coords, Math.max(thermalRadius, blastRadius, fireballRadius));
    }

    addScaleReference(coords, maxRadius) {
        // Add distance markers for scale
        const distances = [1, 5, 10, 25, 50, 100].filter(d => d <= maxRadius * 2);
        
        distances.forEach(distance => {
            L.circle(coords, {
                radius: distance * 1000,
                color: '#666666',
                weight: 1,
                opacity: 0.4,
                fillOpacity: 0,
                dashArray: '5, 5'
            }).addTo(this.impactMap).bindPopup(`📏 ${distance} km from impact`);
        });
    }

    runMapDiagnostics() {
        const results = [];
        
        // Check Leaflet
        if (typeof L === 'undefined') {
            results.push('❌ Leaflet: Not loaded');
        } else {
            results.push(`✅ Leaflet: Loaded (v${L.version})`);
        }
        
        // Check map container
        const container = document.getElementById('impact-map');
        if (!container) {
            results.push('❌ Map Container: Not found');
        } else {
            results.push(`✅ Map Container: Found (${container.clientWidth}x${container.clientHeight}px)`);
        }
        
        // Check map instance
        if (this.impactMap) {
            results.push('✅ Map Instance: Active');
            results.push(`   Center: ${this.impactMap.getCenter().lat.toFixed(3)}, ${this.impactMap.getCenter().lng.toFixed(3)}`);
            results.push(`   Zoom: ${this.impactMap.getZoom()}`);
            
            // Count layers
            let layerCount = 0;
            this.impactMap.eachLayer(() => layerCount++);
            results.push(`   Layers: ${layerCount}`);
        } else {
            results.push('❌ Map Instance: Not initialized');
        }
        
        // Check impact results
        if (this.impactResults && this.impactResults.fireballRadius) {
            results.push('✅ Impact Data: Available');
            results.push(`   Fireball: ${this.impactResults.fireballRadius.toFixed(1)} km`);
            results.push(`   Blast: ${this.impactResults.blastRadius.toFixed(1)} km`);
            results.push(`   Thermal: ${this.impactResults.thermalRadius.toFixed(1)} km`);
        } else {
            results.push('⚠️ Impact Data: Not calculated (showing preview zones)');
        }
        
        // Network connectivity (tile loading)
        results.push('ℹ️ Network: Tile loading depends on internet connection');
        
        // Display results
        const diagnosticHtml = `
            <div class="bg-gray-900/90 border border-gray-500 rounded-lg p-6 mb-4">
                <h4 class="text-yellow-400 font-bold text-xl mb-4">🗺️ Impact Map Diagnostics</h4>
                <div class="space-y-1 text-sm font-mono">
                    ${results.map(result => `<div class="text-gray-300">${result}</div>`).join('')}
                </div>
                <div class="mt-4 flex space-x-2">
                    <button onclick="window.meteorMadness.initializeImpactMap()" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm">
                        🔄 Reinitialize Map
                    </button>
                    <button onclick="window.meteorMadness.updateImpactMap()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm">
                        🔄 Refresh Zones
                    </button>
                    <button onclick="window.meteorMadness.calculateImpact()" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm">
                        🔥 Recalculate Impact
                    </button>
                </div>
            </div>
        `;
        
        const educationalPanel = document.getElementById('educational-content');
        if (educationalPanel) {
            educationalPanel.innerHTML = diagnosticHtml;
        }
    }

    addDamageZones(coords) {
        // Legacy method - redirect to enhanced version
        this.addEnhancedDamageZones(coords);
    }
    
    calculateImpact() {
        console.log('🔥 Calculating impact...', this.asteroidParams);
        
        // Calculate basic physics
        const mass = this.calculateMass();
        const kineticEnergy = this.calculateKineticEnergy(mass);
        const tntEquivalent = this.calculateTNTEquivalent(kineticEnergy);
        
        // Calculate crater dimensions
        const craterDimensions = this.calculateCraterDimensions();
        
        // Calculate seismic effects
        const seismicMagnitude = this.calculateSeismicMagnitude(kineticEnergy);
        
        // Calculate tsunami risk
        const tsunamiRisk = this.calculateTsunamiRisk();
        
        // Calculate damage radii
        const damageRadii = this.calculateDamageRadii(kineticEnergy);
        
        // Store results
        this.impactResults = {
            mass,
            kineticEnergy,
            tntEquivalent,
            ...craterDimensions,
            seismicMagnitude,
            tsunamiRisk,
            ...damageRadii
        };
        
        // Update displays
        this.updateResultsDisplay();
        this.updateImpactMap();
        this.showResultsSummary();
    }
    
    calculateMass() {
        const radius = this.asteroidParams.diameter / 2; // meters
        const volume = (4/3) * Math.PI * Math.pow(radius, 3); // m³
        return volume * this.asteroidParams.density; // kg
    }
    
    calculateKineticEnergy(mass) {
        const velocity = this.asteroidParams.velocity * 1000; // m/s
        return 0.5 * mass * Math.pow(velocity, 2); // Joules
    }
    
    calculateTNTEquivalent(kineticEnergy) {
        const tntJoules = 4.184e9; // Joules per kiloton TNT
        return kineticEnergy / tntJoules; // kilotons
    }
    
    calculateCraterDimensions() {
        // Empirical crater scaling laws
        const energy = this.impactResults?.kineticEnergy || this.calculateKineticEnergy(this.calculateMass());
        const energyMT = energy / (4.184e15); // Convert to megatons
        
        // Crater diameter (km) - simplified scaling law
        let craterDiameter = 1.8 * Math.pow(energyMT, 0.25);
        
        // Adjust for impact angle
        const angleEffect = Math.sin(this.asteroidParams.angle * Math.PI / 180);
        craterDiameter *= Math.pow(angleEffect, 0.33);
        
        // Crater depth (typically 1/10 to 1/5 of diameter)
        const craterDepth = craterDiameter * 0.15;
        
        return {
            craterDiameter: Math.round(craterDiameter * 1000), // meters
            craterDepth: Math.round(craterDepth * 1000) // meters
        };
    }
    
    calculateSeismicMagnitude(kineticEnergy) {
        // Energy-magnitude relationship: log(E) = 1.5M + 4.8
        const logEnergy = Math.log10(kineticEnergy);
        const magnitude = (logEnergy - 4.8) / 1.5;
        return Math.max(0, Math.min(10, magnitude));
    }
    
    calculateTsunamiRisk() {
        if (this.asteroidParams.location !== 'ocean' && this.asteroidParams.location !== 'coast') {
            return { risk: 'None', height: 0 };
        }
        
        const energy = this.impactResults?.kineticEnergy || this.calculateKineticEnergy(this.calculateMass());
        const energyMT = energy / (4.184e15);
        
        if (energyMT < 1) {
            return { risk: 'Low', height: Math.round(energyMT * 5) };
        } else if (energyMT < 100) {
            return { risk: 'High', height: Math.round(energyMT * 2) };
        } else {
            return { risk: 'Catastrophic', height: Math.round(energyMT) };
        }
    }
    
    calculateDamageRadii(kineticEnergy) {
        const energyMT = kineticEnergy / (4.184e15);
        
        // Fireball radius (km)
        const fireballRadius = 0.5 * Math.pow(energyMT, 0.4);
        
        // Blast damage radius (5 psi overpressure)
        const blastRadius = 2.5 * Math.pow(energyMT, 0.33);
        
        // Thermal radiation radius (3rd degree burns)
        const thermalRadius = 4.2 * Math.pow(energyMT, 0.4);
        
        return {
            fireballRadius: Math.round(fireballRadius * 100) / 100,
            blastRadius: Math.round(blastRadius * 100) / 100,
            thermalRadius: Math.round(thermalRadius * 100) / 100
        };
    }
    
    updateResultsDisplay() {
        const results = this.impactResults;
        
        // Kinetic Energy
        document.getElementById('kinetic-energy').textContent = 
            this.formatScientific(results.kineticEnergy) + ' J';
        document.getElementById('tnt-equivalent').textContent = 
            this.formatNumber(results.tntEquivalent) + ' kilotons TNT';
        
        // Crater Size
        document.getElementById('crater-diameter').textContent = 
            this.formatNumber(results.craterDiameter) + ' m';
        document.getElementById('crater-depth').textContent = 
            'Depth: ' + this.formatNumber(results.craterDepth) + ' m';
        
        // Seismic Effects
        document.getElementById('seismic-magnitude').textContent = 
            results.seismicMagnitude.toFixed(1);
        document.getElementById('seismic-range').textContent = 
            'Felt up to ' + Math.round(Math.pow(10, results.seismicMagnitude * 0.5)) + ' km away';
        
        // Tsunami Risk
        const tsunami = results.tsunamiRisk;
        document.getElementById('tsunami-risk').textContent = tsunami.risk;
        document.getElementById('tsunami-height').textContent = 
            tsunami.height > 0 ? `Wave height: ${tsunami.height}m` : 'No tsunami generated';
        
        // Damage radii
        document.getElementById('fireball-radius').textContent = 
            results.fireballRadius + ' km';
        document.getElementById('blast-radius').textContent = 
            results.blastRadius + ' km';
    }
    
    showResultsSummary() {
        const summaryDiv = document.getElementById('results-summary');
        const contentDiv = document.getElementById('summary-content');
        
        summaryDiv.classList.remove('hidden');
        
        // Determine severity level
        const energy = this.impactResults.tntEquivalent;
        let severity, className;
        
        if (energy < 1) {
            severity = 'Minor';
            className = 'safe-zone';
        } else if (energy < 1000) {
            severity = 'Moderate';
            className = 'simulation-panel';
        } else {
            severity = 'Catastrophic';
            className = 'danger-zone';
        }
        
        summaryDiv.className = `mt-8 p-6 rounded-lg ${className}`;
        
        contentDiv.innerHTML = `
            <div class="text-2xl font-bold mb-4">Severity Level: ${severity}</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 class="font-bold text-lg mb-2">Impact Parameters</h4>
                    <ul class="space-y-1">
                        <li>Diameter: ${this.asteroidParams.diameter}m</li>
                        <li>Velocity: ${this.asteroidParams.velocity} km/s</li>
                        <li>Mass: ${this.formatScientific(this.impactResults.mass)} kg</li>
                        <li>Entry Angle: ${this.asteroidParams.angle}°</li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-lg mb-2">Damage Assessment</h4>
                    <ul class="space-y-1">
                        <li>Energy: ${this.formatNumber(this.impactResults.tntEquivalent)} kt TNT</li>
                        <li>Crater: ${this.formatNumber(this.impactResults.craterDiameter)}m diameter</li>
                        <li>Seismic: Magnitude ${this.impactResults.seismicMagnitude.toFixed(1)}</li>
                        <li>Tsunami: ${this.impactResults.tsunamiRisk.risk}</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    simulateDeflection() {
        console.log('🎯 Simulating deflection...', this.deflectionParams);
        
        if (this.deflectionParams.method === 'none') {
            alert('Please select a deflection method first!');
            return;
        }
        
        // Calculate deflection effectiveness based on method and warning time
        const effectiveness = this.calculateDeflectionEffectiveness();
        
        // Simulate velocity change
        const deltaV = this.calculateDeltaV(effectiveness);
        
        // Calculate new trajectory
        const originalVelocity = this.asteroidParams.velocity;
        const newVelocity = originalVelocity - deltaV;
        
        // Update visualization
        this.asteroidParams.velocity = Math.max(5, newVelocity);
        document.getElementById('velocity-value').textContent = `${this.asteroidParams.velocity} km/s`;
        document.getElementById('velocity-slider').value = this.asteroidParams.velocity;
        
        // Recalculate impact with new parameters
        this.calculateImpact();
        
        // Show deflection results
        this.showDeflectionResults(deltaV, effectiveness);
    }
    
    calculateDeflectionEffectiveness() {
        const method = this.deflectionParams.method;
        const warningTime = this.deflectionParams.warningTime;
        
        let baseEffectiveness;
        switch (method) {
            case 'kinetic':
                baseEffectiveness = 0.8;
                break;
            case 'gravity':
                baseEffectiveness = 0.95 * Math.min(1, warningTime / 10);
                break;
            case 'laser':
                baseEffectiveness = 0.6 * Math.min(1, warningTime / 5);
                break;
            case 'nuclear':
                baseEffectiveness = 0.9;
                break;
            default:
                baseEffectiveness = 0;
        }
        
        // Warning time multiplier
        const timeMultiplier = Math.min(2, Math.sqrt(warningTime));
        
        return Math.min(1, baseEffectiveness * timeMultiplier);
    }
    
    calculateDeltaV(effectiveness) {
        // Required velocity change for successful deflection
        const asteroidSize = this.asteroidParams.diameter;
        const baseRequirement = 0.1; // km/s base requirement
        
        // Larger asteroids need more delta-v
        const sizeMultiplier = Math.sqrt(asteroidSize / 100);
        
        const requiredDeltaV = baseRequirement * sizeMultiplier;
        
        return requiredDeltaV * effectiveness;
    }
    
    showDeflectionResults(deltaV, effectiveness) {
        const successRate = effectiveness * 100;
        const resultMessage = `
            Deflection Result:
            Method: ${this.deflectionParams.method.charAt(0).toUpperCase() + this.deflectionParams.method.slice(1)}
            Velocity Change: ${deltaV.toFixed(3)} km/s
            Success Rate: ${successRate.toFixed(1)}%
            
            ${successRate > 80 ? '✅ Mission Success! Earth is safe!' :
              successRate > 50 ? '⚠️ Partial Success - Reduced impact severity' :
              '❌ Mission Failed - Impact still imminent'}
        `;
        
        alert(resultMessage);
    }
    
    playAnimation() {
        document.getElementById('play-animation').classList.add('hidden');
        document.getElementById('pause-animation').classList.remove('hidden');
        
        this.animateImpact();
    }
    
    pauseAnimation() {
        document.getElementById('play-animation').classList.remove('hidden');
        document.getElementById('pause-animation').classList.add('hidden');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animateImpact() {
        if (!this.asteroid) return;
        
        let progress = 0;
        const animate = () => {
            progress += 0.01;
            
            if (progress >= 1) {
                progress = 0;
            }
            
            // Move asteroid along trajectory
            const startDistance = 50;
            const endDistance = 10;
            const distance = startDistance - (startDistance - endDistance) * progress;
            
            const x = distance * Math.cos(this.asteroidParams.angle * Math.PI / 180);
            const y = distance * Math.sin(this.asteroidParams.angle * Math.PI / 180);
            
            this.asteroid.position.set(x, y, 0);
            
            // Add impact flash at the end
            if (progress > 0.95) {
                this.scene3D.background = new THREE.Color(0xff4466);
            } else {
                this.scene3D.background = new THREE.Color(0x000011);
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    resetView() {
        if (this.camera) {
            this.camera.position.set(50, 30, 50);
            this.camera.lookAt(0, 0, 0);
        }
        
        if (this.controls) {
            this.controls.reset();
        }
        
        if (this.asteroid) {
            this.updateAsteroidPosition();
        }
        
        if (this.scene3D) {
            this.scene3D.background = new THREE.Color(0x000011);
        }
    }
    
    animate3D() {
        if (!this.renderer || !this.scene3D || !this.camera) return;
        
        requestAnimationFrame(() => this.animate3D());
        
        if (this.controls) {
            this.controls.update();
        }
        
        // Rotate Earth
        if (this.earth) {
            this.earth.rotation.y += 0.005;
        }
        
        this.renderer.render(this.scene3D, this.camera);
    }
    
    updateVisualization() {
        this.updateAsteroidPosition();
        this.createTrajectoryLine();
    }
    
    updateDeflectionVisualization() {
        // Update 3D visualization based on selected deflection method
        if (this.deflectionParams.method !== 'none') {
            this.createTrajectoryLine();
        }
    }
    
    loadPresetScenarios() {
        // Additional preset scenarios could be loaded here
        console.log('📋 Preset scenarios loaded');
    }
    
    downloadResults() {
        const results = {
            timestamp: new Date().toISOString(),
            asteroidParameters: this.asteroidParams,
            deflectionParameters: this.deflectionParams,
            impactResults: this.impactResults
        };
        
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `meteor-madness-results-${Date.now()}.json`;
        link.click();
    }
    
    shareScenario() {
        const params = new URLSearchParams({
            diameter: this.asteroidParams.diameter,
            velocity: this.asteroidParams.velocity,
            density: this.asteroidParams.density,
            angle: this.asteroidParams.angle,
            location: this.asteroidParams.location
        });
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Meteor Madness Scenario',
                text: `Check out this asteroid impact scenario: ${this.formatNumber(this.impactResults.tntEquivalent)} kilotons TNT equivalent!`,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Scenario URL copied to clipboard!');
            });
        }
    }
    
    formatNumber(num) {
        if (!num) return '0';
        
        if (num >= 1e9) {
            return (num / 1e9).toFixed(1) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(1) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(1) + 'K';
        } else {
            return num.toFixed(1);
        }
    }
    
    formatScientific(num) {
        if (!num) return '0';
        return num.toExponential(2);
    }

    // === Enhanced NASA Integration Methods ===

    async loadImpactor2025() {
        try {
            this.showLoadingIndicator('Loading Impactor-2025 scenario with real orbital data...');
            
            const scenario = await this.enhancedNASA.getImpactor2025Scenario();
            
            // Update asteroid parameters with real data
            this.asteroidParams.diameter = scenario.physical_parameters.diameter;
            this.asteroidParams.velocity = scenario.impact_parameters.velocity;
            this.asteroidParams.angle = scenario.impact_parameters.angle;
            
            // Update UI elements
            document.getElementById('size-slider').value = scenario.physical_parameters.diameter;
            document.getElementById('size-value').textContent = `${scenario.physical_parameters.diameter}m`;
            document.getElementById('velocity-slider').value = scenario.impact_parameters.velocity;
            document.getElementById('velocity-value').textContent = `${scenario.impact_parameters.velocity} km/s`;
            document.getElementById('angle-slider').value = scenario.impact_parameters.angle;
            document.getElementById('angle-value').textContent = `${scenario.impact_parameters.angle}°`;
            
            // Set impact location
            const location = scenario.impact_parameters.location;
            if (location.type === 'Pacific Ocean') {
                this.asteroidParams.location = 'ocean';
                document.getElementById('impact-location').value = 'ocean';
            }
            
            // Update 3D visualization with real trajectory
            this.update3DTrajectory(scenario.trajectory);
            
            // Show educational content
            this.displayImpactorEducationalContent(scenario);
            
            // Calculate seismic equivalent
            const mass = scenario.physical_parameters.estimated_mass;
            const velocity = scenario.impact_parameters.velocity * 1000; // Convert to m/s
            const kineticEnergy = 0.5 * mass * velocity * velocity;
            
            const seismicData = await this.enhancedNASA.calculateImpactSeismicEquivalent(kineticEnergy);
            this.displaySeismicComparison(seismicData);
            
            this.hideLoadingIndicator();
            
            // Show success message
            this.showNotification('✅ Impactor-2025 scenario loaded with real NASA orbital data!', 'success');
            
            return scenario;
        } catch (error) {
            this.hideLoadingIndicator();
            this.showNotification(`❌ Failed to load Impactor-2025: ${error.message}`, 'error');
            console.error('Failed to load Impactor-2025:', error);
        }
    }

    async loadRealTimeNASAData() {
        try {
            this.showLoadingIndicator('Fetching real-time NASA and partner agency data...');
            
            const dashboard = await this.enhancedNASA.createRealTimeDashboard();
            this.realTimeData = dashboard;
            
            // Update dashboard with real data
            await this.enhancedNASA.enhanceMeteorMadnessWithRealData();
            
            // Update educational content
            this.updateEducationalContent();
            
            this.hideLoadingIndicator();
            this.showNotification('🛰️ Real-time NASA data loaded successfully!', 'success');
            
            return dashboard;
        } catch (error) {
            this.hideLoadingIndicator();
            this.showNotification(`❌ Failed to load real-time data: ${error.message}`, 'error');
            console.error('Failed to load real-time NASA data:', error);
        }
    }

    async searchAsteroidDatabase(asteroidName) {
        try {
            this.showLoadingIndicator(`Searching NASA database for ${asteroidName}...`);
            
            const asteroidData = await this.enhancedNASA.getSmallBodyData(asteroidName);
            
            if (asteroidData && asteroidData.name) {
                // Update parameters with real asteroid data
                if (asteroidData.physical_parameters?.diameter) {
                    this.asteroidParams.diameter = asteroidData.physical_parameters.diameter;
                    document.getElementById('size-slider').value = asteroidData.physical_parameters.diameter;
                    document.getElementById('size-value').textContent = `${asteroidData.physical_parameters.diameter}m`;
                }
                
                // Show educational content
                this.educationalContent = this.enhancedNASA.buildEducationalContent(asteroidData);
                this.displayEducationalContent();
                
                // Update 3D visualization with orbital elements
                if (asteroidData.orbital_elements) {
                    this.visualizeRealOrbit(asteroidData.orbital_elements);
                }
                
                this.hideLoadingIndicator();
                this.showNotification(`✅ Loaded data for ${asteroidData.name}`, 'success');
                
                return asteroidData;
            } else {
                throw new Error('Asteroid not found in NASA database');
            }
        } catch (error) {
            this.hideLoadingIndicator();
            this.showNotification(`❌ Failed to find asteroid: ${error.message}`, 'error');
            console.error('Failed to search asteroid database:', error);
        }
    }

    update3DTrajectory(trajectory) {
        if (!this.scene3D || !trajectory) return;
        
        // Remove existing trajectory
        const existingTrajectory = this.scene3D.getObjectByName('trajectory');
        if (existingTrajectory) {
            this.scene3D.remove(existingTrajectory);
        }
        
        // Create trajectory line
        const points = [];
        trajectory.forEach(point => {
            // Convert AU to visualization units (1 AU = 10 units in visualization)
            const x = point.position.x * 10;
            const y = point.position.y * 10;
            const z = point.position.z * 10;
            points.push(new THREE.Vector3(x, y, z));
        });
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xff4444,
            linewidth: 2
        });
        
        const trajectoryLine = new THREE.Line(geometry, material);
        trajectoryLine.name = 'trajectory';
        this.scene3D.add(trajectoryLine);
        
        // Add trajectory points
        trajectory.forEach((point, index) => {
            if (index % 10 === 0) { // Show every 10th point
                const sphereGeometry = new THREE.SphereGeometry(0.2);
                const sphereMaterial = new THREE.MeshBasicMaterial({ 
                    color: point.days_to_impact < 30 ? 0xff0000 : 0xffaa00 
                });
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                
                sphere.position.set(
                    point.position.x * 10,
                    point.position.y * 10,
                    point.position.z * 10
                );
                
                this.scene3D.add(sphere);
            }
        });
    }

    visualizeRealOrbit(orbitalElements) {
        if (!this.scene3D) return;
        
        // Calculate orbital path points
        const points = [];
        const steps = 100;
        
        for (let i = 0; i <= steps; i++) {
            const meanAnomaly = (i / steps) * 2 * Math.PI;
            
            // Simplified orbital calculation for visualization
            const eccentricAnomaly = meanAnomaly; // Approximation for low eccentricity
            const trueAnomaly = eccentricAnomaly;
            
            const r = orbitalElements.semi_major_axis * (1 - orbitalElements.eccentricity * Math.cos(eccentricAnomaly));
            
            const x = r * Math.cos(trueAnomaly) * 10; // Scale for visualization
            const y = r * Math.sin(trueAnomaly) * 10;
            const z = 0; // Simplified to orbital plane
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        // Create orbital path
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ffff,
            linewidth: 1,
            transparent: true,
            opacity: 0.7
        });
        
        const orbitLine = new THREE.Line(geometry, material);
        orbitLine.name = 'real-orbit';
        this.scene3D.add(orbitLine);
    }

    displayImpactorEducationalContent(scenario) {
        const contentHtml = `
            <div class="bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-lg p-6 mb-4">
                <h3 class="text-red-400 font-bold text-xl mb-4">🎯 Impactor-2025 Mission Brief</h3>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-orange-400 font-semibold mb-2">Physical Characteristics</h4>
                        <ul class="space-y-1 text-sm">
                            <li><span class="text-gray-400">Diameter:</span> <span class="text-white">${scenario.physical_parameters.diameter}m</span></li>
                            <li><span class="text-gray-400">Estimated Mass:</span> <span class="text-white">${(scenario.physical_parameters.estimated_mass / 1e9).toFixed(1)} billion kg</span></li>
                            <li><span class="text-gray-400">Composition:</span> <span class="text-white">${scenario.physical_parameters.composition}</span></li>
                            <li><span class="text-gray-400">Discovery:</span> <span class="text-white">${scenario.discovery_date}</span></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 class="text-orange-400 font-semibold mb-2">Impact Parameters</h4>
                        <ul class="space-y-1 text-sm">
                            <li><span class="text-gray-400">Velocity:</span> <span class="text-white">${scenario.impact_parameters.velocity} km/s</span></li>
                            <li><span class="text-gray-400">Angle:</span> <span class="text-white">${scenario.impact_parameters.angle}°</span></li>
                            <li><span class="text-gray-400">Impact Date:</span> <span class="text-red-400">${new Date(scenario.impact_date).toDateString()}</span></li>
                            <li><span class="text-gray-400">Threat Level:</span> <span class="text-red-400 font-bold">${scenario.threat_level}</span></li>
                        </ul>
                    </div>
                </div>
                
                <div class="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                    <p class="text-yellow-400 text-sm">
                        <strong>⚠️ Deflection Window:</strong> 
                        Optimal deflection missions must launch between ${new Date(scenario.deflection_window.optimal_start).toDateString()} 
                        and ${new Date(scenario.deflection_window.latest_effective).toDateString()}
                    </p>
                </div>
            </div>
        `;
        
        const educationalPanel = document.getElementById('educational-content');
        if (educationalPanel) {
            educationalPanel.innerHTML = contentHtml;
        }
    }

    displaySeismicComparison(seismicData) {
        const comparisonHtml = `
            <div class="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg p-4 mb-4">
                <h4 class="text-orange-400 font-bold mb-3">🌍 Seismic Impact Analysis</h4>
                
                <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><span class="text-gray-400">Magnitude:</span> <span class="text-white font-bold">${seismicData.magnitude.toFixed(1)}</span></p>
                        <p><span class="text-gray-400">TNT Equivalent:</span> <span class="text-white">${seismicData.tnt_equivalent_mt.toFixed(0)} MT</span></p>
                        <p><span class="text-gray-400">Felt Radius:</span> <span class="text-white">${(seismicData.felt_radius_km).toFixed(0)} km</span></p>
                    </div>
                    
                    <div>
                        ${seismicData.historical_comparisons.map(comp => `
                            <div class="mb-2">
                                <p class="text-yellow-400 font-semibold">${comp.event}</p>
                                <p class="text-gray-300 text-xs">${comp.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        const seismicPanel = document.getElementById('seismic-comparison');
        if (seismicPanel) {
            seismicPanel.innerHTML = comparisonHtml;
        }
    }

    displayEducationalContent() {
        if (!this.educationalContent) return;
        
        const content = this.educationalContent;
        const contentHtml = `
            <div class="space-y-4">
                ${Object.keys(content).map(sectionKey => {
                    const section = content[sectionKey];
                    return `
                        <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                            <h4 class="text-blue-400 font-bold mb-3">${section.title}</h4>
                            ${this.renderSectionContent(section, sectionKey)}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        const educationalPanel = document.getElementById('educational-content');
        if (educationalPanel) {
            educationalPanel.innerHTML = contentHtml;
        }
    }

    renderSectionContent(section, sectionKey) {
        switch (sectionKey) {
            case 'basic_facts':
                return `<ul class="space-y-1 text-sm">${section.facts.map(fact => 
                    `<li class="text-gray-300">• ${fact}</li>`
                ).join('')}</ul>`;
                
            case 'orbital_mechanics':
                return `<div class="space-y-2">${section.explanations.map(exp => 
                    `<div class="text-sm">
                        <span class="text-yellow-400 font-medium">${exp.concept}:</span>
                        <span class="text-white">${exp.value}</span>
                        <p class="text-gray-400 text-xs mt-1">${exp.explanation}</p>
                    </div>`
                ).join('')}</div>`;
                
            case 'threat_assessment':
                return `<div class="space-y-2">${section.assessment.map(assess => 
                    `<div class="text-sm">
                        <p class="text-red-400 font-medium">Level: ${assess.level}</p>
                        <p class="text-gray-300">${assess.reason}</p>
                        <p class="text-yellow-400 text-xs">${assess.monitoring}</p>
                    </div>`
                ).join('')}</div>`;
                
            default:
                return '<p class="text-gray-400 text-sm">Content loading...</p>';
        }
    }

    updateEducationalContent() {
        if (this.realTimeData) {
            const updateHtml = `
                <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                    <h4 class="text-green-400 font-bold mb-3">📡 Real-Time Space Monitoring</h4>
                    <div class="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p class="text-gray-400">Tracked Objects</p>
                            <p class="text-white font-bold text-lg">${this.realTimeData.space_surveillance.tracked_objects?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Detection Rate</p>
                            <p class="text-white font-bold">${this.realTimeData.space_surveillance.detection_rate}</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Data Sources</p>
                            <p class="text-white">${this.realTimeData.data_sources.nasa_apis.length + this.realTimeData.data_sources.partner_agencies.length} APIs</p>
                        </div>
                    </div>
                </div>
            `;
            
            const realTimePanel = document.getElementById('real-time-updates');
            if (realTimePanel) {
                realTimePanel.innerHTML = updateHtml;
            }
        }
    }

    showLoadingIndicator(message) {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                    <span class="text-blue-400">${message}</span>
                </div>
            `;
            indicator.classList.remove('hidden');
        }
    }

    hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-900/80' : 
                       type === 'error' ? 'bg-red-900/80' : 'bg-blue-900/80';
        const borderColor = type === 'success' ? 'border-green-500' : 
                           type === 'error' ? 'border-red-500' : 'border-blue-500';
        
        notification.className = `fixed top-4 right-4 ${bgColor} ${borderColor} border text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm">${message}</span>
                <button class="ml-4 text-gray-300 hover:text-white" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    displayCometsData(comets) {
        const cometHtml = `
            <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-4">
                <h4 class="text-yellow-400 font-bold text-xl mb-4">☄️ Near-Earth Comets Data</h4>
                <p class="text-gray-300 mb-4">Showing ${comets.length} Near-Earth Comets from NASA Open Data Portal</p>
                
                <div class="max-h-60 overflow-y-auto space-y-2">
                    ${comets.slice(0, 10).map(comet => `
                        <div class="bg-gray-800/50 p-3 rounded border border-yellow-600/30">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-white font-medium">${comet.object_name || comet.full_name || 'Unknown Comet'}</p>
                                    <p class="text-yellow-400 text-sm">${comet.object_class || 'Comet'}</p>
                                </div>
                                <div class="text-right text-sm">
                                    ${comet.q_au_1 ? `<p class="text-gray-300">Perihelion: ${parseFloat(comet.q_au_1).toFixed(3)} AU</p>` : ''}
                                    ${comet.e ? `<p class="text-gray-300">Eccentricity: ${parseFloat(comet.e).toFixed(3)}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${comets.length > 10 ? `<p class="text-gray-400 text-sm mt-3">Showing first 10 of ${comets.length} comets</p>` : ''}
            </div>
        `;
        
        const educationalPanel = document.getElementById('educational-content');
        if (educationalPanel) {
            educationalPanel.innerHTML = cometHtml;
        }
    }

    displayEarthquakeData(earthquakes) {
        const features = earthquakes.features || [];
        const earthquakeHtml = `
            <div class="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6 mb-4">
                <h4 class="text-orange-400 font-bold text-xl mb-4">🌍 Recent Major Earthquakes (USGS)</h4>
                <p class="text-gray-300 mb-4">Showing recent earthquakes magnitude 6.0+ for impact comparison</p>
                
                <div class="max-h-60 overflow-y-auto space-y-2">
                    ${features.slice(0, 10).map(eq => {
                        const props = eq.properties;
                        const coords = eq.geometry.coordinates;
                        return `
                            <div class="bg-gray-800/50 p-3 rounded border border-orange-600/30">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="text-white font-medium">${props.place}</p>
                                        <p class="text-orange-400 text-sm">Magnitude ${props.mag}</p>
                                    </div>
                                    <div class="text-right text-sm">
                                        <p class="text-gray-300">${new Date(props.time).toLocaleDateString()}</p>
                                        <p class="text-gray-300">Depth: ${coords[2]}km</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                    <p class="text-blue-400 text-sm">
                        <strong>💡 Impact Comparison:</strong> 
                        Calculate an asteroid impact to see how its seismic magnitude compares to these historical earthquakes.
                    </p>
                </div>
            </div>
        `;
        
        const educationalPanel = document.getElementById('educational-content');
        if (educationalPanel) {
            educationalPanel.innerHTML = earthquakeHtml;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.meteorMadness = new MeteorMadness();
});