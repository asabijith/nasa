"""
Impact Physics and Crater Calculations
Based on scientific scaling laws for asteroid impacts
"""
import math
from typing import Dict, Tuple
from dataclasses import dataclass

@dataclass
class ImpactParameters:
    """Parameters for asteroid impact calculations"""
    diameter: float  # meters
    velocity: float  # km/s
    density: float  # kg/m³ (typical: 3000 for rocky, 7800 for iron)
    angle: float  # degrees from horizontal
    target_type: str  # 'land' or 'water'
    
class ImpactPhysicsCalculator:
    """Calculate detailed impact physics and consequences"""
    
    # Constants
    EARTH_GRAVITY = 9.81  # m/s²
    TNT_EQUIVALENT = 4.184e12  # Joules per megaton TNT
    
    def __init__(self, params: ImpactParameters):
        self.params = params
        self.results = {}
        
    def calculate_all(self) -> Dict:
        """Calculate all impact effects"""
        self.calculate_kinetic_energy()
        self.calculate_crater_dimensions()
        self.calculate_seismic_effects()
        self.calculate_blast_effects()
        self.calculate_thermal_effects()
        
        if self.params.target_type == 'water':
            self.calculate_tsunami_effects()
        
        self.calculate_atmospheric_effects()
        self.calculate_ejecta_effects()
        
        return self.results
    
    def calculate_kinetic_energy(self):
        """Calculate impact kinetic energy"""
        # Calculate mass from diameter and density
        radius = self.params.diameter / 2  # meters
        volume = (4/3) * math.pi * (radius ** 3)  # m³
        mass = volume * self.params.density  # kg
        
        # Convert velocity to m/s
        velocity_ms = self.params.velocity * 1000
        
        # Calculate kinetic energy (KE = 0.5 * m * v²)
        kinetic_energy = 0.5 * mass * (velocity_ms ** 2)  # Joules
        
        # Convert to megatons of TNT
        megatons_tnt = kinetic_energy / self.TNT_EQUIVALENT
        
        # Adjust for impact angle (energy dissipation)
        angle_factor = math.sin(math.radians(self.params.angle))
        effective_energy = kinetic_energy * angle_factor
        
        self.results['mass'] = mass
        self.results['kinetic_energy_joules'] = kinetic_energy
        self.results['kinetic_energy_megatons'] = megatons_tnt
        self.results['effective_energy'] = effective_energy
        self.results['effective_megatons'] = effective_energy / self.TNT_EQUIVALENT
        
        # Compare to historical events
        self.results['hiroshima_equivalent'] = megatons_tnt / 0.015  # Hiroshima was ~15 kilotons
        
    def calculate_crater_dimensions(self):
        """Calculate crater size using scaling laws"""
        # Simplified crater scaling relationship
        # D_crater = C * (E)^0.28 where E is in megatons
        # C depends on target material and gravity
        
        energy_mt = self.results['effective_megatons']
        
        if self.params.target_type == 'land':
            # For hard rock
            scaling_constant = 1.8  # km per megaton^0.28
        else:
            # For water (transient crater in seafloor)
            scaling_constant = 2.2
        
        # Crater diameter (km)
        crater_diameter = scaling_constant * (energy_mt ** 0.28)
        
        # Crater depth (typically 1/5 to 1/3 of diameter)
        crater_depth = crater_diameter / 5
        
        # Crater volume
        crater_volume = (math.pi / 4) * (crater_diameter ** 2) * crater_depth  # km³
        
        self.results['crater_diameter_km'] = crater_diameter
        self.results['crater_diameter_m'] = crater_diameter * 1000
        self.results['crater_depth_km'] = crater_depth
        self.results['crater_depth_m'] = crater_depth * 1000
        self.results['crater_volume_km3'] = crater_volume
        
    def calculate_seismic_effects(self):
        """Calculate earthquake magnitude from impact"""
        # Seismic energy relationship with impact energy
        # M = 0.67 * log10(E) - 5.87 (where E is in Joules)
        
        energy_joules = self.results['effective_energy']
        
        # Richter magnitude
        if energy_joules > 0:
            magnitude = 0.67 * math.log10(energy_joules) - 5.87
        else:
            magnitude = 0
        
        # Mercalli intensity at various distances
        crater_radius = self.results['crater_diameter_km'] / 2
        
        distances = [10, 50, 100, 500, 1000, 5000]  # km
        intensities = {}
        
        for distance in distances:
            # Intensity decreases with distance
            if distance < crater_radius:
                intensity = "XII (Total destruction)"
            else:
                # Simplified intensity calculation
                intensity_value = magnitude - 1.5 * math.log10(distance / crater_radius)
                intensity_value = max(0, min(12, intensity_value))
                
                if intensity_value >= 10:
                    intensities[distance] = f"X-XII (Extreme - {intensity_value:.1f})"
                elif intensity_value >= 8:
                    intensities[distance] = f"VIII-IX (Severe - {intensity_value:.1f})"
                elif intensity_value >= 6:
                    intensities[distance] = f"VI-VII (Strong - {intensity_value:.1f})"
                elif intensity_value >= 4:
                    intensities[distance] = f"IV-V (Moderate - {intensity_value:.1f})"
                else:
                    intensities[distance] = f"I-III (Minor - {intensity_value:.1f})"
        
        self.results['seismic_magnitude'] = magnitude
        self.results['seismic_intensities'] = intensities
        
    def calculate_blast_effects(self):
        """Calculate blast wave overpressure effects"""
        # Blast overpressure at various distances
        energy_mt = self.results['effective_megatons']
        
        # Scaling law: P = K * (W^0.33 / R) where W is yield, R is range
        distances = [1, 5, 10, 25, 50, 100, 250, 500]  # km
        blast_effects = {}
        
        for distance in distances:
            if distance == 0:
                continue
            
            # Overpressure in psi
            scaled_distance = distance / (energy_mt ** 0.33)
            
            if scaled_distance < 0.1:
                overpressure = 100  # Near total destruction
                effect = "Complete annihilation"
            elif scaled_distance < 0.5:
                overpressure = 20
                effect = "Reinforced concrete destroyed"
            elif scaled_distance < 1:
                overpressure = 10
                effect = "Heavy damage to buildings"
            elif scaled_distance < 2:
                overpressure = 5
                effect = "Most buildings collapse"
            elif scaled_distance < 5:
                overpressure = 2
                effect = "Moderate damage to structures"
            elif scaled_distance < 10:
                overpressure = 1
                effect = "Window breakage"
            else:
                overpressure = 0.1
                effect = "Minor damage"
            
            blast_effects[distance] = {
                'overpressure_psi': overpressure,
                'effect': effect
            }
        
        self.results['blast_effects'] = blast_effects
        
    def calculate_thermal_effects(self):
        """Calculate thermal radiation effects"""
        energy_mt = self.results['effective_megatons']
        
        # Thermal energy (roughly 30% of total energy)
        thermal_energy_mt = energy_mt * 0.3
        
        distances = [1, 5, 10, 25, 50, 100, 250]  # km
        thermal_effects = {}
        
        for distance in distances:
            if distance == 0:
                continue
            
            # Thermal flux (cal/cm²)
            # Q = Y * 1e6 / (4 * π * R²) where Y is in MT, R in km
            thermal_flux = (thermal_energy_mt * 1e6) / (4 * math.pi * (distance ** 2))
            
            if thermal_flux > 500:
                effect = "Everything ignites, vaporization"
            elif thermal_flux > 100:
                effect = "Third-degree burns, fires"
            elif thermal_flux > 40:
                effect = "Second-degree burns"
            elif thermal_flux > 10:
                effect = "First-degree burns"
            elif thermal_flux > 5:
                effect = "Pain, minor burns"
            else:
                effect = "No significant burns"
            
            thermal_effects[distance] = {
                'thermal_flux_cal_cm2': thermal_flux,
                'effect': effect
            }
        
        self.results['thermal_effects'] = thermal_effects
        
    def calculate_tsunami_effects(self):
        """Calculate tsunami wave characteristics for ocean impacts"""
        # Only if impact is in water
        if self.params.target_type != 'water':
            return
        
        energy_mt = self.results['effective_megatons']
        
        # Tsunami wave height generation (simplified model)
        # H = C * E^0.5 where E is energy
        initial_wave_height = 0.1 * math.sqrt(energy_mt * 1000)  # meters
        
        # Wave propagation (deep water tsunami speed ~= sqrt(g*d) where d is depth)
        # Assume average ocean depth of 4000m
        tsunami_speed = math.sqrt(self.EARTH_GRAVITY * 4000)  # m/s
        tsunami_speed_kmh = tsunami_speed * 3.6
        
        # Wave height at various distances from impact
        distances = [100, 500, 1000, 2000, 5000]  # km
        tsunami_effects = {}
        
        for distance in distances:
            # Wave height decreases with distance (simplified)
            wave_height = initial_wave_height * math.sqrt(100 / distance)
            
            # Time to reach coast
            time_hours = distance / tsunami_speed_kmh
            
            if wave_height > 100:
                hazard = "Catastrophic - mega-tsunami"
            elif wave_height > 50:
                hazard = "Extreme - regional devastation"
            elif wave_height > 20:
                hazard = "Severe - major coastal damage"
            elif wave_height > 10:
                hazard = "High - significant flooding"
            elif wave_height > 3:
                hazard = "Moderate - coastal flooding"
            else:
                hazard = "Low - minor effects"
            
            tsunami_effects[distance] = {
                'wave_height_m': wave_height,
                'arrival_time_hours': time_hours,
                'hazard_level': hazard
            }
        
        self.results['tsunami_initial_height_m'] = initial_wave_height
        self.results['tsunami_speed_kmh'] = tsunami_speed_kmh
        self.results['tsunami_effects'] = tsunami_effects
        
    def calculate_atmospheric_effects(self):
        """Calculate dust and atmospheric disturbance"""
        energy_mt = self.results['effective_megatons']
        
        # Ejecta mass into atmosphere
        crater_volume = self.results['crater_volume_km3']
        ejecta_mass = crater_volume * 2.5e12  # kg (assuming rock density)
        
        # Dust in stratosphere
        dust_stratosphere = ejecta_mass * 0.001  # kg (rough estimate)
        
        # Global cooling estimate
        if energy_mt > 1e6:
            cooling_effect = "Extinction-level event"
            duration_years = 10
        elif energy_mt > 1e4:
            cooling_effect = "Global winter"
            duration_years = 3
        elif energy_mt > 1000:
            cooling_effect = "Regional climate disruption"
            duration_years = 1
        elif energy_mt > 100:
            cooling_effect = "Temporary cooling"
            duration_years = 0.1
        else:
            cooling_effect = "Negligible"
            duration_years = 0
        
        self.results['ejecta_mass_kg'] = ejecta_mass
        self.results['atmospheric_dust_kg'] = dust_stratosphere
        self.results['cooling_effect'] = cooling_effect
        self.results['climate_disruption_years'] = duration_years
        
    def calculate_ejecta_effects(self):
        """Calculate ejecta blanket and fallout"""
        crater_diameter = self.results['crater_diameter_km']
        
        # Ejecta blanket extends ~2-5 crater radii
        ejecta_radius = crater_diameter * 2.5
        
        # Thickness decreases with distance
        distances = [10, 50, 100, 500]  # km from impact
        ejecta_effects = {}
        
        for distance in distances:
            if distance < ejecta_radius:
                # Ejecta thickness (simplified)
                thickness = crater_diameter * 10 / (distance + 1)  # meters
                
                if thickness > 100:
                    effect = "Buried under debris"
                elif thickness > 10:
                    effect = "Severe damage from ejecta"
                elif thickness > 1:
                    effect = "Moderate ejecta damage"
                else:
                    effect = "Light ejecta fallout"
                
                ejecta_effects[distance] = {
                    'thickness_m': thickness,
                    'effect': effect
                }
        
        self.results['ejecta_blanket_radius_km'] = ejecta_radius
        self.results['ejecta_effects'] = ejecta_effects
    
    def get_summary(self) -> Dict:
        """Get human-readable summary of impact"""
        summary = {
            'impact_classification': self.classify_impact(),
            'immediate_effects': self.summarize_immediate_effects(),
            'regional_effects': self.summarize_regional_effects(),
            'global_effects': self.summarize_global_effects(),
            'casualties_estimate': self.estimate_casualties(),
            'economic_impact': self.estimate_economic_impact()
        }
        
        return summary
    
    def classify_impact(self) -> str:
        """Classify impact severity"""
        energy_mt = self.results['effective_megatons']
        
        if energy_mt > 1e8:
            return "Extinction Event (K-T level)"
        elif energy_mt > 1e6:
            return "Global Catastrophe"
        elif energy_mt > 1e4:
            return "Continental Disaster"
        elif energy_mt > 1000:
            return "Regional Catastrophe"
        elif energy_mt > 100:
            return "Major Regional Impact"
        elif energy_mt > 10:
            return "Significant Local Impact"
        elif energy_mt > 1:
            return "Moderate Local Impact"
        else:
            return "Minor Impact"
    
    def summarize_immediate_effects(self) -> list:
        """List immediate effects at impact site"""
        effects = []
        crater_d = self.results['crater_diameter_km']
        
        effects.append(f"Crater: {crater_d:.1f} km diameter, {self.results['crater_depth_km']:.1f} km deep")
        effects.append(f"Seismic: Magnitude {self.results['seismic_magnitude']:.1f} earthquake")
        effects.append(f"Total vaporization within {crater_d/2:.1f} km")
        
        return effects
    
    def summarize_regional_effects(self) -> list:
        """List regional effects"""
        effects = []
        
        # Get blast radius for significant damage (5 psi overpressure)
        for dist, data in self.results['blast_effects'].items():
            if data['overpressure_psi'] >= 5:
                blast_radius = dist
        
        effects.append(f"Severe blast damage out to ~{blast_radius} km")
        effects.append(f"Thermal burns within ~{blast_radius/2} km")
        effects.append(f"Ejecta blanket extends {self.results['ejecta_blanket_radius_km']:.0f} km")
        
        if 'tsunami_effects' in self.results:
            effects.append(f"Tsunami waves reach coastlines in {list(self.results['tsunami_effects'].values())[0]['arrival_time_hours']:.1f} hours")
        
        return effects
    
    def summarize_global_effects(self) -> list:
        """List global effects"""
        effects = []
        
        if self.results['climate_disruption_years'] > 0:
            effects.append(f"Climate disruption: {self.results['cooling_effect']}")
            effects.append(f"Duration: {self.results['climate_disruption_years']:.1f} years")
        
        energy_mt = self.results['effective_megatons']
        if energy_mt > 1000:
            effects.append("Global agricultural disruption")
            effects.append("Potential mass extinction event")
        elif energy_mt > 100:
            effects.append("Regional agricultural failure")
            effects.append("Global economic disruption")
        
        return effects
    
    def estimate_casualties(self) -> Dict:
        """Estimate potential casualties"""
        energy_mt = self.results['effective_megatons']
        
        # Very rough estimates based on location and population
        if energy_mt > 1e6:
            return {
                'immediate': '1+ billion',
                'total': 'Majority of human population',
                'note': 'Extinction-level event'
            }
        elif energy_mt > 1e4:
            return {
                'immediate': '100+ million',
                'total': '1+ billion',
                'note': 'Global catastrophe'
            }
        elif energy_mt > 1000:
            return {
                'immediate': '1-100 million',
                'total': '10-500 million',
                'note': 'Depends heavily on impact location'
            }
        elif energy_mt > 100:
            return {
                'immediate': '100,000 - 10 million',
                'total': '1-50 million',
                'note': 'Major regional disaster'
            }
        else:
            return {
                'immediate': '1,000 - 1 million',
                'total': '10,000 - 10 million',
                'note': 'Significant local impact'
            }
    
    def estimate_economic_impact(self) -> Dict:
        """Estimate economic impact"""
        energy_mt = self.results['effective_megatons']
        
        if energy_mt > 1e6:
            return {'cost_usd': 'Incalculable', 'note': 'End of civilization'}
        elif energy_mt > 1e4:
            return {'cost_usd': '$100+ trillion', 'note': 'Global economic collapse'}
        elif energy_mt > 1000:
            return {'cost_usd': '$10-100 trillion', 'note': 'Continental devastation'}
        elif energy_mt > 100:
            return {'cost_usd': '$1-10 trillion', 'note': 'Regional catastrophe'}
        else:
            return {'cost_usd': '$100 billion - $1 trillion', 'note': 'Major disaster'}


