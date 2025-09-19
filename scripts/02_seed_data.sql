-- Seed data for Sweet Shop Management System
-- This script populates the database with initial data

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Chocolates', 'Rich and creamy chocolate treats'),
    ('Gummies', 'Chewy and fruity gummy candies'),
    ('Hard Candies', 'Long-lasting hard candies and lollipops'),
    ('Cookies', 'Sweet baked cookies and biscuits'),
    ('Cakes', 'Delicious cakes and pastries')
ON CONFLICT (name) DO NOTHING;

-- Insert sample admin user (password: admin123)
-- Note: In production, this should be properly hashed
INSERT INTO users (email, password_hash, name, is_admin) VALUES
    ('admin@sweetshop.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.G', 'Admin User', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert sample regular user (password: user123)
INSERT INTO users (email, password_hash, name, is_admin) VALUES
    ('user@example.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular User', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Insert sample sweets
INSERT INTO sweets (name, description, category_id, price, quantity, image_url) VALUES
    ('Dark Chocolate Bar', 'Premium 70% dark chocolate bar', 
     (SELECT id FROM categories WHERE name = 'Chocolates'), 4.99, 50, '/images/dark-chocolate.jpg'),
    
    ('Milk Chocolate Truffles', 'Creamy milk chocolate truffles with various fillings', 
     (SELECT id FROM categories WHERE name = 'Chocolates'), 12.99, 30, '/images/truffles.jpg'),
    
    ('Gummy Bears', 'Classic fruity gummy bears in assorted flavors', 
     (SELECT id FROM categories WHERE name = 'Gummies'), 3.49, 100, '/images/gummy-bears.jpg'),
    
    ('Sour Worms', 'Tangy sour gummy worms', 
     (SELECT id FROM categories WHERE name = 'Gummies'), 4.29, 75, '/images/sour-worms.jpg'),
    
    ('Rainbow Lollipops', 'Colorful hard candy lollipops', 
     (SELECT id FROM categories WHERE name = 'Hard Candies'), 1.99, 200, '/images/lollipops.jpg'),
    
    ('Peppermint Drops', 'Refreshing peppermint hard candies', 
     (SELECT id FROM categories WHERE name = 'Hard Candies'), 2.99, 150, '/images/peppermint.jpg'),
    
    ('Chocolate Chip Cookies', 'Homemade chocolate chip cookies', 
     (SELECT id FROM categories WHERE name = 'Cookies'), 6.99, 40, '/images/choc-chip-cookies.jpg'),
    
    ('Oatmeal Cookies', 'Healthy oatmeal cookies with raisins', 
     (SELECT id FROM categories WHERE name = 'Cookies'), 5.99, 35, '/images/oatmeal-cookies.jpg'),
    
    ('Chocolate Cake Slice', 'Rich chocolate cake slice', 
     (SELECT id FROM categories WHERE name = 'Cakes'), 8.99, 20, '/images/chocolate-cake.jpg'),
    
    ('Strawberry Cupcake', 'Fresh strawberry cupcake with cream frosting', 
     (SELECT id FROM categories WHERE name = 'Cakes'), 4.99, 25, '/images/strawberry-cupcake.jpg')
ON CONFLICT DO NOTHING;
