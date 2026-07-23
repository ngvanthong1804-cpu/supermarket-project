import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import categoryApi from '../../api/category.api';
import adminApi from '../../api/admin.api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';
import ProductGallery from '../../components/admin/ProductGallery';
import productApi from '../../api/product.api';
import Pagination from '../../components/common/Pagination';
import { Percent } from 'lucide-react';

const emptyForm = {
    category_id: '', name: '', slug: '', description: '',
    price: '', discount_price: '', unit: '', stock: '', image: '', status: 1, barcode: '',
};

export default function ProductManage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [galleryImages, setGalleryImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [currentPage]);

    const loadProducts = async () => {
        const res = await productApi.getAll({ page: currentPage, limit: 15 });
        setProducts(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
    };

    const loadCategories = async () => {
        const res = await categoryApi.getAll();
        setCategories(res.data);
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setGalleryImages([]);
        setShowForm(true);
    };

    const openEdit = async (p) => {
        setEditing(p);
        setForm({
            category_id: p.category_id || '', name: p.name, slug: p.slug,
            description: p.description || '', price: p.price, discount_price: p.discount_price || '',
            unit: p.unit || '', stock: p.stock, image: p.image || '', status: p.status, barcode: p.barcode || '',
        });
        setShowForm(true);

        // Tải danh sách ảnh phụ của sản phẩm này
        try {
            const res = await productApi.getById(p.id);
            setGalleryImages(res.data.images || []);
        } catch (err) {
            setGalleryImages([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, discount_price: form.discount_price || null };
            if (editing) {
                await adminApi.updateProduct(editing.id, payload);
                toast.success('Cập nhật sản phẩm thành công');
            } else {
                await adminApi.createProduct(payload);
                toast.success('Tạo sản phẩm thành công');
            }
            setShowForm(false);
            loadProducts();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Ẩn sản phẩm này khỏi cửa hàng?')) return;
        try {
            await adminApi.deleteProduct(id);
            toast.success('Đã ẩn sản phẩm');
            loadProducts();
        } catch (err) {
            toast.error(err.message || 'Xóa thất bại');
        }
    };

    const handleQuickDiscount = async (productId, currentDiscountPrice, price) => {
        const currentPercent = currentDiscountPrice
            ? Math.round((1 - currentDiscountPrice / price) * 100)
            : 0;
        const input = prompt('Nhập phần trăm giảm giá (0-90, để 0 để bỏ giảm giá):', currentPercent);
        if (input === null) return;

        const percent = Number(input);
        if (isNaN(percent) || percent < 0 || percent > 90) {
            toast.error('Vui lòng nhập số từ 0 đến 90');
            return;
        }

        try {
            await productApi.quickDiscount(productId, percent);
            toast.success(percent > 0 ? 'Áp dụng giảm giá thành công' : 'Đã bỏ giảm giá');
            loadProducts();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
                <button onClick={openCreate} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    <Plus size={18} /> Thêm sản phẩm
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                    <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th className="p-3">Ảnh</th>
                            <th className="p-3">Tên</th>
                            <th className="p-3">Danh mục</th>
                            <th className="p-3">Giá</th>
                            <th className="p-3">Tồn kho</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-3">
                                    <img src={p.image || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded object-cover" />
                                </td>
                                <td className="p-3 font-medium">{p.name}</td>
                                <td className="p-3 text-gray-500">{p.category_name || '—'}</td>
                                <td className="p-3">
                                    <div>
                                        <span className={p.discount_price ? 'text-accent font-medium' : ''}>
                                            {Number(p.discount_price || p.price).toLocaleString('vi-VN')}đ
                                        </span>
                                        {p.discount_price && (
                                            <p className="text-xs text-gray-400 line-through">
                                                {Number(p.price).toLocaleString('vi-VN')}đ
                                            </p>
                                        )}
                                        {p.flash_sale_end && (
                                            <p className="text-[10px] text-orange-500 font-medium">⚡ Flash Sale</p>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">{p.stock}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.status ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {p.status ? 'Đang bán' : 'Đã ẩn'}
                                    </span>
                                </td>
                                <td className="p-3 text-right space-x-2 whitespace-nowrap">
                                    <button
                                        onClick={() => handleQuickDiscount(p.id, p.discount_price, p.price)}
                                        className="text-orange-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        <Percent size={14} /> Giảm giá
                                    </button>
                                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                        <Pencil size={14} /> Sửa
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline inline-flex items-center gap-1">
                                        <Trash2 size={14} /> Ẩn
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
                                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Slug</label>
                                    <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Danh mục</label>
                                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border rounded-md px-3 py-2">
                                        <option value="">-- Chọn --</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Đơn vị</label>
                                    <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, chai, hộp..." className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mã vạch (tùy chọn)</label>
                                    <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="VD: 8938512345678" className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giá gốc</label>
                                    <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giá khuyến mãi</label>
                                    <input type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tồn kho</label>
                                    <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Trạng thái</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })} className="w-full border rounded-md px-3 py-2">
                                        <option value={1}>Đang bán</option>
                                        <option value={0}>Ẩn</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Ảnh sản phẩm</label>
                                    <ImageUploader
                                        value={form.image}
                                        onChange={(url) => setForm({ ...form, image: url })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                                    <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Ảnh phụ (gallery)</label>
                                    <ProductGallery
                                        productId={editing?.id}
                                        images={galleryImages}
                                        onChange={setGalleryImages}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                                {editing ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}