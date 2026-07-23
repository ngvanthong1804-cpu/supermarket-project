const db = require('../config/db');

// Lấy danh sách phiếu nhập
exports.getAllImports = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT si.*, s.name AS supplier_name, u.full_name AS staff_name
             FROM stock_imports si
             LEFT JOIN suppliers s ON si.supplier_id = s.id
             JOIN users u ON si.staff_id = u.id
             ORDER BY si.created_at DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Chi tiết 1 phiếu nhập
exports.getImportById = async (req, res) => {
    try {
        const { id } = req.params;
        const [imports] = await db.query(
            `SELECT si.*, s.name AS supplier_name, u.full_name AS staff_name
             FROM stock_imports si
             LEFT JOIN suppliers s ON si.supplier_id = s.id
             JOIN users u ON si.staff_id = u.id
             WHERE si.id = ?`,
            [id]
        );
        if (imports.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập' });
        }
        const [items] = await db.query(
            `SELECT sii.*, p.name AS product_name, p.unit
             FROM stock_import_items sii
             JOIN products p ON sii.product_id = p.id
             WHERE sii.stock_import_id = ?`,
            [id]
        );
        res.json({ success: true, data: { ...imports[0], items } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tạo phiếu nhập kho — tự động CỘNG tồn kho sản phẩm (Admin/Staff)
exports.createImport = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const staffId = req.user.id;
        const { supplier_id, note, items } = req.body;
        // items: [{ product_id, quantity, import_price }, ...]

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Phiếu nhập phải có ít nhất 1 sản phẩm' });
        }

        await connection.beginTransaction();

        const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.import_price, 0);

        const [importResult] = await connection.query(
            'INSERT INTO stock_imports (supplier_id, staff_id, total_amount, note) VALUES (?, ?, ?, ?)',
            [supplier_id || null, staffId, totalAmount, note || null]
        );
        const importId = importResult.insertId;

        for (const item of items) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Dữ liệu sản phẩm trong phiếu nhập không hợp lệ' });
            }

            await connection.query(
                `INSERT INTO stock_import_items (stock_import_id, product_id, quantity, import_price)
                 VALUES (?, ?, ?, ?)`,
                [importId, item.product_id, item.quantity, item.import_price || 0]
            );

            // Cộng tồn kho sản phẩm
            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Nhập kho thành công', data: { id: importId } });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};