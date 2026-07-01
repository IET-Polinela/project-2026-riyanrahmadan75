// js/app.js

let currentTab   = 'my_reports';
let currentPage  = 1;
let editingReportId = null;
let allReports   = [];
let bsModalInstance = null;
let isLoading    = false;        // FIX DUPLIKAT: guard agar request tidak dobel
let dashboardInitDone = false;   // FIX DUPLIKAT: pastikan init hanya sekali per load


// ─── EVENT DELEGATION untuk tab navigasi ──────────────────────────────────────
// Dipasang sekali di document — tidak diulang saat hashchange
document.addEventListener('click', function (e) {
    if (e.target.closest('#tabMyReports')) {
        e.preventDefault();
        switchTab('my_reports');
    }
    if (e.target.closest('#tabFeedKota')) {
        e.preventDefault();
        switchTab('feed');
    }
});


// ─── INISIALISASI DASHBOARD ───────────────────────────────────────────────────
// Dipanggil oleh router.js setiap kali hash berubah ke #dashboard.
// Guard dashboardInitDone mencegah setup modal & event listener dobel.
function initDashboardPage() {
    dashboardInitDone = true;

    const modalEl = document.getElementById('reportModal');
    if (modalEl) {
        // Buat instance Modal hanya sekali — hancurkan dulu kalau sudah ada
        if (bsModalInstance) {
            bsModalInstance.dispose();
        }
        bsModalInstance = new bootstrap.Modal(modalEl);
    }

    // Tombol Buka Modal
    const btnBukaModal = document.getElementById('btnBukaModal');
    if (btnBukaModal) {
        // Clone node untuk hapus listener lama sebelum pasang baru
        const freshBtn = btnBukaModal.cloneNode(true);
        btnBukaModal.parentNode.replaceChild(freshBtn, btnBukaModal);
        freshBtn.onclick = () => {
            editingReportId = null;
            document.getElementById('reportForm')?.reset();
            const lbl = document.getElementById('reportModalLabel');
            if (lbl) lbl.innerHTML = `<i class="bi bi-plus-circle-fill me-2"></i>Buat Laporan Baru`;
            bsModalInstance.show();
        };
    }

    // Tombol Simpan Draft dan Ajukan di dalam modal
    ['btnDraft', 'btnSubmit'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const fresh = el.cloneNode(true);
            el.parentNode.replaceChild(fresh, el);
            fresh.addEventListener('click', () =>
                handleSaveReport(id === 'btnDraft' ? 'DRAFT' : 'REPORTED')
            );
        }
    });

    renderNavbarUser();

    // Muat data awal — hanya sekali, bukan berulang
    currentTab  = 'my_reports';
    currentPage = 1;
    loadReports();
}


// ─── NAVBAR: tampilkan username + badge ADMIN / WARGA ─────────────────────────
function renderNavbarUser() {
    const navMenus = document.getElementById('nav-menus');
    if (!navMenus) return;

    const username    = localStorage.getItem('username') || 'User';
    const isSuperuser = localStorage.getItem('is_superuser') === 'true';
    const role        = localStorage.getItem('role') || 'citizen';
    const isAdmin     = isSuperuser || role === 'admin' || role === 'staff';

    navMenus.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="bi ${isAdmin ? 'bi-shield-fill-check' : 'bi-person-fill'} text-white"></i>
            <span class="text-white fw-semibold">${username}</span>
            <span class="badge rounded-pill px-2 py-1"
                  style="font-size:10px;font-weight:700;
                         background:${isAdmin ? '#dc3545' : '#198754'};color:#fff;">
                ${isAdmin ? 'ADMIN' : 'WARGA'}
            </span>
        </div>
    `;
}


// ─── SWITCH TAB ───────────────────────────────────────────────────────────────
function switchTab(tabName) {
    if (isLoading) return;   // FIX DUPLIKAT: jangan switch saat sedang load

    currentTab  = tabName;
    currentPage = 1;

    // Update visual tombol tab aktif / tidak aktif
    const tabMyReports = document.getElementById('tabMyReports');
    const tabFeedKota  = document.getElementById('tabFeedKota');
    if (tabMyReports) tabMyReports.classList.toggle('active', tabName === 'my_reports');
    if (tabFeedKota)  tabFeedKota.classList.toggle('active',  tabName === 'feed');

    // Update label di atas daftar laporan
    const tabLabel = document.getElementById('tabLabel');
    if (tabLabel) {
        tabLabel.textContent = tabName === 'feed'
            ? '🌐 Feed Kota (Publik)'
            : '📋 Laporan Saya';
    }

    loadReports();
}


// ─── MUAT LAPORAN DARI API ────────────────────────────────────────────────────
async function loadReports() {
    if (isLoading) return;   // FIX DUPLIKAT: satu request dalam satu waktu
    isLoading = true;

    const container = document.getElementById('listContainer');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>Memuat laporan...
            </div>`;
    }

    try {
        const url      = `/api/report/?tab=${currentTab}&page=${currentPage}`;
        const response = await requestAPI(url, 'GET');

        if (!response) { isLoading = false; return; }
        if (response.status === 401) { isLoading = false; return; } // api.js sudah redirect

        if (response.status === 200) {
            const data = await response.json();
            allReports = data.results || [];
            renderList();
            renderPagination(Math.ceil((data.count || 0) / 10));
            loadSummaryStats();
        } else {
            if (container) container.innerHTML =
                `<div class="col-12 text-center py-5 text-danger small">
                    Gagal memuat data (HTTP ${response.status}).
                </div>`;
        }
    } catch (err) {
        console.error('Gagal muat laporan:', err);
        if (container) container.innerHTML =
            `<div class="col-12 text-center py-5 text-danger small">
                Tidak dapat terhubung ke server backend.<br>
                <small>Pastikan Django server sudah berjalan di <b>127.0.0.1:8000</b>.</small>
            </div>`;
    } finally {
        isLoading = false;   // FIX DUPLIKAT: selalu reset setelah selesai
    }
}

