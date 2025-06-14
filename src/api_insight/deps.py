"""
Dependencies
"""
from typing import Annotated
from fastapi import Depends, Request
from redis import Redis
from api_insight.core.cache import pool, init_data

def get_cache():
    """Re-use connection pool"""
    return Redis(connection_pool=pool)

CacheDep = Annotated[Redis, Depends(get_cache)]

def get_ip(request: Request):
    """Get IP"""
    ip = None
    real_ip = request.headers.get("X-Real-IP")
    if real_ip and real_ip != "":
        ip = real_ip
    xff = request.headers.get("X-Forwarded-For")
    if xff and len(xff) > 0:
        ip = xff[0]
    client_host = request.client.host
    if client_host and client_host != "":
        ip = client_host
    if ip and ip != "":
        init_data(get_cache(), ip)

    return ip

GetIpDep = Annotated[str | None, Depends(get_ip)]
