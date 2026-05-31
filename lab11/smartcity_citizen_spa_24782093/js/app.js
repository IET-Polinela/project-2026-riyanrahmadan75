// js/app.js
// Render dashboard sederhana dan interaksi kecil
function renderDashboard() {
    const target = document.getElementById('app-content');
    if (!target) return;

    target.innerHTML = `
    <div class="dashboard-row">
        <aside class="sidebar">
            <div class="card shadow-soft mb-3">
                <div class="p-3">
                    <button id="new-report" class="btn btn-primary btn-report">
                        <i class="bi bi-plus-circle me-2"></i> Laporan Baru
                    </button>
                    <button id="logout" class="btn btn-outline-danger btn-logout">
                        <i class="bi bi-box-arrow-right me-2"></i> Keluar
                    </button>
                </div>
            </div>
            <div class="card small shadow-soft">
                <div class="d-flex align-items-start">
                    <div class="me-3"><i class="bi bi-geo-alt-fill text-primary" style="font-size:22px"></i></div>
                    <div>
                        <div class="fw-semibold">Area Terdekat</div>
                        <div class="text-muted small">Tidak ada laporan baru</div>
                    </div>
                </div>
            </div>
        </aside>

        <section class="main-card">
            <div class="card card-hero shadow-soft">
                <div class="hero-icon"><i class="bi bi-inbox-fill"></i></div>
                <h4 class="mb-2">Selamat Datang di Portal Warga!</h4>
                <p class="text-muted">Koneksi API untuk data laporan penuh akan diimplementasikan pada Lab 12.</p>
            </div>

            <div class="row mt-3">
                <div class="col-md-4 mb-3">
                    <div class="card small shadow-soft p-3">
                        <div class="fw-semibold">Laporan Aktif</div>
                        <div class="text-muted">0</div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card small shadow-soft p-3">
                        <div class="fw-semibold">Menunggu Tindakan</div>
                        <div class="text-muted">0</div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card small shadow-soft p-3">
                        <div class="fw-semibold">Selesai</div>
                        <div class="text-muted">0</div>
                    </div>
                </div>
            </div>
        </section>

        <aside class="right-col">
            <div class="card small shadow-soft">
                <div class="p-3">
                    <div class="notice-title"><i class="bi bi-info-circle me-2"></i> Pengumuman Resmi</div>
                    <div class="text-muted small mt-2">Pastikan menjaga kebersihan lingkungan menyambut agenda pembersihan berkala minggu ini.</div>
                </div>
            </div>
        </aside>
    </div>
    `;

    // Event listeners
    document.getElementById('new-report')?.addEventListener('click', () => {
        alert('Fitur tambah laporan akan tersedia di Lab 12.');
    });
    document.getElementById('logout')?.addEventListener('click', () => {
        if (confirm('Yakin ingin keluar?')) {
            try { localStorage.clear(); } catch (e) {}
            window.location.hash = '#/login';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    console.log('Citizen Portal SPA Initialized Successfully.');
});