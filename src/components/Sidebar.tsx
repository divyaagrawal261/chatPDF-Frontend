import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"; // Import Trash2 (Dustbin) icon
import { useNavigate } from "react-router-dom"; // For navigation

const ITEMS_PER_PAGE = 3; // PDFs per page

export default function Sidebar() {
  const [pdfs, setPdfs] = useState<{
    id: string;
    title: string | null;
    created_at: string;
    queries: Array<{ id: string; query: string; response: string; created_at: string }>;
  }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryPagination, setQueryPagination] = useState<{
    [pdfId: string]: { currentPage: number; totalQueries: number };
  }>({});
  const navigate = useNavigate(); // Hook for navigation

  const totalPages = Math.ceil(pdfs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = pdfs.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const pdfsResponse = await axios.get(`${import.meta.env.VITE_URL}/pdfs_with_queries`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const pdfsData = pdfsResponse.data || [];

        // Initialize pagination for each PDF
        const initialPagination: { [pdfId: string]: { currentPage: number; totalQueries: number } } =
          pdfsData.reduce((acc, pdf) => {
            acc[pdf.id] = { currentPage: 1, totalQueries: pdf.queries.length };
            return acc;
          }, {});

        setQueryPagination(initialPagination);
        setPdfs(pdfsData);
      } catch (error) {
        console.error("Error fetching PDFs or histories:", error);
      }
    };

    fetchPdfs();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleQueryPagination = async (pdfId: string, page: number) => {
    try {

      const response = await axios.get(`${import.meta.env.VITE_URL}/history/${pdfId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setPdfs((prevPdfs) =>
        prevPdfs.map((pdf) =>
          pdf.id === pdfId
            ? { ...pdf, queries: response.data.history || [] }
            : pdf
        )
      );

      setQueryPagination((prev) => ({
        ...prev,
        [pdfId]: { ...prev[pdfId], currentPage: page },
      }));
    } catch (error) {
      console.error(`Error paginating queries for PDF ${pdfId}:`, error);
    }
  };

  const handleDeletePdf = async (pdfId: string) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this PDF?");
    if (confirmDelete) {
      try {
        // Make the DELETE request to the backend
        await axios.delete(`${import.meta.env.VITE_URL}/pdfs/${pdfId}`);
        // Remove the deleted PDF from the state
        setPdfs((prevPdfs) => prevPdfs.filter((pdf) => pdf.id !== pdfId));
        alert("PDF deleted successfully");
      } catch (error) {
        console.error("Error deleting PDF:", error);
        alert("There was an error deleting the PDF");
      }
    }
  };
  

  const handleQueryClick = (queryId: string, pdfId: string, filename: string) => {
    const pdf = pdfs.find((pdf) => pdf.id === pdfId);
    if (pdf) {
      const query = pdf.queries.find((query) => query.id === queryId);
      if (query) {
        // Save query and response to sessionStorage
        sessionStorage.setItem(
          "queryData",
          JSON.stringify({
            query: query.query,
            response: query.response,
            pdfId,
            filename: filename || "Untitled PDF",
          })
        );
        // Redirect to new page
        navigate("/query-detail");
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            PDFs & Query History
          </h2>
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
                <div key={startIndex + index} className="p-4 group relative">
                  {/* Trashbin (Dustbin) icon that appears on hover */}
                  <button
                    onClick={() => handleDeletePdf(pdf.id)}
                    className="absolute top-2 right-2 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {pdf.title || "Untitled PDF"}
                      </p>
                      <time className="text-xs text-gray-500 mt-1 block">
                        {new Date(pdf.created_at).toLocaleString()}
                      </time>
                    </div>
                  </div>

                  {pdf.queries.length === 0 ? (
                    <p className="text-gray-400 text-xs ml-7">
                      No queries for this PDF
                    </p>
                  ) : (
                    <ul className="ml-7 space-y-2">
                      {pdf.queries.map((query) => (
                        <li key={query.id}>
                          <button
                            onClick={() =>
                              handleQueryClick(query.id, pdf.id, pdf.title || "Untitled PDF")
                            }
                            className="text-left text-sm text-indigo-600 hover:underline"
                          >
                            {query.query}
                          </button>
                          <time className="block text-xs text-gray-500">
                            {new Date(query.created_at).toLocaleString()}
                          </time>
                        </li>
                      ))}
                    </ul>
                  )}

                  </div>
              ))}
            </nav>

            {totalPages > 1 && (
              <div className="p-4 flex justify-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="text-gray-500 disabled:text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="text-gray-500 disabled:text-gray-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}