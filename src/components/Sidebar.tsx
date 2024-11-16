import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"; // Import Trash2 (Dustbin) icon
import { useNavigate } from "react-router-dom"; // For navigation

const QUERIES_PER_PAGE = 5; // Queries per page

export default function Sidebar() {
  const [pdfs, setPdfs] = useState<{
    id: string;
    title: string | null;
    created_at: string;
    queries: Array<{ id: string; query: string; response: string; created_at: string }>;
  }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [flattenedQueries, setFlattenedQueries] = useState<Array<{ query: string; response: string; pdfId: string; created_at: string }>>([]);
  const navigate = useNavigate(); // Hook for navigation

  // Flatten all queries into a single array
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const pdfsResponse = await axios.get(`${import.meta.env.VITE_URL}/pdfs_with_queries`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const pdfsData = pdfsResponse.data || [];

        // Flatten all queries across PDFs
        const allQueries = pdfsData.flatMap((pdf) =>
          pdf.queries.map((query) => ({
            query: query.query,
            response: query.response,
            pdfId: pdf.id,
            created_at: query.created_at,
          }))
        );

        setFlattenedQueries(allQueries);
        setPdfs(pdfsData);
      } catch (error) {
        console.error("Error fetching PDFs or histories:", error);
      }
    };

    fetchPdfs();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(flattenedQueries.length / QUERIES_PER_PAGE);
  const startIndex = (currentPage - 1) * QUERIES_PER_PAGE;
  const endIndex = startIndex + QUERIES_PER_PAGE;
  const currentQueries = flattenedQueries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        {flattenedQueries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No queries available</p>
            <p className="text-gray-400 text-xs mt-1">
              Your PDFs and query history will appear here
            </p>
          </div>
        ) : (
          <>
            <nav className="divide-y divide-gray-100">
              {currentQueries.map((query, index) => (
                <div key={index} className="p-4 group relative">
                  {/* Cross icon that appears on hover */}
                  <button
                    onClick={() => handleDeletePdf(query.pdfId)}
                    className="absolute top-2 right-2 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {query.query}
                      </p>
                      <time className="text-xs text-gray-500 mt-1 block">
                        {new Date(query.created_at).toLocaleString()}
                      </time>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm">{query.response}</p>
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
