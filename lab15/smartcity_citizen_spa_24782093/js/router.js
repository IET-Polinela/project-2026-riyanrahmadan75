// js/router.js

const routes = {

    // ─── HALAMAN LOGIN ────────────────────────────────────────────────────────
    '#login': `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4 card shadow-sm border-0 p-4">
                <div class="text-center mb-4">
                    <i class="bi bi-buildings-fill fs-1 text-primary"></i>
                    <h4 class="fw-bold mt-2">Portal Warga</h4>
                    <p class="text-muted small">Smart City Issue Tracker</p>
                </div>
                <form id="loginForm">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Username</label>
                        <input type="text" id="loginUsername" class="form-control" placeholder="Masukkan username" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Password</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="Masukkan password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 fw-bold">
                        <i class="bi bi-box-arrow-in-right me-2"></i>Masuk
                    </button>
                    <p class="text-center mt-3 small mb-0">
                        Belum punya akun? <a href="#register" class="text-decoration-none fw-bold">Daftar di sini</a>
                    </p>
                </form>
            </div>
        </div>
    `,

    // ─── HALAMAN REGISTRASI ───────────────────────────────────────────────────
    '#register': `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4 card shadow-sm border-0 p-4">
                <div class="text-center mb-4">
                    <i class="bi bi-person-plus-fill fs-1 text-success"></i>
                    <h4 class="fw-bold mt-2">Registrasi Warga Baru</h4>
                </div>
                <form id="registerForm">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Username</label>
                        <input type="text" id="regUsername" class="form-control" placeholder="Buat username" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Email</label>
                        <input type="email" id="regEmail" class="form-control" placeholder="nama@email.com" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Password</label>
                        <input type="password" id="regPassword" class="form-control" placeholder="Minimal 8 karakter" required>
                    </div>
                    <button type="submit" class="btn btn-success w-100 fw-bold">
                        <i class="bi bi-person-check-fill me-2"></i>Daftar Akun
                    </button>
                    <p class="text-center mt-3 small mb-0">
                        Sudah punya akun? <a href="#login" class="text-decoration-none fw-bold">Login di sini</a>
                    </p>
                </form>
            </div>
        </div>
    `,

    // ─── HALAMAN DASHBOARD UTAMA ──────────────────────────────────────────────
    '#dashboard': `
        <div class="row g-4">

            <!-- Sidebar kiri: navigasi + statistik -->
            <aside class="col-12 col-lg-3">

                <!-- Tombol buat laporan + tab navigasi -->
                <div class="card border-0 p-3 shadow-sm mb-3">
                    <button id="btnBukaModal" class="btn btn-primary btn-lg w-100 fw-bold mb-3">
                        <i class="bi bi-plus-circle-fill me-2"></i>Laporan Baru
                    </button>
                    <div class="list-group list-group-flush mb-3">
                        <button id="tabMyReports"
                            class="list-group-item list-group-item-action fw-bold active border-0 rounded mb-1">
                            <i class="bi bi-person-vcard me-2"></i>Laporan Saya
                        </button>
                        <button id="tabFeedKota"
                            class="list-group-item list-group-item-action fw-bold border-0 rounded">
                            <i class="bi bi-globe2 me-2"></i>Feed Kota (Publik)
                        </button>
                    </div>
                    <button id="logoutBtn" class="btn btn-outline-danger w-100 fw-bold btn-sm">
                        <i class="bi bi-box-arrow-right me-2"></i>Keluar Portal
                    </button>
                </div>

                <!-- Kartu statistik laporan milik sendiri -->
                <div class="card border-0 p-3 shadow-sm" id="summaryStats">
                    <h6 class="fw-bold mb-3 text-muted">
                        <i class="bi bi-graph-up-arrow me-2"></i>Status Laporan Saya
                    </h6>
                    <div class="d-flex justify-content-between align-items-center mb-2 small">
                        <span>📝 Draft</span>
                        <span id="countDraft" class="badge bg-secondary rounded-pill">0</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2 small">
                        <span>📨 Reported</span>
                        <span id="countReported" class="badge bg-warning text-dark rounded-pill">0</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2 small">
                        <span>🔍 Verified</span>
                        <span id="countVerified" class="badge rounded-pill" style="background:#ede9fe;color:#5b21b6;">0</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2 small">
                        <span>⚙️ In Progress</span>
                        <span id="countInProgress" class="badge bg-primary rounded-pill">0</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center small">
                        <span>✅ Resolved</span>
                        <span id="countResolved" class="badge bg-success rounded-pill">0</span>
                    </div>
                </div>
            </aside>

            <!-- Konten tengah: daftar laporan + pagination -->
            <section class="col-12 col-lg-6">
                <!-- Label tab aktif -->
                <div class="d-flex align-items-center mb-3 gap-2">
                    <span id="tabLabel" class="fw-bold text-muted small text-uppercase letter-spacing-1">
                        📋 Laporan Saya
                    </span>
                </div>
                <div id="listContainer" class="row g-3"></div>
                <nav class="mt-4 d-flex justify-content-center">
                    <ul class="pagination shadow-sm" id="paginationContainer"></ul>
                </nav>
            </section>

            <!-- Sidebar kanan: panduan -->
            <aside class="col-12 col-lg-3 d-none d-lg-block">
                <div class="card border-0 p-3 shadow-sm sticky-top" style="top: 80px;">
                    <h6 class="fw-bold text-primary mb-3">
                        <i class="bi bi-info-circle-fill me-2"></i>Panduan Sistem
                    </h6>
                    <p class="small text-muted mb-2">
                        Laporan berstatus <b>DRAFT</b> hanya terlihat oleh kamu sendiri.
                        Admin belum bisa melihat laporan kamu selama masih berstatus DRAFT.
                    </p>
                    <p class="small text-muted mb-2">
                        Setelah status diubah ke <b>REPORTED</b>, laporan akan muncul di
                        Feed Kota dan bisa dilihat admin. Nama pelapor ditampilkan sebagai
                        <b>Warga Anonim</b> untuk melindungi privasi.
                    </p>
                    <hr class="my-2">
                    <p class="small text-muted mb-0">
                        🔒 Laporan REPORTED ke atas <b>tidak bisa diedit</b> lagi.
                    </p>
                </div>
            </aside>
        </div>
    `
};


// ─── ROUTING ──────────────────────────────────────────────────────────────────
function handleRouting() {
    const hash = window.location.hash || '#login';
    const contentDiv = document.getElementById('app-content');

    // Bersihkan sesi lama saat buka halaman login
    if (hash === '#login') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('is_superuser');
    }

    // Guard: belum login → paksa ke #login
    if (hash === '#dashboard' && !localStorage.getItem('access_token')) {
        window.location.hash = '#login';
        return;
    }

    contentDiv.innerHTML = routes[hash] || routes['#login'];

    if (hash === '#login' && typeof setupLoginForm === 'function') {
        setupLoginForm();
    }

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


// ─── REGISTRASI AKUN BARU ─────────────────────────────────────────────────────
function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            username: document.getElementById('regUsername').value,
            email:    document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value
        };

        try {
            // Tembak endpoint /api/register/ di backend Django lokal
            const response = await requestAPI('/api/register/', 'POST', payload);
            if (response.ok) {
                alert('Registrasi berhasil! Silakan login menggunakan akun baru Anda.');
                window.location.hash = '#login';
            } else {
                const errData = await response.json();
                alert('Registrasi Gagal: ' + JSON.stringify(errData));
            }
        } catch (err) {
            alert('Gagal terhubung dengan server backend.');
        }
    });
}


window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);