import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Pharmacie(BaseModel):
    nom_pharm = models.CharField(max_length=100)
    ville_pharm = models.CharField(max_length=50)
    commune_pharm = models.CharField(max_length=50)
    adresse_pharm = models.TextField()
    ni = models.CharField(max_length=20)
    telephone = models.CharField(max_length=20)
    logo_pharm = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    montant_mensuel = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    is_active = models.BooleanField(default=True)
    date_expiration = models.DateField(null=True, blank=True)

    def jours_restants(self):
        if self.date_expiration:
            delta = self.date_expiration - timezone.now().date()
            return max(delta.days, 0)
        return 0

    def est_expiree(self):
        return self.date_expiration and self.date_expiration < timezone.now().date()

    def __str__(self):
        return self.nom_pharm


class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'superuser')
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(
        max_length=50,
        choices=[
            ('superuser', 'Superuser'),
            ('admin', 'Admin'),
            ('directeur', 'Directeur'),
            ('comptable', 'Comptable')
        ],
        default='comptable'
    )
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username
