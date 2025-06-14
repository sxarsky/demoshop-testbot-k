"""
Redis support for Caching
"""
import logging
import ssl
import redis
from api_insight.core.config import get_settings
logger = logging.getLogger(__name__)
settings = get_settings()

def create_pool():
    """Create redis connection pool"""
    kwargs = {}
    if settings.SKYRAMP_ENVIRONMENT != "local":
        kwargs['connection_class']=redis.SSLConnection
        kwargs['ssl_cert_reqs']="required"
        kwargs['username']=settings.redis_user
        kwargs['password']=settings.redis_pass
        kwargs['ssl_certfile']=settings.redis_client_crt
        kwargs['ssl_keyfile']=settings.redis_client_key
        kwargs['ssl_ca_certs']=settings.redis_ca_pem
        kwargs['ssl_min_version']=ssl.TLSVersion.TLSv1_3

    return redis.ConnectionPool(
        host=settings.redis_host,
        port=settings.redis_port,
        decode_responses=True,
        # optional:
        **kwargs
    )

def init_data(cache: redis.Redis, session_id: str):
    """init data"""
    collections = ["products", "reviews", "orders", "orderitems"]
    default_data = "demoshop_default"

    for collection in collections:
        resource_keys = cache.keys(f"{session_id}:{collection}:*")
        if resource_keys and len(resource_keys) > 0:
            logger.debug('skip init data')
            continue
        pattern = f"{default_data}:{collection}:*"
        default_keys = cache.keys(pattern)

        with cache.pipeline() as pipe:
            for k in default_keys:
                pipe.json().get(k)
            default_values = pipe.execute()

        with cache.pipeline() as pipe:
            for k, v in zip(default_keys, default_values):
                if v is not None:
                    resource_id = k.split(":")[-1]
                    new_key = f"{session_id}:{collection}:{resource_id}"
                    pipe.json().set(new_key, '$', v)
                    pipe.expire(new_key, settings.key_ttl_seconds)
            pipe.execute()

pool = create_pool()
