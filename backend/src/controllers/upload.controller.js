exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
    }

    // Cloudinary trả sẵn URL đầy đủ trong req.file.path
    const imageUrl = req.file.path;

    res.json({
        success: true,
        message: 'Tải ảnh lên thành công',
        data: { url: imageUrl }
    });
};