"use client";

import { useState, useRef } from "react";
import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

export default function DocumentUpload() {
  const [content, setContent] = useState("");
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    setMessage("Processing file...");

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // Handle PDF files
        await handlePDFFile(file);
      } else {
        // Handle text-based files
        const reader = new FileReader();

        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContent(text);
          setFilename(file.name);
          setMessage("");
        };

        reader.onerror = () => {
          setMessage("Error reading file");
        };

        reader.readAsText(file);
      }
    } catch (error) {
      setMessage("Error processing file: " + error);
    }
  };

  // Handle PDF file processing
  const handlePDFFile = async (file: File) => {
    try {
      // Dynamic import of PDF.js
      const pdfjsLib = await import('pdfjs-dist');

      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText: string = textContent.items
            .map((item: TextItem | TextMarkedContent) =>
                "str" in item ? (item as TextItem).str : ""
            )
            .join(" ");

        fullText += pageText + '\n\n';
      }

      setContent(fullText.trim());
      setFilename(file.name);
      setMessage("");

    } catch (error) {
      setMessage("Error reading PDF: " + String(error));
    }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    await handleFileSelect(files);
  };

  // Handle file input change
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileSelect(e.target.files);
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
        setMessage("Document indexed successfully in ChromaDB!");
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
      <div className="max-w-4xl mx-auto p-6 border-t">
        <h2 className="text-xl font-semibold mb-4">Add Data</h2>

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
                Supports: .txt, .md, .csv, .json, .pdf files
              </p>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept=".txt,.md,.csv,.json,.doc,.docx,.pdf"
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
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {content && (
                <p className="text-xs text-gray-500 mt-1">
                  {content.length} characters
                </p>
            )}
          </div>

          {/* Upload Button */}
          <button
              onClick={handleUpload}
              disabled={uploading || !content.trim()}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {uploading ? "Indexing..." : "Add to ChromaDB"}
          </button>

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

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Uploaded Documents ({uploadedFiles.length})
              </h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center p-2 bg-white rounded shadow-sm">
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
            <li>• Supported file types: .txt, .md, .csv, .json, .pdf</li>
            <li>• You can also paste content directly into the text area</li>
            <li>• Each document will be processed and made searchable</li>
          </ul>
        </div>
      </div>
  );
}