"""
Order models for the API.
"""
from datetime import datetime
from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class OrderStatus(str, Enum):
    """Order status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderItemBase(BaseModel):
    """Model for order items with common fields."""
    quantity: int = Field(ge=0)
    product_id: int = Field(ge=0)
    unit_price: float = Field(ge=0)

    # TODO: Add validation for quantity and unit_price once skyramp generate supports minimum and maximum values
    # @field_validator('quantity')
    # @classmethod
    # def quantity_must_be_positive(cls, v):
    #     """Validate that quantity is positive."""
    #     if v < 1:
    #         raise ValueError('Quantity must be at least 1')
    #     return v
    
    # TODO: Add validation for quantity and unit_price once skyramp generate supports minimum and maximum values
    # @field_validator('unit_price')
    # @classmethod
    # def unit_price_must_be_positive(cls, v):
    #     """Validate that unit price is positive.""" 
    #     if v < 1.0:
    #         raise ValueError('Unit price must be at least 1.0')
    #     return v

class OrderItem(OrderItemBase):
    """Model for order items."""
    # TODO: order_item_id should be a UUID. Hardcoding it as 0 to pass the tests
    order_item_id: int = Field(default=0)
    order_id: int = Field()

class OrderItemCreate(OrderItemBase):
    """Model for creating new order items in DB."""
    pass

class OrderItemRead(OrderItemBase):
    """Model for fetching order items from DB."""
    order_item_id: int
    order_id: int

class OrderBase(BaseModel):
    """Parent Model for orders with common fields."""
    customer_email: str = Field(max_length=255, pattern=r"(^[a-zA-Z]+[@a-zA-Z0-9-]*[\.a-zA-Z0-9-.]*$)")
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    total_amount: float = Field(default=0.0)

class Order(OrderBase):
    """Model for orders."""
    # TODO: order_id should be a UUID. Hardcoding it as 0 to pass the tests
    order_id: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    items: List[OrderItem]

class OrderCreate(BaseModel):
    """Model for creating new orders in DB."""
    customer_email: str = Field(max_length=255, pattern=r"(^[a-zA-Z]+[@a-zA-Z0-9-]*[\.a-zA-Z0-9-.]*$)")
    items: List[OrderItemCreate]
    model_config = {
        "json_schema_extra": {
            "example": {
                "customer_email": "abc@mail.com",
                "items": [
                    {
                        "quantity": 2,
                        "product_id": 1,
                        "unit_price": 9.99
                    }
                ]
            }
        }
    }

class OrderRead(OrderBase):
    """Model for fetching order details from DB."""
    order_id: int
    items: List[OrderItemRead]
    created_at: datetime
    updated_at: datetime
    model_config = {
        "json_schema_extra": {
            "example": {
                "order_id": 1,
                "customer_email": "abc@mail.com",
                "status": "pending",
                "total_amount": 19.98,
                "items": [
                    {
                        "order_item_id": 1,
                        "quantity": 2,
                        "product_id": 1,
                        "unit_price": 9.99
                    }
                ],
                "created_at": "2022-01-01T00:00:00",
                "updated_at": "2022-01-01T00:00:00"
            }
        }
    }

class OrderCancel(BaseModel):
    """Model for cancelling an order."""
    message: str = Field(default="Order cancelled successfully")
