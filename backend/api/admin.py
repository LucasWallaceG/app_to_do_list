from django.contrib import admin
from .models import Category, Task

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'color')
    search_fields = ('name', 'user__username')
    list_filter = ('user',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'category', 'completed', 'created_at', 'due_date')
    list_filter = ('completed', 'owner', 'category', 'created_at')
    search_fields = ('title', 'description', 'owner__username')
    raw_id_fields = ('owner', 'category', 'shared_with')
    date_hierarchy = 'created_at'
