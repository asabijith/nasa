import os

class Config:
    """Configuration for the Flask application"""
    
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    
    # NASA API configuration
    NASA_API_KEY = os.environ.get('NASA_API_KEY') or 'gBuMXFNUouwJEmnN7pwCfVuIUWb5IaClN5EJaqyf'
    
    # Multiple NASA API endpoints
    NASA_ENDPOINTS = {
        'NEO': 'https://api.nasa.gov/neo/rest/v1',  # Near Earth Objects
        'APOD': 'https://api.nasa.gov/planetary/apod',  # Astronomy Picture of the Day
        'MARS_ROVER': 'https://api.nasa.gov/mars-photos/api/v1',  # Mars Rover Photos
        'EARTH': 'https://api.nasa.gov/planetary/earth',  # Earth Imagery
        'EPIC': 'https://api.nasa.gov/EPIC/api',  # Earth Polychromatic Imaging Camera
        'EXOPLANETS': 'https://exoplanetarchive.ipac.caltech.edu/TAP',  # Exoplanet Archive
        'SOLAR_SYSTEM': 'https://api.nasa.gov/planetary',  # Solar System data
        'ASTEROIDS': 'https://api.nasa.gov/neo/rest/v1/neo/browse',  # Asteroid data
        'ISS': 'http://api.open-notify.org/iss-now.json',  # ISS location (no key needed)
        'PEOPLE_IN_SPACE': 'http://api.open-notify.org/astros.json'  # People currently in space
    }
    
    # Solar System Bodies
    SOLAR_SYSTEM_BODIES = {
        'planets': ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
        'dwarf_planets': ['pluto', 'ceres', 'eris', 'makemake', 'haumea'],
        'moons': {
            'earth': ['moon'],
            'mars': ['phobos', 'deimos'],
            'jupiter': ['io', 'europa', 'ganymede', 'callisto'],
            'saturn': ['titan', 'enceladus', 'mimas', 'iapetus'],
            'uranus': ['miranda', 'ariel', 'umbriel', 'titania', 'oberon'],
            'neptune': ['triton', 'nereid']
        }
    }
    
    # Country-specific space agencies and data
    SPACE_AGENCIES = {
        'USA': 'NASA',
        'RUSSIA': 'ROSCOSMOS', 
        'CHINA': 'CNSA',
        'INDIA': 'ISRO',
        'JAPAN': 'JAXA',
        'EUROPE': 'ESA',
        'CANADA': 'CSA',
        'UK': 'UKSA',
        'FRANCE': 'CNES',
        'GERMANY': 'DLR',
        'ITALY': 'ASI',
        'BRAZIL': 'AEB',
        'AUSTRALIA': 'ASA'
    }
    
    # Database configuration
    DATABASE_URI = os.environ.get('DATABASE_URI') or 'sqlite:///astrodefend.db'
    
    # Cache configuration
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300  # 5 minutes
    
    # Debug mode
    DEBUG = True
    
    # Update intervals (in seconds)
    REAL_TIME_UPDATE_INTERVAL = 60  # 1 minute for real-time data
    ISS_UPDATE_INTERVAL = 30       # 30 seconds for ISS tracking
    ASTEROID_UPDATE_INTERVAL = 3600  # 1 hour for asteroid data
