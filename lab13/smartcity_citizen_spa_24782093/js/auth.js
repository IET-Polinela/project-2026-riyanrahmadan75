// js/auth.js

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    // Pastikan tidak ada sisa sesi admin/citizen lama saat masuk ke halaman login
    localStorage.clear();

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Mencegah reload halaman bawaan browser agar token tidak bocor [cite: 214]

        const usernameInput = document.getElementById('loginUsername').value;
        const passwordInput = document.getElementById('loginPassword').value;

        try {
            // Tembak endpoint token login bawaan SimpleJWT kita [cite: 215]
            const response = await requestAPI('/api/token/', 'POST', {
                username: usernameInput,
                password: passwordInput
            });

            const data = await response.json();

            if (response.status === 200) {
                // Reset data login lama sebelum menyimpan sesi baru
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('username');
                localStorage.removeItem('user');
                localStorage.removeItem('role');
                localStorage.removeItem('is_superuser');

                // Simpan access dan refresh token dengan sukses ke localStorage 
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('username', usernameInput);
                localStorage.setItem('user', usernameInput);
                localStorage.setItem('role', usernameInput.toLowerCase() === 'riyan' ? 'admin' : 'citizen');
                localStorage.setItem('is_superuser', 'false');

                if (data.username) {
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('user', data.username);
                }
                if (typeof data.role === 'string' && data.role.trim() !== '') {
                    localStorage.setItem('role', data.role);
                }
                if (typeof data.is_superuser === 'boolean') {
                    localStorage.setItem('is_superuser', data.is_superuser.toString());
                } else if (typeof data.is_superuser === 'string') {
                    localStorage.setItem('is_superuser', data.is_superuser);
                }

                alert('Login Berhasil! Selamat Datang.');
                window.location.hash = '#dashboard'; // Alihkan rute secara instan ke dashboard 
            } else {
                alert('Login Gagal: ' + (data.detail || 'Username atau password salah!'));
            }
        } catch (error) {
            alert('Gagal terhubung ke server backend.');
        }
    });
}