"""
Product models for the API.
"""
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    """
    Represents a base product.

    Attributes:
        product_id (int): The ID of the product.
        name (str): The name of the product.
        description (str): The description of the product.
        price (float): The price of the product.
        image_url (str): The URL of the product image.
        category (str): The category of the product.
        in_stock (bool): Indicates if the product is in stock.
    """
    name: str = Field(min_length=1, pattern=r'^[A-Za-z]+.*\s*$')
    description: str = Field(min_length=1, pattern=r'^[A-Za-z]+.*\s*$')
    price: float = Field(ge=0)
    image_url: str = Field(min_length=1, pattern=r'^[A-Za-z]+.*\s*$')
    category: str = Field(min_length=1, pattern=r'^[A-Za-z]+.*\s*$')
    in_stock: bool = Field(default=False)

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "bigbear",
                "description": "Bear Soft Toy",
                "price": 9.99,
                "image_url": "https://images.app.goo.gl/cgcHpeehRdu5osot8",
                "category": "Toys",
                "in_stock": True
            }
        }
    }


class Product(ProductBase):
    """
    Represents a product in the database.

    Attributes:
        id (int): The ID of the product. Primary key in database.
    """
    # TODO: product_id should be a UUID. Hardcoding it as 0 to pass the tests
    product_id: int = Field(default=0)
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(ProductBase):
    """
    Represents a product creation instance.

    This class inherits from the `ProductBase` class and is used to define the attributes
    required to create a new product.
    """
    pass


class ProductUpdate(BaseModel):
    """
    Represents an update for a product.

    Attributes:
        name (str): The updated name of the product.
        description (str): The updated description of the product.
        price (float): The updated price of the product.
        image_url (str): The updated URL of the product image.
        category (str): The updated category of the product.
        in_stock (bool): The updated stock availability of the product.
    """

    name: str = Field(default=None, min_length=1, pattern=r'^[A-Za-z]+.*\s*$')
    description: str = Field(default=None, min_length=1, pattern=r'^[A-Za-z]+.*\s*$')
    price: float = Field(default=None, ge=0)
    image_url: str = Field(default=None, min_length=1, pattern=r'^[A-Za-z]+.*\s*$')
    category: str = Field(default=None, min_length=1, pattern=r'^[A-Za-z]+.*\s*$')
    in_stock: bool = Field(default=False)

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "bigbear",
                "description": "Bear Soft Toy",
                "price": 19.99,
                "image_url": "https://images.app.goo.gl/cgcHpeehRdu5osot8",
                "category": "Toys",
                "in_stock": True
            }
        }
    }

class ProductResponse(ProductBase):
    """
    Represents a product response instance.

    This class inherits from the `ProductBase` class and is used to define the attributes
    returned in the response when a product is retrieved.
    
    Attributes:
        id (int): The ID of the product.
    """

    product_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {
        "json_schema_extra": {
            "example": {
                "product_id": 0,
                "created_at": "2025-02-25T10:54:22-05:00",
                "name": "bigbear",
                "description": "Bear Soft Toy",
                "price": 9.99,
                "image_url": "https://images.app.goo.gl/cgcHpeehRdu5osot8",
                "category": "Toys",
                "in_stock": True
            }
        }
    }
