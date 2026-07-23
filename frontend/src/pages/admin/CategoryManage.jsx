import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import categoryApi from '../../api/category.api';
import adminApi from '../../api/admin.api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ImageUploader from '../../components/admin/ImageUploader';

export default function CategoryManage() {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', slug: '', image: '' });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const res = await categoryApi.getAll();
        setCategories(res.data);
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', slug: '', image: '' });
        setShowForm(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setForm({ name: cat.name, slug: cat.slug, image: cat.image || '' });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await adminApi.updateCategory(editing.id, form);
                toast.success('Cập nhật danh mục thành công');
            } else {
                await adminApi.createCategory(form);
                toast.success('Tạo danh mục thành công');
            }
            setShowForm(false);
            loadCategories();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa danh mục này? Sản phẩm thuộc danh mục sẽ về "Chưa phân loại".')) return;
        try {
            await adminApi.deleteCategory(id);
            toast.success('Đã xóa danh mục');
            loadCategories();
        } catch (err) {
            toast.error(err.message || 'Xóa thất bại');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                    <Plus size={18} /> Thêm danh mục
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Tên</th>
                            <th className="p-3">Slug</th>
                            <th className="p-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id} className="border-t">
                                <td className="p-3">{cat.id}</td>
                                <td className="p-3 font-medium">{cat.name}</td>
                                <td className="p-3 text-gray-500">{cat.slug}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => openEdit(cat)} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                        <Pencil size={14} /> Sửa
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline inline-flex items-center gap-1">
                                        <Trash2 size={14} /> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên danh mục</label>
                                <input
                                    type="text" required value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slug (không dấu, không khoảng trắng)</label>
                                <input
                                    type="text" required value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    className="w-full border rounded-md px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ảnh danh mục (tùy chọn)</label>
                                <ImageUploader
                                    value={form.image}
                                    onChange={(url) => setForm({ ...form, image: url })}
                                />
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