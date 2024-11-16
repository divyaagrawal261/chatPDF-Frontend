import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, History, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  onQueryClick: (query: string) => void;
}

const ITEMS_PER_PAGE = 10;

export default function Sidebar({ onQueryClick }: SidebarProps) {
  const [pdfs, setPdfs] = useState<
    Array<{
      id: string;
      filename: string;
      created_at: string;
      queryHistory: Array<{ query: string; timestamp: string }>;
    }>
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(pdfs.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = pdfs.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchPdfsAndHistory = async () => {
      try {
        // Fetch all PDFs
        const pdfsResponse = await axios.get(`${import.meta.env.VITE_URL}/pdfs`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const pdfsData = pdfsResponse.data || [];

        // Fetch query history for each PDF
        const pdfsWithHistory = await Promise.all(
          pdfsData.map(async (pdf: { id: string; filename: string; created_at: string }) => {
            try {
              const historyResponse = await axios.get(`${import.meta.env.VITE_URL}/history/${pdf.id}`, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              return {
                ...pdf,
                queryHistory: historyResponse.data.history || [],
              };
            } catch (error) {
              console.error(`Error fetching history for PDF ${pdf.id}:`, error);
              return { ...pdf, queryHistory: [] }; // Fallback to empty history
            }
          })
        );

        setPdfs(pdfsWithHistory);
      } catch (error) {
        console.error('Error fetching PDFs or histories:', error);
      }
    };

    fetchPdfsAndHistory();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">PDFs & Query History</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {pdfs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No PDFs available</p>
            <p className="text-gray-400 text-xs mt-1">
              Your PDFs and query history will appear here
            </p>
          </div>
        ) : (
          <>
            <nav className="divide-y divide-gray-100">
              {currentItems.map((pdf, index) => (
                <div key={startIndex + index} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {pdf.filename}
                      </p>
                      <time className="text-xs text-gray-500 mt-1 block">
                        {new Date(pdf.created_at).toLocaleString()}
                      </time>
                    </div>
                  </div>

                  {pdf.queryHistory.length === 0 ? (
                    <p className="text-gray-400 text-xs ml-7">No queries for this PDF</p>
                  ) : (
                    <ul className="ml-7 space-y-2">
                      {pdf.queryHistory.map((query, queryIndex) => (
                        <li key={queryIndex}>
                          <button
                            onClick={() => onQueryClick(query.query)}
                            className="text-left text-sm text-indigo-600 hover:underline"
                          >
                            {query.query}
                          </button>
                          <time className="block text-xs text-gray-500">
                            {new Date(query.timestamp).toLocaleString()}
                          </time>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
