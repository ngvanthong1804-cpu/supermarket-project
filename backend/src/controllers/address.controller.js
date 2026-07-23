const db = require('../config/db');

exports.getProvinces = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT code, name FROM provinces ORDER BY name');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getWards = async (req, res) => {
    try {
        const { provinceCode } = req.params;
        const [rows] = await db.query(
            'SELECT code, name FROM wards WHERE province_code = ? ORDER BY name',
            [provinceCode]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};