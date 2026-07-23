import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

// Combobox tìm kiếm dùng chung cho Tỉnh/Phường-Xã
function SearchSelect({ label, placeholder, options, value, onSelect, disabled }) {
    const [open, setOpen] = useState(false);
    const [keyword, setKeyword] = useState('');
    const wrapRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = options.filter((o) =>
        o.name.toLowerCase().includes(keyword.toLowerCase())
    );

    const selectedName = options.find((o) => String(o.code) === String(value))?.name || '';

    return (
        <div className="relative" ref={wrapRef}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className={`w-full border rounded-md px-3 py-2 text-left flex items-center justify-between text-sm ${
                    disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:border-green-500'
                }`}
            >
                <span className={selectedName ? 'text-gray-800' : 'text-gray-400'}>
                    {selectedName || placeholder}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
            </button>

            {open && !disabled && (
                <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                    <div className="p-2 border-b flex items-center gap-2">
                        <Search size={14} className="text-gray-400" />
                        <input
                            autoFocus
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="flex-1 text-sm outline-none"
                        />
                        {keyword && (
                            <button type="button" onClick={() => setKeyword('')}>
                                <X size={14} className="text-gray-400" />
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="text-sm text-gray-400 p-3 text-center">Không tìm thấy kết quả</p>
                        ) : (
                            filtered.map((o) => (
                                <button
                                    type="button"
                                    key={o.code}
                                    onClick={() => {
                                        onSelect(o);
                                        setKeyword('');
                                        setOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 ${
                                        String(o.code) === String(value) ? 'bg-green-100 font-medium' : ''
                                    }`}
                                >
                                    {o.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * props:
 * - value: { province, ward, detail } (province/ward là object {code, name} hoặc null)
 * - onChange: (newValue) => void
 *
 * Lưu ý: chỉ còn 2 cấp Tỉnh/Thành phố -> Phường/Xã, đúng theo cơ cấu hành chính
 * Việt Nam hiện hành (đã bỏ cấp Quận/Huyện từ giữa 2025).
 */
export default function AddressSelector({ value, onChange }) {
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);

    const addr = value || { province: null, ward: null, detail: '' };

    // Tải danh sách tỉnh/thành khi mount — lấy từ DB nội bộ, không cần mạng ngoài
    useEffect(() => {
        axiosClient.get('/address/provinces')
            .then((res) => setProvinces(res.data))
            .catch((err) => {
                console.error(err);
                setProvinces([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Tải phường/xã khi chọn tỉnh — lấy từ DB nội bộ
    useEffect(() => {
        const provinceCode = addr.province?.code;
        if (!provinceCode) {
            setWards([]);
            return;
        }
        let ignore = false;
        setWards([]);

        axiosClient.get(`/address/wards/${provinceCode}`)
            .then((res) => {
                if (!ignore) setWards(res.data);
            })
            .catch((err) => {
                if (!ignore) {
                    console.error(err);
                    setWards([]);
                }
            });

        return () => { ignore = true; };
    }, [addr.province?.code]);

    const handleSelectProvince = (o) => {
        onChange({ province: { code: o.code, name: o.name }, ward: null, detail: addr.detail });
    };
    const handleSelectWard = (o) => {
        onChange({ ...addr, ward: { code: o.code, name: o.name } });
    };
    const handleDetailChange = (e) => {
        onChange({ ...addr, detail: e.target.value });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium mb-1">Số nhà, tên đường</label>
                <input
                    value={addr.detail}
                    onChange={handleDetailChange}
                    placeholder="Ví dụ: 123 Nguyễn Trãi"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchSelect
                    label="Tỉnh / Thành phố"
                    placeholder={loading ? 'Đang tải...' : '-- Chọn tỉnh/thành --'}
                    options={provinces}
                    value={addr.province?.code}
                    onSelect={handleSelectProvince}
                    disabled={loading}
                />
                <SearchSelect
                    label="Phường / Xã"
                    placeholder="-- Chọn phường/xã --"
                    options={wards}
                    value={addr.ward?.code}
                    onSelect={handleSelectWard}
                    disabled={!addr.province}
                />
            </div>
        </div>
    );
}