from application.data.models import Venue
from main import cache

@cache.cached(timeout=50, key_prefix='get_venues')
def get_venues():
    venue=Venue.query.all()
    return venue