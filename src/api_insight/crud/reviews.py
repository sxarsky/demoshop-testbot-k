"""Crud for reviews."""
from json import loads
import redis
from fastapi.encoders import jsonable_encoder
from redis import ResponseError
from redis.commands.json.path import Path
from redis.commands.search.field import NumericField
from redis.commands.search.index_definition import IndexDefinition, IndexType
from redis.commands.search.query import Query, NumericFilter
from api_insight.models.review import ReviewCreate, Review
from api_insight.core.config import get_settings

DEFAULT_KEY = "demoshop_default"

def get_reviews(product_id: int, cache: redis.Redis, session_id: str, limit: int, offset: int, order: str, order_by: str):
    """Get all reviews."""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    product = cache.json().get(f'{key}:products:{product_id}')
    if not product:
        product_id = 0
    index = get_or_create_reviews_index(cache, key)
    query = Query("*").add_filter(NumericFilter("product_id", product_id, product_id)).paging(offset, limit)
    if order_by and order_by != "":
        asc = True
        if order == 'asc':
            asc = True
        elif order == 'desc':
            asc = False
        query.sort_by(order_by, asc)
    res = index.search(query)
    reviews = [loads(doc.json) for doc in res.docs]
    return reviews

def get_or_create_reviews_index(cache: redis.Redis, key):
    """Get or create reviews index"""
    index = cache.ft(f"idx:{key}:reviews")
    try:
        index.info()
        return index
    except ResponseError:
        print("index doesn't exist, creating")

    definition=IndexDefinition(prefix=[f"{key}:reviews:"], index_type=IndexType.JSON)
    index.create_index((
        NumericField("$.product_id", as_name='product_id')),
        definition=definition,
        temporary=get_settings().key_ttl_seconds
    )
    return index

def create_review(review: ReviewCreate, cache: redis.Redis, session_id: str, product_id: int):
    """Create a new review."""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    product = cache.json().get(f'{key}:products:{product_id}')
    if not product:
        product_id = 0
    review_id = set_review_id(cache, session_id)
    db_review = Review(rating=review.rating,
                       comment=review.comment,
                       product_id=product_id,
                       review_id=review_id)
    review_encoded = jsonable_encoder(db_review.model_dump())
    cache.json().set(f'{key}:reviews:{review_id}', Path.root_path(), review_encoded)
    return db_review

def get_review(cache, session_id: str, product_id: int) -> Review | None:
    """Get a product by ID."""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    review = cache.json().get(f'{key}:reviews:{product_id}')
    return review

def set_review_id(cache: redis.Redis, session_id: str) -> int:
    """set review ID."""
    review_with_id_0 = get_review(cache, session_id, 0)
    if not review_with_id_0:
        return 0
    keys = cache.keys(f'{session_id}:reviews:*')
    max_review_id = max(int(k.split(":")[-1]) for k in keys)
    return max_review_id + 1
