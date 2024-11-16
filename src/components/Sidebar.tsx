import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "./Modal";

const ITEMS_PER_PAGE = 10; // PDFs per page
const QUERIES_PER_PAGE = 5; // Queries per page

export default function Sidebar() {
  const [pdfs, setPdfs] = useState<
    Array<{
      id: string;
      filename: string;
      created_at: string;
      totalQueries: number;
      queryHistory: Array<{ id: string; query: string; response: string; timestamp: string }>;
    }>
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryPagination, setQueryPagination] = useState<{
    [pdfId: string]: { currentPage: number; totalQueries: number };
  }>({});
  const [modalData, setModalData] = useState<{
    query: string;
    pdfId: string;
    filename: string;
    response: string | null;
  } | null>(null);

  const totalPages = Math.ceil(pdfs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = pdfs.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const pdfsResponse = await axios.get(`${import.meta.env.VITE_URL}/pdfs`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const pdfsData = pdfsResponse.data || [];

        // Fetch the query history for each PDF
        const pdfsWithQueryHistory = await Promise.all(
          pdfsData.map(async (pdf: { id: string; filename: string; created_at: string }) => {
            try {
              const historyResponse = await axios.get(`${import.meta.env.VITE_URL}/history/${pdf.id}`, {
                params: { skip: 0, limit: QUERIES_PER_PAGE },
                headers: {
                  "Content-Type": "application/json",
                },
              });

              return {
                ...pdf,
                totalQueries: historyResponse.data.total || 0,
                queryHistory: historyResponse.data.history || [],
              };
            } catch (error) {
              console.error(`Error fetching query history for PDF ${pdf.id}:`, error);
              return { ...pdf, totalQueries: 0, queryHistory: [] };
            }
          })
        );

        // Initialize pagination for each PDF
        const initialPagination: { [pdfId: string]: { currentPage: number; totalQueries: number } } =
          pdfsWithQueryHistory.reduce((acc, pdf) => {
            acc[pdf.id] = { currentPage: 1, totalQueries: pdf.totalQueries };
            return acc;
          }, {});

        setQueryPagination(initialPagination);
        setPdfs(pdfsWithQueryHistory);
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
      const skip = (page - 1) * QUERIES_PER_PAGE;

      const response = await axios.get(`${import.meta.env.VITE_URL}/history/${pdfId}`, {
        params: { skip, limit: QUERIES_PER_PAGE },
        headers: {
          "Content-Type": "application/json",
        },
      });

      setPdfs((prevPdfs) =>
        prevPdfs.map((pdf) =>
          pdf.id === pdfId
            ? { ...pdf, queryHistory: response.data.history || [] }
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

  const handleQueryClick = async (query: string, pdfId: string, filename: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/query`,
        { query, pdf_id: pdfId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setModalData({
        query,
        pdfId,
        filename,
        response: response.data.results ? response.data.results[0] : null, // Assuming response contains results
      });
    } catch (error) {
      console.error("Error fetching query results:", error);
      setModalData({
        query,
        pdfId,
        filename,
        response: null,
      });
    }
  };

  const handleDeletePdf = async (pdfId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_URL}/pdfs/${pdfId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Reload the page or update the state
      window.location.reload();
    } catch (error) {
      console.error("Error deleting PDF:", error);
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
                    <p className="text-gray-400 text-xs ml-7">
                      No queries for this PDF
                    </p>
                  ) : (
                    <ul className="ml-7 space-y-2">
                      {pdf.queryHistory.map((query) => (
                        <li key={query.id}>
                          <button
                            onClick={() =>
                              handleQueryClick(query.query, pdf.id, pdf.filename)
                            }
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

                  {pdf.totalQueries > QUERIES_PER_PAGE && (
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() =>
                          handleQueryPagination(
                            pdf.id,
                            queryPagination[pdf.id]?.currentPage - 1
                          )
                        }
                        disabled={queryPagination[pdf.id]?.currentPage === 1}
                        className="text-gray-500 disabled:text-gray-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          handleQueryPagination(
                            pdf.id,
                            queryPagination[pdf.id]?.currentPage + 1
                          )
                        }
                        disabled={
                          queryPagination[pdf.id]?.currentPage ===
                          Math.ceil(pdf.totalQueries / QUERIES_PER_PAGE)
                        }
                        className="text-gray-500 disabled:text-gray-300"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </>
        )}
      </div>

      {modalData && (
        <Modal
          title={`Query Result for: "${modalData.query}"`}
          onClose={() => setModalData(null)}
          onDelete={() => handleDeletePdf(modalData.pdfId)}
        >
          <p className="mb-4 text-sm text-gray-700">
            <strong>File Name:</strong> {modalData.filename}
          </p>
          {modalData.response ? (
            <p className="p-2 border rounded bg-gray-100 text-gray-700">{modalData.response}</p>
          ) : (
            <p className="text-sm text-gray-500">No results found.</p>
          )}
        </Modal>
      )}
    </div>
  );
}
