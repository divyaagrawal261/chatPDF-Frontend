import React from 'react';
import { Clock, Search } from 'lucide-react';

interface QueryHistoryProps {
  history: Array<{
    query: string;
    timestamp: string;
  }>;
  onHistoryItemClick: (query: string) => void;
}

export default function QueryHistory({ history, onHistoryItemClick }: QueryHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-800">Query History</h2>
      </div>
      <div className="space-y-3">
        {history.map((item, index) => (
          <div
            key={index}
            onClick={() => onHistoryItemClick(item.query)}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <Search className="w-4 h-4 mt-1 text-gray-400 group-hover:text-indigo-600" />
            <div className="flex-1">
              <p className="text-gray-700 group-hover:text-indigo-600 font-medium">
                {item.query}
              </p>
              <p className="text-sm text-gray-400">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}