const express = require('express');
const router = express.Router();
const controller = require('../controllers/userAddress.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, checkRole('customer'), controller.getMyAddresses);
router.post('/', verifyToken, checkRole('customer'), controller.createAddress);
router.put('/:id', verifyToken, checkRole('customer'), controller.updateAddress);
router.put('/:id/set-default', verifyToken, checkRole('customer'), controller.setDefaultAddress);
router.delete('/:id', verifyToken, checkRole('customer'), controller.deleteAddress);

module.exports = router;