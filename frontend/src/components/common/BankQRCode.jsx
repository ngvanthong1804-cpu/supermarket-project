// props: amount (số tiền), orderInfo (nội dung chuyển khoản, VD "Thanh toan don hang 12")
export default function BankQRCode({ amount, orderInfo }) {
    const bankId = import.meta.env.VITE_BANK_ID;
    const accountNo = import.meta.env.VITE_BANK_ACCOUNT;
    const accountName = import.meta.env.VITE_BANK_ACCOUNT_NAME;

    if (!bankId || !accountNo) {
        return (
            <p className="text-xs text-red-500">
                Chưa cấu hình thông tin ngân hàng để tạo mã QR.
            </p>
        );
    }

    // VietQR API: tự sinh ảnh QR kèm đúng số tiền + nội dung chuyển khoản
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(orderInfo)}&accountName=${encodeURIComponent(accountName)}`;

    return (
        <div className="flex flex-col items-center border rounded-lg p-4 bg-gray-50">
            <img src={qrUrl} alt="QR chuyển khoản" className="w-48 h-48 object-contain" />
            <p className="text-sm font-medium mt-2">{accountName}</p>
            <p className="text-xs text-gray-500">STK: {accountNo}</p>
            <p className="text-sm font-bold text-green-600 mt-1">
                {Number(amount).toLocaleString('vi-VN')}đ
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center">
                Quét mã bằng app ngân hàng để chuyển khoản đúng số tiền và nội dung
            </p>
        </div>
    );
}