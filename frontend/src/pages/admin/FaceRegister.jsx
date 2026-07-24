import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Camera, CheckCircle2, Trash2, UserRound } from 'lucide-react';
import faceAttendanceApi from '../../api/faceAttendance.api';
import { loadFaceModels, detectFaceDescriptor } from '../../utils/faceApiLoader';

export default function FaceRegister() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [employees, setEmployees] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [modelsReady, setModelsReady] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [capturing, setCapturing] = useState(false);

    useEffect(() => {
        loadEmployees();
        loadFaceModels()
            .then(() => setModelsReady(true))
            .catch(() => toast.error('Không tải được model nhận diện khuôn mặt'));

        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadEmployees = async () => {
        try {
            const res = await faceAttendanceApi.getEmployees();
            setEmployees(res.data);
        } catch (err) {
            toast.error(err.message || 'Không tải được danh sách nhân viên');
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraOn(true);
        } catch (err) {
            toast.error('Không mở được camera. Kiểm tra quyền truy cập camera của trình duyệt.');
        }
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setCameraOn(false);
    };

    const handleCapture = async () => {
        if (!selectedId) {
            toast.warn('Chọn nhân viên trước khi chụp');
            return;
        }
        if (!videoRef.current) return;

        setCapturing(true);
        try {
            const descriptor = await detectFaceDescriptor(videoRef.current);
            if (!descriptor) {
                toast.warn('Không phát hiện khuôn mặt trong khung hình, thử lại');
                return;
            }
            await faceAttendanceApi.registerFace(selectedId, descriptor);
            toast.success('Đăng ký khuôn mặt thành công');
            loadEmployees();
        } catch (err) {
            toast.error(err.message || 'Đăng ký thất bại');
        } finally {
            setCapturing(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Xóa dữ liệu khuôn mặt của nhân viên này?')) return;
        try {
            await faceAttendanceApi.deleteFace(userId);
            toast.success('Đã xóa, có thể đăng ký lại');
            loadEmployees();
        } catch (err) {
            toast.error(err.message || 'Xóa thất bại');
        }
    };

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-1">Đăng ký khuôn mặt nhân viên</h1>
            <p className="text-gray-500 mb-6">Dùng để nhận diện khi điểm danh bằng camera.</p>

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

                    <div className="mt-4 space-y-3">
                        <select
                            className="w-full border rounded-lg px-3 py-2"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            <option value="">-- Chọn nhân viên --</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.full_name} ({emp.role === 'admin' ? 'Admin' : 'Nhân viên'})
                                    {emp.has_face ? ' ✓ đã đăng ký' : ''}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            {!cameraOn ? (
                                <button
                                    onClick={startCamera}
                                    disabled={!modelsReady}
                                    className="flex-1 bg-green-600 disabled:bg-gray-300 text-white rounded-lg py-2 font-medium"
                                >
                                    {modelsReady ? 'Bật camera' : 'Đang tải model...'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCapture}
                                        disabled={capturing}
                                        className="flex-1 bg-blue-600 disabled:bg-blue-300 text-white rounded-lg py-2 font-medium"
                                    >
                                        {capturing ? 'Đang xử lý...' : 'Chụp & lưu khuôn mặt'}
                                    </button>
                                    <button
                                        onClick={stopCamera}
                                        className="px-4 bg-gray-200 rounded-lg font-medium"
                                    >
                                        Tắt cam
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                    <h2 className="font-semibold mb-4">Danh sách nhân viên</h2>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto">
                        {employees.map((emp) => (
                            <div
                                key={emp.id}
                                className="flex items-center justify-between border rounded-lg p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {emp.avatar ? (
                                            <img src={emp.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserRound className="text-gray-400" size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{emp.full_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {emp.role === 'admin' ? 'Admin' : 'Nhân viên'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {emp.has_face ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm">
                                            <CheckCircle2 size={16} /> Đã đăng ký
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Chưa đăng ký</span>
                                    )}
                                    {emp.has_face && (
                                        <button
                                            onClick={() => handleDelete(emp.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Xóa để đăng ký lại"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {employees.length === 0 && (
                            <p className="text-gray-400 text-center py-6">Chưa có nhân viên nào</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}