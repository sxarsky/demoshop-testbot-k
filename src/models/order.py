from enum import Enum
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from pydantic import field_validator

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderItemBase(SQLModel):
    quantity: int = Field(ge=1)
    product_id: int = Field(foreign_key="product.id")
    unit_price: float = Field(ge=1)

    @field_validator('quantity')
    def quantity_must_be_positive(cls, v):
        if v < 1:
            raise ValueError('Quantity must be at least 1')
        return v

    @field_validator('unit_price')
    def unit_price_must_be_positive(cls, v):
        if v < 1.0:
            raise ValueError('Unit price must be at least 1.0')
        return v

class OrderItem(OrderItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    
    # Relationships
    product: Optional["Product"] = Relationship()
    order: Optional["Order"] = Relationship(back_populates="items")

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemRead(OrderItemBase):
    id: int
    order_id: int

class OrderBase(SQLModel):
    customer_email: str = Field(index=True)
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    total_amount: float = Field(default=0.0)

class Order(OrderBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    items: List[OrderItem] = Relationship(back_populates="order")

class OrderCreate(SQLModel):
    customer_email: str
    items: List[OrderItemCreate]

class OrderRead(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime
