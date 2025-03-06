-- Create user table
CREATE TABLE IF NOT EXISTS user (
        email VARCHAR(255) NOT NULL, 
        id CHAR(32) NOT NULL, 
        hashed_password VARCHAR NOT NULL, 
        created_at DATETIME, 
        updated_at DATETIME, 
        PRIMARY KEY (id)
);
CREATE UNIQUE INDEX ix_user_email ON user (email);

-- Create products table
CREATE TABLE IF NOT EXISTS product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category VARCHAR(255) NOT NULL,
    in_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS "order" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER DEFAULT 0,
    customer_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order items table
CREATE TABLE IF NOT EXISTS orderitem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_item_id INTEGER DEFAULT 0,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES "order"(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

CREATE TABLE IF NOT EXISTS review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER DEFAULT 0,
    product_id INTEGER,
    rating INTEGER NOT NULL DEFAULT 0,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(productid)
);

-- Create and populate products table
INSERT INTO product (
    product_id,
    name,
    description,
    price,
    image_url,
    category,
    in_stock
) VALUES 
    (0, 'Macbook Pro', 'High-performance laptop', 2499.99, 'https://images.app.goo.gl/jGPHo3ZEzEbHG8o2A', 'Laptop', true),
    (1, 'Apple iPhone 16', 'The everyday smartphone', 799.99, 'https://images.app.goo.gl/rALgN7NxNDtwYdBH9', 'Mobile', true),
    (2, 'Apple Airpods', 'The next evolution of sound and comfort.', 199.99, 'https://images.app.goo.gl/zMx9rgzQ2svmoUAL7', 'Headphones', true),
    (3, 'Apple iWatch', 'The ultimate device for a healthy life.', 499.99, 'https://images.app.goo.gl/LohrkpRHJsbNk7Uf8', 'Smartwatch', true),
    (4, 'Rayban Sunglasses', 'Add a modern touch to your outfits with these sleek aviator sunglasses.', 99.99, 'https://static/img/products/sunglasses.jpg', 'accessories', true),
    (5, 'Adidas Running Shoes', 'The perfect running shoes for your daily workout.', 129.99, 'https://static/img/products/shoes.jpg', 'shoes', true),
    (6, 'Nike T-shirt', 'Stay comfortable and stylish with this classic Nike t-shirt.', 39.99, 'https://static/img/products/tshirt.jpg', 'clothing', true),
    (7, 'Samsung Galaxy S20', 'Experience the power of 5G with the Samsung Galaxy S20.', 999.99, 'https://static/img/products/s20.jpg', 'mobile', true),
    (8, 'Sony Noise-Cancelling Headphones', 'Enjoy your music without distractions with these noise-cancelling headphones.', 299.99, 'https://static/img/products/headphones.jpg', 'headphones', true),
    (9, 'Dell XPS 13', 'The ultimate laptop for work and play.', 1499.99, 'https://static/img/products/laptop.jpg', 'laptop', true),
    (10, 'Apple iPad Pro', 'The most advanced iPad ever.', 799.99, 'https://static/img/products/ipad.jpg', 'tablet', true),
    (11, 'Dockers Loafers', 'Step out in style with these classic Dockers loafers.', 79.99, 'https://static/img/products/shoes2.jpg', 'shoes', true),
    (12, 'Calvin Klein Jeans', 'Stay on trend with these stylish Calvin Klein jeans.', 59.99, 'https://static/img/products/jeans.jpg', 'clothing', true),
    (13, 'Bose Soundbar 700', 'Experience immersive sound with the Bose Soundbar 700.', 799.99, 'https://static/img/products/soundbar.jpg', 'audio', true),
    (14, 'Samsung 55" QLED TV', 'Enjoy stunning visuals with the Samsung 55" QLED TV.', 1499.99, 'https://static/img/products/tv.jpg', 'tv', true),
    (15, 'Fitbit Versa 2', 'Track your fitness goals with the Fitbit Versa 2.', 199.99, 'https://static/img/products/smartwatch.jpg', 'smartwatch', true),
    (16, 'Amazon Echo Dot', 'Make your home smarter with the Amazon Echo Dot.', 49.99, 'https://static/img/products/smart_home.jpg', 'smart_home', true),
    (17, 'Google Nest Mini', 'Control your home with your voice using the Google Nest Mini.', 39.99, 'https://static/img/products/smart_home2.jpg', 'smart_home', true),
    (18, 'Sony WH-1000XM3 Headphones', 'Experience premium sound quality with the Sony WH-1000XM3 Headphones.', 349.99, 'https://static/img/products/headphones2.jpg', 'headphones', true),
    (19, 'Dyson Hairdryer', 'This lightweight hairdryer has 3 heat and speed settings. It iss perfect for travel.', 499.99, 'https://static/img/products/hairdryer.jpg', 'beauty', true),
    (20, 'Samsung Galaxy Buds', 'Enjoy clear sound with the Samsung Galaxy Buds.', 129.99, 'https://static/img/products/earbuds.jpg', 'headphones', true),
    (21, 'Bose QuietComfort 35 II', 'Experience world-class noise cancellation with the Bose QuietComfort 35 II.', 349.99, 'https://static/img/products/headphones3.jpg', 'headphones', true),
    (22, 'Apple MacBook Air', 'The thinnest and lightest MacBook ever.', 999.99, 'https://static/img/products/laptop2.jpg', 'laptop', true),
    (23, 'Google Pixel 4', 'Capture stunning photos with the Google Pixel 4.', 799.99, 'https://static/img/products/mobile.jpg', 'mobile', true);

