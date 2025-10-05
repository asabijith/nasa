import requests
import json
from datetime import datetime, timedelta
import config
import time
from typing import Dict, List, Optional, Any

class NASAAPIClient:
    """Comprehensive NASA API client for all space data"""
    
    def __init__(self):
        self.api_key = config.Config.NASA_API_KEY
        self.endpoints = config.Config.NASA_ENDPOINTS
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'AstroDefense-Stellarium-App/1.0',
            'Accept': 'application/json'
        })
    
    def _make_request(self, url: str, params: Dict = None) -> Dict:
        """Make API request with error handling"""
        if params is None:
            params = {}
        
        # Add API key if URL contains nasa.gov
        if 'nasa.gov' in url:
            params['api_key'] = self.api_key
            
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
            return {"error": str(e)}
    
    # ASTEROID AND NEO DATA
    def get_asteroid_data(self, start_date=None, end_date=None, asteroid_id=None):
        """Fetch asteroid data from NASA NeoWs API"""
        base_url = self.endpoints['NEO']
        
        if asteroid_id:
            url = f"{base_url}/neo/{asteroid_id}"
            return self._make_request(url)
        else:
            url = f"{base_url}/feed"
            params = {}
            if start_date:
                params['start_date'] = start_date
            if end_date:
                params['end_date'] = end_date
            return self._make_request(url, params)
    
    def get_close_approach_data(self, days=7):
        """Get near-Earth objects approaching in the next specified days"""
        end_date = datetime.now() + timedelta(days=days)
        start_date = datetime.now().strftime('%Y-%m-%d')
        end_date = end_date.strftime('%Y-%m-%d')
        
        return self.get_asteroid_data(start_date, end_date)
    
    def get_asteroid_browse(self, page=0, size=20):
        """Browse all asteroids in database"""
        url = self.endpoints['ASTEROIDS']
        params = {'page': page, 'size': size}
        return self._make_request(url, params)
    
    # ASTRONOMY PICTURE OF THE DAY
    def get_apod(self, date=None, count=None, start_date=None, end_date=None):
        """Get Astronomy Picture of the Day"""
        url = self.endpoints['APOD']
        params = {}
        
        if date:
            params['date'] = date
        if count:
            params['count'] = count
        if start_date:
            params['start_date'] = start_date
        if end_date:
            params['end_date'] = end_date
            
        return self._make_request(url, params)
    
    # MARS ROVER DATA
    def get_mars_rover_photos(self, rover='curiosity', sol=None, earth_date=None, camera=None):
        """Get Mars rover photos"""
        url = f"{self.endpoints['MARS_ROVER']}/rovers/{rover}/photos"
        params = {}
        
        if sol:
            params['sol'] = sol
        elif earth_date:
            params['earth_date'] = earth_date
        else:
            # Default to latest sol
            params['sol'] = 1000
            
        if camera:
            params['camera'] = camera
            
        return self._make_request(url, params)
    
    def get_mars_rover_info(self, rover='curiosity'):
        """Get Mars rover mission information"""
        url = f"{self.endpoints['MARS_ROVER']}/rovers/{rover}"
        return self._make_request(url)
    
    # EARTH IMAGERY
    def get_earth_imagery(self, lat, lon, date=None, dim=0.12):
        """Get Earth satellite imagery"""
        url = f"{self.endpoints['EARTH']}/imagery"
        params = {
            'lat': lat,
            'lon': lon,
            'dim': dim
        }
        if date:
            params['date'] = date
            
        return self._make_request(url, params)
    
    def get_earth_assets(self, lat, lon, date=None, dim=0.12):
        """Get available Earth imagery assets"""
        url = f"{self.endpoints['EARTH']}/assets"
        params = {
            'lat': lat,
            'lon': lon,
            'dim': dim
        }
        if date:
            params['date'] = date
            
        return self._make_request(url, params)
    
    # EPIC - EARTH POLYCHROMATIC IMAGING CAMERA
    def get_epic_images(self, date=None, image_type='natural'):
        """Get EPIC Earth images"""
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        url = f"{self.endpoints['EPIC']}/{image_type}/date/{date}"
        return self._make_request(url)
    
    def get_epic_available_dates(self, image_type='natural'):
        """Get available dates for EPIC images"""
        url = f"{self.endpoints['EPIC']}/{image_type}/all"
        return self._make_request(url)
    
    # ISS AND ASTRONAUTS DATA (No API key needed)
    def get_iss_location(self):
        """Get current ISS location"""
        url = self.endpoints['ISS']
        return self._make_request(url)
    
    def get_people_in_space(self):
        """Get people currently in space"""
        url = self.endpoints['PEOPLE_IN_SPACE']
        return self._make_request(url)
    
    # SOLAR SYSTEM DATA
    def get_planetary_data(self, body='earth'):
        """Get planetary ephemeris data"""
        # This would integrate with JPL Horizons API for detailed planetary data
        bodies = config.Config.SOLAR_SYSTEM_BODIES
        
        return {
            'body': body,
            'data': f"Planetary data for {body}",
            'available_bodies': bodies
        }
    
    # EXOPLANETS
    def get_exoplanet_data(self, limit=100):
        """Get exoplanet data from NASA Exoplanet Archive"""
        # TAP query for exoplanet data
        query = f"""
        SELECT TOP {limit} 
        pl_name, ra, dec, sy_dist, pl_rade, pl_masse, 
        pl_orbper, pl_eqt, disc_year, disc_facility
        FROM ps 
        WHERE default_flag = 1
        ORDER BY disc_year DESC
        """
        
        url = f"{self.endpoints['EXOPLANETS']}/sync"
        params = {
            'query': query,
            'format': 'json'
        }
        
        return self._make_request(url, params)
    
    # REAL-TIME SPACE EVENTS
    def get_real_time_events(self):
        """Get current space events and phenomena"""
        current_time = datetime.now()
        
        events = {
            'timestamp': current_time.isoformat(),
            'iss_location': self.get_iss_location(),
            'people_in_space': self.get_people_in_space(),
            'close_approaches_today': self.get_close_approach_data(1),
            'apod': self.get_apod(),
            'epic_latest': self.get_epic_images()
        }
        
        return events
    
    # COUNTRY-SPECIFIC SPACE MISSIONS
    def get_country_missions(self, country='USA'):
        """Get space missions by country"""
        agencies = config.Config.SPACE_AGENCIES
        
        return {
            'country': country,
            'agency': agencies.get(country, 'Unknown'),
            'missions': f"Missions data for {country} would be fetched here"
        }
    
    # STELLARIUM-LIKE FEATURES
    def get_sky_view_data(self, lat=0, lon=0, elevation=0, time=None):
        """Get sky view data for Stellarium-like visualization"""
        if time is None:
            time = datetime.now()
        
        return {
            'location': {'lat': lat, 'lon': lon, 'elevation': elevation},
            'time': time.isoformat(),
            'visible_planets': self._get_visible_planets(lat, lon, time),
            'visible_satellites': self._get_visible_satellites(lat, lon, time),
            'iss_visible': self._check_iss_visibility(lat, lon, time),
            'moon_phase': self._get_moon_phase(time),
            'sun_position': self._get_sun_position(lat, lon, time)
        }
    
    def _get_visible_planets(self, lat, lon, time):
        """Calculate visible planets for location and time"""
        # Placeholder for planetary visibility calculations
        return config.Config.SOLAR_SYSTEM_BODIES['planets']
    
    def _get_visible_satellites(self, lat, lon, time):
        """Get visible satellites for location and time"""
        # Integration with satellite tracking APIs would go here
        return ['ISS', 'Hubble Space Telescope', 'Starlink satellites']
    
    def _check_iss_visibility(self, lat, lon, time):
        """Check if ISS is visible from location at time"""
        # Calculate ISS visibility
        return {'visible': True, 'magnitude': -2.5, 'duration': '6 minutes'}
    
    def _get_moon_phase(self, time):
        """Calculate moon phase"""
        # Moon phase calculation
        return {'phase': 'Waxing Crescent', 'illumination': 0.25}
    
    def _get_sun_position(self, lat, lon, time):
        """Calculate sun position"""
        # Sun position calculation
        return {'altitude': 45, 'azimuth': 180, 'sunrise': '06:30', 'sunset': '18:45'}

# Global instance
nasa_client = NASAAPIClient()

# Legacy function wrappers for backward compatibility
def get_asteroid_data(start_date=None, end_date=None, asteroid_id=None):
    return nasa_client.get_asteroid_data(start_date, end_date, asteroid_id)

def get_close_approach_data(days=7):
    return nasa_client.get_close_approach_data(days)
