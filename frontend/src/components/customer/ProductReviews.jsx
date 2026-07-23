import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'react-toastify';
import reviewApi from '../../api/review.api';
import useAuthStore from '../../store/authStore';

export default function ProductReviews({ productId }) {
    const [data, setData] = useState({ reviews: [], avg_rating: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const res = await reviewApi.getByProduct(productId);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await reviewApi.create({ product_id: productId, ...form });
            toast.success('Cảm ơn bạn đã đánh giá!');
            setForm({ rating: 5, comment: '' });
            loadReviews();
        } catch (err) {
            toast.error(err.message || 'Không thể gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-10 border-t pt-6">
            <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold">Đánh giá sản phẩm</h2>
                {data.total > 0 && (
                    <span className="flex items-center gap-1 text-yellow-500 text-sm">
                        <Star size={16} fill="currentColor" /> {data.avg_rating} ({data.total} đánh giá)
                    </span>
                )}
            </div>

            {/* Form đánh giá - chỉ hiện với Customer đã đăng nhập */}
            {user?.role === 'customer' && (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium mb-2">Chọn số sao</p>
                    <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setForm({ ...form, rating: star })}
                            >
                                <Star
                                    size={24}
                                    className={star <= form.rating ? 'text-yellow-400' : 'text-gray-300'}
                                    fill={star <= form.rating ? 'currentColor' : 'none'}
                                />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                        rows={3}
                        className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-green-600 text-white px-5 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                        * Chỉ áp dụng cho khách hàng đã mua và nhận sản phẩm này.
                    </p>
                </form>
            )}

            {!user && (
                <p className="text-sm text-gray-500 mb-6">
                    Vui lòng đăng nhập để đánh giá sản phẩm này.
                </p>
            )}

            {/* Danh sách đánh giá */}
            {loading ? (
                <p className="text-gray-500 text-sm">Đang tải đánh giá...</p>
            ) : data.reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
            ) : (
                <div className="space-y-4">
                    {data.reviews.map((r) => (
                        <div key={r.id} className="border-b pb-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{r.full_name}</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(r.created_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <div className="flex gap-0.5 my-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={14}
                                        className={s <= r.rating ? 'text-yellow-400' : 'text-gray-300'}
                                        fill={s <= r.rating ? 'currentColor' : 'none'}
                                    />
                                ))}
                            </div>
                            {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}