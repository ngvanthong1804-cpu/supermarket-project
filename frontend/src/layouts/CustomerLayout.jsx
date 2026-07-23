import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ChatWidget from '../components/customer/ChatWidget';

export default function CustomerLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
}