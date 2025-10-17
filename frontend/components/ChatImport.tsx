'use client';

import { useState, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import { decompressChatMessages } from '@/lib/chatCompression';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface ChatImportProps {
  onClose: () => void;
  onImport: (sessionData: any) => void;
}

export default function ChatImport({ onClose, onImport }: ChatImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const text = await file.text();
      const chatData = JSON.parse(text);

      // Validate chat data structure
      if (!chatData.sessionId || !chatData.messages || !Array.isArray(chatData.messages)) {
        throw new Error('Invalid chat file format');
      }

      // Decompress messages
      const decompressedMessages = decompressChatMessages(chatData.messages);
      
      // Prepare session data
      const sessionData = {
        sessionId: chatData.sessionId,
        title: chatData.title || 'Imported Chat',
        messages: decompressedMessages,
        files: chatData.files || [],
        metadata: chatData.metadata || {}
      };

      onImport(sessionData);
      setImportSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Import failed:', error);
      setImportError(error instanceof Error ? error.message : 'Failed to import chat');
    } finally {
      setIsImporting(false);
    }
  };

  const handleUrlImport = async (url: string) => {
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch chat data');
      }

      const chatData = await response.json();
      
      // Validate and process the data
      if (!chatData.sessionId || !chatData.messages || !Array.isArray(chatData.messages)) {
        throw new Error('Invalid chat data format');
      }

      const decompressedMessages = decompressChatMessages(chatData.messages);
      
      const sessionData = {
        sessionId: chatData.sessionId,
        title: chatData.title || 'Shared Chat',
        messages: decompressedMessages,
        files: chatData.files || [],
        metadata: chatData.metadata || {}
      };

      onImport(sessionData);
      setImportSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('URL import failed:', error);
      setImportError(error instanceof Error ? error.message : 'Failed to import from URL');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Import Chat Session</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* File Import */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Import from File</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to select a chat export file (.json)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>

          {/* URL Import */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Import from URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="Paste shared chat URL here..."
                className="flex-1 px-3 py-2 text-sm bg-muted rounded border"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const url = (e.target as HTMLInputElement).value;
                    if (url) handleUrlImport(url);
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                  if (input.value) handleUrlImport(input.value);
                }}
                className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {isImporting && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span>Importing chat session...</span>
            </div>
          )}

          {importError && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Chat session imported successfully!</span>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground">
            <p>• Import JSON files exported from this app</p>
            <p>• Paste URLs from shared chat sessions</p>
            <p>• Continue conversations seamlessly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
