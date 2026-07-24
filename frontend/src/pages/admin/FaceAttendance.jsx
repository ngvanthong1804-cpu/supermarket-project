import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Camera, UserRound, History } from 'lucide-react';
import faceAttendanceApi from '../../api/faceAttendance.api';
import { loadFaceModels, detectFaceDescriptor } from '../../utils/faceApiLoader';

const SCAN_INTERVAL_MS = 2000;

export default function FaceAttendance() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scanTimerRef = useRef(null);
    const scanningRef = useRef(false);

    const [modelsReady, setModelsReady] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadHistory();
        loadFaceModels()
            .then(() => setModelsReady(true))
            .catch(() => toast.error('Không tải được model nhận diện khuôn mặt'));

        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadHistory = async () => {
        try {
            const res = await faceAttendanceApi.getHistory();
            setHistory(res.data);
        } catch (err) {
            toast.error(err.message || 'Không tải được lịch sử điểm danh');
        }
    };

    const runScan = useCallback(async () => {
        if (scanningRef.current || !videoRef.current) return;
        scanningRef.current = true;
        try {
            const descriptor = await detectFaceDescriptor(videoRef.current);
            if (descriptor) {
                const res = await faceAttendanceApi.checkIn(descriptor);
                setLastResult({ ...res.data, message: res.message, duplicate: res.duplicate, success: res.success });
                if (res.success && !res.duplicate) {
                    toast.success(res.message);
                    loadHistory();
                }
            }
        } catch (err) {
            if (err?.message) {
                setLastResult({ success: false, message: err.message });
            }
        } finally {
            scanningRef.current = false;
        }
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraOn(true);
            scanTimerRef.current = setInterval(runScan, SCAN_INTERVAL_MS);
        } catch (err) {
            toast.error('Không mở được camera. Kiểm tra quyền truy cập camera của trình duyệt.');
        }
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
        setCameraOn(false);
        setLastResult(null);
    };

    const formatTime = (t) => new Date(t).toLocaleString('vi-VN');

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-1">Điểm danh khuôn mặt</h1>
            <p className="text-gray-500 mb-6">
                Bật camera, nhân viên đứng trước camera để tự động điểm danh (quét mỗi {SCAN_INTERVAL_MS / 1000}s).
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover ${cameraOn ? '' : 'hidden'}`}
                        />
                        {!cameraOn && (
                            <div className="text-gray-400 flex flex-col items-center gap-2">
                                <Camera size={40} />
                                <span>Camera chưa bật</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={cameraOn ? stopCamera : startCamera}
                        disabled={!modelsReady}
                        className={`w-full mt-4 rounded-lg py-2 font-medium text-white ${
                            cameraOn ? 'bg-red-500' : 'bg-green-600 disabled:bg-gray-300'
                        }`}
                    >
                        {!modelsReady ? 'Đang tải model...' : cameraOn ? 'Tắt camera' : 'Bật camera & bắt đầu điểm danh'}
                    </button>

                    {lastResult && (
                        <div
                            className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${
                                lastResult.success
                                    ? lastResult.duplicate
                                        ? 'bg-yellow-50 text-yellow-700'
                                        : 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-600'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                                {lastResult.avatar ? (
                                    <img src={lastResult.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserRound size={20} />
                                )}
                            </div>
                            <span className="text-sm">{lastResult.message}</span>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <History size={18} /> Lịch sử điểm danh gần đây
                    </h2>
                    <div className="max-h-[420px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500 border-b">
                                <tr>
                                    <th className="py-2">Nhân viên</th>
                                    <th className="py-2">Vai trò</th>
                                    <th className="py-2">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h) => (
                                    <tr key={h.id} className="border-b last:border-0">
                                        <td className="py-2 font-medium">{h.full_name}</td>
                                        <td className="py-2 text-gray-500">
                                            {h.role === 'admin' ? 'Admin' : 'Nhân viên'}
                                        </td>
                                        <td className="py-2 text-gray-500">{formatTime(h.check_in_time)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {history.length === 0 && (
                            <p className="text-gray-400 text-center py-6">Chưa có lượt điểm danh nào</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}