import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import bannerApi from '../../api/banner.api';
import ImageUploader from '../../components/admin/ImageUploader';
import { Plus, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';

export default function BannerManage() {
    const [banners, setBanners] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', image: '', link: '' });

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        const res = await bannerApi.getAll();
        setBanners(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.image) {
            toast.error('Vui lòng tải ảnh banner lên');
            return;
        }
        try {
            await bannerApi.create(form);
            toast.success('Tạo banner thành công');
            setShowForm(false);
            setForm({ title: '', image: '', link: '' });
            loadBanners();
        } catch (err) {
            toast.error(err.message || 'Tạo banner thất bại');
        }
    };

    const handleToggle = async (id) => {
        try {
            await bannerApi.toggleStatus(id);
            loadBanners();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa banner này?')) return;
        try {
            await bannerApi.delete(id);
            toast.success('Đã xóa banner');
            loadBanners();
        } catch (err) {
            toast.error(err.message || 'Xóa thất bại');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý banner trang chủ</h1>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    <Plus size={18} /> Thêm banner
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {banners.map((b) => (
                    <div key={b.id} className="bg-white rounded-lg shadow overflow-hidden">
                        <img src={b.image} alt={b.title} className="w-full h-32 object-cover" />
                        <div className="p-3">
                            <p className="font-medium text-sm truncate">{b.title || '(Không có tiêu đề)'}</p>
                            {b.link && <p className="text-xs text-gray-400 truncate">{b.link}</p>}
                            <div className="flex justify-between items-center mt-3">
                                <button onClick={() => handleToggle(b.id)} className="flex items-center gap-1 text-sm">
                                    {b.status ? (
                                        <><ToggleRight className="text-green-600" size={20} /> <span className="text-green-600">Hiện</span></>
                                    ) : (
                                        <><ToggleLeft className="text-gray-400" size={20} /> <span className="text-gray-400">Ẩn</span></>
                                    )}
                                </button>
                                <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline text-sm flex items-center gap-1">
                                    <Trash2 size={14} /> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {banners.length === 0 && (
                <p className="text-gray-500 text-center py-10">Chưa có banner nào.</p>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">Thêm banner</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ảnh banner (khuyến nghị tỉ lệ ngang, VD 1200x400)</label>
                                <ImageUploader value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tiêu đề (tùy chọn)</label>
                                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Link khi bấm vào (tùy chọn)</label>
                                <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/products/1 hoặc để trống" className="w-full border rounded-md px-3 py-2" />
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                                Tạo banner
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}