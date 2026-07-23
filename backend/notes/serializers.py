from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Category, Note

User = get_user_model()
DEFAULT_CATEGORIES = (
    ("Random Thoughts", "#EF9C66"),
    ("School", "#FCDC94"),
    ("Personal", "#78ABA8"),
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name")


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    class Meta:
        model = User
        fields = ("id", "email", "password", "first_name")
        read_only_fields = ("id",)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    @transaction.atomic
    def create(self, validated_data):
        email = validated_data.pop("email")
        user = User.objects.create_user(username=email, email=email, **validated_data)
        Category.objects.bulk_create(
            [Category(owner=user, name=name, color=color) for name, color in DEFAULT_CATEGORIES]
        )
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"
    email = serializers.EmailField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        user = User.objects.filter(username__iexact=email).first()
        if user is None or not user.check_password(attrs["password"]) or not user.is_active:
            raise AuthenticationFailed("No active account found with the given credentials")
        self.user = user
        refresh = self.get_token(user)
        data = {"refresh": str(refresh), "access": str(refresh.access_token)}
        data["user"] = UserSerializer(self.user).data
        return data


class CategorySerializer(serializers.ModelSerializer):
    note_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ("id", "name", "color", "note_count", "created_at")
        read_only_fields = ("id", "created_at", "note_count")

    def validate_color(self, value):
        if len(value) != 7 or not value.startswith("#"):
            raise serializers.ValidationError("Use a hex color such as #F4A77B.")
        try:
            int(value[1:], 16)
        except ValueError as exc:
            raise serializers.ValidationError("Use a valid hex color.") from exc
        return value.upper()

    def validate_name(self, value):
        name = value.strip()
        request = self.context["request"]
        categories = Category.objects.filter(owner=request.user, name__iexact=name)
        if self.instance:
            categories = categories.exclude(pk=self.instance.pk)
        if categories.exists():
            raise serializers.ValidationError("You already have a category with this name.")
        return name


class NoteSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.CharField(source="category.color", read_only=True)

    class Meta:
        model = Note
        fields = (
            "id",
            "category",
            "category_name",
            "category_color",
            "title",
            "content",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "category_name", "category_color", "created_at", "updated_at")

    def validate_category(self, category):
        request = self.context["request"]
        if category.owner_id != request.user.id:
            raise serializers.ValidationError("This category does not belong to you.")
        return category
