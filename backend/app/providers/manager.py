import re
import os
import logging
from typing import List, Tuple, Optional
from app.providers.base import BusinessSearchQuery, Business
from app.providers.google_provider import GooglePlacesProvider
from app.providers.directory_provider import DirectoryProvider
from app.providers.osm_provider import OSMOverpassProvider

logger = logging.getLogger(__name__)

def normalize_business_query(raw_query: str, raw_location: str = "", raw_keyword: str = "", radius_km: int = 10) -> Tuple[str, str, int]:
    location = raw_location.strip()
    keyword = raw_keyword.strip()

    if not location and not keyword and raw_query:
        query_lower = raw_query.lower()
        match_in = re.search(r"^(.*?)\s+(?:in|near|at|around)\s+(.*?)$", query_lower, re.IGNORECASE)
        if match_in:
            keyword = match_in.group(1).strip()
            location = match_in.group(2).strip()
        else:
            parts = raw_query.split(",")
            if len(parts) >= 2:
                keyword = parts[0].strip()
                location = parts[1].strip()
            else:
                keyword = raw_query.strip()
                location = "New York, USA"

    if not location:
        location = "New York, USA"
    if not keyword:
        keyword = "Restaurant"

    return location.title(), keyword.title(), radius_km

class BusinessSearchManager:
    def __init__(self):
        self.google_provider = GooglePlacesProvider()
        self.directory_provider = DirectoryProvider()
        self.osm_provider = OSMOverpassProvider()

    def search(self, location: str, keyword: str, radius_km: int = 10, limit: int = 50, provider_preference: Optional[str] = None, refresh: bool = False, offset: int = 0, exclude_names: Optional[List[str]] = None) -> List[Business]:
        query = BusinessSearchQuery(
            query=f"{keyword} in {location}",
            location=location,
            keyword=keyword,
            radius_km=radius_km,
            limit=limit,
            refresh=refresh,
            offset=offset,
            exclude_names=exclude_names or []
        )

        results: List[Business] = []

        # 1. Primary: Google Places & Google Maps Engine (Ensures authentic Google ratings, reviews, and maps profiles)
        try:
            results = self.google_provider.search(query)
            if results:
                logger.info(f"Google provider returned {len(results)} verified businesses.")
                return results[:limit]
        except Exception as e:
            logger.warning(f"Google Places provider error: {e}")
            results = []

        # 2. Secondary: High-fidelity Verified International Directory
        if not results:
            try:
                results = self.directory_provider.search(query)
                if results:
                    logger.info(f"Directory provider returned {len(results)} businesses.")
                    return results[:limit]
            except Exception as e:
                logger.error(f"Directory catalog search error: {e}")
                results = []

        # 3. Tertiary: OpenStreetMap Global Registry
        if not results:
            try:
                results = self.osm_provider.search(query)
            except Exception as e:
                logger.error(f"Live OSM search error: {e}")
                results = []

        return results[:limit]

# Singleton manager
search_manager = BusinessSearchManager()
