from typing import Union, List

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

description = """
## Products, Orders
"""

app = FastAPI(
    title="Skyramp Sample Store API",
    description=description,
    version="0.0.1",
    terms_of_service="http://skyramp.dev/terms/",
    contact={
        "name": "Skyramp",
        "url": "https://skyramp.dev",
        "email": "info@skyramp.dev",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Product(BaseModel):
    id: str
    title: str
    price: float
    description: str
    image_url: str
    category: str = None
    in_stock: bool


class Order(BaseModel):
    id: str
    user_id: str
    product_id: str
    quantity: int

@app.get("/products", response_model=List[Product], summary="Get a list of products", tags=["Products"])
async def get_products(max_items: int = 10):
    products = [
        {
            "id": str(i), 
            "title": f"Product {i}", 
            "price": 100.0, 
            "description": f"Description for product {i}", 
            "image_url": f"https://example.com/product{i}.jpg", 
            "in_stock": True
        } 
        for i in range(max_items)
    ]
    return products

@app.post("/products", response_model=Product, summary="Add a new product", tags=["Products"])
async def add_product(product: Product):
    return product
@app.get("/products/{product_id}", response_model=Product, summary="Get a product by id", tags=["Products"])
async def get_product(product_id: str):
    return {"id": product_id, "title": "Product " + product_id, "price": 100.0, "description": "Product description", "image_url": "https://example.com/image.jpg", "in_stock": True}

@app.put("/products/{product_id}", response_model=Product, summary="Update a product by id", tags=["Products"])
async def update_product(product_id: str, product: Product):
    return product

@app.delete("/products/{product_id}", summary="Delete a product by id", tags=["Products"])
async def delete_product(product_id: str):
    return {"message": "Product deleted"}

@app.get("/orders/{order_id}", response_model=Order, summary="Get an order by id", tags=["Orders"])
async def get_order(order_id: str):
    return {"id": order_id, "user_id": "user_id", "product_id": "product_id", "quantity": 1}

@app.put("/orders/{order_id}", response_model=Order, summary="Update an order by id", tags=["Orders"])
async def update_order(order_id: str, order: Order):
    return order

@app.delete("/orders/{order_id}", summary="Delete an order by id", tags=["Orders"])
async def delete_order(order_id: str):
    return {"message": "Order deleted"}
