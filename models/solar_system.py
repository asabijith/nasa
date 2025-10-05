"""
Solar System Models for comprehensive space data
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import math

@dataclass
class CelestialBody:
    """Base class for all celestial bodies"""
    name: str
    id: str
    mass: float  # kg
    radius: float  # km
    orbital_period: Optional[float] = None  # days
    rotation_period: Optional[float] = None  # hours
    distance_from_sun: Optional[float] = None  # AU
    discovery_date: Optional[str] = None
    description: str = ""

@dataclass
class Planet(CelestialBody):
    """Planet data model"""
    planet_type: str = "terrestrial"  # terrestrial, gas_giant, ice_giant
    moons: List[str] = field(default_factory=list)
    atmosphere_composition: Dict[str, float] = field(default_factory=dict)
    surface_temperature: Tuple[float, float] = (0, 0)  # min, max in Celsius
    has_rings: bool = False
    magnetic_field: bool = False
    
    def get_orbital_velocity(self) -> float:
        """Calculate orbital velocity in km/s"""
        if self.distance_from_sun:
            # Simplified calculation: v = sqrt(GM/r)
            return math.sqrt(1.327e11 / (self.distance_from_sun * 1.496e8))
        return 0

@dataclass
class Moon(CelestialBody):
    """Moon/satellite data model"""
    parent_planet: str = ""
    orbital_distance: float = 0  # km from parent
    synchronous_rotation: bool = True
    surface_composition: Dict[str, float] = field(default_factory=dict)

@dataclass
class DwarfPlanet(CelestialBody):
    """Dwarf planet data model"""
    classification_criteria: List[str] = field(default_factory=list)
    location: str = ""  # asteroid belt, kuiper belt, etc.

@dataclass
class SpaceMission:
    """Space mission data model"""
    name: str = ""
    country: str = ""
    agency: str = ""
    launch_date: str = ""
    mission_type: str = ""  # exploration, communication, scientific, etc.
    target: str = ""
    status: str = ""  # planned, active, completed, failed
    crew_size: int = 0
    description: str = ""
    achievements: List[str] = field(default_factory=list)

@dataclass
class Astronaut:
    """Astronaut data model"""
    name: str = ""
    country: str = ""
    agency: str = ""
    current_mission: Optional[str] = None
    location: str = "Earth"  # ISS, Moon, Mars, etc.
    mission_duration: Optional[int] = None  # days
    total_space_time: Optional[int] = None  # days
    
class SolarSystemDatabase:
    """Comprehensive solar system database"""
    
    def __init__(self):
        self.planets = self._initialize_planets()
        self.dwarf_planets = self._initialize_dwarf_planets()
        self.moons = self._initialize_major_moons()
        self.missions = self._initialize_missions()
        
    def _initialize_planets(self) -> Dict[str, Planet]:
        """Initialize planet data"""
        return {
            'mercury': Planet(
                name='Mercury',
                id='mercury',
                mass=3.301e23,
                radius=2439.7,
                orbital_period=87.97,
                rotation_period=1407.6,
                distance_from_sun=0.387,
                planet_type='terrestrial',
                surface_temperature=(-173, 427),
                atmosphere_composition={'oxygen': 42, 'sodium': 29, 'hydrogen': 22},
                discovery_date='Ancient',
                description='Smallest planet in our solar system and closest to the Sun'
            ),
            'venus': Planet(
                name='Venus',
                id='venus',
                mass=4.867e24,
                radius=6051.8,
                orbital_period=224.7,
                rotation_period=-5832.5,  # retrograde rotation
                distance_from_sun=0.723,
                planet_type='terrestrial',
                surface_temperature=(462, 462),
                atmosphere_composition={'carbon_dioxide': 96.5, 'nitrogen': 3.5},
                discovery_date='Ancient',
                description='Hottest planet in our solar system with extreme greenhouse effect'
            ),
            'earth': Planet(
                name='Earth',
                id='earth',
                mass=5.972e24,
                radius=6371,
                orbital_period=365.25,
                rotation_period=24,
                distance_from_sun=1.0,
                planet_type='terrestrial',
                moons=['moon'],
                surface_temperature=(-89, 58),
                atmosphere_composition={'nitrogen': 78.08, 'oxygen': 20.95, 'argon': 0.93},
                magnetic_field=True,
                discovery_date='N/A',
                description='Our home planet, the only known planet with life'
            ),
            'mars': Planet(
                name='Mars',
                id='mars',
                mass=6.39e23,
                radius=3389.5,
                orbital_period=687,
                rotation_period=24.6,
                distance_from_sun=1.524,
                planet_type='terrestrial',
                moons=['phobos', 'deimos'],
                surface_temperature=(-87, -5),
                atmosphere_composition={'carbon_dioxide': 95.32, 'nitrogen': 2.7, 'argon': 1.6},
                discovery_date='Ancient',
                description='The Red Planet, target for human exploration'
            ),
            'jupiter': Planet(
                name='Jupiter',
                id='jupiter',
                mass=1.898e27,
                radius=69911,
                orbital_period=4333,
                rotation_period=9.9,
                distance_from_sun=5.204,
                planet_type='gas_giant',
                moons=['io', 'europa', 'ganymede', 'callisto'],
                surface_temperature=(-108, -108),
                atmosphere_composition={'hydrogen': 89.8, 'helium': 10.2},
                has_rings=True,
                magnetic_field=True,
                discovery_date='Ancient',
                description='Largest planet in our solar system'
            ),
            'saturn': Planet(
                name='Saturn',
                id='saturn',
                mass=5.683e26,
                radius=58232,
                orbital_period=10759,
                rotation_period=10.7,
                distance_from_sun=9.537,
                planet_type='gas_giant',
                moons=['titan', 'enceladus', 'mimas', 'iapetus'],
                surface_temperature=(-139, -139),
                atmosphere_composition={'hydrogen': 96.3, 'helium': 3.25},
                has_rings=True,
                magnetic_field=True,
                discovery_date='Ancient',
                description='Famous for its prominent ring system'
            ),
            'uranus': Planet(
                name='Uranus',
                id='uranus',
                mass=8.681e25,
                radius=25362,
                orbital_period=30687,
                rotation_period=-17.2,  # retrograde rotation
                distance_from_sun=19.191,
                planet_type='ice_giant',
                moons=['miranda', 'ariel', 'umbriel', 'titania', 'oberon'],
                surface_temperature=(-197, -197),
                atmosphere_composition={'hydrogen': 82.5, 'helium': 15.2, 'methane': 2.3},
                has_rings=True,
                magnetic_field=True,
                discovery_date='1781',
                description='Ice giant with extreme axial tilt'
            ),
            'neptune': Planet(
                name='Neptune',
                id='neptune',
                mass=1.024e26,
                radius=24622,
                orbital_period=60190,
                rotation_period=16.1,
                distance_from_sun=30.069,
                planet_type='ice_giant',
                moons=['triton', 'nereid'],
                surface_temperature=(-201, -201),
                atmosphere_composition={'hydrogen': 80, 'helium': 19, 'methane': 1},
                has_rings=True,
                magnetic_field=True,
                discovery_date='1846',
                description='Windiest planet in the solar system'
            )
        }
    
    def _initialize_dwarf_planets(self) -> Dict[str, DwarfPlanet]:
        """Initialize dwarf planet data"""
        return {
            'pluto': DwarfPlanet(
                name='Pluto',
                id='pluto',
                mass=1.309e22,
                radius=1188.3,
                orbital_period=90560,
                distance_from_sun=39.482,
                location='Kuiper Belt',
                discovery_date='1930',
                classification_criteria=['orbits_sun', 'sufficient_mass', 'not_cleared_orbit'],
                description='Former ninth planet, now classified as dwarf planet'
            ),
            'ceres': DwarfPlanet(
                name='Ceres',
                id='ceres',
                mass=9.39e20,
                radius=473,
                orbital_period=1682,
                distance_from_sun=2.766,
                location='Asteroid Belt',
                discovery_date='1801',
                classification_criteria=['orbits_sun', 'sufficient_mass', 'not_cleared_orbit'],
                description='Largest object in the asteroid belt'
            )
        }
    
    def _initialize_major_moons(self) -> Dict[str, Moon]:
        """Initialize major moon data"""
        return {
            'moon': Moon(
                name='Moon',
                id='luna',
                mass=7.342e22,
                radius=1737.4,
                parent_planet='earth',
                orbital_distance=384400,
                orbital_period=27.3,
                surface_composition={'oxygen': 43, 'silicon': 20, 'magnesium': 19},
                discovery_date='Ancient',
                description='Earth\'s only natural satellite'
            ),
            'europa': Moon(
                name='Europa',
                id='europa',
                mass=4.8e22,
                radius=1560.8,
                parent_planet='jupiter',
                orbital_distance=671034,
                orbital_period=3.55,
                surface_composition={'water_ice': 85, 'rock': 15},
                discovery_date='1610',
                description='Jupiter\'s moon with subsurface ocean'
            ),
            'titan': Moon(
                name='Titan',
                id='titan',
                mass=1.345e23,
                radius=2574,
                parent_planet='saturn',
                orbital_distance=1221830,
                orbital_period=15.95,
                surface_composition={'water_ice': 50, 'rock': 50},
                discovery_date='1655',
                description='Saturn\'s largest moon with thick atmosphere'
            )
        }
    
    def _initialize_missions(self) -> Dict[str, SpaceMission]:
        """Initialize space mission data"""
        return {
            'artemis': SpaceMission(
                name='Artemis Program',
                country='USA',
                agency='NASA',
                launch_date='2024',
                mission_type='human_exploration',
                target='Moon',
                status='active',
                crew_size=4,
                description='Return humans to the Moon',
                achievements=['Sustainable lunar presence']
            ),
            'perseverance': SpaceMission(
                name='Mars 2020 Perseverance',
                country='USA',
                agency='NASA',
                launch_date='2020-07-30',
                mission_type='robotic_exploration',
                target='Mars',
                status='active',
                description='Search for signs of ancient microbial life on Mars',
                achievements=['First helicopter flight on another planet', 'Sample collection']
            ),
            'chang_e_4': SpaceMission(
                name='Chang\'e 4',
                country='China',
                agency='CNSA',
                launch_date='2018-12-07',
                mission_type='robotic_exploration',
                target='Moon',
                status='completed',
                description='First soft landing on the far side of the Moon',
                achievements=['Far side lunar exploration', 'Lunar sample analysis']
            )
        }
    
    def get_planet_info(self, planet_name: str) -> Optional[Planet]:
        """Get detailed planet information"""
        return self.planets.get(planet_name.lower())
    
    def get_all_planets(self) -> List[Planet]:
        """Get all planets"""
        return list(self.planets.values())
    
    def get_missions_by_country(self, country: str) -> List[SpaceMission]:
        """Get missions by country"""
        return [mission for mission in self.missions.values() 
                if mission.country.upper() == country.upper()]
    
    def search_celestial_bodies(self, query: str) -> List[CelestialBody]:
        """Search for celestial bodies by name"""
        results = []
        query_lower = query.lower()
        
        # Search planets
        for planet in self.planets.values():
            if query_lower in planet.name.lower():
                results.append(planet)
        
        # Search moons
        for moon in self.moons.values():
            if query_lower in moon.name.lower():
                results.append(moon)
        
        # Search dwarf planets
        for dwarf_planet in self.dwarf_planets.values():
            if query_lower in dwarf_planet.name.lower():
                results.append(dwarf_planet)
        
        return results