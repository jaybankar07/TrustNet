from django.urls import path
from .views import (
    PostListCreateView, PostDetailView, toggle_like, 
    CommentListCreateView, repost, trending_hashtags
)

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post-list'),
    path('posts/<uuid:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<uuid:pk>/like/', toggle_like, name='post-like'),
    path('posts/<uuid:pk>/repost/', repost, name='post-repost'),
    path('posts/<uuid:pk>/comments/', CommentListCreateView.as_view(), name='post-comments'),
    path('trending/', trending_hashtags, name='trending'),
]
