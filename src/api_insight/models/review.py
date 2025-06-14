"""Review model"""
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

class ReviewBase(BaseModel):
    """Review base model"""
    rating: int = Field(ge=0)
    comment: str = Field(pattern=r'^[A-Za-z]+.*\s*$')
    model_config = {
        "json_schema_extra": {
            "example": {
                "rating": 5,
                "comment": "Great product!"
            }
        }
    }

class Review(ReviewBase):
    """Database model for review"""
    product_id: int = Field(default=0)
    review_id: int = Field(default=0)
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReviewCreate(ReviewBase):
    """Review create model"""
    pass

class ReviewResponse(ReviewBase):
    """Review response model"""
    model_config = {
        "json_schema_extra": {
            "example": {
                "rating": 5,
                "comment": "Great product!"
            }
        }
    }
