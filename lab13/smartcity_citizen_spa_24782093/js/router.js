// js/router.js

const routes = {
    // 🔐 HALAMAN LOGIN (Sudah ditambahkan link menuju halaman daftar)
    '#login': `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4 card shadow-sm border-0 p-4">
                <h4 class="text-center fw-bold mb-4">Login Warga</h4>
                <form id="loginForm">
                    <div class="mb-3">
                        <label class="form-label">Username</label>
                        <input type="text" id="loginUsername" class="form-control" placeholder="Username" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 fw-bold">Masuk</button>
                    <p class="text-center mt-3 small mb-0">Belum punya akun? <a href="#register" class="text-decoration-none fw-bold">Daftar di sini</a></p>
                </form>
            </div>
        </div>
    `,
    
    // 📝 [BARU] HALAMAN DAFTAR AKUN WARGA SPA
    '#register': `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4 card shadow-sm border-0 p-4">
                <h4 class="text-center fw-bold mb-4">Registrasi Warga Baru</h4>
                <form id="registerForm">
                    <div class="mb-3">
                        <label class="form-label">Username</label>
                        <input type="text" id="regUsername" class="form-control" placeholder="Buat username" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" id="regEmail" class="form-control" placeholder="nama@email.com" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input type="password" id="regPassword" class="form-control" placeholder="Minimal 8 karakter" required>
                    </div>
                    <button type="submit" class="btn btn-success w-100 fw-bold">Daftar Akun</button>
                    <p class="text-center mt-3 small mb-0">Sudah punya akun? <a href="#login" class="text-decoration-none fw-bold">Login di sini</a></p>
                </form>
            </div>
        </div>
    `,

    // 🖥️ HALAMAN DASHBOARD UTAMA
    '#dashboard': `
        <div class="row g-4">
            <aside class="col-12 col-lg-3">
                <div class="card border-0 p-3 shadow-sm mb-3">
                    <button id="btnBukaModalBaru" class="btn btn-primary btn-lg w-100 fw-bold mb-3">
                        <i class="bi bi-plus-circle-fill me-2"></i>Laporan Baru
                    </button>
                    <div class="list-group list-group-flush mb-3">
                        <button id="tabMyReports" class="list-group-item list-group-item-action fw-bold active border-0 rounded mb-1">
                            <i class="bi bi-person-vcard me-2"></i>Laporan Saya
                        </button>
                        <button id="tabFeed" class="list-group-item list-group-item-action fw-bold border-0 rounded">
                            <i class="bi bi-globe2 me-2"></i>Feed Kota (Publik)
                        </button>
                    </div>
                    <button id="logoutBtn" class="btn btn-outline-danger w-100 fw-bold btn-sm">
                        <i class="bi bi-box-arrow-right me-2"></i>Keluar Portal
                    </button>
                </div>

                <div class="card border-0 p-3 shadow-sm">
                    <h6 class="fw-bold mb-3 text-muted"><i class="bi bi-graph-up-arrow me-2"></i>Status Laporan Saya</h6>
                    <div class="d-flex justify-content-between mb-2 small"><span>📝 Draft:</span> <span id="countDraft" class="badge bg-secondary rounded-pill">0</span></div>
                    <div class="d-flex justify-content-between mb-2 small"><span>⏳ Diproses:</span> <span id="countDiproses" class="badge bg-primary rounded-pill">0</span></div>
                    <div class="d-flex justify-content-between small"><span>✅ Selesai:</span> <span id="countSelesai" class="badge bg-success rounded-pill">0</span></div>
                </div>
            </aside>

            <section class="col-12 col-lg-6">
                <div id="listContainer" class="row g-3"></div>
                <nav class="mt-4 d-flex justify-content-center">
                    <ul class="pagination shadow-sm" id="paginationContainer"></ul>
                </nav>
            </section>

            <aside class="col-12 col-lg-3 d-none d-lg-block">
                <div class="card border-0 p-3 shadow-sm sticky-top" style="top: 20px;">
                    <h6 class="fw-bold text-primary mb-3"><i class="bi bi-info-circle-fill me-2"></i>Panduan Sistem</h6>
                    <p class="small text-muted">Laporan berstatus <b>DRAFT</b> dapat diubah kembali kapan saja oleh pelapor. Laporan yang sudah masuk tahap <b>REPORTED</b> dikunci demi validasi petugas lapangan.</p>
                </div>
            </aside>
        </div>
    `
};

function handleRouting() {
    const hash = window.location.hash || '#login';
    const contentDiv = document.getElementById('app-content');
    
    // Guard Keamanan: Cegah masuk dashboard jika belum punya token
    if (hash === '#dashboard' && !localStorage.getItem('access_token')) {
        window.location.hash = '#login';
        return;
    }
    
    contentDiv.innerHTML = routes[hash] || routes['#login'];

    if (hash === '#login' && typeof setupLoginForm === 'function') {
        setupLoginForm();
    }
    
    // 🛠️ Hubungkan aksi tombol form daftar ke fungsi eksekusi API
    if (hash === '#register') {
        setupRegisterForm();
    }
    
    if (hash === '#dashboard') {
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.clear();
            window.location.hash = '#login';
        });
        if (typeof initDashboardPage === 'function') {
            initDashboardPage();
        }
    }
}

// 🌐 Fungsi Asinkron Menembak API Registrasi Django Backend
function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            username: document.getElementById('regUsername').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value
        };

        try {
            // Menembak endpoint RegisterSerializer milik backend Django
            const response = await fetch('http://103.151.63.88:8010/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Registrasi berhasil! Silakan login menggunakan akun baru Anda.");
                window.location.hash = '#login'; // Alihkan otomatis ke halaman login
            } else {
                const errData = await response.json();
                alert("Registrasi Gagal: " + JSON.stringify(errData));
            }
        } catch (err) {
            alert("Gagal terhubung dengan server backend.");
        }
    });
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);