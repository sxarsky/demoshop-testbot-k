"""Create initial data in the database."""
from sqlmodel import Session
from api_insight.models import Product, OrderItem, Order, Review

def create_products(engine):
    """Create initial product data in the database."""
    product_0 = Product(product_id=0, name='Macbook Pro', description='High-performance laptop', price=2499.99, image_url='https://images.app.goo.gl/jGPHo3ZEzEbHG8o2A', category='Laptop', in_stock=True)
    product_1 = Product(product_id=1, name='Apple iPhone 16', description='The everyday smartphone', price=799.99, image_url='https://images.app.goo.gl/rALgN7NxNDtwYdBH9', category='Mobile', in_stock=True)
    product_2 = Product(product_id=2, name='Apple Airpods', description='The next evolution of sound and comfort.', price=199.99, image_url='https://images.app.goo.gl/zMx9rgzQ2svmoUAL7', category='Headphones', in_stock=True)
    product_3 = Product(product_id=3, name='Apple iWatch', description='The ultimate device for a healthy life.', price=499.99, image_url='https://images.app.goo.gl/LohrkpRHJsbNk7Uf8', category='Smartwatch', in_stock=True)
    product_4 = Product(product_id=4, name='Rayban Sunglasses', description='Add a modern touch to your outfits with these sleek aviator sunglasses.', price=99.99, image_url='https://static/img/products/sunglasses.jpg', category='accessories', in_stock=True)
    product_5 = Product(product_id=5, name='Adidas Running Shoes', description='The perfect running shoes for your daily workout.', price=129.99, image_url='https://static/img/products/shoes.jpg', category='shoes', in_stock=True)
    product_6 = Product(product_id=6, name='Nike T-shirt', description='Stay comfortable and stylish with this classic Nike t-shirt.', price=39.99, image_url='https://static/img/products/tshirt.jpg', category='clothing', in_stock=True)
    product_7 = Product(product_id=7, name='Samsung Galaxy S20', description='Experience the power of 5G with the Samsung Galaxy S20.', price=999.99, image_url='https://static/img/products/s20.jpg', category='mobile', in_stock=True)
    product_8 = Product(product_id=8, name='Sony Noise-Cancelling Headphones', description='Enjoy your music without distractions with these noise-cancelling headphones.', price=299.99, image_url='https://static/img/products/headphones.jpg', category='headphones', in_stock=True)
    product_9 = Product(product_id=9, name='Dell XPS 13', description='The ultimate laptop for work and play.', price=1499.99, image_url='https://static/img/products/laptop.jpg', category='laptop', in_stock=True)
    product_10 = Product(product_id=10, name='Apple iPad Pro', description='The most advanced iPad ever.', price=799.99, image_url='https://static/img/products/ipad.jpg', category='tablet', in_stock=True)
    product_11 = Product(product_id=11, name='Dockers Loafers', description='Step out in style with these classic Dockers loafers.', price=79.99, image_url='https://static/img/products/shoes2.jpg', category='shoes', in_stock=True)
    product_12 = Product(product_id=12, name='Calvin Klein Jeans', description='Stay on trend with these stylish Calvin Klein jeans.', price=59.99, image_url='https://static/img/products/jeans.jpg', category='clothing', in_stock=True)
    product_13 = Product(product_id=13, name='Bose Soundbar 700', description='Experience immersive sound with the Bose Soundbar 700.', price=799.99, image_url='https://static/img/products/soundbar.jpg', category='audio', in_stock=True)
    product_14 = Product(product_id=14, name='Samsung 55" QLED TV', description='Enjoy stunning visuals with the Samsung 55" QLED TV.', price=1499.99, image_url='https://static/img/products/tv.jpg', category='tv', in_stock=True)
    product_15 = Product(product_id=15, name='Fitbit Versa 2', description='Track your fitness goals with the Fitbit Versa 2.', price=199.99, image_url='https://static/img/products/smartwatch.jpg', category='smartwatch', in_stock=True)
    product_16 = Product(product_id=16, name='Amazon Echo Dot', description='Make your home smarter with the Amazon Echo Dot.', price=49.99, image_url='https://static/img/products/smart_home.jpg', category='smart_home', in_stock=True)
    product_17 = Product(product_id=17, name='Google Nest Mini', description='Control your home with your voice using the Google Nest Mini.', price=39.99, image_url='https://static/img/products/smart_home2.jpg', category='smart_home', in_stock=True)
    product_18 = Product(product_id=18, name='Sony WH-1000XM3 Headphones', description='Experience premium sound quality with the Sony WH-1000XM3 Headphones.', price=349.99, image_url='https://static/img/products/headphones2.jpg', category='headphones', in_stock=True)
    product_19 = Product(product_id=19, name='Dyson Hairdryer', description='This lightweight hairdryer has 3 heat and speed settings. It iss perfect for travel.', price=499.99, image_url='https://static/img/products/hairdryer.jpg', category='beauty', in_stock=True)
    product_20 = Product(product_id=20, name='Samsung Galaxy Buds', description='Enjoy clear sound with the Samsung Galaxy Buds.', price=129.99, image_url='https://static/img/products/earbuds.jpg', category='headphones', in_stock=True)
    product_21 = Product(product_id=21, name='Bose QuietComfort 35 II', description='Experience world-class noise cancellation with the Bose QuietComfort 35 II.', price=349.99, image_url='https://static/img/products/headphones3.jpg', category='headphones', in_stock=True)
    product_22 = Product(product_id=22, name='Apple MacBook Air', description='The thinnest and lightest MacBook ever.', price=999.99, image_url='https://static/img/products/laptop2.jpg', category='laptop', in_stock=True)
    product_23 = Product(product_id=23, name='Google Pixel 4', description='Capture stunning photos with the Google Pixel 4.', price=799.99, image_url='https://static/img/products/mobile.jpg', category='mobile', in_stock=True)

    with Session(engine) as session:
        session.add(product_0)
        session.add(product_1)
        session.add(product_2)
        session.add(product_3)
        session.add(product_4)
        session.add(product_5)
        session.add(product_6)
        session.add(product_7)
        session.add(product_8)
        session.add(product_9)
        session.add(product_10)
        session.add(product_11)
        session.add(product_12)
        session.add(product_13)
        session.add(product_14)
        session.add(product_15)
        session.add(product_16)
        session.add(product_17)
        session.add(product_18)
        session.add(product_19)
        session.add(product_20)
        session.add(product_21)
        session.add(product_22)
        session.add(product_23)
        session.commit()

