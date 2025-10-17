'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatStore } from '@/lib/store';
import { decompressChatMessages } from '@/lib/chatCompression';
import ChatInterface from '@/components/ChatInterface';
import SessionManager from '@/components/SessionManager';
import FileUploader from '@/components/FileUploader';
import { Loader2, AlertCircle } from 'lucide-react';

export default function SharedChatPage() {
  const searchParams = useSearchParams();
  const { setMessages, setFiles, setCurrentSession } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const loadSharedChat = async () => {
      const url = searchParams.get('url');
      if (!url) {
        setError('No chat URL provided');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the shared chat data
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to load shared chat');
        }

        const chatData = await response.json();
        
        // Validate the data structure
        if (!chatData.sessionId || !chatData.messages || !Array.isArray(chatData.messages)) {
          throw new Error('Invalid chat data format');
        }

        // Decompress messages
        const decompressedMessages = decompressChatMessages(chatData.messages);
        
        // Set up the session
        setSessionData(chatData);
        setCurrentSession(chatData.sessionId);
        setMessages(decompressedMessages);
        setFiles(chatData.files || []);

      } catch (err) {
        console.error('Failed to load shared chat:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedChat();
  }, [searchParams, setMessages, setFiles, setCurrentSession]);

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
      <SessionManager />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          <div className="flex-1">
            <ChatInterface />
          </div>
          <div className="w-80 border-l border-border bg-muted/30 p-4">
            <FileUploader />
          </div>
        </div>
      </div>
    </div>
  );
}
