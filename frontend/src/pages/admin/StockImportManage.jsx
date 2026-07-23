import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import stockImportApi from '../../api/stockImport.api';
import supplierApi from '../../api/supplier.api';
import productApi from '../../api/product.api';
import { Plus, X, Trash2 } from 'lucide-react';

export default function StockImportManage() {
    const [imports, setImports] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [supplierId, setSupplierId] = useState('');
    const [note, setNote] = useState('');
    const [items, setItems] = useState([{ product_id: '', quantity: 1, import_price: 0 }]);

    useEffect(() => {
        loadImports();
        loadSuppliers();
        loadProducts();
    }, []);

    const loadImports = async () => {
        const res = await stockImportApi.getAll();
        setImports(res.data);
    };
    const loadSuppliers = async () => {
        const res = await supplierApi.getAll();
        setSuppliers(res.data);
    };
    const loadProducts = async () => {
        const res = await productApi.getAll({ limit: 200 });
        setProducts(res.data);
    };

    const addItemRow = () => setItems([...items, { product_id: '', quantity: 1, import_price: 0 }]);
    const removeItemRow = (index) => setItems(items.filter((_, i) => i !== index));
    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = items.filter((i) => i.product_id && i.quantity > 0);
        if (validItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 sản phẩm hợp lệ');
            return;
        }
        try {
            await stockImportApi.create({ supplier_id: supplierId || null, note, items: validItems });
            toast.success('Nhập kho thành công, tồn kho đã được cập nhật');
            setShowForm(false);
            setSupplierId('');
            setNote('');
            setItems([{ product_id: '', quantity: 1, import_price: 0 }]);
            loadImports();
        } catch (err) {
            toast.error(err.message || 'Nhập kho thất bại');
        }
    };

    const totalAmount = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.import_price || 0), 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Nhập kho</h1>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    <Plus size={18} /> Tạo phiếu nhập
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                    <thead className="bg-gray-50 text-left text-gray-600">
                        <tr>
                            <th className="p-3">Mã phiếu</th>
                            <th className="p-3">Nhà cung cấp</th>
                            <th className="p-3">Người nhập</th>
                            <th className="p-3">Tổng tiền</th>
                            <th className="p-3">Ngày nhập</th>
                        </tr>
                    </thead>
                    <tbody>
                        {imports.map((imp) => (
                            <tr key={imp.id} className="border-t">
                                <td className="p-3 font-medium">#{imp.id}</td>
                                <td className="p-3">{imp.supplier_name || '—'}</td>
                                <td className="p-3">{imp.staff_name}</td>
                                <td className="p-3">{Number(imp.total_amount).toLocaleString('vi-VN')}đ</td>
                                <td className="p-3 text-gray-500">{new Date(imp.created_at).toLocaleDateString('vi-VN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">Tạo phiếu nhập kho</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nhà cung cấp</label>
                                    <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full border rounded-md px-3 py-2">
                                        <option value="">-- Không chọn --</option>
                                        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ghi chú</label>
                                    <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium">Danh sách sản phẩm nhập</label>
                                    <button type="button" onClick={addItemRow} className="text-green-600 text-sm hover:underline flex items-center gap-1">
                                        <Plus size={14} /> Thêm dòng
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                className="flex-1 border rounded-md px-2 py-1.5 text-sm"
                                            >
                                                <option value="">-- Chọn sản phẩm --</option>
                                                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <input
                                                type="number" min="1" placeholder="SL"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                className="w-20 border rounded-md px-2 py-1.5 text-sm"
                                            />
                                            <input
                                                type="number" min="0" placeholder="Giá nhập"
                                                value={item.import_price}
                                                onChange={(e) => updateItem(index, 'import_price', Number(e.target.value))}
                                                className="w-28 border rounded-md px-2 py-1.5 text-sm"
                                            />
                                            <button type="button" onClick={() => removeItemRow(index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between font-bold border-t pt-3">
                                <span>Tổng tiền nhập</span>
                                <span className="text-green-600">{Number(totalAmount).toLocaleString('vi-VN')}đ</span>
                            </div>

                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
                                Xác nhận nhập kho
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}