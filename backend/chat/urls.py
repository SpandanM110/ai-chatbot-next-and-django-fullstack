from django.urls import path
from . import views, export_views, shared_views

urlpatterns = [
    path('', views.chat, name='chat'),
    path('session/<str:session_id>/', views.get_session, name='get_session'),
    path('sessions/', views.get_sessions, name='get_sessions'),
    path('session/<str:session_id>/delete/', views.delete_session, name='delete_session'),
    path('export/', export_views.export_chat_session, name='export_chat_session'),
    path('import/', export_views.import_chat_session, name='import_chat_session'),
    path('export-info/', export_views.get_export_info, name='get_export_info'),
    # Shared session URLs
    path('shared/create/', shared_views.create_shared_session, name='create_shared_session'),
    path('shared/<str:share_token>/', shared_views.get_shared_session, name='get_shared_session'),
    path('shared/<str:share_token>/pdf/', shared_views.get_shared_pdf, name='get_shared_pdf'),
    path('shared/<str:share_token>/add-message/', shared_views.add_message_to_shared, name='add_message_to_shared'),
    path('shared/<str:share_token>/info/', shared_views.get_shared_session_info, name='get_shared_session_info'),
]
