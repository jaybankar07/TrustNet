from rest_framework import serializers
from accounts.serializers import PublicUserSerializer
from .models import Post, Like, Comment


class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    original_post = serializers.SerializerMethodField()
    media_url = serializers.SerializerMethodField()

    def get_media_url(self, obj):
        if not obj.media_file:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.media_file.url)
        return obj.media_file.url

    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'media_url', 'post_type', 'poll_data',
                  'is_repost', 'original_post', 'likes_count',
                  'comments_count', 'is_liked', 'created_at']
        read_only_fields = ['id', 'user', 'likes_count', 'created_at']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_original_post(self, obj):
        if obj.original_post:
            return PostSerializer(obj.original_post, context=self.context).data
        return None

    def get_comments_count(self, obj):
        return obj.comments.count()


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'media_file', 'post_type', 'poll_data']
