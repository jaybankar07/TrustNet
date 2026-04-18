import uuid
from django.db import models
from django.conf import settings


class Post(models.Model):
    POST_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('poll', 'Poll'),
        ('event', 'Event'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts'
    )
    content = models.TextField()
    media_file = models.FileField(upload_to='feed_media/', blank=True, null=True)
    post_type = models.CharField(max_length=10, choices=POST_TYPES, default='text')
    poll_data = models.JSONField(blank=True, null=True)  # {options: [{text: str, votes: int}]}
    
    # Repost logic
    original_post = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='reposts'
    )
    is_repost = models.BooleanField(default=False)
    
    likes_count = models.PositiveIntegerField(default=0)
    reports_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'posts'
        indexes = [models.Index(fields=['user']), models.Index(fields=['-created_at'])]
        ordering = ['-created_at']

    def __str__(self):
        return f"Post({self.user.email[:20]}, {self.created_at.date()})"


class Like(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='likes'
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'likes'
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_post_like')
        ]


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments'
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment({self.user.email[:15]}, post={self.post_id})"
