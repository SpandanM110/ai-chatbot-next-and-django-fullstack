'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { chatApi, fileApi } from '@/lib/api';
import ChatInterface from '@/components/ChatInterface';
import SessionManager from '@/components/SessionManager';
import FileUploader from '@/components/FileUploader';
import Footer from '@/components/Footer';

export default function Home() {
  const { setSessions, setFiles } = useChatStore();

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        const [sessions, files] = await Promise.all([
          chatApi.getSessions(),
          fileApi.getFiles(),
        ]);
        setSessions(sessions);
        setFiles(files);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadData();
  }, [setSessions, setFiles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <div className="flex flex-1 min-h-0">
        <SessionManager />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex min-h-0">
            <div className="flex-1">
              <ChatInterface />
            </div>
            <div className="w-80 border-l border-border/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 shadow-lg">
              <FileUploader />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
