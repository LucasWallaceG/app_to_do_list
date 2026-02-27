from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    color = models.CharField(max_length=7, default='#000000') # Hex color

    class Meta:
        verbose_name_plural = 'Categories'
        unique_together = ('name', 'user')

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(blank=True, null=True)
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    
    shared_with = models.ManyToManyField(User, related_name='shared_tasks', blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