def create_order_items(engine):
    """Create initial order item data in the database."""

    orderitem_0 = OrderItem(order_item_id=0, order_id=0, product_id=0, quantity=2, unit_price=2499.99)
    orderitem_1 = OrderItem(order_item_id=1, order_id=1, product_id=1, quantity=1, unit_price=799.99)
    orderitem_2 = OrderItem(order_item_id=2, order_id=1, product_id=2, quantity=1, unit_price=199.99)
    orderitem_3 = OrderItem(order_item_id=3, order_id=2, product_id=3, quantity=1, unit_price=499.99)
    orderitem_4 = OrderItem(order_item_id=4, order_id=3, product_id=4, quantity=2, unit_price=99.99)
    orderitem_5 = OrderItem(order_item_id=5, order_id=3, product_id=11, quantity=1, unit_price=79.99)
    orderitem_6 = OrderItem(order_item_id=6, order_id=4, product_id=5, quantity=1, unit_price=129.99)
    orderitem_7 = OrderItem(order_item_id=7, order_id=4, product_id=12, quantity=1, unit_price=59.99)
    orderitem_8 = OrderItem(order_item_id=8, order_id=5, product_id=6, quantity=1, unit_price=39.99)
    orderitem_9 = OrderItem(order_item_id=9, order_id=5, product_id=13, quantity=1, unit_price=799.99)
    orderitem_10 = OrderItem(order_item_id=10, order_id=6, product_id=7, quantity=1, unit_price=999.99)
    orderitem_11 = OrderItem(order_item_id=11, order_id=6, product_id=14, quantity=1, unit_price=1499.99)
    orderitem_12 = OrderItem(order_item_id=12, order_id=7, product_id=8, quantity=1, unit_price=299.99)
    orderitem_13 = OrderItem(order_item_id=13, order_id=7, product_id=18, quantity=1, unit_price=349.99)
    orderitem_14 = OrderItem(order_item_id=14, order_id=8, product_id=9, quantity=1, unit_price=1499.99)
    orderitem_15 = OrderItem(order_item_id=15, order_id=8, product_id=22, quantity=1, unit_price=999.99)
    orderitem_16 = OrderItem(order_item_id=16, order_id=9, product_id=10, quantity=1, unit_price=799.99)
    orderitem_17 = OrderItem(order_item_id=17, order_id=9, product_id=23, quantity=1, unit_price=799.99)
    orderitem_18 = OrderItem(order_item_id=18, order_id=10, product_id=15, quantity=1, unit_price=199.99)
    orderitem_19 = OrderItem(order_item_id=19, order_id=10, product_id=20, quantity=1, unit_price=129.99)
    orderitem_20 = OrderItem(order_item_id=20, order_id=11, product_id=16, quantity=1, unit_price=49.99)
    orderitem_21 = OrderItem(order_item_id=21, order_id=11, product_id=17, quantity=1, unit_price=39.99)
    orderitem_22 = OrderItem(order_item_id=22, order_id=12, product_id=19, quantity=1, unit_price=499.99)
    orderitem_23 = OrderItem(order_item_id=23, order_id=12, product_id=21, quantity=1, unit_price=349.99)

    with Session(engine) as session:
        session.add(orderitem_0)
        session.add(orderitem_1)
        session.add(orderitem_2)
        session.add(orderitem_3)
        session.add(orderitem_4)
        session.add(orderitem_5)
        session.add(orderitem_6)
        session.add(orderitem_7)
        session.add(orderitem_8)
        session.add(orderitem_9)
        session.add(orderitem_10)
        session.add(orderitem_11)
        session.add(orderitem_12)
        session.add(orderitem_13)
        session.add(orderitem_14)
        session.add(orderitem_15)
        session.add(orderitem_16)
        session.add(orderitem_17)
        session.add(orderitem_18)
        session.add(orderitem_19)
        session.add(orderitem_20)
        session.add(orderitem_21)
        session.add(orderitem_22)
        session.add(orderitem_23)
        session.commit()

