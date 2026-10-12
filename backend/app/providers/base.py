from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Business(BaseModel):
    id: str
    name: str
    category: str
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    hours: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    profile_url: Optional[str] = None
    social_links: Dict[str, str] = Field(default_factory=dict)
    source: str = "osm"
    opportunity_signals: List[Dict[str, Any]] = Field(default_factory=list)
    analysis_id: Optional[str] = None
    analysis_scores: Optional[Dict[str, Any]] = None

class BusinessSearchQuery(BaseModel):
    query: str
    location: str
    keyword: str
    radius_km: int = 10
    limit: int = 50
    refresh: bool = False
    offset: int = 0
    exclude_names: List[str] = Field(default_factory=list)

class BusinessSearchProvider(ABC):
    """
    Abstract base provider for business search services.
    Enables swapping between OpenStreetMap/Overpass, Google Places, Yelp, SerpAPI, etc.
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def search(self, query: BusinessSearchQuery) -> List[Business]:
        pass
