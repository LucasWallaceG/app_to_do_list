from rest_framework import viewsets, permissions, filters
from django.db.models import Q
from api.models import Category, Task
from api.serializers import CategorySerializer, TaskSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    # filter_backends = [filters.SearchFilter, filters.OrderingFilter, filters.DjangoFilterBackend]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, filters.BaseFilterBackend]
    search_fields = ['title', 'description']
    filterset_fields = ['completed', 'category']
    ordering_fields = ['created_at', 'due_date', 'completed']

    def get_queryset(self):
        user = self.request.user
        # Return tasks owned by user OR shared with user
        return Task.objects.filter(Q(owner=user) | Q(shared_with=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

from rest_framework import generics
from api.serializers import UserSerializer
from django.contrib.auth.models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(self.request.data.get('password'))
        user.save()
