const express = require('express');
const router = express.Router();
const controller = require('../controllers/faceAttendance.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

router.use(verifyToken, checkRole('admin'));

router.get('/employees', controller.getEmployeesWithFaceStatus);
router.post('/register', controller.registerFace);
router.delete('/register/:userId', controller.deleteFace);
router.post('/checkin', controller.checkIn);
router.get('/history', controller.getAttendanceHistory);

module.exports = router;