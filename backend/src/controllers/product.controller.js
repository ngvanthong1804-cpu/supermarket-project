const db = require('../config/db');

// Tự động khôi phục giá cho các sản phẩm đã hết hạn Flash Sale (gọi trước mỗi lần đọc danh sách/chi tiết sản phẩm)
async function revertExpiredFlashSales() {
    await db.query(
        `UPDATE products 
         SET discount_price = pre_flash_discount_price, flash_sale_end = NULL, pre_flash_discount_price = NULL
         WHERE flash_sale_end IS NOT NULL AND flash_sale_end <= NOW()`
    );
}

// Lấy tất cả sản phẩm (có phân trang + tìm kiếm + lọc theo danh mục)
exports.getAllProducts = async (req, res) => {
    try {
        await revertExpiredFlashSales();
        const {
            page = 1, limit = 12, keyword = '', category_id,
            min_price, max_price, sort = 'newest',
        } = req.query;
        const offset = (page - 1) * limit;

        // Dùng COALESCE để lọc/sắp xếp theo giá thực tế đang bán (ưu tiên giá khuyến mãi nếu có)
        let query = `
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 1 AND p.name LIKE ?
        `;
        const params = [`%${keyword}%`];

        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(category_id);
        }
        if (min_price) {
            query += ' AND COALESCE(p.discount_price, p.price) >= ?';
            params.push(Number(min_price));
        }
        if (max_price) {
            query += ' AND COALESCE(p.discount_price, p.price) <= ?';
            params.push(Number(max_price));
        }

        const sortMap = {
            newest: 'p.created_at DESC',
            price_asc: 'COALESCE(p.discount_price, p.price) ASC',
            price_desc: 'COALESCE(p.discount_price, p.price) DESC',
            name_asc: 'p.name ASC',
            best_selling: '(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.product_id = p.id) DESC',
        };
        query += ` ORDER BY ${sortMap[sort] || sortMap.newest} LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        // Đếm tổng số sản phẩm (phục vụ phân trang) — dùng cùng điều kiện lọc
        let countQuery = 'SELECT COUNT(*) AS total FROM products p WHERE p.status = 1 AND p.name LIKE ?';
        const countParams = [`%${keyword}%`];
        if (category_id) {
            countQuery += ' AND p.category_id = ?';
            countParams.push(category_id);
        }
        if (min_price) {
            countQuery += ' AND COALESCE(p.discount_price, p.price) >= ?';
            countParams.push(Number(min_price));
        }
        if (max_price) {
            countQuery += ' AND COALESCE(p.discount_price, p.price) <= ?';
            countParams.push(Number(max_price));
        }
        const [countRows] = await db.query(countQuery, countParams);

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: countRows[0].total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(countRows[0].total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Lấy chi tiết 1 sản phẩm
exports.getProductById = async (req, res) => {
    try {
        await revertExpiredFlashSales();
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT p.*, c.name AS category_name 
             FROM products p LEFT JOIN categories c ON p.category_id = c.id 
             WHERE p.id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        // Lấy ảnh phụ (kèm id để Admin xóa từng ảnh)
        const [images] = await db.query(
            'SELECT id, image_url FROM product_images WHERE product_id = ? ORDER BY id ASC',
            [id]
        );

        res.json({ success: true, data: { ...rows[0], images } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Thêm 1 ảnh phụ cho sản phẩm (Admin/Staff)
exports.addProductImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { image_url } = req.body;

        if (!image_url) {
            return res.status(400).json({ success: false, message: 'Thiếu image_url' });
        }

        const [product] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
        if (product.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        const [result] = await db.query(
            'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
            [id, image_url]
        );

        res.status(201).json({ success: true, message: 'Thêm ảnh thành công', data: { id: result.insertId, image_url } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Xóa 1 ảnh phụ (Admin/Staff)
exports.deleteProductImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const [result] = await db.query('DELETE FROM product_images WHERE id = ?', [imageId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' });
        }
        res.json({ success: true, message: 'Đã xóa ảnh' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tạo sản phẩm (Admin)
exports.createProduct = async (req, res) => {
    try {
        const { category_id, name, slug, description, price, discount_price, unit, stock, image, barcode } = req.body;

        if (!name || !slug || !price) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        const [result] = await db.query(
            `INSERT INTO products 
            (category_id, name, slug, description, price, discount_price, unit, stock, image, barcode) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, name, slug, description, price, discount_price || null, unit, stock || 0, image, barcode || null]
        );

        res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: { id: result.insertId } });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Mã vạch đã tồn tại cho sản phẩm khác' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// Cập nhật sản phẩm (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, slug, description, price, discount_price, unit, stock, image, status, barcode } = req.body;

        const [result] = await db.query(
            `UPDATE products SET 
                category_id=?, name=?, slug=?, description=?, price=?, 
                discount_price=?, unit=?, stock=?, image=?, status=?, barcode=?
             WHERE id=?`,
            [category_id, name, slug, description, price, discount_price, unit, stock, image, status, barcode || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Mã vạch đã tồn tại cho sản phẩm khác' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// Xóa sản phẩm (Admin) — xóa mềm bằng cách set status = 0
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('UPDATE products SET status = 0 WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// Tìm sản phẩm theo mã vạch (dùng cho quét mã tại quầy POS)
exports.getProductByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;
        const [rows] = await db.query(
            'SELECT * FROM products WHERE barcode = ? AND status = 1',
            [barcode]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm với mã vạch này' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

function buildBarcodeForProduct(id) {
    return `200${String(id).padStart(9, '0')}`;
}

exports.generateBarcode = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT id, barcode FROM products WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        if (rows[0].barcode) {
            return res.json({ success: true, message: 'Sản phẩm đã có mã vạch', data: { barcode: rows[0].barcode } });
        }
        const barcode = buildBarcodeForProduct(id);
        await db.query('UPDATE products SET barcode = ? WHERE id = ?', [barcode, id]);
        res.json({ success: true, message: 'Đã tạo mã vạch', data: { barcode } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.generateBarcodesForAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id FROM products WHERE barcode IS NULL OR barcode = ""');
        for (const row of rows) {
            const barcode = buildBarcodeForProduct(row.id);
            await db.query('UPDATE products SET barcode = ? WHERE id = ?', [barcode, row.id]);
        }
        res.json({ success: true, message: `Đã tạo mã vạch cho ${rows.length} sản phẩm` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Giảm giá nhanh 1 sản phẩm (không giới hạn thời gian, áp dụng ngay trong danh sách quản lý)
exports.quickDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { discount_percent } = req.body;

        if (discount_percent == null || discount_percent < 0 || discount_percent > 90) {
            return res.status(400).json({ success: false, message: 'Phần trăm giảm giá phải từ 0-90' });
        }

        const [rows] = await db.query('SELECT price FROM products WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        const newDiscountPrice = discount_percent > 0
            ? Math.round(rows[0].price * (1 - discount_percent / 100))
            : null;

        await db.query(
            'UPDATE products SET discount_price = ?, flash_sale_end = NULL, pre_flash_discount_price = NULL WHERE id = ?',
            [newDiscountPrice, id]
        );

        res.json({ success: true, message: discount_percent > 0 ? 'Áp dụng giảm giá thành công' : 'Đã bỏ giảm giá' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Tạo Flash Sale cho nhiều sản phẩm cùng lúc (Admin)
exports.createFlashSale = async (req, res) => {
    try {
        const { product_ids, discount_percent, end_time } = req.body;

        if (!product_ids || product_ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 sản phẩm' });
        }
        if (!discount_percent || discount_percent <= 0 || discount_percent > 90) {
            return res.status(400).json({ success: false, message: 'Phần trăm giảm giá phải từ 1-90' });
        }
        if (!end_time || new Date(end_time) <= new Date()) {
            return res.status(400).json({ success: false, message: 'Thời gian kết thúc phải ở tương lai' });
        }

        for (const productId of product_ids) {
            const [rows] = await db.query('SELECT price, discount_price, flash_sale_end FROM products WHERE id = ?', [productId]);
            if (rows.length === 0) continue;
            const product = rows[0];

            const newDiscountPrice = Math.round(product.price * (1 - discount_percent / 100));

            // Chỉ lưu giá trước Flash Sale nếu sản phẩm CHƯA đang trong 1 Flash Sale khác (tránh ghi đè giá gốc thật)
            const preFlashPrice = product.flash_sale_end ? undefined : product.discount_price;

            if (preFlashPrice === undefined) {
                await db.query(
                    'UPDATE products SET discount_price = ?, flash_sale_end = ? WHERE id = ?',
                    [newDiscountPrice, end_time, productId]
                );
            } else {
                await db.query(
                    'UPDATE products SET discount_price = ?, flash_sale_end = ?, pre_flash_discount_price = ? WHERE id = ?',
                    [newDiscountPrice, end_time, preFlashPrice, productId]
                );
            }
        }

        res.status(201).json({ success: true, message: `Đã áp dụng Flash Sale cho ${product_ids.length} sản phẩm` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Lấy danh sách sản phẩm đang trong Flash Sale
exports.getFlashSaleProducts = async (req, res) => {
    try {
        await revertExpiredFlashSales();
        const [rows] = await db.query(
            `SELECT id, name, image, price, discount_price, flash_sale_end 
             FROM products WHERE flash_sale_end IS NOT NULL ORDER BY flash_sale_end ASC`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Kết thúc sớm Flash Sale cho 1 sản phẩm (Admin)
exports.endFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            `UPDATE products 
             SET discount_price = pre_flash_discount_price, flash_sale_end = NULL, pre_flash_discount_price = NULL
             WHERE id = ?`,
            [id]
        );
        res.json({ success: true, message: 'Đã kết thúc Flash Sale cho sản phẩm này' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};