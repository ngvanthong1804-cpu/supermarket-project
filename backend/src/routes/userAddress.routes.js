const express = require('express');
const router = express.Router();
const controller = require('../controllers/userAddress.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, controller.getMyAddresses);
router.post('/', verifyToken, controller.createAddress);
router.put('/:id', verifyToken, controller.updateAddress);
router.put('/:id/set-default', verifyToken, controller.setDefaultAddress);
router.delete('/:id', verifyToken, controller.deleteAddress);

module.exports = router;