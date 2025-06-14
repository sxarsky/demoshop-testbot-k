import json
import ssl
import os
import redis
from redis.commands.json.path import Path

redis_host = os.getenv('REDIS_HOST','localhost')
redis_port = int(os.getenv('REDIS_PORT', '6379'))
redis_user = os.getenv('REDIS_USER')
redis_pass = os.getenv('REDIS_PASS')
redis_client_crt = os.getenv('REDIS_CLIENT_CRT')
redis_client_key = os.getenv('REDIS_CLIENT_KEY')
redis_ca_pem = os.getenv('REDIS_CA_PEM')
environment = os.getenv('SKYRAMP_ENVIRONMENT')

kwargs = {}
if environment != "local":
    kwargs['connection_class']=redis.SSLConnection
    kwargs['ssl_cert_reqs']="required"
    kwargs['username']=redis_user
    kwargs['password']=redis_pass
    kwargs['ssl_certfile']=redis_client_crt
    kwargs['ssl_keyfile']=redis_client_key
    kwargs['ssl_ca_certs']=redis_ca_pem
    kwargs['ssl_min_version']=ssl.TLSVersion.TLSv1_3

r = redis.Redis(
    host=redis_host,
    port=redis_port,
    decode_responses=True,
    # optional:
    **kwargs
)

with open('app_data.json', 'r', encoding='utf-8') as file:
    data = json.load(file)
    for product in data['products']:
        default_key = f'demoshop_default:products:{product["product_id"]}'
        r.json().set(default_key, Path.root_path(), product)

    for review in data['reviews']:
        default_key = f'demoshop_default:reviews:{review["review_id"]}'
        r.json().set(default_key, Path.root_path(), review)

    for order in data['orders']:
        default_key = f'demoshop_default:orders:{order["order_id"]}'
        r.json().set(default_key, Path.root_path(), order)

    for orderitem in data['orderitems']:
        default_key = f'demoshop_default:orderitems:{orderitem["order_item_id"]}'
        r.json().set(default_key, Path.root_path(), orderitem)
