import os
import csv
import PyPDF2
from docx import Document
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile


def parse_pdf(file_path):
    """Parse PDF file and extract text using PyPDF2"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error parsing PDF: {str(e)}")


def parse_docx(file_path):
    """Parse DOCX file and extract text"""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error parsing DOCX: {str(e)}")


def parse_csv(file_path):
    """Parse CSV file and extract text"""
    try:
        text = ""
        with open(file_path, 'r', encoding='utf-8', newline='') as file:
            csv_reader = csv.reader(file)
            for row in csv_reader:
                text += ", ".join(row) + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error parsing CSV: {str(e)}")


def parse_txt(file_path):
    """Parse TXT file and extract text"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        raise Exception(f"Error parsing TXT: {str(e)}")


def get_file_type(filename):
    """Get file type from filename"""
    _, ext = os.path.splitext(filename.lower())
    return ext[1:] if ext else 'unknown'


def parse_file(file_path, filename):
    """Parse file based on its type"""
    file_type = get_file_type(filename)
    
    if file_type == 'pdf':
        return parse_pdf(file_path)
    elif file_type == 'docx':
        return parse_docx(file_path)
    elif file_type == 'csv':
        return parse_csv(file_path)
    elif file_type == 'txt':
        return parse_txt(file_path)
    else:
        raise Exception(f"Unsupported file type: {file_type}")


def save_uploaded_file(uploaded_file):
    """Save uploaded file and return the path"""
    file_name = default_storage.save(uploaded_file.name, ContentFile(uploaded_file.read()))
    return default_storage.path(file_name)
