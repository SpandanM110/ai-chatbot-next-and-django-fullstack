'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { chatApi } from '@/lib/api';
import Message from './Message';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInterface() {
  const {
    messages,
    isLoading,
    error,
    currentSessionId,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    setCurrentSession,
    setSessions,
  } = useChatStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setLoading(true);

    try {
      // Send to API with streaming
      const response = await chatApi.sendMessage(
        userMessage,
        currentSessionId || undefined,
        true // Enable streaming
      );

      // Handle streaming response
      if (response && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
        let assistantMessageId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  // Create assistant message on first content
                  if (!assistantMessageId) {
                    assistantMessageId = Date.now().toString();
                    addMessage({
                      role: 'assistant',
                      content: data.content,
                    });
                    setStreamingMessageId(assistantMessageId);
                  } else {
                    // Update existing assistant message with accumulated content
                    assistantContent += data.content;
                    updateMessage(assistantMessageId, assistantContent);
                  }
                }
              } catch (e) {
                // Ignore parsing errors for non-JSON lines
              }
            }
          }
        }

        // Set session ID if this is a new session
        if (!currentSessionId) {
          // Generate a new session ID for the frontend
          const newSessionId = Date.now().toString();
          setCurrentSession(newSessionId);
          
          // Refresh sessions list to include the new session
          try {
            const updatedSessions = await chatApi.getSessions();
            setSessions(updatedSessions);
          } catch (error) {
            console.error('Failed to refresh sessions:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-border/50 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Send className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">AI Chatbot</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Intelligent conversations with file support
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="h-10 w-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">
                Start a conversation
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Ask me anything or upload a file to get started. I can help with analysis, questions, and more!
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">💬 Chat</div>
                  <div className="text-slate-500 dark:text-slate-400">Ask questions</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">📄 Files</div>
                  <div className="text-slate-500 dark:text-slate-400">Upload documents</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                isStreaming={streamingMessageId === message.id}
              />
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-lg">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full min-h-[60px] max-h-[120px] p-4 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 shadow-sm"
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-slate-400">
              Press Enter to send
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