-- Create and populate orders table
INSERT INTO "order" (
    order_id,
    customer_email,
    status,
    total_amount
) VALUES 
    (0, 'abc@mail.com', 'PENDING', 2499.99),
    (1, 'def@mail.com', 'CONFIRMED', 999.98),
    (2, 'ghi@mail.com', 'SHIPPED', 499.99),
    (3, 'jkl@mail.com', 'DELIVERED', 279.97),
    (4, 'mno@mail.com', 'PENDING', 189.98),
    (5, 'pqr@mail.com', 'PENDING', 839.98),
    (6, 'stu@mail.com', 'DELIVERED', 2499.98),
    (7, 'vwx@mail.com', 'SHIPPED', 649.98),
    (8, 'yza@mail.com', 'CONFIRMED', 2799.98),
    (9, 'bcd@mail.com', 'PENDING', 1599.98),
    (10, 'efg@mail.com', 'DELIVERED', 329.98),
    (11, 'hij@mail.com', 'SHIPPED', 89.98),
    (12, 'klm@mail.com', 'CONFIRMED', 849.98);

-- Create and populate order items table
INSERT INTO orderitem (
    order_item_id,
    order_id,
    product_id,
    quantity,
    unit_price
) VALUES 
    (0, 0, 0, 1, 2499.99),
    (1, 1, 1, 1, 799.99),
    (2, 1, 2, 1, 199.99),
    (3, 2, 3, 1, 499.99),
    (4, 3, 4, 2, 99.99),
    (5, 3, 11, 1, 79.99),
    (6, 4, 5, 1, 129.99),
    (7, 4, 12, 1, 59.99),
    (8, 5, 6, 1, 39.99),
    (9, 5, 13, 1, 799.99),
    (10, 6, 7, 1, 999.99),
    (11, 6, 14, 1, 1499.99),
    (12, 7, 8, 1, 299.99),
    (13, 7, 18, 1, 349.99),
    (14, 8, 9, 1, 1499.99),
    (15, 8, 22, 1, 999.99),
    (16, 9, 10, 1, 799.99),
    (17, 9, 23, 1, 799.99),
    (18, 10, 15, 1, 199.99),
    (19, 10, 20, 1, 129.99),
    (20, 11, 16, 1, 49.99),
    (21, 11, 17, 1, 39.99),
    (22, 12, 19, 1, 499.99),
    (23, 12, 21, 1, 349.99);

