import { ChevronLeft, ChevronRight } from 'lucide-react';

// props: currentPage, totalPages, onPageChange
export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    // Tạo danh sách số trang hiển thị, rút gọn bằng dấu "..." nếu quá nhiều trang
    const getPageNumbers = () => {
        const pages = [];
        const delta = 1; // số trang hiện xung quanh trang hiện tại

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm">...</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-9 h-9 rounded-md text-sm ${
                            p === currentPage
                                ? 'bg-green-600 text-white font-medium'
                                : 'border hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}