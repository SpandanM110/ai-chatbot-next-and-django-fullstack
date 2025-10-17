'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/lib/store';
import { chatApi } from '@/lib/api';
import { Plus, MessageSquare, Trash2, History, Loader2, Share2, Upload } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import PDFChatSharing from './PDFChatSharing';
import RobustChatImport from './RobustChatImport';

export default function SessionManager() {
  const {
    sessions,
    currentSessionId,
    setCurrentSession,
    setMessages,
    setSessions,
    clearChat,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsRefreshing(true);
    try {
      const sessionsData = await chatApi.getSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleImportSession = (sessionData: any) => {
    // Set the imported session as current
    setCurrentSession(sessionData.sessionId);
    setMessages(sessionData.messages);
    setFiles(sessionData.files);
    
    // Add to sessions list if not already present
    const existingSession = sessions.find(s => s.session_id === sessionData.sessionId);
    if (!existingSession) {
      setSessions([...sessions, {
        session_id: sessionData.sessionId,
        title: sessionData.title,
        created_at: sessionData.metadata?.exportedAt || new Date().toISOString(),
        updated_at: sessionData.metadata?.exportedAt || new Date().toISOString()
      }]);
    }
  };

  return (
    <div className="w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-r border-border/50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Chatbot</h1>
            <p className="text-sm text-blue-100">
              Intelligent Conversations
            </p>
          </div>
        </div>
        
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-white/50 dark:bg-slate-800/50 border-b border-border/50">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowSharing(true)}
            disabled={!currentSessionId}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md font-medium"
          >
            <Share2 className="h-4 w-4" />
            <span>Download</span>
          </button>
          
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 text-sm bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-md font-medium"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white/30 to-white/10 dark:from-slate-800/30 dark:to-slate-800/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <History className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Chat History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sessions.length} conversations
              </p>
            </div>
          </div>
          <button
            onClick={loadSessions}
            disabled={isRefreshing}
            className="p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 shadow-sm"
            title="Refresh sessions"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <History className="h-4 w-4 text-slate-500 hover:text-blue-500 transition-colors" />
            )}
          </button>
        </div>
        
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              No conversations yet
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Start a new chat to see your history here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className={`group relative flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentSessionId === session.session_id
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 shadow-lg'
                    : 'hover:bg-white/60 dark:hover:bg-slate-700/60 hover:shadow-md'
                }`}
                onClick={() => handleSelectSession(session.session_id)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentSessionId === session.session_id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300'
                }`}>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-300">
                    {session.title || `Chat ${session.session_id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(session.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.session_id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            AI Chatbot v2.0
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 text-center mt-1">
          Powered by Groq LLM
        </p>
      </div>

      {/* Modals */}
      {showSharing && currentSessionId && (
        <PDFChatSharing
          sessionId={currentSessionId}
          onClose={() => setShowSharing(false)}
        />
      )}

      {showImport && (
        <RobustChatImport
          onClose={() => setShowImport(false)}
          onImport={handleImportSession}
        />
      )}
    </div>
  );
}
