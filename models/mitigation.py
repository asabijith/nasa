"""
Asteroid Deflection and Mitigation Strategies
"""
import math
from typing import Dict, List, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class DeflectionMission:
    """Parameters for a deflection mission"""
    strategy: str  # 'kinetic_impactor', 'gravity_tractor', 'nuclear', 'laser_ablation', 'ion_beam'
    launch_date: datetime
    asteroid_diameter: float  # meters
    asteroid_velocity: float  # km/s
    asteroid_mass: float  # kg
    warning_time_years: float
    mission_duration_years: float = 0
    
class MitigationCalculator:
    """Calculate effectiveness of various deflection strategies"""
    
    # Mission parameters
    KINETIC_IMPACTOR_MASS = 500  # kg
    KINETIC_IMPACTOR_VELOCITY = 10  # km/s relative to asteroid
    GRAVITY_TRACTOR_MASS = 1000  # kg
    NUCLEAR_YIELD_MT = 1  # megatons
    
    def __init__(self, mission: DeflectionMission):
        self.mission = mission
        self.results = {}
        
    def calculate_required_deflection(self, impact_date: datetime) -> float:
        """
        Calculate minimum deflection needed to miss Earth
        
        Returns:
            Required velocity change in m/s
        """
        # Earth's radius plus safety margin
        earth_radius = 6371  # km
        safety_margin = 10 * earth_radius  # Miss by at least 10 Earth radii
        
        # Time until impact
        time_until_impact = (impact_date - self.mission.launch_date).total_seconds()
        time_years = time_until_impact / (365.25 * 24 * 3600)
        
        # Required deflection distance
        deflection_distance = safety_margin  # km
        
        # Required velocity change (simplified)
        # Δv needed decreases with more warning time
        delta_v = deflection_distance / time_years  # km/year
        delta_v_ms = (delta_v * 1000) / (365.25 * 24 * 3600)  # m/s
        
        self.results['required_delta_v_ms'] = delta_v_ms
        self.results['warning_time_years'] = time_years
        
        return delta_v_ms
    
    def kinetic_impactor_deflection(self) -> Dict:
        """
        Calculate deflection from kinetic impactor mission
        NASA DART-style mission
        """
        # Momentum transfer
        impactor_mass = self.KINETIC_IMPACTOR_MASS
        impactor_velocity = self.KINETIC_IMPACTOR_VELOCITY * 1000  # m/s
        
        # Momentum enhancement factor (beta) - typically 2-5
        # Accounts for ejecta momentum
        beta = 3.5
        
        # Change in velocity of asteroid
        momentum_change = beta * impactor_mass * impactor_velocity
        delta_v = momentum_change / self.mission.asteroid_mass  # m/s
        
        # Deflection distance after warning time
        warning_time_seconds = self.mission.warning_time_years * 365.25 * 24 * 3600
        deflection_distance = delta_v * warning_time_seconds / 1000  # km
        
        # Success probability (decreases with asteroid size)
        if self.mission.asteroid_diameter < 100:
            success_prob = 0.95
        elif self.mission.asteroid_diameter < 300:
            success_prob = 0.85
        elif self.mission.asteroid_diameter < 500:
            success_prob = 0.70
        else:
            success_prob = 0.50
        
        # Mission cost estimate (millions USD)
        mission_cost = 300 + (self.mission.asteroid_diameter / 10)
        
        # Time to prepare mission (years)
        prep_time = 3 + (self.mission.asteroid_diameter / 200)
        
        return {
            'delta_v_ms': delta_v,
            'deflection_distance_km': deflection_distance,
            'success_probability': success_prob,
            'mission_cost_million_usd': mission_cost,
            'preparation_time_years': prep_time,
            'technology_readiness': 'High (DART proven)',
            'advantages': [
                'Proven technology (NASA DART)',
                'Relatively low cost',
                'Fast deployment',
                'No radioactive materials'
            ],
            'disadvantages': [
                'Single attempt',
                'Less effective on large asteroids',
                'Requires precise targeting',
                'Limited by launch windows'
            ],
            'recommended_for': 'Small to medium asteroids (<500m) with 5+ years warning'
        }
    
    def gravity_tractor_deflection(self) -> Dict:
        """
        Calculate deflection from gravity tractor mission
        Slow but steady approach
        """
        # Gravitational constant
        G = 6.674e-11  # m³/kg/s²
        
        # Station-keeping distance
        distance = 100  # meters from asteroid surface
        
        # Gravitational acceleration on asteroid from spacecraft
        spacecraft_mass = self.GRAVITY_TRACTOR_MASS
        accel = G * spacecraft_mass / (distance ** 2)  # m/s²
        
        # Duration of mission
        mission_duration_seconds = self.mission.mission_duration_years * 365.25 * 24 * 3600
        
        # Velocity change (Δv = a * t)
        delta_v = accel * mission_duration_seconds  # m/s
        
        # Deflection distance
        warning_time_seconds = self.mission.warning_time_years * 365.25 * 24 * 3600
        deflection_distance = delta_v * warning_time_seconds / 1000  # km
        
        # Success probability (very high if enough time)
        if self.mission.warning_time_years > 10:
            success_prob = 0.90
        elif self.mission.warning_time_years > 5:
            success_prob = 0.75
        else:
            success_prob = 0.50
        
        # Mission cost (very high due to long duration)
        mission_cost = 1000 + (self.mission.mission_duration_years * 200)
        
        return {
            'delta_v_ms': delta_v,
            'deflection_distance_km': deflection_distance,
            'success_probability': success_prob,
            'mission_cost_million_usd': mission_cost,
            'preparation_time_years': 5,
            'mission_duration_years': self.mission.mission_duration_years,
            'technology_readiness': 'Medium (requires development)',
            'advantages': [
                'Precise control',
                'Adjustable in real-time',
                'No physical contact needed',
                'Works on any asteroid type'
            ],
            'disadvantages': [
                'Extremely slow',
                'Very expensive',
                'Requires decades of warning',
                'Complex station-keeping'
            ],
            'recommended_for': 'Any size asteroid with 15+ years warning'
        }
    
    def nuclear_deflection(self) -> Dict:
        """
        Calculate deflection from nuclear device
        Last resort option
        """
        # Nuclear yield
        yield_mt = self.NUCLEAR_YIELD_MT
        energy_joules = yield_mt * 4.184e15  # Joules
        
        # Fraction of energy transferred to asteroid
        # Standoff detonation: ~1-5% efficiency
        # Surface detonation: ~10-30% efficiency
        efficiency = 0.15  # Average assumption
        
        momentum_transfer = math.sqrt(2 * efficiency * energy_joules * self.mission.asteroid_mass)
        delta_v = momentum_transfer / self.mission.asteroid_mass  # m/s
        
        # Deflection distance
        warning_time_seconds = self.mission.warning_time_years * 365.25 * 24 * 3600
        deflection_distance = delta_v * warning_time_seconds / 1000  # km
        
        # Success probability
        if self.mission.asteroid_diameter < 200:
            success_prob = 0.85
            fragmentation_risk = 0.60  # High risk of breaking asteroid
        elif self.mission.asteroid_diameter < 500:
            success_prob = 0.75
            fragmentation_risk = 0.30
        else:
            success_prob = 0.65
            fragmentation_risk = 0.10
        
        # Mission cost
        mission_cost = 5000  # Very expensive, requires special authorization
        
        return {
            'delta_v_ms': delta_v,
            'deflection_distance_km': deflection_distance,
            'success_probability': success_prob,
            'fragmentation_risk': fragmentation_risk,
            'mission_cost_million_usd': mission_cost,
            'preparation_time_years': 2,
            'technology_readiness': 'High (but untested in space)',
            'advantages': [
                'Most powerful option',
                'Effective on large asteroids',
                'Can be deployed quickly',
                'Multiple devices possible'
            ],
            'disadvantages': [
                'Risk of fragmentation',
                'International treaty concerns',
                'Radioactive contamination',
                'Political challenges'
            ],
            'recommended_for': 'Last resort for large asteroids (>500m) or short warning time',
            'warning': '⚠️ Risk of creating multiple dangerous fragments'
        }
    
    def laser_ablation_deflection(self) -> Dict:
        """
        Calculate deflection from laser ablation
        Vaporize surface material to create thrust
        """
        # Laser power (megawatts)
        laser_power = 10  # MW
        
        # Ablation efficiency
        efficiency = 0.001  # kg/s per MW
        
        # Mission duration
        mission_duration_seconds = self.mission.mission_duration_years * 365.25 * 24 * 3600
        
        # Mass ablated
        mass_ablated = laser_power * efficiency * mission_duration_seconds  # kg
        
        # Exhaust velocity (typical for sublimation)
        exhaust_velocity = 1000  # m/s
        
        # Momentum transfer (rocket equation)
        delta_v = exhaust_velocity * math.log(self.mission.asteroid_mass / 
                                              (self.mission.asteroid_mass - mass_ablated))
        
        # Deflection distance
        warning_time_seconds = self.mission.warning_time_years * 365.25 * 24 * 3600
        deflection_distance = delta_v * warning_time_seconds / 1000  # km
        
        # Success probability
        success_prob = 0.65
        
        # Mission cost
        mission_cost = 2000 + (self.mission.mission_duration_years * 300)
        
        return {
            'delta_v_ms': delta_v,
            'deflection_distance_km': deflection_distance,
            'success_probability': success_prob,
            'mission_cost_million_usd': mission_cost,
            'preparation_time_years': 8,
            'mission_duration_years': self.mission.mission_duration_years,
            'technology_readiness': 'Low (requires significant development)',
            'advantages': [
                'Continuous thrust',
                'Precise control',
                'No physical contact',
                'Scalable power'
            ],
            'disadvantages': [
                'Unproven technology',
                'Requires large power source',
                'Very expensive',
                'Slow deflection'
            ],
            'recommended_for': 'Future missions with 20+ years warning'
        }
    
    def ion_beam_deflection(self) -> Dict:
        """
        Calculate deflection from ion beam shepherd
        Similar to gravity tractor but uses ion beam
        """
        # Ion beam thrust
        thrust = 0.5  # Newtons
        
        # Mission duration
        mission_duration_seconds = self.mission.mission_duration_years * 365.25 * 24 * 3600
        
        # Acceleration on asteroid
        accel = thrust / self.mission.asteroid_mass  # m/s²
        
        # Velocity change
        delta_v = accel * mission_duration_seconds  # m/s
        
        # Deflection distance
        warning_time_seconds = self.mission.warning_time_years * 365.25 * 24 * 3600
        deflection_distance = delta_v * warning_time_seconds / 1000  # km
        
        # Success probability
        if self.mission.warning_time_years > 10:
            success_prob = 0.85
        else:
            success_prob = 0.60
        
        # Mission cost
        mission_cost = 1500 + (self.mission.mission_duration_years * 250)
        
        return {
            'delta_v_ms': delta_v,
            'deflection_distance_km': deflection_distance,
            'success_probability': success_prob,
            'mission_cost_million_usd': mission_cost,
            'preparation_time_years': 6,
            'mission_duration_years': self.mission.mission_duration_years,
            'technology_readiness': 'Medium (ion drives proven)',
            'advantages': [
                'More efficient than gravity tractor',
                'Proven ion drive technology',
                'Precise control',
                'No contact needed'
            ],
            'disadvantages': [
                'Slow deflection',
                'Expensive',
                'Long mission duration',
                'Requires decades of warning'
            ],
            'recommended_for': 'Medium asteroids with 10+ years warning'
        }
    
    def compare_all_strategies(self, impact_date: datetime) -> Dict:
        """Compare all deflection strategies"""
        required_dv = self.calculate_required_deflection(impact_date)
        
        strategies = {
            'kinetic_impactor': self.kinetic_impactor_deflection(),
            'gravity_tractor': self.gravity_tractor_deflection(),
            'nuclear': self.nuclear_deflection(),
            'laser_ablation': self.laser_ablation_deflection(),
            'ion_beam': self.ion_beam_deflection()
        }
        
        # Rank strategies
        rankings = []
        for name, data in strategies.items():
            # Calculate effectiveness score
            dv_ratio = data['delta_v_ms'] / required_dv if required_dv > 0 else 0
            
            # Weighted score
            score = (
                dv_ratio * 0.3 +  # Effectiveness
                data['success_probability'] * 0.3 +  # Success probability
                (1000 / data['mission_cost_million_usd']) * 0.2 +  # Cost efficiency
                (1 / max(data['preparation_time_years'], 1)) * 0.2  # Time to deploy
            )
            
            rankings.append({
                'strategy': name,
                'score': score,
                'is_sufficient': dv_ratio >= 1.0,
                'effectiveness_ratio': dv_ratio,
                'data': data
            })
        
        # Sort by score
        rankings.sort(key=lambda x: x['score'], reverse=True)
        
        # Recommendations
        recommendations = self.generate_recommendations(rankings, required_dv)
        
        return {
            'required_deflection_ms': required_dv,
            'warning_time_years': self.mission.warning_time_years,
            'strategies': strategies,
            'rankings': rankings,
            'recommendations': recommendations
        }
    
    def generate_recommendations(self, rankings: List[Dict], required_dv: float) -> Dict:
        """Generate strategic recommendations"""
        sufficient_strategies = [r for r in rankings if r['is_sufficient']]
        
        if not sufficient_strategies:
            return {
                'status': 'INSUFFICIENT',
                'message': 'No single strategy sufficient. Consider multiple missions or evacuation.',
                'options': [
                    'Launch multiple kinetic impactors',
                    'Combine kinetic impactor with gravity tractor',
                    'Nuclear option as last resort',
                    'Focus on impact zone evacuation and preparation'
                ]
            }
        
        best = sufficient_strategies[0]
        
        # Short warning time (<5 years)
        if self.mission.warning_time_years < 5:
            if best['strategy'] == 'nuclear':
                message = "⚠️ CRITICAL: Nuclear deflection recommended due to short warning time"
            else:
                message = "URGENT: Deploy kinetic impactor mission immediately"
            
            return {
                'status': 'URGENT',
                'message': message,
                'primary_strategy': best['strategy'],
                'backup_strategies': [rankings[1]['strategy'], rankings[2]['strategy']],
                'timeline': 'Immediate action required',
                'cost_estimate_million_usd': best['data']['mission_cost_million_usd']
            }
        
        # Medium warning (5-15 years)
        elif self.mission.warning_time_years < 15:
            return {
                'status': 'ADEQUATE',
                'message': 'Multiple options available. Kinetic impactor recommended.',
                'primary_strategy': 'kinetic_impactor',
                'backup_strategies': ['ion_beam', 'nuclear'],
                'timeline': 'Launch within 2-3 years',
                'cost_estimate_million_usd': rankings[0]['data']['mission_cost_million_usd'],
                'notes': 'Time for careful mission planning and preparation'
            }
        
        # Long warning (15+ years)
        else:
            return {
                'status': 'OPTIMAL',
                'message': 'Ample time for precise deflection. Gravity tractor or ion beam recommended.',
                'primary_strategy': 'gravity_tractor',
                'backup_strategies': ['ion_beam', 'kinetic_impactor'],
                'timeline': 'Launch within 5 years, operate for extended period',
                'cost_estimate_million_usd': rankings[0]['data']['mission_cost_million_usd'],
                'notes': 'Ideal conditions for controlled, precise deflection'
            }


