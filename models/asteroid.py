import numpy as np
from utils.calculations import kinetic_energy_joules, tnt_equivalent

class Asteroid:
    """Class representing an asteroid and its physical properties"""
    
    # Density in kg/m³ for different asteroid types
    DENSITY_TYPES = {
        "rocky": 3000,    # Stony asteroid
        "metallic": 8000, # Iron asteroid
        "icy": 1000       # Comet-like
    }
    
    def __init__(self, diameter=None, velocity=None, density=None, angle=None, type_name=None):
        """
        Initialize an asteroid object
        
        Args:
            diameter (float): Diameter in meters
            velocity (float): Velocity in km/s
            density (float): Density in kg/m³
            angle (float): Impact angle in degrees (0 = vertical)
            type_name (str): Type of asteroid (rocky, metallic, icy)
        """
        self.diameter = diameter
        self.velocity = velocity  # km/s
        
        # Set density based on type or directly
        if type_name and type_name in self.DENSITY_TYPES:
            self.density = self.DENSITY_TYPES[type_name]
        else:
            self.density = density or self.DENSITY_TYPES["rocky"]  # Default to rocky
            
        self.angle = angle or 45  # Default to 45 degrees
    
    @property
    def radius(self):
        """Get radius in meters"""
        return self.diameter / 2 if self.diameter else 0
    
    @property
    def mass(self):
        """Calculate mass in kg"""
        if not self.diameter:
            return 0
            
        volume = (4/3) * np.pi * (self.radius ** 3)
        return volume * self.density
    
    @property
    def kinetic_energy(self):
        """Calculate kinetic energy in joules"""
        if not self.velocity:
            return 0
            
        # Convert km/s to m/s
        velocity_ms = self.velocity * 1000
        return kinetic_energy_joules(self.mass, velocity_ms)
    
    @property
    def impact_energy(self):
        """Calculate impact energy adjusted for angle"""
        # Vertical component of velocity determines impact energy
        vertical_factor = np.cos(np.radians(self.angle))
        return self.kinetic_energy * (vertical_factor ** 2)
    
    @property
    def tnt_equivalent(self):
        """Convert impact energy to megatons of TNT"""
        return tnt_equivalent(self.impact_energy)
    
    def to_dict(self):
        """Convert asteroid properties to dictionary"""
        return {
            "diameter": self.diameter,
            "radius": self.radius,
            "velocity": self.velocity,
            "density": self.density,
            "mass": self.mass,
            "angle": self.angle,
            "kinetic_energy": self.kinetic_energy,
            "impact_energy": self.impact_energy,
            "tnt_equivalent": self.tnt_equivalent
        }
