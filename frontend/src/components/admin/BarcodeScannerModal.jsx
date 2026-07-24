import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

const SCANNER_ELEMENT_ID = 'barcode-scanner-region';

export default function BarcodeScannerModal({ onScan, onClose }) {
    const scannerRef = useRef(null);
    const hasScannedRef = useRef(false);

    useEffect(() => {
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        scanner
            .start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 150 } },
                (decodedText) => {
                    if (hasScannedRef.current) return;
                    hasScannedRef.current = true;
                    onScan(decodedText);
                },
                () => {}
            )
            .catch(() => {
                onClose();
            });

        return () => {
            scannerRef.current
                ?.stop()
                .then(() => scannerRef.current?.clear())
                .catch(() => {});
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Quét mã vạch / QR sản phẩm</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={20} />
                    </button>
                </div>
                <div id={SCANNER_ELEMENT_ID} className="rounded-lg overflow-hidden" />
                <p className="text-xs text-gray-500 mt-3 text-center">
                    Đưa mã vạch/QR của sản phẩm vào giữa khung hình
                </p>
            </div>
        </div>
    );
}