import numpy as np
from utils.calculations import crater_diameter, air_blast_radius, thermal_radiation_radius

class ImpactSimulator:
    """Simulates asteroid impact effects"""
    
    def __init__(self, asteroid, lat, lng):
        """
        Initialize impact simulator
        
        Args:
            asteroid: Asteroid object with physical properties
            lat (float): Impact latitude
            lng (float): Impact longitude
        """
        self.asteroid = asteroid
        self.lat = lat
        self.lng = lng
        
        # Determine if ocean or land impact
        self.is_ocean = self._check_if_ocean()
    
    def _check_if_ocean(self):
        """
        Check if impact location is in ocean
        
        Returns:
            bool: True if ocean impact, False otherwise
        """
        # For a real implementation, this would check against USGS data
        # For now, return a placeholder based on a simple heuristic
        # (e.g., approximate ocean coverage)
        return np.random.random() < 0.7  # ~70% of Earth is ocean
    
    def calculate_crater(self):
        """
        Calculate crater dimensions
        
        Returns:
            dict: Crater dimensions
        """
        if self.is_ocean:
            # For ocean impacts, crater is temporary
            energy = self.asteroid.impact_energy
            temp_crater_diameter = crater_diameter(
                energy, 
                target_density=1000,  # Water density
                gravity=9.8,
                angle=self.asteroid.angle
            )
            
            return {
                "temporary_diameter": temp_crater_diameter,
                "permanent_diameter": 0,
                "depth": temp_crater_diameter * 0.25
            }
        else:
            # For land impacts, calculate permanent crater
            energy = self.asteroid.impact_energy
            crater_dia = crater_diameter(
                energy,
                target_density=2500,  # Average rock density
                gravity=9.8,
                angle=self.asteroid.angle
            )
            
            return {
                "temporary_diameter": crater_dia * 1.5,
                "permanent_diameter": crater_dia,
                "depth": crater_dia * 0.3
            }
    
    def calculate_blast_effects(self):
        """
        Calculate air blast effects
        
        Returns:
            dict: Air blast radii for different overpressures
        """
        energy = self.asteroid.impact_energy
        
        return {
            "severe_damage_radius": air_blast_radius(energy, 20),
            "window_breakage_radius": air_blast_radius(energy, 5),
            "sound_intensity_radius": air_blast_radius(energy, 1)
        }
    
    def calculate_thermal_effects(self):
        """
        Calculate thermal radiation effects
        
        Returns:
            dict: Thermal radiation radii for different intensities
        """
        energy = self.asteroid.impact_energy
        
        return {
            "third_degree_burns": thermal_radiation_radius(energy, 35),
            "second_degree_burns": thermal_radiation_radius(energy, 20),
            "first_degree_burns": thermal_radiation_radius(energy, 5)
        }
    
    def calculate_tsunami(self):
        """
        Calculate tsunami effects for ocean impacts
        
        Returns:
            dict: Tsunami wave characteristics or None if land impact
        """
        if not self.is_ocean:
            return None
            
        # Simple tsunami model based on energy
        energy = self.asteroid.impact_energy
        tnt_mt = energy / 4.184e15  # Convert to megatons
        
        # Simplified calculation for demonstration
        wave_height_1000km = 0.14 * (tnt_mt ** 0.25)
        wave_height_100km = 1.41 * (tnt_mt ** 0.25)
        
        return {
            "initial_cavity_diameter": self.calculate_crater()["temporary_diameter"],
            "wave_height_100km": wave_height_100km,
            "wave_height_1000km": wave_height_1000km,
            "arrival_time_100km": 100 / 800 * 3600,  # seconds (tsunami speed ~800 km/h)
            "arrival_time_1000km": 1000 / 800 * 3600  # seconds
        }
    
    def calculate_impact(self):
        """
        Calculate all impact effects
        
        Returns:
            dict: Complete impact results
        """
        return {
            "asteroid": self.asteroid.to_dict(),
            "impact_location": {
                "lat": self.lat,
                "lng": self.lng,
                "is_ocean": self.is_ocean
            },
            "crater": self.calculate_crater(),
            "blast_effects": self.calculate_blast_effects(),
            "thermal_effects": self.calculate_thermal_effects(),
            "tsunami": self.calculate_tsunami(),
            "energy": {
                "joules": self.asteroid.impact_energy,
                "megatons": self.asteroid.tnt_equivalent
            }
        }