def create_orders(engine):
    """Create initial order data in the database."""

    order_0 = Order(order_id=0, customer_email='abc@mail.com', status='PENDING', total_amount=4999.98)
    order_1 = Order(order_id=1, customer_email='def@mail.com', status='CONFIRMED', total_amount=999.98)
    order_2 = Order(order_id=2, customer_email='ghi@mail.com', status='SHIPPED', total_amount=499.99)
    order_3 = Order(order_id=3, customer_email='jkl@mail.com', status='DELIVERED', total_amount=279.97)
    order_4 = Order(order_id=4, customer_email='mno@mail.com', status='PENDING', total_amount=189.98)
    order_5 = Order(order_id=5, customer_email='pqr@mail.com', status='PENDING', total_amount=839.98)
    order_6 = Order(order_id=6, customer_email='stu@mail.com', status='DELIVERED', total_amount=2499.98)
    order_7 = Order(order_id=7, customer_email='vwx@mail.com', status='SHIPPED', total_amount=649.98)
    order_8 = Order(order_id=8, customer_email='yza@mail.com', status='CONFIRMED', total_amount=2799.98)
    order_9 = Order(order_id=9, customer_email='bcd@mail.com', status='PENDING', total_amount=1599.98)
    order_10 = Order(order_id=10, customer_email='efg@mail.com', status='DELIVERED', total_amount=329.98)
    order_11 = Order(order_id=11, customer_email='hij@mail.com', status='SHIPPED', total_amount=89.98)
    order_12 = Order(order_id=12, customer_email='klm@mail.com', status='CONFIRMED', total_amount=849.98)

    with Session(engine) as session:
        session.add(order_0)
        session.add(order_1)
        session.add(order_2)
        session.add(order_3)
        session.add(order_4)
        session.add(order_5)
        session.add(order_6)
        session.add(order_7)
        session.add(order_8)
        session.add(order_9)
        session.add(order_10)
        session.add(order_11)
        session.add(order_12)
        session.commit()

