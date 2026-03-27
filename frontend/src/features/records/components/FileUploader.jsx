import React, { useState, useRef } from 'react';

const FileUploader = ({ onFileSelect, accept = ".pdf,.jpg,.jpeg,.png", maxSizeMB = 5 }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const validateAndSelect = (selectedFile) => {
    const isTooBig = selectedFile.size > maxSizeMB * 1024 * 1024;
    if (isTooBig) {
      alert(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }
    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept={accept}
        onChange={(e) => e.target.files[0] && validateAndSelect(e.target.files[0])}
      />

      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-4 shadow-inner">
        📂
      </div>

      <h5 className="font-bold text-slate-800 mb-1">
        {file ? file.name : 'Upload Medical Document'}
      </h5>
      <p className="text-xs text-slate-400 font-medium text-center max-w-[200px]">
        Drag & drop or <span className="text-blue-600 underline">browse</span> to upload (PDF, JPG, PNG up to {maxSizeMB}MB)
      </p>

      {file && (
        <div className="mt-4 flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
          <span className="text-green-600 text-xs font-bold">✓ Ready to upload</span>
          <button 
            className="text-slate-400 hover:text-red-500"
            onClick={(e) => { e.stopPropagation(); setFile(null); onFileSelect(null); }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
