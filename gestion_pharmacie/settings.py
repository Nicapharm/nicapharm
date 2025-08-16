from pathlib import Path
import logging
import os
from corsheaders.defaults import default_headers
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
logging.basicConfig(level=logging.DEBUG) 
# SECURITY WARNING: keep the secret key used in production secret!
#SECRET_KEY = 'django-insecure-#z+!08_7q)g9zgor&1vk+@l8x)$5fp&4-!a#r^+p@)k3khf#-m'
SECRET_KEY = os.environ.get("SECRET_KEY")
# SECURITY WARNING: don't run with debug turned on in production!
#DEBUG = True

ALLOWED_HOSTS = ["pharmacie-hefk.onrender.com"]
#ALLOWED_HOSTS = ["localhost", "127.0.0.1"]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
     'corsheaders',
    'rest_framework',
    'rest_framework.authtoken', 
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
     'comptes',
    'pharmacie',
]
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
]
CORS_ALLOWED_ORIGINS = [
    "https://nicapharmtechnologie.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",        # ← parfois nécessaire aussi
    "http://localhost:5000",        # ← si tu utilises Electron
    "http://127.0.0.1:5000",
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    'authorization',
    'content-type',
]
CORS_ALLOW_CREDENTIALS = True
# Ajoutez ceci pour gérer les fichiers statiques en production


STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
# Pour les fichiers média (images, etc.)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
ROOT_URLCONF = 'gestion_pharmacie.urls'
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'EXCEPTION_HANDLER': 'pharmacie.exceptions.custom_exception_handler',
}


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'gestion_pharmacie.wsgi.application'

AUTH_USER_MODEL = "comptes.User"  
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=800),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=23),

    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databasessssss

from decouple import config

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'nicapharm',
        'USER': 'nicapharm_user',
        'PASSWORD': 'WTIVUA2bEab4gowGJyNZ0WRKY5g6tXq8',
        'HOST': 'dpg-d1t3j93e5dus73e4am20-a',
        'PORT': '5432',
    },
    'remote': 
    {
    'ENGINE': 'django.db.backends.postgresql',
    'NAME': 'nicapharm',
    'USER': 'nicapharm_user',
    'PASSWORD': 'WTIVUA2bEab4gowGJyNZ0WRKY5g6tXq8',
    'HOST': 'dpg-d1t3j93e5dus73e4am20-a.oregon-postgres.render.com',
    'PORT': '5432',
}
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static/')

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


