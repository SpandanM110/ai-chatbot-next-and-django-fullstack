'use client';

import { useState } from 'react';
import { useChatStore } from '@/lib/store';
import { chatApi } from '@/lib/api';
import { Plus, MessageSquare, Trash2, History } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Sidebar() {
  const {
    sessions,
    currentSessionId,
    setCurrentSession,
    setMessages,
    setSessions,
    clearChat,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = () => {
    clearChat();
    setCurrentSession(null);
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;

    setIsLoading(true);
    try {
      const session = await chatApi.getSession(sessionId);
      setCurrentSession(sessionId);
      
      // Convert backend messages to frontend format
      const frontendMessages = (session.messages || []).map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));
      
      setMessages(frontendMessages);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await chatApi.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.session_id !== sessionId));
      
      if (currentSessionId === sessionId) {
        clearChat();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return (
    <div className="w-64 bg-muted/30 border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center space-x-2 mb-4">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Chat History</h3>
        </div>
        
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No chat history yet
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className={`group flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  currentSessionId === session.session_id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleSelectSession(session.session_id)}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.title || `Chat ${session.session_id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(session.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.session_id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          AI Chatbot with File Support
        </p>
      </div>
    </div>
  );
}
