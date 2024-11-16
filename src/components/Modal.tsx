import React from "react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onDelete: () => void;
}

export default function Modal({ title, children, onClose, onDelete }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete PDF
          </button>
        </div>
      </div>
    </div>
  );
}
