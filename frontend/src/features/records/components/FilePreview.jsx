import React from 'react';

const FilePreview = ({ file, isOpen, onClose }) => {
  if (!isOpen || !file) return null;

  const isPDF = file.fileName?.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <div>
            <h3 className="font-bold text-slate-800">{file.type || 'Medical Document'}</h3>
            <p className="text-xs text-slate-400 font-medium">{file.fileName || 'View file'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all text-xs font-bold">
              ⬇️ Download
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-xl leading-none font-black text-slate-400">
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-6 flex items-center justify-center">
          {isPDF ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500">
              <span className="text-6xl">📄</span>
              <p className="font-bold">PDF Preview Placeholder</p>
              <p className="text-sm max-w-xs text-center leading-relaxed">
                Embedding a real PDF usually requires a library like react-pdf or using an iframe. 
                For this demo, we can assume the PDF is loaded here.
              </p>
            </div>
          ) : (
            <img 
              src={file.url || 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=2070'} 
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
