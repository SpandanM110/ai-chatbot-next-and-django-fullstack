import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface ParsedFile {
  id: number;
  original_name: string;
  file_type: string;
  file_size: number;
  parsed_content: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface ChatStore {
  // Current session
  currentSessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // Sessions
  sessions: ChatSession[];
  
  // Files
  files: ParsedFile[];
  
  // Actions
  setCurrentSession: (sessionId: string | null) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, content: string) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setFiles: (files: ParsedFile[]) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // State
  currentSessionId: null,
  messages: [],
  isLoading: false,
  error: null,
  sessions: [],
  files: [],

  // Actions
  setCurrentSession: (sessionId) => {
    set({ currentSessionId: sessionId });
    // If switching to a new session, clear current messages
    if (sessionId) {
      set({ messages: [] });
    }
  },
  
  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  updateMessage: (id, content) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content: content } : msg
      ),
    }));
  },

  setMessages: (messages) => set({ messages }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setSessions: (sessions) => set({ sessions }),
  
  setFiles: (files) => set({ files }),
  
  clearChat: () => set({ messages: [], currentSessionId: null, error: null }),
}));
