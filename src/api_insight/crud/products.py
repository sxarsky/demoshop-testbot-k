"""
CRUD operations for products.
"""
from sqlmodel import Session, select
from api_insight.models.product import Product, ProductCreate

def get_product(session: Session, product_id: int) -> Product | None:
    """Get a product by ID."""
    statement = select(Product).where(Product.product_id == product_id)
    product = session.exec(statement).first()
    return product

def create_product(session: Session, product_create: ProductCreate) -> Product:
    """Create a new product."""
    db_obj = Product.model_validate(product_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def get_products(session: Session, limit: int, offset: int) -> list[Product]:
    """Get all products."""
    statement = select(Product).limit(limit).offset(offset)
    products = session.exec(statement).all()
    return products
