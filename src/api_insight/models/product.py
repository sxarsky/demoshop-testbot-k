"""
Product models for the API.
"""
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field

class ProductBase(SQLModel):
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
    product_id: int = Field(ge=0,unique=True)
    name: str = Field(min_length=1, schema_extra={'pattern': r'^[A-Za-z]+$'})
    description: str = Field(min_length=1, schema_extra={'pattern': r'^[A-Za-z]+$'})
    price: float = Field(ge=0)
    image_url: str = Field(min_length=1, schema_extra={'pattern': r'^[A-Za-z]+$'})
    category: str = Field(min_length=1, schema_extra={'pattern': r'^[A-Za-z]+$'})
    in_stock: bool = Field(default=False)


class Product(ProductBase, table=True):
    """
    Represents a product in the database.

    Attributes:
        id (int): The ID of the product. Primary key in database.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, nullable=True)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow, nullable=True)

class ProductCreate(ProductBase):
    """
    Represents a product creation instance.

    This class inherits from the `ProductBase` class and is used to define the attributes
    required to create a new product.
    """
    pass


class ProductUpdate(SQLModel):
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

    name: str = Field(min_length=1, schema_extra={'pattern': r'^[A-Za-z]+$'})
    description: str = Field(min_length=1, schema_extra={'pattern': r'^[A-Za-z]+$'})
    price: float = Field(ge=0)
    image_url: str = Field(min_length=1, schema_extra={'pattern': r'^[A-Za-z]+$'})
    category: str = Field(min_length=1, schema_extra={'pattern': r'^[A-Za-z]+$'})
    in_stock: bool = Field(default=False)

class ProductResponse(ProductBase):
    """
    Represents a product response instance.

    This class inherits from the `ProductBase` class and is used to define the attributes
    returned in the response when a product is retrieved.
    
    Attributes:
        id (int): The ID of the product.
    """

    id: int
    created_at: datetime
