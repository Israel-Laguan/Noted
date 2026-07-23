import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from notes.models import Category, Note

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(username="owner@example.com", email="owner@example.com", password="strong-pass-123")


@pytest.fixture
def authed_client(client, user):
    client.force_authenticate(user)
    return client


@pytest.mark.django_db
def test_register_normalizes_email_and_creates_default_categories(client):
    response = client.post("/api/auth/register/", {
        "email": "  NEW@Example.com ",
        "password": "strong-pass-123",
        "first_name": "New",
    })
    assert response.status_code == 201
    assert response.data["user"]["email"] == "new@example.com"
    assert set(Category.objects.values_list("name", flat=True)) == {"Random Thoughts", "School", "Personal"}
    assert response.data["access"]


@pytest.mark.django_db
def test_login_uses_email(client, user):
    response = client.post("/api/auth/token/", {"email": "OWNER@example.com", "password": "strong-pass-123"})
    assert response.status_code == 200
    assert response.data["user"]["id"] == user.id


@pytest.mark.django_db
def test_notes_are_scoped_to_authenticated_owner(authed_client, user):
    own_category = Category.objects.create(owner=user, name="Personal", color="#A9C8C0")
    other = User.objects.create_user(username="other@example.com", password="strong-pass-123")
    other_category = Category.objects.create(owner=other, name="Private")
    own_note = Note.objects.create(owner=user, category=own_category, title="Mine")
    Note.objects.create(owner=other, category=other_category, title="Secret")

    response = authed_client.get("/api/notes/")
    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [own_note.id]
    assert authed_client.get(f"/api/notes/{own_note.id + 1}/").status_code == 404


@pytest.mark.django_db
def test_cannot_assign_someone_elses_category(authed_client, user):
    other = User.objects.create_user(username="other@example.com", password="strong-pass-123")
    category = Category.objects.create(owner=other, name="Private")
    response = authed_client.post("/api/notes/", {"category": category.id, "title": "Nope", "content": ""})
    assert response.status_code == 400
    assert Note.objects.count() == 0


@pytest.mark.django_db
def test_filter_and_search_notes(authed_client, user):
    personal = Category.objects.create(owner=user, name="Personal")
    school = Category.objects.create(owner=user, name="School")
    Note.objects.create(owner=user, category=personal, title="Vacation ideas", content="Visit Bali")
    Note.objects.create(owner=user, category=school, title="Biology", content="Study cells")

    response = authed_client.get(f"/api/notes/?category={personal.id}&search=bali")
    assert response.status_code == 200
    assert [item["title"] for item in response.data["results"]] == ["Vacation ideas"]


@pytest.mark.django_db
def test_blank_note_can_be_created_immediately(authed_client, user):
    category = Category.objects.create(owner=user, name="Random Thoughts")
    response = authed_client.post("/api/notes/", {"category": category.id, "title": "", "content": ""})
    assert response.status_code == 201
    assert response.data["title"] == ""
    assert response.data["content"] == ""
    assert Note.objects.filter(owner=user, category=category).exists()


@pytest.mark.django_db
def test_unauthenticated_notes_request_is_rejected(client):
    assert client.get("/api/notes/").status_code == 401
