// js/auth.js

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

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
                // Simpan access dan refresh token dengan sukses ke localStorage 
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);

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