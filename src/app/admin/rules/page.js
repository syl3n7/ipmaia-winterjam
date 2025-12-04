"use client";

import { useState, useEffect } from 'react';

export default function AdminRules() {
  const [loading, setLoading] = useState(true);
  const [rulesStatus, setRulesStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    loadRulesStatus();
  }, []);

  const loadRulesStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rules/active`,
        { credentials: 'include' }
      );

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const rules = await response.json();

        if (rules && rules.pdf_url) {
          // Construct the PDF URL using the frontend's API URL to ensure consistency
          const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/rules/download`;
          
          setRulesStatus({
            pdf_url: pdfUrl,
            created_at: rules.created_at,
            updated_at: rules.updated_at,
          });
        } else {
          setRulesStatus(null);
        }
      } else {
        setRulesStatus(null);
      }
    } catch (error) {
      console.error('Failed to load rules status:', error);
      setRulesStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      alert('Please select a PDF file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rules/admin/upload-pdf`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (response.ok) {
        await loadRulesStatus();
        setPdfFile(null);
        // Reset file input
        const fileInput = document.getElementById('rules-pdf-file');
        if (fileInput) fileInput.value = '';
        alert('Rulebook PDF uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">📋 Rules Management</h2>
      </div>

      {/* Current Rules Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          📄 Current Rulebook
        </h3>

        {rulesStatus ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-2xl">✓</span>
              <div className="flex-1">
                <p className="text-white font-semibold mb-2">Rulebook Active</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-400">PDF URL:</span>{' '}
                    <a
                      href={rulesStatus.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {rulesStatus.pdf_url}
                    </a>
                  </p>
                  <p className="text-gray-400">
                    Uploaded: {new Date(rulesStatus.created_at).toLocaleString()}
                  </p>
                  {rulesStatus.updated_at !== rulesStatus.created_at && (
                    <p className="text-gray-400">
                      Updated: {new Date(rulesStatus.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <a
                href={rulesStatus.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors inline-flex items-center gap-2"
              >
                👁️ View PDF
              </a>
              <a
                href={rulesStatus.pdf_url}
                download
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors inline-flex items-center gap-2"
              >
                📥 Download
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 text-gray-400">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p>No rulebook uploaded yet.</p>
              <p className="text-sm mt-1">
                Upload a PDF below to make it available at:{' '}
                <code className="bg-gray-700 px-2 py-1 rounded">
                  /WinterJam_Rulebook.pdf
                </code>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          📤 Upload {rulesStatus ? 'New' : ''} Rulebook PDF
        </h3>

        <form onSubmit={handlePdfUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select PDF File
            </label>
            <input
              id="rules-pdf-file"
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-dashed border-blue-500 rounded-lg text-white focus:outline-none focus:border-blue-400"
              required
            />
            <p className="text-sm text-gray-400 mt-2">
              The PDF will be available at:{' '}
              <code className="bg-gray-700 px-2 py-1 rounded">
                https://ipmaia-winterjam.pt/WinterJam_Rulebook.pdf
              </code>
            </p>
          </div>

          {pdfFile && (
            <div className="bg-gray-700 rounded p-3">
              <p className="text-sm text-gray-300">
                <span className="text-gray-400">Selected:</span> {pdfFile.name} (
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !pdfFile}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload PDF'}
          </button>
        </form>

        {rulesStatus && (
          <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded">
            <p className="text-sm text-yellow-300">
              ⚠️ Uploading a new PDF will replace the current rulebook.
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-400 text-xl">💡</span>
          <div className="text-sm text-gray-300 space-y-1">
            <p className="font-semibold text-white">Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Only PDF files are accepted</li>
              <li>The PDF will be served at a fixed URL for easy sharing</li>
              <li>Make sure your PDF is properly formatted before uploading</li>
              <li>Include all necessary rules and regulations in the document</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
