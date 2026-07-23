const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');

// Công khai, ai cũng gọi được (kể cả Guest lúc đăng ký)
router.get('/provinces', addressController.getProvinces);
router.get('/wards/:provinceCode', addressController.getWards);

module.exports = router;