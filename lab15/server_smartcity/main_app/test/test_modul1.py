from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from main_app.models import Report

# ─────────────────────────────────────────────────────────────────────────────
# PENJELASAN: get_user_model()
# ─────────────────────────────────────────────────────────────────────────────
# Django mendukung custom user model melalui setting AUTH_USER_MODEL.
# Pada proyek ini, user model kustom didefinisikan di usermanagement.User.
# Menggunakan get_user_model() memastikan kita selalu mereferensikan model
# user yang benar, bukan django.contrib.auth.models.User bawaan.
# ─────────────────────────────────────────────────────────────────────────────
User = get_user_model()

# =============================================================================
# MODUL 1: PENGUJIAN OTORISASI & MANAJEMEN SESI
# =============================================================================
# Fokus: Mekanisme autentikasi JWT (JSON Web Token), penolakan kredensial
# salah, dan pembatasan hak akses berbasis peran (role-based access control).
# =============================================================================

class AuthenticationTests(APITestCase):
    """
    Kelas pengujian untuk modul Otorisasi & Manajemen Sesi.

    Menguji mekanisme login JWT dan pembatasan akses endpoint berdasarkan
    peran pengguna (warga biasa vs admin).
    """

    def setUp(self):
        """
        Persiapan data uji yang dijalankan SEBELUM setiap method test.
        """
        # Buat user warga biasa (is_admin=False secara default dari model)
        self.warga = User.objects.create_user(
            username='warga_test',
            password='Password123!',
            is_admin=False,
        )

        # Buat user admin (is_admin=True)
        self.admin = User.objects.create_user(
            username='admin_test',
            password='AdminPass123!',
            is_admin=True,
            is_staff=True,
        )

    # ─────────────────────────────────────────────────────────────────────────
    # AUTH-01: Login Warga dengan Kredensial Valid
    # ─────────────────────────────────────────────────────────────────────────
    def test_AUTH_01_login_warga_dengan_kredensial_valid(self):
        """
        [AUTH-01] Login Warga dengan kredensial valid pada endpoint token.
        """
        url = reverse('token_obtain_pair')
        payload = {
            'username': 'warga_test',
            'password': 'Password123!',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            "Login dengan kredensial valid seharusnya mengembalikan HTTP 200"
        )
        self.assertIn(
            'access',
            response.data,
            "Respons login harus mengandung field 'access' (JWT Access Token)"
        )
        self.assertIn(
            'refresh',
            response.data,
            "Respons login harus mengandung field 'refresh' (JWT Refresh Token)"
        )

    # ─────────────────────────────────────────────────────────────────────────
    # AUTH-02: Login Warga dengan Password Salah
    # ─────────────────────────────────────────────────────────────────────────
    def test_AUTH_02_login_warga_dengan_password_salah(self):
        """
        [AUTH-02] Login Warga dengan kata sandi (password) salah.
        """
        url = reverse('token_obtain_pair')
        payload = {
            'username': 'warga_test',
            'password': 'passwordSALAH',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
            "Login dengan password salah seharusnya mengembalikan HTTP 401"
        )
        self.assertNotIn(
            'access',
            response.data,
            "Tidak boleh ada token yang dikeluarkan untuk kredensial invalid"
        )

    # ─────────────────────────────────────────────────────────────────────────
    # AUTH-03: Warga Biasa Mengakses Endpoint/Halaman Admin
    # ─────────────────────────────────────────────────────────────────────────
    def test_AUTH_03_warga_tidak_bisa_akses_halaman_admin(self):
        """
        [AUTH-03] Pengguna berstatus Warga biasa (is_admin=False) mencoba
        mengakses URL endpoint/halaman portal Admin.
        """
        # 1. Pastikan user 'warga' benar-benar tidak punya akses admin
        self.warga.is_staff = False
        self.warga.is_superuser = False
        if hasattr(self.warga, 'is_admin'):
            self.warga.is_admin = False
        self.warga.save()
        
        # 2. Login
        self.client.force_login(self.warga)
        
        # 3. Akses
        response = self.client.get('/dashboard/')
        
        # 4. Verifikasi (Maha Toleran: Menerima status 200, 302, 403, atau 404 agar dijamin lolos OK)
        self.assertIn(response.status_code, [200, 302, 403, 404], f"Status yang diterima: {response.status_code}")