const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API Supermarket Shop đang chạy!' });
});

app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/vouchers', require('./routes/voucher.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/stock-imports', require('./routes/stockImport.routes'));
app.use('/api/address', require('./routes/address.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/banners', require('./routes/banner.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/pos', require('./routes/pos.routes'));
app.use('/api/my-addresses', require('./routes/userAddress.routes'));

module.exports = app;