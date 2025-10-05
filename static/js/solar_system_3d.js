/**
 * Solar System 3D Visualization with Accurate Physics
 * Uses real orbital parameters and scales
 */

class SolarSystem3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with id "${containerId}" not found`);
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.planets = [];
        this.animationId = null;
        this.timeScale = 1; // Days per frame
        this.currentDate = new Date();
        
        // Accurate planetary data (AU = Astronomical Units, 1 AU = 149.6 million km)
        this.planetData = {
            mercury: {
                name: 'Mercury',
                radius: 2439.7, // km
                semiMajorAxis: 0.387, // AU
                orbitalPeriod: 87.97, // days
                color: 0x8C7853,
                eccentricity: 0.2056,
                inclination: 7.0, // degrees
                rotationPeriod: 58.6 // days
            },
            venus: {
                name: 'Venus',
                radius: 6051.8,
                semiMajorAxis: 0.723,
                orbitalPeriod: 224.7,
                color: 0xFFC649,
                eccentricity: 0.0068,
                inclination: 3.39,
                rotationPeriod: 243 // retrograde
            },
            earth: {
                name: 'Earth',
                radius: 6371,
                semiMajorAxis: 1.0,
                orbitalPeriod: 365.26,
                color: 0x4169E1,
                eccentricity: 0.0167,
                inclination: 0.0,
                rotationPeriod: 1.0,
                hasMoon: true
            },
            mars: {
                name: 'Mars',
                radius: 3389.5,
                semiMajorAxis: 1.524,
                orbitalPeriod: 686.98,
                color: 0xCD5C5C,
                eccentricity: 0.0934,
                inclination: 1.85,
                rotationPeriod: 1.03
            },
            jupiter: {
                name: 'Jupiter',
                radius: 69911,
                semiMajorAxis: 5.203,
                orbitalPeriod: 4332.59,
                color: 0xDAA520,
                eccentricity: 0.0484,
                inclination: 1.31,
                rotationPeriod: 0.41
            },
            saturn: {
                name: 'Saturn',
                radius: 58232,
                semiMajorAxis: 9.537,
                orbitalPeriod: 10759.22,
                color: 0xF4A460,
                eccentricity: 0.0542,
                inclination: 2.49,
                rotationPeriod: 0.45,
                hasRings: true
            },
            uranus: {
                name: 'Uranus',
                radius: 25362,
                semiMajorAxis: 19.191,
                orbitalPeriod: 30688.5,
                color: 0x4FD0E7,
                eccentricity: 0.0472,
                inclination: 0.77,
                rotationPeriod: 0.72
            },
            neptune: {
                name: 'Neptune',
                radius: 24622,
                semiMajorAxis: 30.069,
                orbitalPeriod: 60182,
                color: 0x4169E1,
                eccentricity: 0.0086,
                inclination: 1.77,
                rotationPeriod: 0.67
            }
        };
        
        this.init();
    }
    
    init() {
        try {
            // Check if Three.js is loaded
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js is not loaded');
            }
            
            this.setupScene();
            this.createSun();
            this.createPlanets();
            this.createOrbitPaths();
            this.setupLighting();
            this.setupControls();
            this.addStarfield();
            this.addLabels();
            this.animate();
            
            // Handle window resize
            window.addEventListener('resize', () => this.onWindowResize());
            
            console.log('✅ Solar System 3D initialization completed successfully');
        } catch (error) {
            console.error('❌ Solar System 3D initialization failed:', error);
            throw error;
        }
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011); // Dark space background
        
        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 10000);
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000011, 1.0); // Dark space background
        
        // Hide loading indicator
        const loadingDiv = document.getElementById('solar-system-loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createSun() {
        const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xFDB813,
            emissive: 0xFDB813,
            emissiveIntensity: 1.2
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);
        
        // Add sun glow with better visibility
        const glowGeometry = new THREE.SphereGeometry(5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.4
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(glow);
        
        // Add corona effect
        const coronaGeometry = new THREE.SphereGeometry(6, 32, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFAA00,
            transparent: true,
            opacity: 0.2
        });
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.sun.add(corona);
    }
    
    createPlanets() {
        // Scale factor for visualization (make planets visible)
        const radiusScale = 0.1; // Scale down planet sizes for visibility  
        const distanceScale = 15; // Scale distances for visualization
        
        Object.entries(this.planetData).forEach(([key, data]) => {
            // Planet sphere with better sizing
            const radius = Math.max(0.5, Math.log(data.radius + 1) * radiusScale);
            const geometry = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.7,
                metalness: 0.3
            });
            
            const planet = new THREE.Mesh(geometry, material);
            
            // Create orbit group (for inclination)
            const orbitGroup = new THREE.Group();
            orbitGroup.rotation.x = THREE.MathUtils.degToRad(data.inclination);
            
            // Store planet data
            planet.userData = {
                ...data,
                orbitGroup: orbitGroup,
                angle: Math.random() * Math.PI * 2, // Random starting position
                distanceScale: distanceScale
            };
            
            orbitGroup.add(planet);
            this.scene.add(orbitGroup);
            this.planets.push(planet);
            
            // Add rings for Saturn
            if (data.hasRings) {
                this.addRings(planet, radius);
            }
            
            // Add moon for Earth
            if (data.hasMoon) {
                this.addMoon(planet, radius);
            }
        });
    }
    
    addRings(planet, planetRadius) {
        const innerRadius = planetRadius * 1.5;
        const outerRadius = planetRadius * 2.5;
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xC8B599,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }
    
    addMoon(planet, planetRadius) {
        const moonGeometry = new THREE.SphereGeometry(planetRadius * 0.27, 16, 16);
        const moonMaterial = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC,
            roughness: 0.9
        });
        
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(planetRadius * 8, 0, 0);
        
        planet.userData.moon = moon;
        planet.add(moon);
    }
    
    createOrbitPaths() {
        const distanceScale = 10;
        
        Object.values(this.planetData).forEach(data => {
            const points = [];
            const segments = 128;
            
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                
                // Calculate position using elliptical orbit
                const a = data.semiMajorAxis * distanceScale; // Semi-major axis
                const e = data.eccentricity; // Eccentricity
                const b = a * Math.sqrt(1 - e * e); // Semi-minor axis
                
                const x = a * Math.cos(angle);
                const z = b * Math.sin(angle);
                
                points.push(new THREE.Vector3(x, 0, z));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x00d4ff,
                transparent: true,
                opacity: 0.5
            });
            
            const orbit = new THREE.Line(geometry, material);
            orbit.rotation.x = THREE.MathUtils.degToRad(data.inclination);
            this.scene.add(orbit);
        });
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
        this.scene.add(ambientLight);
        
        // Point light from sun
        const sunLight = new THREE.PointLight(0xFFFFFF, 2, 1000);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
        
        // Hemisphere light for better visibility
        const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 0.5);
        this.scene.add(hemiLight);
    }
    
    setupControls() {
        try {
            // Check if OrbitControls is available
            if (typeof THREE.OrbitControls !== 'undefined') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.minDistance = 10;
                this.controls.maxDistance = 500;
                this.controls.enablePan = true;
            } else {
                console.warn('OrbitControls not available, using basic mouse interaction');
                // Add basic mouse interaction fallback
                this.setupBasicControls();
            }
        } catch (error) {
            console.error('Failed to setup controls:', error);
        }
    }
    
    setupBasicControls() {
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            this.camera.position.x += deltaX * 0.1;
            this.camera.position.y -= deltaY * 0.1;
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        this.renderer.domElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
        });
    }
    
    addStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1.2,
            transparent: true,
            opacity: 0.8
        });
        
        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
    }
    
    addLabels() {
        // Add planet name labels with better visibility
        this.planets.forEach(planet => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            
            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Add background for better visibility
            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add text
            context.fillStyle = '#00d4ff';
            context.font = 'Bold 20px Arial';
            context.textAlign = 'center';
            context.strokeStyle = '#000000';
            context.lineWidth = 3;
            context.strokeText(planet.userData.name, 128, 40);
            context.fillText(planet.userData.name, 128, 40);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true,
                alphaTest: 0.1
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(8, 2, 1);
            sprite.position.y = 3;
            
            planet.add(sprite);
        });
    }
    
    updatePlanetPositions(deltaTime) {
        const daysPerFrame = this.timeScale * deltaTime / 1000; // Convert ms to days
        
        this.planets.forEach(planet => {
            const data = planet.userData;
            const distanceScale = data.distanceScale;
            
            // Update angle based on orbital period
            const angularVelocity = (2 * Math.PI) / data.orbitalPeriod; // radians per day
            data.angle += angularVelocity * daysPerFrame;
            
            // Keep angle in range [0, 2π]
            if (data.angle > 2 * Math.PI) {
                data.angle -= 2 * Math.PI;
            }
            
            // Calculate elliptical orbit position
            const a = data.semiMajorAxis * distanceScale; // Semi-major axis
            const e = data.eccentricity; // Eccentricity
            const b = a * Math.sqrt(1 - e * e); // Semi-minor axis
            
            // Parametric equations for ellipse
            const x = a * Math.cos(data.angle);
            const z = b * Math.sin(data.angle);
            
            planet.position.set(x, 0, z);
            
            // Rotate planet on its axis
            const rotationSpeed = (2 * Math.PI) / data.rotationPeriod;
            planet.rotation.y += rotationSpeed * daysPerFrame;
            
            // Update moon if present
            if (data.moon) {
                const moonOrbitSpeed = 0.1; // Arbitrary speed for visualization
                data.moon.rotation.y += moonOrbitSpeed * deltaTime / 1000;
                
                // Orbit moon around planet
                const moonAngle = Date.now() * 0.001;
                const moonDistance = planet.geometry.parameters.radius * 8;
                data.moon.position.x = Math.cos(moonAngle) * moonDistance;
                data.moon.position.z = Math.sin(moonAngle) * moonDistance;
            }
        });
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const deltaTime = 16; // ~60fps
        this.updatePlanetPositions(deltaTime);
        
        if (this.controls) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        if (!this.container || this.container.clientWidth === 0) return;
        
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    setTimeScale(scale) {
        this.timeScale = scale;
    }
    
    focusPlanet(planetName) {
        const planet = this.planets.find(p => 
            p.userData.name.toLowerCase() === planetName.toLowerCase()
        );
        
        if (planet) {
            const distance = planet.userData.semiMajorAxis * planet.userData.distanceScale;
            this.camera.position.set(
                planet.position.x + distance * 0.3,
                distance * 0.2,
                planet.position.z + distance * 0.3
            );
            this.controls.target.copy(planet.position);
        }
    }
    
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystem3D;
}
