import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import userAddressApi from '../../api/userAddress.api';
import AddressSelector from '../common/AddressSelector';
import { emptyAddress } from '../../utils/address';
import { Plus, Pencil, Trash2, X, CheckCircle } from 'lucide-react';

export default function AddressBook() {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [receiverName, setReceiverName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState(emptyAddress);
    const [isDefault, setIsDefault] = useState(false);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        const res = await userAddressApi.getAll();
        setAddresses(res.data);
    };

    const openCreate = () => {
        setEditing(null);
        setReceiverName('');
        setPhone('');
        setAddress(emptyAddress);
        setIsDefault(addresses.length === 0);
        setShowForm(true);
    };

    const openEdit = (a) => {
        setEditing(a);
        setReceiverName(a.receiver_name);
        setPhone(a.phone);
        setAddress({
            province: { code: a.province_code, name: a.province_name },
            ward: { code: a.ward_code, name: a.ward_name },
            detail: a.address_detail,
        });
        setIsDefault(!!a.is_default);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!address.province || !address.ward || !address.detail.trim()) {
            toast.error('Vui lòng chọn đầy đủ địa chỉ');
            return;
        }

        const payload = {
            receiver_name: receiverName,
            phone,
            address_detail: address.detail,
            province_code: address.province.code,
            province_name: address.province.name,
            ward_code: address.ward.code,
            ward_name: address.ward.name,
            is_default: isDefault,
        };

        try {
            if (editing) {
                await userAddressApi.update(editing.id, payload);
                toast.success('Cập nhật địa chỉ thành công');
            } else {
                await userAddressApi.create(payload);
                toast.success('Thêm địa chỉ thành công');
            }
            setShowForm(false);
            loadAddresses();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await userAddressApi.setDefault(id);
            loadAddresses();
        } catch (err) {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa địa chỉ này?')) return;
        try {
            await userAddressApi.delete(id);
            toast.success('Đã xóa địa chỉ');
            loadAddresses();
        } catch (err) {
            toast.error(err.message || 'Xóa thất bại');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">Sổ địa chỉ</h2>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700"
                >
                    <Plus size={14} /> Thêm địa chỉ
                </button>
            </div>

            {addresses.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Bạn chưa có địa chỉ nào.</p>
            ) : (
                <div className="space-y-3">
                    {addresses.map((a) => (
                        <div key={a.id} className="border rounded-lg p-3 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{a.receiver_name}</p>
                                    <span className="text-gray-400 text-sm">|</span>
                                    <p className="text-sm text-gray-500">{a.phone}</p>
                                    {a.is_default === 1 && (
                                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            <CheckCircle size={12} /> Mặc định
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {a.address_detail}, {a.ward_name}, {a.province_name}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(a)} className="text-blue-600 text-xs hover:underline flex items-center gap-0.5">
                                        <Pencil size={12} /> Sửa
                                    </button>
                                    <button onClick={() => handleDelete(a.id)} className="text-red-600 text-xs hover:underline flex items-center gap-0.5">
                                        <Trash2 size={12} /> Xóa
                                    </button>
                                </div>
                                {!a.is_default && (
                                    <button onClick={() => handleSetDefault(a.id)} className="text-xs text-gray-500 hover:underline">
                                        Đặt làm mặc định
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên người nhận</label>
                                <input
                                    value={receiverName}
                                    onChange={(e) => setReceiverName(e.target.value)}
                                    required
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                />
                            </div>

                            <AddressSelector value={address} onChange={setAddress} />

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                Đặt làm địa chỉ mặc định
                            </label>

                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                                {editing ? 'Cập nhật' : 'Thêm địa chỉ'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}