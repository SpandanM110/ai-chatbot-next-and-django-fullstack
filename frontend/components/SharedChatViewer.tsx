'use client';

import { useState, useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { Download, RefreshCw, Loader2, AlertCircle, Clock, Users } from 'lucide-react';
import Message from './Message';

interface SharedChatViewerProps {
  shareToken: string;
}

export default function SharedChatViewer({ shareToken }: SharedChatViewerProps) {
  const { setMessages, setCurrentSession } = useChatStore();
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSharedSession = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/chat/shared/${shareToken}/`);
      
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
        setMessages(data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        })));
        setCurrentSession(data.session_id);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load shared session');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshSession = async () => {
    setIsRefreshing(true);
    await loadSharedSession();
  };

  const downloadPDF = () => {
    if (sessionData?.pdf_url) {
      window.open(`http://localhost:8000${sessionData.pdf_url}`, '_blank');
    }
  };

  useEffect(() => {
    loadSharedSession();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSharedSession, 30000);
    return () => clearInterval(interval);
  }, [shareToken]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Chat</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Header */}
      <div className="w-full flex flex-col">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{sessionData?.title}</h1>
              <p className="text-sm text-muted-foreground">
                Shared Chat • Last synced: {sessionData?.last_synced ? new Date(sessionData.last_synced).toLocaleString() : 'Unknown'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshSession}
                disabled={isRefreshing}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Refresh</span>
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
          
          {/* Session Info */}
          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{sessionData?.access_count || 0} views</span>
            </div>
            {sessionData?.expires_at && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Expires: {new Date(sessionData.expires_at).toLocaleString()}</span>
              </div>
            )}
            {sessionData?.is_editable && (
              <span className="text-green-600">Collaborative</span>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {sessionData?.messages?.map((message: any) => (
              <Message
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role,
                  content: message.content,
                  timestamp: new Date(message.timestamp)
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="text-center text-xs text-muted-foreground">
            <p>This is a shared chat session. Messages sync in real-time.</p>
            <p>Last updated: {sessionData?.last_synced ? new Date(sessionData.last_synced).toLocaleString() : 'Unknown'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
