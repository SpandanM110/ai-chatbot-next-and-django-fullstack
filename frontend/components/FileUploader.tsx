'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useChatStore } from '@/lib/store';
import { fileApi } from '@/lib/api';
import { Upload, File, X, Loader2, CheckCircle } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';

export default function FileUploader() {
  const { files, setFiles } = useChatStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'uploading' | 'success' | 'error'>>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    for (const file of acceptedFiles) {
      setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));
      
      try {
        const result = await fileApi.uploadFile(file);
        setFiles([result, ...files]);
        setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
      }
    }
    
    setIsUploading(false);
  }, [files, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDeleteFile = async (fileId: number) => {
    try {
      await fileApi.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-medium text-sm mb-2 text-white">Upload Files</h3>
        <p className="text-xs text-white/80 mb-4">
          Upload PDF, DOCX, CSV, or TXT files for AI analysis
        </p>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-white/30 hover:border-white/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-white/70" />
          <p className="text-sm text-white">
            {isDragActive
              ? 'Drop files here...'
              : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-white/70 mt-1">
            PDF, DOCX, CSV, TXT (max 10MB)
          </p>
        </div>
      </div>

      {/* Upload Status */}
      {Object.keys(uploadStatus).length > 0 && (
        <div className="mb-4 space-y-2">
          {Object.entries(uploadStatus).map(([filename, status]) => (
            <div key={filename} className="flex items-center space-x-2 text-xs text-white">
              {status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin text-blue-400" />}
              {status === 'success' && <CheckCircle className="h-3 w-3 text-green-400" />}
              {status === 'error' && <X className="h-3 w-3 text-red-400" />}
              <span className="truncate">{filename}</span>
            </div>
          ))}
        </div>
      )}

      {/* Files List */}
      <div className="flex-1 overflow-y-auto">
        <h4 className="font-medium text-sm mb-2 text-white">Uploaded Files</h4>
        {files.length === 0 ? (
          <p className="text-xs text-white/70 text-center py-4">
            No files uploaded yet
          </p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="group p-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start space-x-2">
                  <File className="h-4 w-4 text-white/70 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">
                      {file.original_name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-white/70">
                      <span>{file.file_type.toUpperCase()}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.created_at)}</span>
                    </div>
                    {file.metadata.description && (
                      <p className="text-xs text-white/70 mt-1">
                        {file.metadata.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                  >
                    <X className="h-3 w-3 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
