"""
File analysis utilities for LLM integration
"""

def analyze_file_content(file_content, file_name, file_type):
    """
    Analyze file content and provide insights
    """
    analysis = {
        'file_name': file_name,
        'file_type': file_type,
        'content_length': len(file_content),
        'insights': []
    }
    
    # Basic content analysis
    if file_type == 'pdf':
        analysis['insights'].append("PDF document with text content")
        if 'resume' in file_name.lower() or 'cv' in file_name.lower():
            analysis['insights'].append("Appears to be a resume/CV document")
        if '@' in file_content:
            analysis['insights'].append("Contains email addresses")
        if 'http' in file_content or 'www.' in file_content:
            analysis['insights'].append("Contains web links")
    
    elif file_type == 'docx':
        analysis['insights'].append("Word document with formatted text")
    
    elif file_type == 'csv':
        analysis['insights'].append("Spreadsheet data")
        lines = file_content.split('\n')
        if len(lines) > 1:
            analysis['insights'].append(f"Contains {len(lines)} rows of data")
    
    elif file_type == 'txt':
        analysis['insights'].append("Plain text document")
    
    # Content-specific insights
    if len(file_content) > 1000:
        analysis['insights'].append("Large document with substantial content")
    
    if any(keyword in file_content.lower() for keyword in ['python', 'javascript', 'java', 'c++', 'programming']):
        analysis['insights'].append("Contains programming/technical content")
    
    if any(keyword in file_content.lower() for keyword in ['experience', 'skills', 'education', 'work']):
        analysis['insights'].append("Contains professional/educational information")
    
    return analysis

def get_file_summary(file_content, max_length=500):
    """
    Get a concise summary of file content
    """
    if len(file_content) <= max_length:
        return file_content
    
    # Try to get the first meaningful part
    lines = file_content.split('\n')
    summary_lines = []
    current_length = 0
    
    for line in lines:
        if current_length + len(line) > max_length:
            break
        summary_lines.append(line)
        current_length += len(line)
    
    summary = '\n'.join(summary_lines)
    if len(file_content) > max_length:
        summary += f"\n\n[Content truncated - showing first {len(summary)} characters of {len(file_content)} total]"
    
    return summary
