import { useState } from 'react';
import { toast } from 'react-toastify';
import { X, Plus, Loader2 } from 'lucide-react';
import uploadApi from '../../api/upload.api';
import productApi from '../../api/product.api';

// props: productId, images (mảng {id, image_url}), onChange (callback khi danh sách ảnh thay đổi)
export default function ProductGallery({ productId, images, onChange }) {
    const [uploading, setUploading] = useState(false);

    const handleAddImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const uploadRes = await uploadApi.uploadImage(file);
            const addRes = await productApi.addImage(productId, uploadRes.data.url);
            onChange([...images, { id: addRes.data.id, image_url: uploadRes.data.url }]);
            toast.success('Đã thêm ảnh');
        } catch (err) {
            toast.error(err.message || 'Thêm ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (imageId) => {
        try {
            await productApi.deleteImage(imageId);
            onChange(images.filter((img) => img.id !== imageId));
            toast.success('Đã xóa ảnh');
        } catch (err) {
            toast.error(err.message || 'Xóa ảnh thất bại');
        }
    };

    if (!productId) {
        return (
            <p className="text-xs text-gray-400 italic">
                Lưu sản phẩm trước, sau đó có thể quay lại sửa để thêm ảnh phụ.
            </p>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {images.map((img) => (
                <div key={img.id} className="relative w-20 h-20">
                    <img src={img.image_url} alt="" className="w-full h-full object-cover rounded-md border" />
                    <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}

            <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 text-gray-400">
                {uploading ? (
                    <Loader2 className="animate-spin" size={18} />
                ) : (
                    <Plus size={18} />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAddImage} disabled={uploading} />
            </label>
        </div>
    );
}