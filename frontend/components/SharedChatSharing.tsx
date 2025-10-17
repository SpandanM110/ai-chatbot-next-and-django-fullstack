'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/store';
import { Share2, Download, Link, Copy, CheckCircle, Loader2, Clock, Users } from 'lucide-react';

interface SharedChatSharingProps {
  sessionId: string;
  onClose: () => void;
}

export default function SharedChatSharing({ sessionId, onClose }: SharedChatSharingProps) {
  const { messages } = useChatStore();
  const [isCreating, setIsCreating] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    title: `Chat Session ${new Date().toLocaleDateString()}`,
    allowEditing: false,
    expiresHours: 24
  });

  const handleCreateSharedSession = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:8000/api/chat/shared/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          title: settings.title,
          allow_editing: settings.allowEditing,
          expires_hours: settings.expiresHours
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareData(data);
      } else {
        const error = await response.json();
        alert(`Failed to create shared session: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create shared session:', error);
      alert('Failed to create shared session. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadPDF = () => {
    if (shareData?.pdf_url) {
      window.open(`http://localhost:8000${shareData.pdf_url}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share Chat Session</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        {!shareData ? (
          <div className="space-y-4">
            {/* Settings */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Session Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({...settings, title: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-muted rounded border"
                  placeholder="Enter session title"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowEditing"
                  checked={settings.allowEditing}
                  onChange={(e) => setSettings({...settings, allowEditing: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="allowEditing" className="text-sm">
                  Allow others to add messages
                </label>
              </div>

              <div>
                <label className="text-sm font-medium">Expires in (hours)</label>
                <select
                  value={settings.expiresHours}
                  onChange={(e) => setSettings({...settings, expiresHours: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 text-sm bg-muted rounded border"
                >
                  <option value={1}>1 hour</option>
                  <option value={24}>24 hours</option>
                  <option value={168}>1 week</option>
                  <option value={720}>1 month</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateSharedSession}
              disabled={isCreating}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              <span>{isCreating ? 'Creating...' : 'Create Shared Link'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Shared session created successfully!</span>
            </div>

            {/* Share URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Shareable Link</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareData.share_url}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded border"
                />
                <button
                  onClick={() => copyToClipboard(shareData.share_url)}
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

            {/* PDF Download */}
            <div className="space-y-2">
              <label className="text-sm font-medium">PDF Download</label>
              <button
                onClick={downloadPDF}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>

            {/* Session Info */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Expires: {shareData.expires_at ? new Date(shareData.expires_at).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Access Count: {shareData.access_count || 0}</span>
              </div>
            </div>

            {/* Features */}
            <div className="text-xs text-muted-foreground">
              <p>• Real-time sync: Link updates with new messages</p>
              <p>• PDF generation: Download complete chat history</p>
              <p>• Access tracking: Monitor who views your chat</p>
              {settings.allowEditing && <p>• Collaborative: Others can add messages</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
