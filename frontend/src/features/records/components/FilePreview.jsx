import React from 'react';

const FilePreview = ({ file, isOpen, onClose }) => {
  if (!isOpen || !file) return null;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
  const rawFileUrl = file.fileUrl || file.file_url || file.prescriptionUrl || '';
  const fileUrl = String(rawFileUrl).trim();
  const hasValidFileUrl = fileUrl.length > 0 && fileUrl !== '/';

  const previewSource = hasValidFileUrl
    ? (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')
        ? fileUrl
        : `${API_BASE_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`)
    : 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=2070';

  const lowerFileUrl = fileUrl.toLowerCase();
  const isPDF =
    file.fileName?.toLowerCase().endsWith('.pdf') ||
    file.type === 'application/pdf' ||
    lowerFileUrl.endsWith('.pdf');

  const canFramePdf = (() => {
    try {
      return new URL(previewSource, window.location.origin).origin === window.location.origin;
    } catch {
      return false;
    }
  })();

  const downloadFileName =
    file.fileName ||
    fileUrl.split('/').pop() ||
    (isPDF ? 'medical-document.pdf' : 'medical-document');

  const handleDownload = async () => {
    if (!hasValidFileUrl) {
      return;
    }

    try {
      const response = await fetch(previewSource);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(previewSource, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <div>
            <h3 className="font-bold text-slate-800">{file.type || 'Medical Document'}</h3>
            <p className="text-xs text-slate-400 font-medium">{downloadFileName || 'View file'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all text-xs font-bold"
            >
              ⬇️ Download
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-xl leading-none font-black text-slate-400">
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-6 flex items-center justify-center">
          {isPDF ? (
            canFramePdf ? (
              <iframe
                src={previewSource}
                title="Medical Record PDF"
                className="w-full h-full rounded-lg bg-white"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-600">
                <p className="font-semibold text-center">PDF preview is blocked by browser frame policy in this environment.</p>
                <a
                  href={previewSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Open PDF in New Tab
                </a>
              </div>
            )
          ) : (
            <img 
              src={previewSource}
              alt="Medical Record"
              className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
