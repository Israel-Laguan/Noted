from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.staticfiles.management.commands.runserver import (
    Command as StaticfilesRunserverCommand,
)


class Command(StaticfilesRunserverCommand):
    """Run the local development server on the project's standard port."""

    default_port = "8080"

    def handle(self, *args, **options):
        from notes.models import Category, Note

        User = get_user_model()
        if not User.objects.filter(username="demo@noted.app").exists():
            user = User.objects.create(
                username="demo@noted.app",
                email="demo@noted.app",
                password=make_password("demo1234"),
            )
            work = Category.objects.create(owner=user, name="Work", color="#F6BE98")
            personal = Category.objects.create(owner=user, name="Personal", color="#C0C0C0")
            ideas = Category.objects.create(owner=user, name="Ideas", color="#A5D6A7")
            Note.objects.create(
                owner=user,
                category=work,
                title="Welcome to Noted",
                content="This is a demo note. Edit or delete it to get started!",
            )
            Note.objects.create(
                owner=user, category=personal, title="Shopping List", content="Milk\nEggs\nBread"
            )
            Note.objects.create(
                owner=user,
                category=ideas,
                title="Project Ideas",
                content="A note-taking app with AI assistance\nA recipe organizer\nA habit tracker",
            )
        super().handle(*args, **options)