-- Create and populate reviews table
INSERT INTO review (
    review_id,
    product_id,
    rating,
    comment
) VALUES 
    (0, 0, 5, 'Morbi non quam nec dui luctus rutrum. Nulla tellus. In sagittis dui vel nisl.'),
    (1, 0, 4, 'Maecenas tincidunt lacus at velit.'),
    (2, 1, 3, 'Nam nulla. Integer pede justo, lacinia eget, tincidunt eget, tempus vel, pede. Morbi porttitor lorem id ligula. Suspendisse ornare consequat lectus. In est risus, auctor sed, tristique in, tempus sit amet, sem. Fusce consequat. Nulla nisl. Nunc nisl. Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa.'),
    (3, 1, 5, 'Morbi non lectus.'),
    (4, 1, 1, 'Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.'),
    (5, 2, 2, 'Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.'),
    (6, 2, 5, 'Vestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat. In congue. Etiam justo. Etiam pretium iaculis justo. In hac habitasse platea dictumst. Etiam faucibus cursus urna. Ut tellus. Nulla ut erat id mauris vulputate elementum.'),
    (7, 3, 5, 'Morbi a ipsum. Integer a nibh. In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet. Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo.'),
    (8, 4, 5, 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin interdum mauris non ligula pellentesque ultrices. Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl. Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum. Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo.'),
    (9, 4, 4, 'Nulla tempus. Vivamus in felis eu sapien cursus vestibulum. Proin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.'),
    (10, 4, 3, 'Nam tristique tortor eu pede.'),
    (11, 4, 1, 'In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem. Duis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit. Donec diam neque, vestibulum eget, vulputate ut, ultrices vel, augue.'),
    (12, 5, 5, 'Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque. Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla.'),
    (13, 6, 5, 'Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti. Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum.'),
    (14, 6, 3, 'Suspendisse potenti.'),
    (15, 7, 3, 'Integer a nibh. In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet. Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui.'),
    (16, 7, 4, 'Nulla justo. Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor.'),
    (17, 7, 1, 'Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti. Nullam porttitor lacus at turpis.'),
    (18, 8, 2, 'Integer a nibh. In quis justo. Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet. Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam.'),
    (19, 8, 3, 'Pellentesque ultrices mattis odio. Donec vitae nisi. Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.'),
    (20, 8, 4, 'Ut tellus. Nulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.'),
    (21, 8, 5, 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Proin interdum mauris non ligula pellentesque ultrices. Phasellus id sapien in sapien iaculis congue. Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl. Aenean lectus. Pellentesque eget nunc.'),
    (22, 8, 5, 'Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi. Nam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla.'),
    (23, 9, 4, 'Nunc nisl. Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa. Donec dapibus. Duis at velit eu est congue elementum. In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo. Aliquam quis turpis eget elit sodales scelerisque.'),
    (24, 9, 3, 'In sagittis dui vel nisl. Duis ac nibh.'),
    (25, 10, 5, 'Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo. Pellentesque ultrices mattis odio.'),
    (26, 11, 3, 'Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam. Cras pellentesque volutpat dui. Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti.'),
    (27, 12, 4, 'Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque. Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla.'),
    (28, 13, 5, 'Nullam sit amet turpis elementum ligula vehicula consequat. Morbi a ipsum.'),
    (29, 13, 3, 'Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat. In congue. Etiam justo. Etiam pretium iaculis justo.'),
    (30, 13, 5, 'Nulla facilisi.'),
    (31, 14, 5, 'Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl.'),
    (32, 14, 5, 'Nunc rhoncus dui vel sem.'),
    (33, 15, 4, 'Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum. Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est. Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.'),
    (34, 16, 1, 'Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis.'),
    (35, 17, 5, 'Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor. Duis mattis egestas metus. Aenean fermentum. Donec ut mauris eget massa tempor convallis. Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum.'),
    (36, 18, 3, 'Nulla facilisi. Cras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque. Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui.'),
    (37, 19, 5, 'Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum. Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.'),
    (38, 20, 2, 'Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum. Aliquam non mauris. Morbi non lectus.'),
    (39, 21, 1, 'Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl. Aenean lectus.'),
    (40, 22, 5, 'Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.');
