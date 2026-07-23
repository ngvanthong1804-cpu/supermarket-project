import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import chatApi from '../../api/chat.api';
import useAuthStore from '../../store/authStore';

export default function ChatWidget() {
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [unread, setUnread] = useState(0);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!user || user.role !== 'customer') return;
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (open) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000); // polling khi đang mở chat
            return () => clearInterval(interval);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchUnread = async () => {
        try {
            const res = await chatApi.getUnreadCount();
            setUnread(res.data.count);
        } catch (err) {
            console.error(err);
        }
    };

    const loadMessages = async () => {
        try {
            const res = await chatApi.getMyChat();
            setMessages(res.data);
            setUnread(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const text = input;
        setInput('');
        try {
            await chatApi.sendMyMessage(text);
            loadMessages();
        } catch (err) {
            console.error(err);
        }
    };

    if (!user || user.role !== 'customer') return null;

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {open ? (
                <div className="w-[calc(100vw-2.5rem)] max-w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col border">
                    <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
                        <span className="font-medium text-sm">Hỗ trợ khách hàng</span>
                        <button onClick={() => setOpen(false)}><X size={18} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                        {messages.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center mt-4">
                                Chào bạn! Hãy để lại tin nhắn, chúng tôi sẽ phản hồi sớm nhất.
                            </p>
                        ) : (
                            messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex ${m.sender_role === 'customer' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                                            m.sender_role === 'customer'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-white border text-gray-800'
                                        }`}
                                    >
                                        {m.sender_role !== 'customer' && (
                                            <p className="text-[10px] text-gray-400 mb-0.5">{m.sender_name}</p>
                                        )}
                                        {m.message}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <form onSubmit={handleSend} className="flex items-center gap-2 p-2 border-t">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button type="submit" className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    className="relative bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700"
                >
                    <MessageCircle size={24} />
                    {unread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
}