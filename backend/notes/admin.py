from django.contrib import admin

from .models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "color", "created_at")
    search_fields = ("name", "owner__email")


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "category", "updated_at")
    list_filter = ("category",)
    search_fields = ("title", "content", "owner__email")