def create_reviews(engine):
    """Create initial review data in the database."""
    reviews = [
        Review(review_id=0, product_id=0, rating=5, comment='Morbi non quam nec dui luctus rutrum. Nulla tellus. In sagittis dui vel nisl.'),
        Review(review_id=1, product_id=0, rating=4, comment='Maecenas tincidunt lacus at velit.'),
        Review(review_id=2, product_id=1, rating=3, comment='Nam nulla. Integer pede justo, lacinia eget, tincidunt eget, tempus vel, pede. Morbi porttitor lorem id ligula. Suspendisse ornare consequat lectus. In est risus, auctor sed, tristique in, tempus sit amet, sem. Fusce consequat. Nulla nisl. Nunc nisl. Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa.'),
        Review(review_id=3, product_id=1, rating=5, comment='Morbi non lectus.'),
        Review(review_id=4, product_id=1, rating=1, comment='Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.'),
        Review(review_id=5, product_id=2, rating=2, comment='Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.'),
        Review(review_id=6, product_id=2, rating=5, comment='Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat. In congue. Etiam justo. Etiam pretium iaculis justo. In hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus. Nulla ut erat id mauris vulputate elementum.'),
        Review(review_id=7, product_id=3, rating=5, comment='Morbi a ipsum. Integer a nibh. In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet. Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo.'),
        Review(review_id=8, product_id=4, rating=5, comment='Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin interdum mauris non ligula pellentesque ultrices. Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl. Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum. Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo.'),
        Review(review_id=9, product_id=4, rating=4, comment='Nulla tempus. Vivamus in felis eu sapien cursus vestibulum. Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.'),
        Review(review_id=10, product_id=4, rating=3, comment='Nam tristique tortor eu pede.'),
        Review(review_id=11, product_id=4, rating=1, comment='In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit. Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue.'),
        Review(review_id=12, product_id=5, rating=5, comment='Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque. Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla.'),
        Review(review_id=13, product_id=6, rating=5, comment='Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti. Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum.'),
        Review(review_id=14, product_id=6, rating=3, comment='Suspendisse potenti.'),
        Review(review_id=15, product_id=7, rating=3, comment='Integer a nibh. In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet. Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui.'),
        Review(review_id=16, product_id=7, rating=4, comment='Nulla justo. Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor.'),
        Review(review_id=17, product_id=7, rating=1, comment='Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti. Nullam porttitor lacus at turpis.'),
        Review(review_id=18, product_id=8, rating=2, comment='Integer a nibh. In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet. Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam.'),
        Review(review_id=19, product_id=8, rating=3, comment='Pellentesque ultrices mattis odio. Donec vitae nisi. Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.'),
        Review(review_id=20, product_id=8, rating=4, comment='Ut tellus. Nulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.'),
        Review(review_id=21, product_id=8, rating=5, comment='Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin interdum mauris non ligula pellentesque ultrices. Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl. Aenean lectus. Pellentesque eget nunc.'),
        Review(review_id=22, product_id=8, rating=5, comment='Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi. Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.'),
        Review(review_id=23, product_id=9, rating=4, comment='Nunc nisl. Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa. Donec dapibus. Duis at velit eu est congue elementum. In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo. Aliquam quis turpis eget elit sodales scelerisque.'),
        Review(review_id=24, product_id=9, rating=3, comment='In sagittis dui vel nisl. Duis ac nibh.'),
        Review(review_id=25, product_id=10, rating=5, comment='Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo. Pellentesque ultrices mattis odio.'),
        Review(review_id=26, product_id=11, rating=3, comment='Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti.'),
        Review(review_id=27, product_id=12, rating=4, comment='Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque. Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla.'),
        Review(review_id=28, product_id=13, rating=5, comment='Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum.'),
        Review(review_id=29, product_id=13, rating=3, comment='Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat. In congue. Etiam justo. Etiam pretium iaculis justo.'),
        Review(review_id=30, product_id=13, rating=5, comment='Nulla facilisi.'),
        Review(review_id=31, product_id=14, rating=5, comment='Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl.'),
        Review(review_id=32, product_id=14, rating=5, comment='Nunc rhoncus dui vel sem.'),
        Review(review_id=33, product_id=15, rating=4, comment='Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum. Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est. Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.'),
        Review(review_id=34, product_id=16, rating=1, comment='Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis.'),
        Review(review_id=35, product_id=17, rating=5, comment='Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor. Duis mattis egestas metus. Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum.'),
        Review(review_id=36, product_id=18, rating=3, comment='Nulla facilisi. Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque. Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui.'),
        Review(review_id=37, product_id=19, rating=5, comment='Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum. Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.'),
        Review(review_id=38, product_id=20, rating=2, comment='Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum. Aliquam non mauris. Morbi non lectus.'),
        Review(review_id=39, product_id=21, rating=1, comment='Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl. Aenean lectus.'),
        Review(review_id=40, product_id=22, rating=5, comment='Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.')
    ]
    
    with Session(engine) as session:
        session.add_all(reviews)
        session.commit()
