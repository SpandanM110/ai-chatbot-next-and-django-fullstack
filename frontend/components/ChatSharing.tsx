'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/store';
import { createChatExport, getCompressionStats } from '@/lib/chatCompression';
// import { UploadButton } from '@/lib/uploadthing';
import { Share2, Download, Link, Copy, CheckCircle, Loader2 } from 'lucide-react';

interface ChatSharingProps {
  sessionId: string;
  onClose: () => void;
}

export default function ChatSharing({ sessionId, onClose }: ChatSharingProps) {
  const { messages, files } = useChatStore();
  const [isExporting, setIsExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [compressionStats, setCompressionStats] = useState<any>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Create chat export
      const chatExport = createChatExport(
        sessionId,
        `Chat Session ${new Date().toLocaleDateString()}`,
        messages,
        files
      );

      // Calculate compression stats
      const stats = getCompressionStats(messages, chatExport.messages);
      setCompressionStats(stats);

      // Convert to JSON blob
      const jsonData = JSON.stringify(chatExport, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-session-${sessionId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async (fileUrl: string) => {
    try {
      // Create a shareable URL
      const shareableUrl = `${window.location.origin}/chat/shared?url=${encodeURIComponent(fileUrl)}`;
      setShareUrl(shareableUrl);
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share Chat Session</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Compression Stats */}
          {compressionStats && (
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Compression Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Original: {(compressionStats.originalSize / 1024).toFixed(1)} KB</div>
                <div>Compressed: {(compressionStats.compressedSize / 1024).toFixed(1)} KB</div>
                <div>Savings: {(compressionStats.savings / 1024).toFixed(1)} KB</div>
                <div>Ratio: {compressionStats.compressionRatio}%</div>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>Export Chat Session</span>
            </button>

            <div className="text-center text-sm text-muted-foreground">
              or
            </div>

            <button
              onClick={() => {
                // For now, just show a message that cloud upload is coming soon
                alert('Cloud upload feature coming soon! Use the export button for now.');
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
            >
              <Share2 className="h-4 w-4" />
              <span>Upload to Cloud (Coming Soon)</span>
            </button>
          </div>

          {/* Share URL */}
          {shareUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Shareable Link</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs bg-muted rounded border"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground">
            <p>• Export: Download chat as JSON file</p>
            <p>• Upload: Share via cloud link</p>
            <p>• Recipients can import and continue the chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}
