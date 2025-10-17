'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/store';
import { parseSharedChatFile, decompressChatMessages } from '@/lib/chatCompression';
import { Upload, XCircle, CheckCircle, Loader2, FileText, Download } from 'lucide-react';

interface RobustChatImportProps {
  onClose: () => void;
  onImport: (sessionData: any) => void;
}

export default function RobustChatImport({ onClose, onImport }: RobustChatImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importMode, setImportMode] = useState<'file' | 'url'>('file');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
    setError(null);
  };

  const importFromFile = async () => {
    if (!file) {
      setError('Please select a chat file to import.');
      return;
    }

    setIsLoading(true);
    try {
      const chatExport = await parseSharedChatFile(file);
      
      // Convert to frontend format
      const sessionData = {
        sessionId: chatExport.sessionId,
        title: chatExport.title,
        messages: decompressChatMessages(chatExport.messages),
        files: chatExport.files || [],
        metadata: chatExport.metadata
      };

      onImport(sessionData);
      onClose();
    } catch (err: any) {
      setError(`Failed to import chat file: ${err.message}`);
      console.error('Import error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const importFromUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const chatExport = await response.json();
      
      // Validate the file structure
      if (!chatExport.sessionId || !chatExport.messages) {
        throw new Error('Invalid chat file format');
      }

      // Convert to frontend format
      const sessionData = {
        sessionId: chatExport.sessionId,
        title: chatExport.title,
        messages: decompressChatMessages(chatExport.messages),
        files: chatExport.files || [],
        metadata: chatExport.metadata
      };

      onImport(sessionData);
      onClose();
    } catch (err: any) {
      setError(`Failed to import from URL: ${err.message}`);
      console.error('URL import error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (importMode === 'file') {
      importFromFile();
    } else {
      importFromUrl();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Import Chat Session</span>
        </h2>
        
        <p className="text-sm text-muted-foreground mb-4">
          Import a previously shared chat session from a file or URL.
        </p>

        <div className="space-y-4">
          {/* Import Mode Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => setImportMode('file')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                importMode === 'file'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              From File
            </button>
            <button
              onClick={() => setImportMode('url')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                importMode === 'url'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Download className="h-4 w-4 inline mr-2" />
              From URL
            </button>
          </div>

          {/* File Import */}
          {importMode === 'file' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Chat File
                </label>
                <input
                  type="file"
                  accept=".json,.gz"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20"
                />
                {file && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* URL Import */}
          {importMode === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Chat File URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/chat-file.json"
                  className="w-full p-2 border border-border rounded-lg bg-muted text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the URL of a shared chat file
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive flex items-center space-x-1">
                <XCircle className="h-4 w-4" />
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={(!file && importMode === 'file') || (!url.trim() && importMode === 'url') || isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {isLoading ? 'Importing...' : 'Import Chat Session'}
            </span>
          </button>

          {/* Help Text */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-xs font-medium mb-1">Supported Formats</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• JSON files (.json)</div>
              <div>• Compressed files (.gz)</div>
              <div>• Shared chat URLs</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