// Alias kompatibilitas
function loadDashboardData(tab, page) {
    currentTab  = tab;
    currentPage = page;
    loadReports();
}


// ─── SIMPAN LAPORAN (DRAFT / REPORTED) ───────────────────────────────────────
async function handleSaveReport(targetStatus) {
    const title       = document.getElementById('inputTitle')?.value.trim();
    const category    = document.getElementById('inputCategory')?.value;
    const location    = document.getElementById('inputLocation')?.value.trim();
    const description = document.getElementById('inputDescription')?.value.trim();

    if (!title || !description || !location) {
        alert('Harap isi semua kolom yang wajib diisi (Judul, Lokasi, Deskripsi).');
        return;
    }

    const payload = { title, category, location, description, status: targetStatus };

    try {
        const method   = editingReportId ? 'PUT'          : 'POST';
        const endpoint = editingReportId
            ? `/api/report/${editingReportId}/`
            : '/api/report/';

        const response = await requestAPI(endpoint, method, payload);

        if (response.status === 201 || response.status === 200) {
            bsModalInstance?.hide();
            editingReportId = null;

            const msg = targetStatus === 'DRAFT'
                ? 'Draft berhasil disimpan!'
                : 'Laporan berhasil diajukan!';
            alert(msg);

            loadReports();
        } else {
            const err = await response.json().catch(() => ({}));
            alert('Gagal menyimpan: ' + (JSON.stringify(err) || response.status));
        }
    } catch (err) {
        alert('Gagal menyimpan — tidak dapat terhubung ke server.');
    }
}


