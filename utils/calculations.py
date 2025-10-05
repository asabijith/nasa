import numpy as np

def kinetic_energy_joules(mass, velocity):
    """
    Calculate kinetic energy in joules
    
    Args:
        mass (float): Mass in kg
        velocity (float): Velocity in m/s
        
    Returns:
        float: Kinetic energy in joules
    """
    return 0.5 * mass * (velocity ** 2)

def tnt_equivalent(energy_joules):
    """
    Convert energy in joules to megatons of TNT
    
    Args:
        energy_joules (float): Energy in joules
        
    Returns:
        float: Energy in megatons of TNT
    """
    # 1 ton of TNT = 4.184 × 10^9 joules
    # 1 megaton = 4.184 × 10^15 joules
    return energy_joules / (4.184e15)

def crater_diameter(energy, target_density=2500, gravity=9.8, angle=90):
    """
    Calculate crater diameter using scaling laws
    
    Args:
        energy (float): Impact energy in joules
        target_density (float): Density of target material in kg/m³
        gravity (float): Surface gravity in m/s²
        angle (float): Impact angle in degrees
        
    Returns:
        float: Crater diameter in meters
    """
    # Simple scaling law for transient crater diameter
    # Based on research by K. Holsapple
    # D = a * (E/m)^b * g^c
    # where a, b, c are empirical constants
    
    # Adjust for impact angle
    energy_adjusted = energy * np.sin(np.radians(angle))
    
    # Simplified calculation
    diameter = 1.161 * ((energy_adjusted / (10**6)) ** 0.333)
    
    return diameter

def air_blast_radius(energy, overpressure=5):
    """
    Calculate air blast radius for given overpressure
    
    Args:
        energy (float): Impact energy in joules
        overpressure (float): Overpressure in psi
        
    Returns:
        float: Radius in meters
    """
    # Convert energy to kilotons of TNT
    kt = energy / 4.184e12
    
    # Scaling law for nuclear explosions
    # R = k * Y^(1/3) where Y is yield in kilotons
    # k depends on overpressure
    if overpressure == 20:  # Severe damage to buildings
        k = 340
    elif overpressure == 5:  # Window breakage
        k = 790
    else:
        k = 500  # Default value
        
    return k * (kt ** (1/3))

def thermal_radiation_radius(energy, intensity=3):
    """
    Calculate radius for thermal radiation effects
    
    Args:
        energy (float): Impact energy in joules
        intensity (float): Radiation intensity in W/m²
        
    Returns:
        float: Radius in meters
    """
    # Convert energy to kilotons of TNT
    kt = energy / 4.184e12
    
    # Scaling based on nuclear weapons effects
    # Third-degree burns: ~35 W/m²
    # Second-degree burns: ~20 W/m²
    # First-degree burns: ~5 W/m²
    if intensity == 35:
        k = 300
    elif intensity == 20:
        k = 400
    elif intensity == 5:
        k = 700
    else:
        k = 500
        
    return k * (kt ** 0.5)
