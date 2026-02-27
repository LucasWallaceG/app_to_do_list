import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    return User.objects.create_user(username='testuser', password='password123')

@pytest.fixture
def other_user(db):
    return User.objects.create_user(username='otheruser', password='password123')

@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client