def simulate_deflection_scenario(
    asteroid_diameter: float,
    asteroid_velocity: float,
    warning_years: float,
    impact_date: datetime,
    strategy: str = 'kinetic_impactor',
    mission_duration_years: float = 5
) -> Dict:
    """
    Simulate a complete deflection scenario
    
    Args:
        asteroid_diameter: meters
        asteroid_velocity: km/s
        warning_years: years of warning time
        impact_date: predicted impact date
        strategy: deflection strategy to use
        mission_duration_years: duration for continuous strategies
    
    Returns:
        Complete simulation results
    """
    # Calculate asteroid mass
    radius = asteroid_diameter / 2
    volume = (4/3) * math.pi * (radius ** 3)
    density = 3000  # kg/m³
    mass = volume * density
    
    # Create mission
    launch_date = impact_date - timedelta(days=warning_years * 365.25)
    mission = DeflectionMission(
        strategy=strategy,
        launch_date=launch_date,
        asteroid_diameter=asteroid_diameter,
        asteroid_velocity=asteroid_velocity,
        asteroid_mass=mass,
        warning_time_years=warning_years,
        mission_duration_years=mission_duration_years
    )
    
    # Calculate deflection
    calculator = MitigationCalculator(mission)
    comparison = calculator.compare_all_strategies(impact_date)
    
    return comparison
