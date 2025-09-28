"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function EnhancedDocumentUpload() {
  const [content, setContent] = useState("");
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      setFilename(file.name);
    };

    reader.onerror = () => {
      setMessage("Error reading file");
    };

    // Read file as text
    reader.readAsText(file);
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!content.trim()) {
      setMessage("Please enter some content or upload a file");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          filename: filename || `document_${Date.now()}.txt`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Document uploaded successfully!");
        setUploadedFiles(prev => [...prev, filename || "Untitled"]);
        setContent("");
        setFilename("");
      } else {
        setMessage("Upload failed: " + data.error);
      }
    } catch (error) {
      setMessage("Upload error: " + error);
    } finally {
      setUploading(false);
    }
  };

  const clearContent = () => {
    setContent("");
    setFilename("");
    setMessage("");
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Document Upload
            </h1>
            <p className="text-gray-600">
              Upload your documents to create a searchable knowledge base
            </p>
          </div>

          {/* Upload Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-6">

                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload File or Paste Content
                  </label>

                  {/* Drag and Drop Area */}
                  <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                  >
                    <div className="mb-4">
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop your file here, or
                    </p>
                    <button
                        type="button"
                        onClick={triggerFileInput}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports: .txt, .md, .csv, .json files
                    </p>
                  </div>

                  {/* Hidden File Input */}
                  <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInputChange}
                      accept=".txt,.md,.csv,.json,.doc,.docx"
                      className="hidden"
                  />
                </div>

                {/* Document Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Name
                  </label>
                  <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="Enter document name..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Document Content */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Document Content
                    </label>
                    {content && (
                        <button
                            onClick={clearContent}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                          Clear
                        </button>
                    )}
                  </div>
                  <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="File content will appear here, or paste your text directly..."
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {content && (
                      <p className="text-xs text-gray-500 mt-1">
                        {content.length} characters
                      </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                      onClick={handleUpload}
                      disabled={uploading || !content.trim()}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {uploading ? "Uploading..." : "Upload Document"}
                  </button>

                  <button
                      onClick={() => router.push("/search")}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    Go to Search
                  </button>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                        message.includes('successfully')
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {message}
                    </div>
                )}
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Uploaded Documents ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-gray-700">{file}</span>
                        </div>
                    ))}
                  </div>
                </div>
            )}

            {/* Quick Tips */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Quick Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Drag and drop files directly into the upload area</li>
                <li>• Supported file types: .txt, .md, .csv, .json</li>
                <li>• You can also paste content directly into the text area</li>
                <li>• Each document will be processed and made searchable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
}