// js/router.js

const routes = {
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
                </form>
            </div>
        </div>
    `,
    '#dashboard': `
        <div class="row g-4">
            <aside class="col-12 col-lg-3">
                <div class="card border-0 p-3 shadow-sm sticky-top" style="top: 20px;">
                    <button class="btn btn-primary btn-lg w-100 fw-bold mb-3">
                        <i class="bi bi-plus-circle-fill me-2"></i>Laporan Baru
                    </button>
                    <button id="logoutBtn" class="btn btn-outline-danger w-100 fw-bold">
                        <i class="bi bi-box-arrow-right me-2"></i>Keluar
                    </button>
                </div>
            </aside>

            <section class="col-12 col-lg-6">
                <div class="card border-0 p-5 shadow-sm text-center text-muted border-dashed">
                    <i class="bi bi-inbox fs-1 mb-2"></i>
                    <h5 class="mt-2">Selamat Datang di Portal Warga!</h5>
                    <p class="small">Koneksi API untuk data laporan penuh akan diimplementasikan pada Lab 12.</p>
                </div>
            </section>

            <aside class="col-12 col-lg-3 d-none d-lg-block">
                <div class="card border-0 p-3 shadow-sm sticky-top" style="top: 20px;">
                    <h6 class="fw-bold text-primary mb-3">
                        <i class="bi bi-info-circle-fill me-2"></i>Pengumuman Resmi
                    </h6>
                    <p class="small text-muted">Pastikan menjaga kebersihan lingkungan menyambut agenda pembersihan berkala minggu ini.</p>
                </div>
            </aside>
        </div>
    `
};

function handleRouting() {
    const hash = window.location.hash || '#login'; // Default view mengarah ke form login [cite: 205]
    const contentDiv = document.getElementById('app-content');
    
    // Proteksi Rute: Jika belum login tapi coba-coba buka #dashboard, tendang ke #login
    if (hash === '#dashboard' && !localStorage.getItem('access_token')) {
        window.location.hash = '#login';
        return;
    }
    
    // Terapkan template HTML ke dalam cangkang aplikasi [cite: 205]
    contentDiv.innerHTML = routes[hash] || routes['#login'];

    // Inisialisasi event listener form/button setelah elemen di-render ke DOM
    if (hash === '#login' && typeof setupLoginForm === 'function') {
        setupLoginForm();
    }
    if (hash === '#dashboard') {
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.clear(); // Bersihkan token
            window.location.hash = '#login';
        });
    }
}

// Daftarkan trigger event deteksi perubahan URL hash [cite: 208]
window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);