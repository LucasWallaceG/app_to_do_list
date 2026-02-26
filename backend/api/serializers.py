from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import Category, Task


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'user']


class TaskSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.id')
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    shared_with_details = UserSerializer(source='shared_with', many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'completed', 
            'created_at', 'updated_at', 'due_date', 
            'owner', 'owner_username', 'category', 'category_name',
            'shared_with', 'shared_with_details'
        ]
        extra_kwargs = {
            'shared_with': {'write_only': True}
        }
