from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_file, name='upload_file'),
    path('', views.get_files, name='get_files'),
    path('<int:file_id>/', views.get_file, name='get_file'),
    path('<int:file_id>/delete/', views.delete_file, name='delete_file'),
    path('search/', views.search_files, name='search_files'),
    path('llm-context/', views.get_files_for_llm, name='get_files_for_llm'),
]