def calculate_impact(diameter: float, velocity: float, density: float = 3000,
                    angle: float = 45, target_type: str = 'land') -> Dict:
    """
    Convenience function to calculate all impact effects
    
    Args:
        diameter: Asteroid diameter in meters
        velocity: Impact velocity in km/s
        density: Asteroid density in kg/m³ (default 3000 for rocky)
        angle: Impact angle in degrees from horizontal (default 45)
        target_type: 'land' or 'water' (default 'land')
    
    Returns:
        Dictionary with all impact calculations and summary
    """
    params = ImpactParameters(diameter, velocity, density, angle, target_type)
    calculator = ImpactPhysicsCalculator(params)
    results = calculator.calculate_all()
    summary = calculator.get_summary()
    
    return {
        'parameters': params.__dict__,
        'calculations': results,
        'summary': summary
    }

# Enhanced methods for Meteor Madness
def calculate_enhanced_impact(diameter: float, velocity: float, density: float = 3000,
                            angle: float = 45, location: str = 'ocean') -> Dict:
    """
    Enhanced impact calculation for Meteor Madness simulation
    
    Args:
        diameter: Asteroid diameter in meters
        velocity: Impact velocity in km/s
        density: Asteroid density in kg/m³
        angle: Impact angle in degrees from horizontal
        location: Impact location type
    
    Returns:
        Comprehensive impact analysis
    """
    # Calculate mass
    radius = diameter / 2
    volume = (4/3) * math.pi * (radius ** 3)
    mass = volume * density
    
    # Calculate kinetic energy
    velocity_ms = velocity * 1000  # Convert to m/s
    kinetic_energy = 0.5 * mass * (velocity_ms ** 2)
    
    # Energy in different units
    energy_mt = kinetic_energy / (4.184e15)  # Megatons TNT
    energy_kt = kinetic_energy / (4.184e12)  # Kilotons TNT
    
    # Crater calculations
    crater_diameter_km = 1.8 * (energy_mt ** 0.25)
    angle_factor = (math.sin(math.radians(angle))) ** 0.33
    crater_diameter_km *= angle_factor
    crater_depth_km = crater_diameter_km * 0.15
    
    # Damage zones
    fireball_radius = 0.5 * (energy_mt ** 0.4)
    blast_radius = 2.5 * (energy_mt ** 0.33)
    thermal_radius = 4.2 * (energy_mt ** 0.4)
    
    # Seismic effects
    seismic_magnitude = max(0, (math.log10(kinetic_energy) - 4.8) / 1.5)
    seismic_magnitude = min(10, seismic_magnitude)
    
    # Location-specific effects
    tsunami_effects = calculate_tsunami_effects(energy_mt, location)
    
    return {
        'mass_kg': mass,
        'kinetic_energy_joules': kinetic_energy,
        'tnt_equivalent_kt': energy_kt,
        'tnt_equivalent_mt': energy_mt,
        'crater_diameter_m': crater_diameter_km * 1000,
        'crater_depth_m': crater_depth_km * 1000,
        'fireball_radius_km': fireball_radius,
        'blast_radius_km': blast_radius,
        'thermal_radius_km': thermal_radius,
        'seismic_magnitude': seismic_magnitude,
        **tsunami_effects,
        'parameters': {
            'diameter': diameter,
            'velocity': velocity,
            'density': density,
            'angle': angle,
            'location': location
        }
    }

