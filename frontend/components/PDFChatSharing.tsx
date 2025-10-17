'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/store';
import { downloadChatAsPDF, ChatSession } from '@/lib/pdfGenerator';
import { Download, File } from 'lucide-react';

interface PDFChatSharingProps {
  sessionId: string;
  onClose: () => void;
}

export default function PDFChatSharing({ sessionId, onClose }: PDFChatSharingProps) {
  const { messages, files, sessions } = useChatStore();
  const currentSession = sessions.find(s => s.session_id === sessionId);
  const sessionTitle = currentSession?.title || `Chat Session ${sessionId.substring(0, 8)}`;

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const chatSession: ChatSession = {
        sessionId,
        title: sessionTitle,
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        files: files || [],
        metadata: {
          exportedAt: new Date().toISOString(),
          totalMessages: messages.length,
          totalFiles: files.length
        }
      };

      await downloadChatAsPDF(chatSession);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Download className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Download Chat as PDF
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Generate a professional PDF document of your conversation
          </p>
        </div>

        <div className="space-y-6">
          {/* PDF Format Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <File className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">PDF Document</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Professional formatting with timestamps
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-600 dark:text-slate-400">Formatted messages</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-600 dark:text-slate-400">File attachments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-600 dark:text-slate-400">Print ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-600 dark:text-slate-400">Easy sharing</span>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Session Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Title</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{sessionTitle}</p>
              </div>
              <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Messages</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{messages.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Files</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{files.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Session ID</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 font-mono text-xs">{sessionId.substring(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            {isGenerating ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <File className="h-6 w-6" />
            )}
            <span className="text-lg">
              {isGenerating ? 'Generating PDF...' : 'Download PDF'}
            </span>
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
