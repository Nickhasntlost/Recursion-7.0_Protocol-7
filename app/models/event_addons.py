from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class FoodType(str, Enum):
    BUFFET = "buffet"
    PLATED = "plated"
    COCKTAIL = "cocktail"
    FOOD_TRUCKS = "food_trucks"
    CATERING = "catering"
    NONE = "none"


class ParkingType(str, Enum):
    FREE_PARKING = "free_parking"
    PAID_PARKING = "paid_parking"
    VALET = "valet"
    SHUTTLE_SERVICE = "shuttle_service"
    NO_PARKING = "no_parking"


class EventAddOn(BaseModel):
    """Base class for event add-ons"""
    enabled: bool = False
    description: Optional[str] = None
    cost: float = 0.0  # Additional cost per ticket
    provider: Optional[str] = None  # Vendor name


class FoodBeverage(EventAddOn):
    food_type: FoodType = FoodType.NONE
    menu_items: List[str] = []
    dietary_options: List[str] = []  # ["Vegetarian", "Vegan", "Gluten-free"]
    beverages_included: bool = False
    alcohol_available: bool = False


class Parking(EventAddOn):
    parking_type: ParkingType = ParkingType.FREE_PARKING
    total_spots: Optional[int] = None
    reserved_spots: int = 0
    valet_cost: Optional[float] = None
    parking_instructions: Optional[str] = None


class AVEquipment(EventAddOn):
    """Audio-Visual Equipment"""
    projector: bool = False
    microphones: int = 0
    speakers: bool = False
    lighting: bool = False
    live_streaming: bool = False
    recording: bool = False
    equipment_list: List[str] = []


class Accommodation(EventAddOn):
    """Hotel/Accommodation"""
    hotel_partnership: bool = False
    hotel_name: Optional[str] = None
    discounted_rate: Optional[float] = None
    room_block: Optional[int] = None  # Number of reserved rooms


class Accessibility(EventAddOn):
    """Accessibility Features"""
    wheelchair_accessible: bool = True
    sign_language_interpreter: bool = False
    assistive_listening_devices: bool = False
    accessible_parking: bool = False
    service_animal_friendly: bool = True
    accessibility_notes: Optional[str] = None


class Entertainment(EventAddOn):
    """Entertainment Options"""
    live_music: bool = False
    dj: bool = False
    performers: List[str] = []
    photo_booth: bool = False
    games_activities: List[str] = []


class Merchandise(EventAddOn):
    """Event Merchandise"""
    t_shirts: bool = False
    bags: bool = False
    badges: bool = False
    custom_items: List[str] = []


class Security(EventAddOn):
    """Security Services"""
    security_guards: int = 0
    bag_check: bool = False
    metal_detectors: bool = False
    emergency_medical: bool = False
    security_company: Optional[str] = None


class Photography(EventAddOn):
    """Photography/Videography"""
    professional_photographer: bool = False
    videographer: bool = False
    drone_footage: bool = False
    photo_package_cost: Optional[float] = None


class Swag(EventAddOn):
    """Swag Bags/Gift Bags"""
    swag_bags: bool = False
    items_included: List[str] = []
    sponsor_materials: bool = False


# Complete add-ons configuration
class EventAddOns(BaseModel):
    food_beverage: Optional[FoodBeverage] = None
    parking: Optional[Parking] = None
    av_equipment: Optional[AVEquipment] = None
    accommodation: Optional[Accommodation] = None
    accessibility: Optional[Accessibility] = None
    entertainment: Optional[Entertainment] = None
    merchandise: Optional[Merchandise] = None
    security: Optional[Security] = None
    photography: Optional[Photography] = None
    swag: Optional[Swag] = None

    # Custom add-ons
    custom_addons: List[dict] = []  # [{"name": "Custom Item", "cost": 10.0}]
