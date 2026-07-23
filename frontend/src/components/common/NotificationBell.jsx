import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function NotificationBell() {
    const { items, unread, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // polling mỗi 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={wrapRef}>
            <button onClick={() => setOpen((o) => !o)} className="relative hover:opacity-80">
                <Bell size={22} />
                {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg text-gray-700 z-50 max-h-96 flex flex-col">
                    <div className="flex justify-between items-center px-4 py-2 border-b">
                        <span className="font-medium text-sm">Thông báo</span>
                        {unread > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-green-600 hover:underline">
                                Đánh dấu đã đọc hết
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {items.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">Chưa có thông báo nào</p>
                        ) : (
                            items.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                    className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${
                                        !n.is_read ? 'bg-green-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{n.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{n.content}</p>
                                            <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}