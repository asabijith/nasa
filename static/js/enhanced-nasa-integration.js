/**
 * Enhanced NASA Integration Module
 * Integrates comprehensive NASA and partner agency data sources
 * with the Meteor Madness simulation platform
 */

class EnhancedNASAIntegration {
    constructor() {
        this.apiBase = '/api/enhanced-nasa';
        this.usgsBase = '/api/usgs';
        this.csaBase = '/api/csa';
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }

    // === NASA Small-Body Database Integration ===
    
    async getSmallBodyData(objectName) {
        const cacheKey = `sbdb_${objectName}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.apiBase}/small-body-database/${encodeURIComponent(objectName)}`);
            const data = await response.json();
            
            if (response.ok) {
                this.setCache(cacheKey, data);
                return data;
            } else {
                throw new Error(data.error || 'Failed to fetch small body data');
            }
        } catch (error) {
            console.error('Small-Body Database API error:', error);
            throw error;
        }
    }

    // === JPL Horizons Integration ===
    
    async getHorizonsEphemeris(params = {}) {
        const queryParams = new URLSearchParams({
            target: params.target || 'Apophis',
            observer: params.observer || '500@399',
            start_time: params.start_time || new Date().toISOString().split('T')[0],
            stop_time: params.stop_time || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
            step_size: params.step_size || '1d'
        });

        try {
            const response = await fetch(`${this.apiBase}/horizons-ephemeris?${queryParams}`);
            const data = await response.json();
            
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.error || 'Failed to fetch ephemeris data');
            }
        } catch (error) {
            console.error('Horizons API error:', error);
            throw error;
        }
    }

    // === Near-Earth Comets Integration ===
    
    async getNearEarthComets() {
        const cacheKey = 'near_earth_comets';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.apiBase}/near-earth-comets`);
            const data = await response.json();
            
            if (response.ok) {
                this.setCache(cacheKey, data);
                return data;
            } else {
                throw new Error(data.error || 'Failed to fetch comet data');
            }
        } catch (error) {
            console.error('Near-Earth Comets API error:', error);
            throw error;
        }
    }

    // === Impactor-2025 Enhanced Scenario ===
    
    async getImpactor2025Scenario() {
        const cacheKey = 'impactor_2025_scenario';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.apiBase}/impactor-2025-scenario`);
            const data = await response.json();
            
            if (response.ok) {
                this.setCache(cacheKey, data);
                return data;
            } else {
                throw new Error(data.error || 'Failed to create Impactor-2025 scenario');
            }
        } catch (error) {
            console.error('Impactor-2025 scenario error:', error);
            throw error;
        }
    }

    // === USGS Seismic Integration ===
    
    async getEarthquakeCatalog(params = {}) {
        const queryParams = new URLSearchParams({
            start_date: params.start_date || '2020-01-01',
            end_date: params.end_date || new Date().toISOString().split('T')[0],
            min_magnitude: params.min_magnitude || 5.0
        });

        try {
            const response = await fetch(`${this.usgsBase}/earthquake-catalog?${queryParams}`);
            const data = await response.json();
            
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.error || 'Failed to fetch earthquake data');
            }
        } catch (error) {
            console.error('USGS Earthquake Catalog error:', error);
            throw error;
        }
    }

    async calculateImpactSeismicEquivalent(kineticEnergy) {
        try {
            const response = await fetch(`${this.usgsBase}/impact-seismic-equivalent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    kinetic_energy: kineticEnergy
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.error || 'Failed to calculate seismic equivalent');
            }
        } catch (error) {
            console.error('Seismic calculation error:', error);
            throw error;
        }
    }

    // === Canadian Space Agency NEOSSAT Integration ===
    
    async getNEOSSATObservations() {
        const cacheKey = 'neossat_observations';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.csaBase}/neossat-observations`);
            const data = await response.json();
            
            if (response.ok) {
                this.setCache(cacheKey, data);
                return data;
            } else {
                throw new Error(data.error || 'Failed to fetch NEOSSAT data');
            }
        } catch (error) {
            console.error('NEOSSAT API error:', error);
            throw error;
        }
    }

    // === Orbital Mechanics Calculations ===
    
    async calculateOrbitalPosition(keplerianElements, julianDate = null) {
        try {
            const payload = {
                ...keplerianElements,
                julian_date: julianDate || this.dateToJulian(new Date())
            };

            const response = await fetch(`${this.apiBase}/orbital-position`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.error || 'Failed to calculate orbital position');
            }
        } catch (error) {
            console.error('Orbital calculation error:', error);
            throw error;
        }
    }

    // === Comprehensive Data Integration ===
    
    async getIntegratedResources() {
        const cacheKey = 'integrated_resources';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${this.apiBase}/integrated-resources`);
            const data = await response.json();
            
            if (response.ok) {
                this.setCache(cacheKey, data);
                return data;
            } else {
                throw new Error(data.error || 'Failed to fetch integrated resources');
            }
        } catch (error) {
            console.error('Integrated resources error:', error);
            throw error;
        }
    }

    // === Educational Resource Builder ===
    
    buildEducationalContent(asteroidData) {
        const content = {
            basic_facts: {
                title: `About ${asteroidData.name || 'This Asteroid'}`,
                facts: []
            },
            orbital_mechanics: {
                title: 'Orbital Characteristics',
                explanations: []
            },
            threat_assessment: {
                title: 'Threat Level Analysis',
                assessment: []
            },
            deflection_options: {
                title: 'Deflection Strategies',
                strategies: []
            }
        };

        // Build basic facts
        if (asteroidData.physical_parameters?.diameter) {
            content.basic_facts.facts.push(
                `Diameter: ${asteroidData.physical_parameters.diameter} meters`
            );
        }

        if (asteroidData.orbit_class) {
            content.basic_facts.facts.push(
                `Orbit Classification: ${asteroidData.orbit_class}`
            );
        }

        // Build orbital mechanics explanation
        if (asteroidData.orbital_elements) {
            const elements = asteroidData.orbital_elements;
            
            content.orbital_mechanics.explanations.push({
                concept: 'Semi-major Axis',
                value: `${elements.semi_major_axis} AU`,
                explanation: 'Average distance from the Sun during its orbit'
            });

            content.orbital_mechanics.explanations.push({
                concept: 'Eccentricity',
                value: elements.eccentricity,
                explanation: 'How elliptical the orbit is (0 = circular, 1 = parabolic)'
            });

            content.orbital_mechanics.explanations.push({
                concept: 'Inclination',
                value: `${elements.inclination}°`,
                explanation: 'Tilt of the orbital plane relative to Earth\'s orbit'
            });
        }

        // Build threat assessment
        if (asteroidData.pha) {
            content.threat_assessment.assessment.push({
                level: 'Potentially Hazardous',
                reason: 'Classified as PHA due to size and orbital proximity to Earth',
                monitoring: 'Continuous tracking and orbit refinement required'
            });
        }

        return content;
    }

    // === Real-time Data Dashboard ===
    
    async createRealTimeDashboard() {
        try {
            const [
                impactorScenario,
                cometsData,
                neossatData,
                earthquakeData
            ] = await Promise.all([
                this.getImpactor2025Scenario(),
                this.getNearEarthComets(),
                this.getNEOSSATObservations(),
                this.getEarthquakeCatalog({ min_magnitude: 6.0 })
            ]);

            return {
                impactor_tracking: {
                    scenario: impactorScenario,
                    trajectory_points: impactorScenario.trajectory?.length || 0,
                    days_to_impact: this.calculateDaysToImpact(impactorScenario.impact_date)
                },
                space_surveillance: {
                    neossat_status: neossatData.mission_status,
                    detection_rate: neossatData.observation_capabilities?.detection_rate,
                    tracked_objects: neossatData.space_situational_awareness?.tracked_objects
                },
                comet_monitoring: {
                    total_comets: cometsData.length,
                    recent_discoveries: cometsData.slice(-5)
                },
                seismic_reference: {
                    recent_major_earthquakes: this.filterMajorEarthquakes(earthquakeData),
                    impact_comparison_ready: true
                },
                data_sources: {
                    nasa_apis: ['NEO Web Service', 'Small-Body Database', 'Horizons System'],
                    partner_agencies: ['USGS NEIC', 'CSA NEOSSAT'],
                    last_updated: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Dashboard creation error:', error);
            throw error;
        }
    }

    // === Utility Methods ===
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    dateToJulian(date) {
        const a = Math.floor((14 - date.getMonth() - 1) / 12);
        const y = date.getFullYear() + 4800 - a;
        const m = date.getMonth() + 1 + 12 * a - 3;
        
        const jdn = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
                   Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        
        const fraction = (date.getHours() + date.getMinutes()/60 + date.getSeconds()/3600) / 24;
        
        return jdn + fraction - 0.5;
    }

    calculateDaysToImpact(impactDateStr) {
        const impactDate = new Date(impactDateStr);
        const now = new Date();
        const diffTime = impactDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    filterMajorEarthquakes(earthquakeData) {
        if (!earthquakeData.features) return [];
        
        return earthquakeData.features
            .filter(eq => eq.properties.mag >= 6.0)
            .slice(0, 10)
            .map(eq => ({
                magnitude: eq.properties.mag,
                location: eq.properties.place,
                date: new Date(eq.properties.time).toISOString().split('T')[0],
                depth: eq.geometry.coordinates[2]
            }));
    }

    // === Integration with Meteor Madness Interface ===
    
    async enhanceMeteorMadnessWithRealData() {
        try {
            const dashboard = await this.createRealTimeDashboard();
            
            // Update UI elements with real data
            this.updateImpactorTracking(dashboard.impactor_tracking);
            this.updateSpaceSurveillance(dashboard.space_surveillance);
            this.updateSeismicReference(dashboard.seismic_reference);
            
            return dashboard;
        } catch (error) {
            console.error('Failed to enhance Meteor Madness with real data:', error);
            throw error;
        }
    }

    updateImpactorTracking(trackingData) {
        const trackingElement = document.getElementById('impactor-tracking');
        if (trackingElement) {
            trackingElement.innerHTML = `
                <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h3 class="text-red-400 font-bold text-lg mb-2">🎯 Impactor-2025 Tracking</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-400">Trajectory Points:</span>
                            <span class="text-white ml-2">${trackingData.trajectory_points}</span>
                        </div>
                        <div>
                            <span class="text-gray-400">Days to Impact:</span>
                            <span class="text-red-400 ml-2 font-bold">${trackingData.days_to_impact}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    updateSpaceSurveillance(surveillanceData) {
        const surveillanceElement = document.getElementById('space-surveillance');
        if (surveillanceElement) {
            surveillanceElement.innerHTML = `
                <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h3 class="text-blue-400 font-bold text-lg mb-2">🛰️ Space Surveillance</h3>
                    <div class="text-sm space-y-2">
                        <div>
                            <span class="text-gray-400">NEOSSAT Status:</span>
                            <span class="text-green-400 ml-2">${surveillanceData.neossat_status}</span>
                        </div>
                        <div>
                            <span class="text-gray-400">Tracked Objects:</span>
                            <span class="text-white ml-2">${surveillanceData.tracked_objects?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    updateSeismicReference(seismicData) {
        const seismicElement = document.getElementById('seismic-reference');
        if (seismicElement && seismicData.recent_major_earthquakes) {
            const recentEqs = seismicData.recent_major_earthquakes.slice(0, 3);
            
            seismicElement.innerHTML = `
                <div class="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                    <h3 class="text-orange-400 font-bold text-lg mb-2">🌍 Seismic Reference</h3>
                    <div class="text-sm space-y-2">
                        ${recentEqs.map(eq => `
                            <div class="flex justify-between">
                                <span class="text-gray-400">${eq.location.split(',')[0]}</span>
                                <span class="text-white">M${eq.magnitude}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedNASAIntegration;
} else if (typeof window !== 'undefined') {
    window.EnhancedNASAIntegration = EnhancedNASAIntegration;
}