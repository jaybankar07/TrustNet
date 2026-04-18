from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsVerifiedUser, IsOwnerOrAdmin
from core.trust_service import calculate_user_trust_score
from .models import Post, Like, Comment
from .serializers import PostSerializer, PostCreateSerializer, CommentSerializer


class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.select_related('user').prefetch_related('likes', 'comments').order_by('-created_at')
    search_fields = ['content']
    ordering_fields = ['created_at', 'likes_count']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsVerifiedUser()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        calculate_user_trust_score(self.request.user)


class PostDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    queryset = Post.objects.select_related('user')

    def get_serializer_context(self):
        return {'request': self.request}


@api_view(['POST'])
@permission_classes([IsVerifiedUser])
def toggle_like(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Post not found.'}, status=404)

    like, created = Like.objects.get_or_create(user=request.user, post=post)
    if not created:
        like.delete()
        post.likes_count = max(0, post.likes_count - 1)
        post.save(update_fields=['likes_count'])
        return Response({'liked': False, 'likes_count': post.likes_count})

    post.likes_count += 1
    post.save(update_fields=['likes_count'])
    return Response({'liked': True, 'likes_count': post.likes_count})


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsVerifiedUser]

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs['pk']).select_related('user')

    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs['pk'])
        serializer.save(user=self.request.user, post=post)


@api_view(['POST'])
@permission_classes([IsVerifiedUser])
def repost(request, pk):
    try:
        original = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Post not found.'}, status=404)
    
    # Check if already reposted
    existing = Post.objects.filter(user=request.user, original_post=original, is_repost=True).first()
    if existing:
        existing.delete()
        return Response({'reposted': False})
    
    Post.objects.create(
        user=request.user,
        content=original.content, # Shadow content
        original_post=original,
        is_repost=True,
        post_type=original.post_type
    )
    return Response({'reposted': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trending_hashtags(request):
    import re
    from collections import Counter
    from django.utils import timezone
    from datetime import timedelta
    
    last_week = timezone.now() - timedelta(days=7)
    posts = Post.objects.filter(created_at__gte=last_week).values_list('content', flat=True)
    
    hashtags = []
    for content in posts:
        hashtags.extend(re.findall(r'#\w+', content.lower()))
    
    counts = Counter(hashtags).most_common(10)
    return Response([{'hashtag': h, 'count': c} for h, c in counts])
