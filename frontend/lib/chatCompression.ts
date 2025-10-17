/**
 * Chat compression utilities for real-time compression and sharing
 */

export interface CompressedChatSession {
  id: string;
  title: string;
  messages: CompressedMessage[];
  metadata: {
    compressedAt: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
}

export interface CompressedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  compressed?: boolean;
}

export interface ChatExport {
  sessionId: string;
  title: string;
  messages: CompressedMessage[];
  files: Array<{
    id: number;
    name: string;
    type: string;
    content: string;
  }>;
  metadata: {
    exportedAt: string;
    version: string;
    compressionRatio: number;
  };
}

/**
 * Compress chat messages by removing redundant information
 */
export function compressChatMessages(messages: any[]): CompressedMessage[] {
  return messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    compressed: true
  }));
}

/**
 * Create a compressed chat session
 */
export function createCompressedSession(
  sessionId: string,
  title: string,
  messages: any[],
  files: any[] = []
): CompressedChatSession {
  const originalSize = JSON.stringify(messages).length;
  const compressedMessages = compressChatMessages(messages);
  const compressedSize = JSON.stringify(compressedMessages).length;
  
  return {
    id: sessionId,
    title,
    messages: compressedMessages,
    metadata: {
      compressedAt: new Date().toISOString(),
      originalSize,
      compressedSize,
      compressionRatio: Math.round((1 - compressedSize / originalSize) * 100)
    }
  };
}

/**
 * Create a shareable chat export
 */
export function createChatExport(
  sessionId: string,
  title: string,
  messages: any[],
  files: any[] = []
): ChatExport {
  const compressedMessages = compressChatMessages(messages);
  const originalSize = JSON.stringify(messages).length;
  const compressedSize = JSON.stringify(compressedMessages).length;
  
  return {
    sessionId,
    title,
    messages: compressedMessages,
    files: files.map(file => ({
      id: file.id,
      name: file.original_name,
      type: file.file_type,
      content: file.parsed_content.substring(0, 2000) // Limit file content for sharing
    })),
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      compressionRatio: Math.round((1 - compressedSize / originalSize) * 100)
    }
  };
}

/**
 * Decompress chat messages
 */
export function decompressChatMessages(compressedMessages: CompressedMessage[]): any[] {
  return compressedMessages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp)
  }));
}

/**
 * Get compression statistics
 */
export function getCompressionStats(original: any[], compressed: any[]): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  savings: number;
} {
  const originalSize = JSON.stringify(original).length;
  const compressedSize = JSON.stringify(compressed).length;
  const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
  const savings = originalSize - compressedSize;
  
  return {
    originalSize,
    compressedSize,
    compressionRatio,
    savings
  };
}

/**
 * Create a compressed file for upload to UploadThing
 */
export function createCompressedFile(
  sessionId: string,
  title: string,
  messages: any[],
  files: any[] = []
): File {
  const chatExport = createChatExport(sessionId, title, messages, files);
  const jsonString = JSON.stringify(chatExport, null, 2);
  
  // Create a compressed file
  const blob = new Blob([jsonString], { type: 'application/json' });
  const fileName = `chat_${sessionId.substring(0, 8)}_${Date.now()}.json`;
  
  return new File([blob], fileName, { type: 'application/json' });
}

/**
 * Create a gzipped file for maximum compression
 */
export async function createGzippedFile(
  sessionId: string,
  title: string,
  messages: any[],
  files: any[] = []
): Promise<File> {
  const chatExport = createChatExport(sessionId, title, messages, files);
  const jsonString = JSON.stringify(chatExport, null, 2);
  
  // Use the Compression Streams API if available
  if ('CompressionStream' in window) {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    // Write data to stream
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    await writer.write(data);
    await writer.close();
    
    // Read compressed data
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }
    
    // Combine chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    const fileName = `chat_${sessionId.substring(0, 8)}_${Date.now()}.json.gz`;
    return new File([result], fileName, { type: 'application/gzip' });
  } else {
    // Fallback to regular JSON file
    return createCompressedFile(sessionId, title, messages, files);
  }
}

/**
 * Parse a shared chat file
 */
export function parseSharedChatFile(file: File): Promise<ChatExport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const chatExport = JSON.parse(content);
        
        // Validate the file structure
        if (!chatExport.sessionId || !chatExport.messages) {
          throw new Error('Invalid chat file format');
        }
        
        resolve(chatExport);
      } catch (error) {
        reject(new Error(`Failed to parse chat file: ${error}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
