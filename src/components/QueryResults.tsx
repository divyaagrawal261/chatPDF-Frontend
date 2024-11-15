import React from 'react';
import { FileText } from 'lucide-react';

interface QueryResultsProps {
  results: string | null;
  isLoading: boolean;
}

export default function QueryResults({ results, isLoading }: QueryResultsProps) {
  if (!results && !isLoading) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-800">Results</h2>
      </div>
      <div className="h-[400px] overflow-y-auto rounded-lg border border-gray-100">
        <div className="prose max-w-none p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">{results}</p>
          )}
        </div>
      </div>
    </div>
  );
}