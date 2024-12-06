from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.exceptions import RequestValidationError, RequestValidationError
from exceptions import ResourceNotFoundException
from sqlmodel import Session, select
from typing import List
from db import get_session
from models.product import Product, ProductCreate, ProductUpdate, ProductResponse
from datetime import datetime

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.post("/", 
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product in the catalog with the provided details"
)
def create_product(
    product: ProductCreate,
    session: Session = Depends(get_session)
):
    db_product = Product.model_validate(product)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

@router.get("/", response_model=List[ProductResponse], summary="Get a list of products")
def get_products(session: Session = Depends(get_session)):
    products = session.exec(select(Product)).all()
    return products

@router.get("/{product_id}", response_model=ProductResponse, summary="Get a product by ID")
def get_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductResponse, summary="Update a product by ID")
def update_product(product_id: int, product_update: ProductUpdate, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    product_data = product_update.dict(exclude_unset=True)
    for key, value in product_data.items():
        setattr(product, key, value)
    product.updated_at = datetime.utcnow()
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a product by ID")
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return