def calculate_tsunami_effects(energy_mt: float, location: str) -> Dict:
    """Calculate tsunami effects for ocean/coastal impacts"""
    if location not in ['ocean', 'coast']:
        return {
            'tsunami_risk': 'None',
            'tsunami_height_m': 0,
            'tsunami_range_km': 0
        }
    
    if energy_mt < 0.1:
        return {
            'tsunami_risk': 'Minimal',
            'tsunami_height_m': energy_mt * 10,
            'tsunami_range_km': energy_mt * 200
        }
    elif energy_mt < 1:
        return {
            'tsunami_risk': 'Low',
            'tsunami_height_m': energy_mt * 5,
            'tsunami_range_km': energy_mt * 100
        }
    elif energy_mt < 10:
        return {
            'tsunami_risk': 'Moderate',
            'tsunami_height_m': energy_mt * 3,
            'tsunami_range_km': energy_mt * 75
        }
    elif energy_mt < 100:
        return {
            'tsunami_risk': 'High',
            'tsunami_height_m': energy_mt * 2,
            'tsunami_range_km': energy_mt * 50
        }
    else:
        return {
            'tsunami_risk': 'Catastrophic',
            'tsunami_height_m': min(200, energy_mt),
            'tsunami_range_km': min(15000, energy_mt * 25)
        }