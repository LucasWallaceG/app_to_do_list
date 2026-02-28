from rest_framework import viewsets, permissions, filters
from django.db.models import Q
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from api.serializers import UserSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth.models import User
from api.models import Category, Task
from api.serializers import CategorySerializer, TaskSerializer
from django_filters.rest_framework import DjangoFilterBackend



class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['title', 'description']
    filterset_fields = ['completed', 'category']
    ordering_fields = ['created_at', 'due_date', 'completed']
    ordering = ['completed', '-created_at']

    def get_queryset(self):
        user = self.request.user
        # Return tasks owned by user OR shared with user
        return Task.objects.filter(Q(owner=user) | Q(shared_with=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
