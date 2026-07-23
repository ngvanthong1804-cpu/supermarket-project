import { useEffect, useRef, useState } from 'react';
import chatApi from '../../api/chat.api';
import { Send, MessageCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function ChatManage() {
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        loadConversations();
        const interval = setInterval(loadConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedCustomer) {
            loadMessages(selectedCustomer.customer_id);
            const interval = setInterval(() => loadMessages(selectedCustomer.customer_id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedCustomer]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        const res = await chatApi.getConversations();
        setConversations(res.data);
    };

    const loadMessages = async (customerId) => {
        const res = await chatApi.getConversationMessages(customerId);
        setMessages(res.data);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedCustomer) return;
        const text = input;
        setInput('');
        try {
            await chatApi.sendStaffMessage(selectedCustomer.customer_id, text);
            loadMessages(selectedCustomer.customer_id);
            loadConversations();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Hỗ trợ khách hàng</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
                {/* Danh sách hội thoại */}
                <div className="border-r overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center p-6">Chưa có cuộc hội thoại nào</p>
                    ) : (
                        conversations.map((c) => (
                            <button
                                key={c.customer_id}
                                onClick={() => setSelectedCustomer(c)}
                                className={`w-full text-left p-3 border-b hover:bg-gray-50 ${
                                    selectedCustomer?.customer_id === c.customer_id ? 'bg-green-50' : ''
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm truncate">{c.customer_name}</span>
                                    {c.unread_count > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                                            {c.unread_count}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 truncate mt-0.5">{c.last_message}</p>
                            </button>
                        ))
                    )}
                </div>

                {/* Khung chat */}
                <div className="md:col-span-2 flex flex-col">
                    {!selectedCustomer ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageCircle size={40} />
                            <p className="text-sm mt-2">Chọn 1 cuộc hội thoại để bắt đầu</p>
                        </div>
                    ) : (
                        <>
                            <div className="border-b p-3">
                                <p className="font-medium text-sm">{selectedCustomer.customer_name}</p>
                                <p className="text-xs text-gray-400">{selectedCustomer.customer_email}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                                {messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`flex ${m.sender_role !== 'customer' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                                                m.sender_role !== 'customer'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-white border text-gray-800'
                                            }`}
                                        >
                                            {m.sender_role !== 'customer' && (
                                                <p className="text-[10px] opacity-80 mb-0.5">{m.sender_name}</p>
                                            )}
                                            {m.message}
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>

                            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Nhập phản hồi..."
                                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button type="submit" className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700">
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}