// ─── RENDER KARTU LAPORAN ─────────────────────────────────────────────────────
function renderList() {
    const container = document.getElementById('listContainer');
    if (!container) return;

    if (!allReports || allReports.length === 0) {
        const isFeed = currentTab === 'feed';
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi ${isFeed ? 'bi-globe2' : 'bi-clipboard-x'} fs-1 text-muted opacity-50 d-block mb-3"></i>
                <p class="text-muted">
                    ${isFeed
                        ? 'Belum ada laporan publik. Jadilah yang pertama melaporkan!'
                        : 'Kamu belum membuat laporan apa pun. Klik <b>Laporan Baru</b> untuk mulai.'}
                </p>
            </div>`;
        return;
    }

    const statusColor = { DRAFT:'secondary', REPORTED:'warning', VERIFIED:'info', IN_PROGRESS:'primary', RESOLVED:'success' };
    const statusLabel = { DRAFT:'Draft', REPORTED:'Reported', VERIFIED:'Verified', IN_PROGRESS:'In Progress', RESOLVED:'Resolved' };
    const statusIcon  = { DRAFT:'bi-pencil', REPORTED:'bi-send', VERIFIED:'bi-patch-check', IN_PROGRESS:'bi-gear', RESOLVED:'bi-check-circle-fill' };

    container.innerHTML = allReports.map(report => {
        const isMine  = report.is_owner;
        const canEdit = isMine && report.status === 'DRAFT';

        // Nama pelapor:
        // - di Feed Kota: SELALU "Warga Anonim" (termasuk laporan milik sendiri)
        // - di Laporan Saya: tampilkan nama asli milik sendiri
        const reporterDisplay = currentTab === 'feed'
            ? '🕵️ Warga Anonim'
            : (isMine ? `👤 ${report.reporter_name}` : '🕵️ Warga Anonim');

        return `
        <div class="col col-md-6">
            <div class="card border-0 shadow-sm h-100
                 ${isMine ? 'border-start border-3 border-primary' : ''}">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="fw-bold mb-0 me-2">${report.title}</h6>
                        <span class="badge bg-${statusColor[report.status]||'secondary'} text-nowrap">
                            <i class="bi ${statusIcon[report.status]||'bi-circle'} me-1"></i>${statusLabel[report.status]||report.status}
                        </span>
                    </div>
                    <p class="small text-muted mb-1"><i class="bi bi-tag-fill me-1"></i>${report.category}</p>
                    <p class="small text-muted mb-1"><i class="bi bi-geo-alt-fill me-1"></i>${report.location}</p>
                    <p class="small mb-2 text-secondary flex-grow-1">${report.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <small class="text-muted">${reporterDisplay}</small>
                        ${canEdit ? `
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-outline-primary py-0"
                                onclick="openEditModal(${report.id})">
                                <i class="bi bi-pencil-fill"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-warning py-0"
                                onclick="submitReport(${report.id})">
                                <i class="bi bi-send-fill"></i> Ajukan
                            </button>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}


// ─── EDIT LAPORAN DRAFT ───────────────────────────────────────────────────────
async function openEditModal(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;

    editingReportId = reportId;
    document.getElementById('inputTitle').value       = report.title;
    document.getElementById('inputCategory').value    = report.category;
    document.getElementById('inputLocation').value    = report.location;
    document.getElementById('inputDescription').value = report.description;

    const lbl = document.getElementById('reportModalLabel');
    if (lbl) lbl.innerHTML = `<i class="bi bi-pencil-fill me-2"></i>Edit Laporan Draft`;
    bsModalInstance?.show();
}


// ─── AJUKAN LAPORAN (DRAFT → REPORTED) ───────────────────────────────────────
async function submitReport(reportId) {
    if (!confirm(
        'Yakin ingin mengajukan laporan ini?\n' +
        'Status akan berubah ke REPORTED dan laporan tidak bisa diedit lagi.'
    )) return;

    const report = allReports.find(r => r.id === reportId);
    if (!report) return;

    // FIX: Kirim hanya field yang diperlukan — jangan spread seluruh object report
    // karena ada field read-only (id, created_at, reporter, is_owner) yang akan menyebabkan
    // serializer error atau menimpa data yang tidak boleh diubah
    const payload = {
        title:       report.title,
        category:    report.category,
        location:    report.location,
        description: report.description,
        status:      'REPORTED'   // inilah satu-satunya yang berubah
    };

    try {
        const response = await requestAPI(`/api/report/${reportId}/`, 'PUT', payload);
        if (response.status === 200) {
            alert('Laporan berhasil diajukan! Kini terlihat di Feed Kota oleh semua warga.');
            loadReports();
        } else {
            const err = await response.json().catch(() => ({}));
            alert('Gagal mengajukan: ' + JSON.stringify(err));
        }
    } catch (err) {
        alert('Tidak dapat terhubung ke server.');
    }
}


// ─── PAGINATION ───────────────────────────────────────────────────────────────
function renderPagination(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    if (!totalPages || totalPages <= 1) { container.innerHTML = ''; return; }

    let html = `
        <li class="page-item ${currentPage===1 ? 'disabled' : ''}">
            <button class="page-link" data-page="${currentPage-1}">&laquo;</button>
        </li>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `
        <li class="page-item ${i===currentPage ? 'active' : ''}">
            <button class="page-link" data-page="${i}">${i}</button>
        </li>`;
    }

    html += `
        <li class="page-item ${currentPage===totalPages ? 'disabled' : ''}">
            <button class="page-link" data-page="${currentPage+1}">&raquo;</button>
        </li>`;

    container.innerHTML = html;

    container.querySelectorAll('.page-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page, 10);
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                loadReports();
            }
        });
    });
}


// ─── STATISTIK RINGKASAN (badge Draft / Diproses / Selesai di sidebar) ────────
async function loadSummaryStats() {
    try {
        // Selalu ambil dari tab=my_reports dengan page_size besar untuk statistik personal
        const response = await requestAPI('/api/report/?tab=my_reports&page_size=1000', 'GET');
        if (!response || response.status !== 200) return;

        const data    = await response.json();
        const reports = data.results || [];

        const draft      = reports.filter(r => r.status === 'DRAFT').length;
        const reported   = reports.filter(r => r.status === 'REPORTED').length;
        const verified   = reports.filter(r => r.status === 'VERIFIED').length;
        const inProgress = reports.filter(r => r.status === 'IN_PROGRESS').length;
        const resolved   = reports.filter(r => r.status === 'RESOLVED').length;

        const el = id => document.getElementById(id);
        if (el('countDraft'))       el('countDraft').textContent       = draft;
        if (el('countReported'))    el('countReported').textContent    = reported;
        if (el('countVerified'))    el('countVerified').textContent    = verified;
        if (el('countInProgress'))  el('countInProgress').textContent  = inProgress;
        if (el('countResolved'))    el('countResolved').textContent    = resolved;
    } catch (err) {
        console.error('Gagal muat statistik:', err);
    }
}