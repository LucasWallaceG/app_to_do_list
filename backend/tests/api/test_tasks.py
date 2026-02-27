import pytest
from django.urls import reverse
from api.models import Task, Category

@pytest.mark.django_db
def test_create_task(auth_client):
    url = reverse('task-list')
    data = {'title': 'Test Task', 'description': 'Description'}
    response = auth_client.post(url, data)
    assert response.status_code == 201
    assert Task.objects.count() == 1
    assert Task.objects.get().owner.username == 'testuser'

@pytest.mark.django_db
def test_share_task(auth_client, user, other_user):
    task = Task.objects.create(title='Shared Task', owner=user)
    url = reverse('task-detail', args=[task.id])
    
    # Share with other_user
    data = {'shared_with': [other_user.id]}
    response = auth_client.patch(url, data)
    
    assert response.status_code == 200
    task.refresh_from_db()
    assert other_user in task.shared_with.all()

@pytest.mark.django_db
def test_view_shared_task(api_client, user, other_user):
    task = Task.objects.create(title='Shared with me', owner=user)
    task.shared_with.add(other_user)
    
    # Authenticate as other_user
    api_client.force_authenticate(user=other_user)
    url = reverse('task-list')
    response = api_client.get(url)
    
    assert response.status_code == 200
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['title'] == 'Shared with me'
