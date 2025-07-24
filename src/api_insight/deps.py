"""
Dependencies
"""
import logging
from typing import Annotated
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from redis import Redis
from api_insight.core.cache import pool, init_data, init_indexes
logger = logging.getLogger(__name__)
def get_cache():
    """Re-use connection pool"""
    return Redis(connection_pool=pool)

CacheDep = Annotated[Redis, Depends(get_cache)]

security = HTTPBearer(
    scheme_name="Authorize with Bearer token",
    description="""Provide the session_id in the box below.
        To generate a session_id, you can use 
        <b> https://demoshop.skyramp.dev/api/v1/generate </b>
        endpoint.
        """,
)

def get_session_id(token: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    """Get session ID"""
    if token and token.credentials != "":
        logger.debug("using bearer token: %s", token.credentials)
        return token.credentials
    return None

GetSessionIdDep = Annotated[str | None, Depends(get_session_id)]

def ensure_session_data(
    cache: Redis = Depends(get_cache),
    session_id: str = Depends(get_session_id)
):
    """Ensure data and indexes are initialized for the session (ip)."""
    if not session_id:
        return  # No session/ip, skip
    # Check if any key exists for this session
    if cache.exists(f"{session_id}:products:1"):  # quick check for one collection
        return
    init_data(cache, session_id)
    init_indexes(cache, session_id)

EnsureSessionDep = Depends(ensure_session_data)
