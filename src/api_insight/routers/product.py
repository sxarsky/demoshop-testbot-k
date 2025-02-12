"""
Router for product-related endpoints.
Handles CRUD operations for product management.
"""
from datetime import datetime, timezone
from typing import List, Annotated

from fastapi import APIRouter, status, Path, Query, Depends
from fastapi.exceptions import HTTPException

from sqlmodel import select
from api_insight.deps import SessionDep, get_current_user
from api_insight.exceptions import ResourceNotFoundException
from api_insight.models.product import Product, ProductCreate, ProductUpdate, ProductResponse
from api_insight.models.params import QueryParams
from api_insight.crud import products

router = APIRouter(
    prefix="/products",
    tags=["products"],
    dependencies=[Depends(get_current_user)]
)

@router.post("",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product in the catalog with the provided details",
)
async def create_product(
    product: ProductCreate,
    session: SessionDep
):
    """Create a new product in the database."""
    if product.in_stock is not False:
        raise HTTPException(status_code=400, detail="Invalid value")
    db_product = products.create_product(session, product)
    return db_product

@router.get("", response_model=List[ProductResponse], summary="Get a list of products")
async def get_products(
    query_params: Annotated[QueryParams, Query()],
    session: SessionDep
):
    """Get all products from the database."""
    products_list = products.get_products(session, query_params.limit, query_params.offset)
    return products_list

@router.get("/{product_id}",
            response_model=ProductResponse,
            summary="Get a product by ID",
            status_code=status.HTTP_200_OK
)
async def get_product(product_id: Annotated[int, Path()], session: SessionDep):
    """Get a single product by its ID."""
    product = session.exec(select(Product).where(Product.product_id == product_id)).first()
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductResponse, summary="Update a product by ID")
async def update_product(product_id: Annotated[int, Path()],
                   product_update: ProductUpdate,
                   session: SessionDep):
    """Update a product's details by its ID."""
    if product_update.in_stock is not False:
        raise HTTPException(status_code=400, detail="Invalid value")
    product = products.get_product(session, product_id)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    product_data = product_update.model_dump(exclude_unset=True)
    for key, value in product_data.items():
        setattr(product, key, value)
    print(product)
    product.updated_at = datetime.now(timezone.utc)
    session.add(product)
    session.commit()
    # session.refresh(product)
    return product

@router.delete("/{product_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               summary="Delete a product by ID")
async def delete_product(product_id: Annotated[int, Path()], session: SessionDep):
    """Delete a product by its ID."""
    product = products.get_product(session, product_id)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return
