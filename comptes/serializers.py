from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            # Vérifier si l'utilisateur a une pharmacie liée
            if user.pharmacie:
                if not user.pharmacie.is_active:
                    raise serializers.ValidationError("La pharmacie associée est désactivée.")
            return user
        raise serializers.ValidationError("Identifiants incorrects")


from django.contrib.auth import get_user_model

User = get_user_model()


from .models import Pharmacie, User
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import Pharmacie
class PharmacieSerializer(serializers.ModelSerializer):
    est_expiree = serializers.SerializerMethodField()
    jours_restants = serializers.SerializerMethodField()  # ✅ ajouté ici

    class Meta:
        model = Pharmacie
        fields = [
            'id',
            'nom_pharm',
            'ville_pharm',
            'commune_pharm',
            'adresse_pharm',
            'ni',
            'telephone',
            'logo_pharm',
            'is_active',
            'latitude',
            'longitude',
            'montant_mensuel',
            'date_expiration',
            'est_expiree',
            'jours_restants',  # ✅ inclure dans l’API
        ]

    def get_est_expiree(self, obj):
        return obj.est_expiree()

    def get_jours_restants(self, obj):
        return obj.jours_restants()



# serializers.py
from rest_framework import serializers
from .models import User

class RegisterAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'default': 'admin'}  # 👈 Role par défaut
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    pharmacie = PharmacieSerializer(read_only=True)
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'role',
            'pharmacie',
            'profile_picture',
            'date_joined',
        ]

    def create(self, validated_data):
        # Utilisez le manager personnalisé pour créer l'utilisateur
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
class UsercomptableSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',  # ✅ Ajouté ici
            'role',
            'pharmacie',
            'profile_picture',
            'date_joined',
            'is_active',
        ]
        read_only_fields = ['pharmacie', 'date_joined']
    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Utilisateur non authentifié.")

        directeur = request.user
        if directeur.role != 'directeur':
            raise serializers.ValidationError("Seul un directeur peut créer un utilisateur.")

        validated_data['pharmacie'] = directeur.pharmacie
        validated_data['role'] = 'comptable'

        password = validated_data.pop('password')  # ← maintenant ce champ existera
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UpdateProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'profile_picture', 'password']
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'profile_picture': {'required': False, 'allow_null': True}
        }

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        # Met à jour les autres champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Met à jour le mot de passe si fourni
        if password:
            instance.set_password(password)

        instance.save()
        return instance


from rest_framework import serializers
from .models import User

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'date_joined']


# serializers.py
from rest_framework import serializers
from .models import User

class CreateDirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        validated_data['role'] = 'directeur'
        pharmacie_id = self.context['pharmacie_id']
        validated_data['pharmacie_id'] = pharmacie_id
        user = User.objects.create_user(**validated_data)
        return user

from rest_framework import serializers

class ComptableDashboardSerializer(serializers.Serializer):
    total_depenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_recettes = serializers.DecimalField(max_digits=12, decimal_places=2)
    solde = serializers.DecimalField(max_digits=12, decimal_places=2)


