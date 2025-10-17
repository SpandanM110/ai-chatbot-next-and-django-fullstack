'use client';

import ReactMarkdown from 'react-markdown';
import { Message as MessageType } from '@/lib/store';
import { User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

export default function Message({ message, isStreaming = false }: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn(
      'flex space-x-3',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}
      
      <div className={cn(
        'max-w-[80%] rounded-lg px-4 py-2',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
      )}>
        {isAssistant && message.content ? (
          <div className="markdown-content">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        
        {isStreaming && (
          <div className="flex items-center space-x-1 mt-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs text-muted-foreground">AI is typing...</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-4 w-4 text-secondary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
