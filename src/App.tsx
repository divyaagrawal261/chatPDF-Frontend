import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'; // Use for navigation
import FileUpload from './components/FileUpload';
import QueryResults from './components/QueryResults';
import Sidebar from './components/Sidebar';

function App() {
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ query: string; timestamp: string }>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate hook for redirection

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);

    const pdf_id = sessionStorage.getItem("pdf_id"); // Retrieve pdf_id from sessionStorage

    if (!pdf_id) {
      window.alert("Please add the file again");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdf_id,
          query,
        }),
      });
      const data = await response.json();
      setResults(data.response || "No results found."); // Adjust to match response structure

      // Save query and response to sessionStorage
      sessionStorage.setItem(
        "queryData",
        JSON.stringify({
          query,
          response: data.response || "No results found.",
          pdf_id,
        })
      );

      setHistory((prev) => [
        { query, timestamp: new Date().toLocaleString() },
        ...prev,
      ]);

      // Do not navigate to query-detail, instead show results on the same page
    } catch (error) {
      console.error("Error querying PDF:", error);
      setResults("An error occurred while processing your request.");
    }

    setIsLoading(false);
  };

  const handleHistoryItemClick = (historicalQuery: string) => {
    setQuery(historicalQuery);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block w-80 bg-white border-r border-gray-200">
        <Sidebar history={history} onHistoryItemClick={handleHistoryItemClick} />
      </div>

      {/* Mobile sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden">
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50">
            <div className="absolute right-0 p-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar history={history} onHistoryItemClick={handleHistoryItemClick} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between md:justify-end">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">PDF Query Assistant</h1>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <FileUpload
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                />

                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about your PDF..."
                    className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Submit Query'}
                </button>
              </form>
            </div>

            {/* Conditionally render query results here */}
            {results && (
              <QueryResults results={results} isLoading={isLoading} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
