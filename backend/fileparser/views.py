import os
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import ParsedFile
from .serializers import ParsedFileSerializer, FileUploadSerializer
from .utils import parse_file, get_file_type, save_uploaded_file


@api_view(['POST'])
@permission_classes([AllowAny])
def upload_file(request):
    """Handle file upload and parsing"""
    serializer = FileUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    uploaded_file = serializer.validated_data['file']
    description = serializer.validated_data.get('description', '')

    # Validate file size (10MB limit)
    if uploaded_file.size > 10 * 1024 * 1024:
        return Response(
            {'error': 'File size exceeds 10MB limit'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate file type
    file_type = get_file_type(uploaded_file.name)
    supported_types = ['pdf', 'docx', 'csv', 'txt']
    if file_type not in supported_types:
        return Response(
            {'error': f'Unsupported file type. Supported types: {", ".join(supported_types)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Save file temporarily
        file_path = save_uploaded_file(uploaded_file)
        
        # Parse file content
        parsed_content = parse_file(file_path, uploaded_file.name)
        
        # Analyze file content
        from .analysis import analyze_file_content, get_file_summary
        analysis = analyze_file_content(parsed_content, uploaded_file.name, file_type)
        file_summary = get_file_summary(parsed_content)
        
        # Create ParsedFile record with analysis
        parsed_file = ParsedFile.objects.create(
            original_name=uploaded_file.name,
            file_path=file_path,
            file_type=file_type,
            file_size=uploaded_file.size,
            parsed_content=parsed_content,
            metadata={
                'description': description,
                'upload_size': uploaded_file.size,
                'analysis': analysis,
                'summary': file_summary,
                'insights': analysis['insights']
            }
        )

        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

        serializer = ParsedFileSerializer(parsed_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        # Clean up file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        
        return Response(
            {'error': f'Failed to parse file: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_files(request):
    """Get all parsed files"""
    files = ParsedFile.objects.all()
    serializer = ParsedFileSerializer(files, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_file(request, file_id):
    """Get specific parsed file"""
    try:
        file_obj = ParsedFile.objects.get(id=file_id)
        serializer = ParsedFileSerializer(file_obj)
        return Response(serializer.data)
    except ParsedFile.DoesNotExist:
        return Response(
            {'error': 'File not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_file(request, file_id):
    """Delete parsed file"""
    try:
        file_obj = ParsedFile.objects.get(id=file_id)
        file_obj.delete()
        return Response({'message': 'File deleted successfully'})
    except ParsedFile.DoesNotExist:
        return Response(
            {'error': 'File not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def search_files(request):
    """Search files by content"""
    query = request.data.get('query', '')
    if not query:
        return Response(
            {'error': 'Query parameter is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Simple text search in parsed content
    files = ParsedFile.objects.filter(parsed_content__icontains=query)
    serializer = ParsedFileSerializer(files, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_files_for_llm(request):
    """Get files formatted for LLM context"""
    files = ParsedFile.objects.all().order_by('-created_at')[:5]
    
    llm_context = []
    for file in files:
        context_item = {
            'id': file.id,
            'name': file.original_name,
            'type': file.file_type,
            'summary': file.metadata.get('summary', file.parsed_content[:500]),
            'insights': file.metadata.get('insights', []),
            'content_preview': file.parsed_content[:1000]  # First 1000 chars for context
        }
        llm_context.append(context_item)
    
    return Response({
        'files': llm_context,
        'total_files': len(llm_context)
    })
