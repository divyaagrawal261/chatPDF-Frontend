import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  onHistoryItemClick: (query: string) => void;
}

const ITEMS_PER_PAGE = 10;

export default function Sidebar({ onHistoryItemClick }: SidebarProps) {
  const [history, setHistory] = useState<Array<{ query: string; timestamp: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchHistory = async () => {
      const pdf_id = sessionStorage.getItem("pdf_id");

      if (!pdf_id) {
        console.error("PDF ID not found in sessionStorage.");
        return;
      }

      try {
        const response = await axios.get(`/history/${pdf_id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setHistory(response.data.history || []);
      } catch (error) {
        console.error("Error fetching query history:", error);
      }
    };

    fetchHistory();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">Query History</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Search className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No queries yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Your search history will appear here
            </p>
          </div>
        ) : (
          <>
            <nav className="divide-y divide-gray-100">
              {currentItems.map((item, index) => (
                <button
                  key={startIndex + index}
                  onClick={() => onHistoryItemClick(item.query)}
                  className="w-full text-left p-4 hover:bg-gray-50 transition-colors group focus:outline-none focus:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                        {item.query}
                      </p>
                      <time className="text-xs text-gray-500 mt-1 block">
                        {item.timestamp}
                      </time>
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {totalPages > 1 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-indigo-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors
                          ${currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 hover:bg-gray-100'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-indigo-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
