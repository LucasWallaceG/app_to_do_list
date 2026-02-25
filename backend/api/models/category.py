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
