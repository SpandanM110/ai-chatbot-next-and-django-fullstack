'use client';

import { MessageSquare, FileText, Download, Github, Twitter, Mail, Heart, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">AI Chatbot</h3>
                <p className="text-xs text-slate-300">v2.0</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Intelligent conversations powered by Groq LLM. Upload files, ask questions, and get AI-powered responses.
            </p>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white">Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <MessageSquare className="h-3 w-3" />
                <span>AI Conversations</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <FileText className="h-3 w-3" />
                <span>File Analysis</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <Download className="h-3 w-3" />
                <span>PDF Export</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <Zap className="h-3 w-3" />
                <span>Real-time Chat</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack & Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white">Technology</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Next.js 15</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Django 5</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Groq LLM</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>TypeScript</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>© 2025 AI Chatbot</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-400">
                <span>Powered by</span>
                <span className="font-semibold text-blue-400">Groq LLM</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <span>Built with</span>
                <span className="font-semibold text-green-400">Next.js</span>
                <span>&</span>
                <span className="font-semibold text-blue-400">Django</span>
              </div>
            </div>
          </div>

          {/* Made with Love */}
          <div className="text-center mt-4">
            <p className="text-xs text-slate-500 flex items-center justify-center space-x-1">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
              <span>for intelligent conversations</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
