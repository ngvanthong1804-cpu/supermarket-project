import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import uploadApi from '../../api/upload.api';

// props: value (url hiện tại), onChange (callback trả về url mới)
export default function ImageUploader({ value, onChange }) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ảnh không được vượt quá 5MB');
            return;
        }

        setUploading(true);
        try {
            const res = await uploadApi.uploadImage(file);
            onChange(res.data.url);
            toast.success('Tải ảnh lên thành công');
        } catch (err) {
            toast.error(err.message || 'Tải ảnh thất bại');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            {value ? (
                <div className="relative w-32 h-32">
                    <img src={value} alt="preview" className="w-full h-full object-cover rounded-md border" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 text-gray-400">
                    {uploading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <Upload size={22} />
                            <span className="text-xs mt-1">Chọn ảnh</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    );
}