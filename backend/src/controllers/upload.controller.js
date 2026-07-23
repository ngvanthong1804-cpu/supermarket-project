exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
    }

    // Trả về đường dẫn để lưu vào DB (VD: /uploads/162839...jpg)
    const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

    res.json({
        success: true,
        message: 'Tải ảnh lên thành công',
        data: { url: imageUrl }
    });
};