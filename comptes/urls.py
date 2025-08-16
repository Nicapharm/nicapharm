from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginAPIView
from django.urls import path, include
from uuid import UUID
from rest_framework.routers import DefaultRouter
from .views import PharmacieViewSet,liste_admins,reactiver_utilisateur,UpdateProfileView, desactiver_utilisateur,RegisterAdminView,DashboardComptableAPIView, UserViewSet,ComptableUserViewSet, CreateDirectorView, PharmacieDetailView #CreateAccountantView

router = DefaultRouter()
router.register(r'pharmacies', PharmacieViewSet)
router.register(r'users', UserViewSet)
router.register(r'comptables', ComptableUserViewSet, basename='comptable')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/login/', LoginAPIView.as_view(), name='api-login'),
    path('api/create-director/<uuid:pharmacie_id>/', CreateDirectorView.as_view(), name='create-director'),
    path('api/pharmacie/', PharmacieDetailView.as_view(), name='pharmacie-detail'),
    path('api/dashboard/comptable/', DashboardComptableAPIView.as_view(), name='dashboard_comptable'),
    path('api/register/admin/', RegisterAdminView.as_view(), name='register_admin'),
    path('api/admins/', liste_admins, name='liste_admins'),
    path('api/admins/<uuid:user_id>/desactiver/', desactiver_utilisateur, name='desactiver_admin'),
    path('api/admins/<uuid:user_id>/reactiver/', reactiver_utilisateur, name='reactiver-utilisateur'),
    path('api/update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    #path('api/create-accountant/', CreateAccountantView.as_view(), name='create-accountant'),
    
]
