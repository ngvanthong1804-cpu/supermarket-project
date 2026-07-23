const nodemailer = require('nodemailer');

// Dùng Gmail + App Password (không dùng mật khẩu Gmail thường, xem hướng dẫn lấy App Password bên dưới)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

module.exports = transporter;