from django.conf import settings
from django.db import models


class Category(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=40)
    color = models.CharField(max_length=7, default="#F6BE98")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)
        constraints = [models.UniqueConstraint(fields=("owner", "name"), name="unique_category_name_per_owner")]

    def __str__(self):
        return self.name


class Note(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="notes")
    title = models.CharField(max_length=160, blank=True, default="")
    content = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)
        indexes = [
            models.Index(fields=("owner", "-updated_at"), name="note_owner_updated_idx"),
            models.Index(fields=("owner", "category"), name="note_owner_category_idx"),
        ]

    def __str__(self):
        return self.title or "Untitled note"

