"""Review model"""
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

class ReviewBase(BaseModel):
    """Review base model"""
    rating: int = Field(ge=0, json_schema_extra={'example': 5})
    comment: str = Field(pattern=r'^[A-Za-z]+.*\s*$', json_schema_extra={'example': "Great Product!"})

class Review(ReviewBase):
    """Database model for review"""
    product_id: int = Field()
    review_id: int = Field()
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReviewCreate(ReviewBase):
    """Review create model"""
    pass

class ReviewResponse(ReviewBase):
    """Review response model"""
    pass
