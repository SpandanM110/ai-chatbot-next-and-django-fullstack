/**
 * PDF Generation Utilities for Chat Sessions
 * Creates professional PDF documents from chat data
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string;
  title: string;
  messages: ChatMessage[];
  files: any[];
  metadata?: {
    exportedAt: string;
    totalMessages: number;
    totalFiles: number;
  };
}

export function generateChatPDF(session: ChatSession): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Create HTML content for the PDF
      const htmlContent = createHTMLContent(session);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        reject(new Error('Could not open print window'));
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        // Trigger print dialog
        printWindow.print();
        
        // Close the window after a short delay
        setTimeout(() => {
          printWindow.close();
        }, 1000);
        
        resolve(new Blob([htmlContent], { type: 'text/html' }));
      };
    } catch (error) {
      reject(error);
    }
  });
}

function createHTMLContent(session: ChatSession): string {
  const messages = session.messages.map(msg => ({
    ...msg,
    formattedTime: new Date(msg.timestamp).toLocaleString(),
    content: msg.content.replace(/\n/g, '<br>')
  }));

  const files = session.files || [];
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Session: ${session.title}</title>
    <style>
        @page {
            margin: 1in;
            size: A4;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
        }
        
        .header .subtitle {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 14px;
        }
        
        .session-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #007bff;
        }
        
        .session-info h3 {
            margin: 0 0 10px 0;
            color: #007bff;
            font-size: 16px;
        }
        
        .session-info p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        
        .message {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ddd;
        }
        
        .message.user {
            background: #e3f2fd;
            border-left-color: #2196f3;
        }
        
        .message.assistant {
            background: #f3e5f5;
            border-left-color: #9c27b0;
        }
        
        .message.system {
            background: #fff3e0;
            border-left-color: #ff9800;
        }
        
        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .message-role {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            color: #666;
        }
        
        .message-time {
            font-size: 12px;
            color: #999;
        }
        
        .message-content {
            font-size: 14px;
            line-height: 1.5;
        }
        
        .files-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        
        .files-section h3 {
            color: #007bff;
            margin-bottom: 15px;
        }
        
        .file-item {
            background: #f8f9fa;
            padding: 10px;
            margin: 5px 0;
            border-radius: 4px;
            border-left: 3px solid #007bff;
        }
        
        .file-name {
            font-weight: bold;
            color: #007bff;
        }
        
        .file-type {
            color: #666;
            font-size: 12px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .message {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Chat Session</h1>
        <p class="subtitle">${session.title}</p>
    </div>
    
    <div class="session-info">
        <h3>Session Information</h3>
        <p><strong>Session ID:</strong> ${session.sessionId}</p>
        <p><strong>Total Messages:</strong> ${session.messages.length}</p>
        <p><strong>Total Files:</strong> ${files.length}</p>
        <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="messages">
        ${messages.map(msg => `
            <div class="message ${msg.role}">
                <div class="message-header">
                    <span class="message-role">${msg.role}</span>
                    <span class="message-time">${msg.formattedTime}</span>
                </div>
                <div class="message-content">${msg.content}</div>
            </div>
        `).join('')}
    </div>
    
    ${files.length > 0 ? `
        <div class="files-section">
            <h3>Attached Files</h3>
            ${files.map(file => `
                <div class="file-item">
                    <div class="file-name">${file.original_name || file.name}</div>
                    <div class="file-type">${file.file_type || file.type}</div>
                </div>
            `).join('')}
        </div>
    ` : ''}
    
    <div class="footer">
        <p>Generated by AI Chatbot • ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`;
}

export function downloadChatAsPDF(session: ChatSession): void {
  generateChatPDF(session)
    .then(() => {
      console.log('PDF generated successfully');
    })
    .catch((error) => {
      console.error('Error generating PDF:', error);
      // Fallback to HTML download
      downloadChatAsHTML(session);
    });
}

// Fallback to HTML download if PDF generation fails
export function downloadChatAsHTML(session: ChatSession): void {
  const htmlContent = createHTMLContent(session);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat_${session.sessionId.substring(0, 8)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
