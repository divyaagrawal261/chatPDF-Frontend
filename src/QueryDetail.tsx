import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function QueryDetail() {
  const [queryData, setQueryData] = useState<{
    query: string;
    response: string;
    pdfId: string;
    filename: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = sessionStorage.getItem("queryData");
    if (storedData) {
      setQueryData(JSON.parse(storedData));
    } else {
      navigate("/"); // Redirect if no query data is found in sessionStorage
    }
  }, [navigate]);

  return (
    <div className="p-6 md:max-w-[768px] sm:max-w-[90vw]">
      {queryData ? (
        <div>
          <h1 className="text-2xl font-semibold mb-4">Query: {queryData.query}</h1>
          <div className="w-full">
            <h2 className="text-lg font-medium">Response:</h2>
            <pre className="bg-gray-100 p-4 rounded md:max-w-[768px] sm:max-w-[90vw] text-wrap">{queryData.response}</pre>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
