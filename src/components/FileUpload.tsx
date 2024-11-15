import React from 'react';
import axios from 'axios';
import { Upload, XCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isConfirmed = window.confirm(`Do you want to submit this PDF: ${file.name}?`);
      if (isConfirmed) {
        onFileSelect(file);
        await uploadFile(file);
      } else {
        event.target.value = ''; // Clear the input value
      }
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${import.meta.env.VITE_URL}/upload_pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        const pdfId = response.data.data.pdf_id;
        sessionStorage.setItem('pdf_id', pdfId); // Store pdf_id in sessionStorage
        alert('File uploaded successfully!');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const deleteFile = async () => {
    const pdfId = sessionStorage.getItem('pdf_id');
    if (!pdfId) return alert('No PDF to delete.');

    const isConfirmed = window.confirm("Are you sure you want to delete this PDF?");
    if (isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_URL}/pdfs/${pdfId}`);
        alert('File deleted successfully!');
        sessionStorage.removeItem('pdf_id');
        onFileSelect(null); // Clear the selected file
      } catch (error) {
        console.error('File deletion failed:', error);
        alert('Failed to delete file. Please try again.');
      }
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${
            selectedFile
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-gray-100'
          }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 relative">
          {!selectedFile && (
            <Upload className="w-8 h-8 mb-2 text-gray-400" />
          )}
          {selectedFile ? (
            <div className="flex items-center group">
              <p className="text-sm text-indigo-600 font-medium">
                {selectedFile.name}
              </p>
              <XCircle
                className="w-14 h-14 mx-2 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering file upload
                  deleteFile();
                }}
              />
            </div>
          ) : (
            <>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF files only</p>
            </>
          )}
        </div>
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={handleFileChange}
      />
    </div>
  );
}
