import numpy as np
import random

class DeflectionSimulator:
    """Simulates asteroid deflection missions"""
    
    DEFLECTION_METHODS = {
        "kinetic": {
            "efficiency": 0.8,
            "cost_factor": 1.0,
            "min_years_needed": 2,
            "max_years_effective": 10
        },
        "gravity_tractor": {
            "efficiency": 0.95,
            "cost_factor": 2.5,
            "min_years_needed": 5,
            "max_years_effective": 20
        },
        "nuclear": {
            "efficiency": 0.7,
            "cost_factor": 5.0,
            "min_years_needed": 1,
            "max_years_effective": 5
        }
    }
    
    def __init__(self, asteroid_id, method, years_before_impact):
        """
        Initialize deflection simulator
        
        Args:
            asteroid_id (str): NASA NEO ID
            method (str): Deflection method (kinetic, gravity_tractor, nuclear)
            years_before_impact (int): Years before potential impact
        """
        self.asteroid_id = asteroid_id
        self.method = method
        self.years_before_impact = years_before_impact
        
        # We would fetch actual asteroid data in a real implementation
        # For now, using placeholder data
        self.asteroid_data = self._get_asteroid_data()
    
    def _get_asteroid_data(self):
        """
        Get asteroid data from NASA API
        
        Returns:
            dict: Asteroid data
        """
        # In a real implementation, this would call the NASA API
        # For now, return placeholder data
        return {
            "id": self.asteroid_id,
            "name": f"Sample Asteroid {self.asteroid_id}",
            "diameter": random.uniform(50, 500),
            "velocity": random.uniform(15000, 30000),
            "mass": random.uniform(1e9, 1e12)
        }
    
    def calculate_deflection(self):
        """
        Calculate deflection mission results
        
        Returns:
            dict: Deflection results
        """
        # Get method parameters
        method_params = self.DEFLECTION_METHODS.get(
            self.method, 
            self.DEFLECTION_METHODS["kinetic"]
        )
        
        # Calculate base success probability
        base_success = method_params["efficiency"]
        
        # Adjust for years before impact
        time_factor = self._calculate_time_factor(
            self.years_before_impact,
            method_params["min_years_needed"],
            method_params["max_years_effective"]
        )
        
        # Calculate final success probability
        success_probability = base_success * time_factor
        
        # Calculate mission cost (in millions USD)
        asteroid_size_factor = np.log10(self.asteroid_data["diameter"]) / 2
        base_cost = 500  # Base cost in millions
        mission_cost = base_cost * method_params["cost_factor"] * asteroid_size_factor
        
        # Calculate deflection distance
        if self.years_before_impact < method_params["min_years_needed"]:
            deflection_distance = 0
        else:
            # Simple model: deflection distance increases with time
            velocity_change = 0.001  # m/s
            seconds_to_impact = self.years_before_impact * 365.25 * 24 * 3600
            deflection_distance = velocity_change * seconds_to_impact
        
        # Earth radius in km
        earth_radius = 6371
        
        # Miss distance in Earth radii
        miss_distance = deflection_distance / (earth_radius * 1000)
        
        return {
            "asteroid": self.asteroid_data,
            "deflection_method": self.method,
            "years_before_impact": self.years_before_impact,
            "success_probability": success_probability,
            "mission_cost_millions": mission_cost,
            "deflection_distance_km": deflection_distance / 1000,
            "miss_distance_earth_radii": miss_distance,
            "is_successful": miss_distance > 1
        }
    
    def _calculate_time_factor(self, years, min_years, max_years):
        """
        Calculate time adjustment factor
        
        Args:
            years (int): Years before impact
            min_years (int): Minimum years needed for method
            max_years (int): Maximum effective years for method
            
        Returns:
            float: Time factor between 0 and 1
        """
        if years < min_years:
            return 0.1  # Very low chance if not enough time
        elif years > max_years:
            return 1.0  # Maximum effectiveness
        else:
            # Linear scaling between min and max
            return 0.1 + 0.9 * (years - min_years) / (max_years - min_years)
