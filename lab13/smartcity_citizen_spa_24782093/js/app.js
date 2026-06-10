// js/app.js

// Deklarasi State Management Aplikasi SPA
let currentTab = 'my_reports';
let currentPage = 1;
let editingReportId = null;
let allReports = [];
let bsModalInstance = null; // Menyimpan instansiasi objek Bootstrap Modal Form

function initDashboardPage() {
    // Daftarkan instansiasi Bootstrap Modal secara manual ke objek DOM JavaScript
    const modalEl = document.getElementById('reportModal');
    if (modalEl) bsModalInstance = new bootstrap.Modal(modalEl);

    // 🛠️ Gunakan properti .onclick agar handler lama otomatis ditimpa dan tidak menduplikasi request
    const tabMyReports = document.getElementById('tabMyReports');
    if (tabMyReports) tabMyReports.onclick = (e) => switchTab('my_reports', e.currentTarget);

    const tabFeed = document.getElementById('tabFeed');
    if (tabFeed) tabFeed.onclick = (e) => switchTab('feed', e.currentTarget);

    // Bind Event Click untuk memicu pembukaan Modal Laporan Baru kosong (POST)
    const btnBukaModalBaru = document.getElementById('btnBukaModalBaru');
    if (btnBukaModalBaru) {
        btnBukaModalBaru.onclick = () => {
            editingReportId = null;
            document.getElementById('reportForm').reset();
            document.getElementById('reportModalLabel').innerHTML = `<i class="bi bi-plus-circle-fill me-2"></i>Buat Laporan Baru`;
            bsModalInstance.show();
        };
    }

    // 🔥 SOLUSI UTAMA BUG GANDA: Menimpa event klik modal agar tidak stacking
    const btnDraft = document.getElementById('btnDraft');
    if (btnDraft) btnDraft.onclick = () => handleSaveReport('DRAFT');

    const btnSubmit = document.getElementById('btnSubmit');
    if (btnSubmit) btnSubmit.onclick = () => handleSaveReport('REPORTED');

    // Jalankan penarikan data perdana saat dashboard berhasil di-load
    loadDashboardData(currentTab, currentPage);
}

function switchTab(tabName, element) {
    currentTab = tabName;
    currentPage = 1; // Reset halaman ke 1 setiap ganti kategori tab
    
    document.getElementById('tabMyReports').classList.remove('active');
    document.getElementById('tabFeed').classList.remove('active');
    element.classList.add('active');

    loadDashboardData(currentTab, currentPage);
}

// ==================== 1. FETCHING DATA TERPAGINASI & MANIPULASI PROGRESS BAR ====================
async function loadDashboardData(tab, page) {
    currentTab = tab;
    currentPage = page;

    try {
        // Tembak endpoint API terpaginasi dengan query parameter pendukung Lab 12
        const response = await requestAPI(`/api/report?tab=${tab}&page=${page}`, 'GET');
        
        if (response && response.status === 200) {
            const data = await response.json();
            
            // INSTRUKSI 1: Ekstraksi Data Paginasi (Destructuring)
            allReports = data.results || [];
            const totalCount = data.count || 0;
            const totalPages = Math.ceil(totalCount / 10); // Batasan pembagian 10 data per halaman

            // INSTRUKSI 2: Sinkronisasi Antarmuka Antrean Layar
            renderList();
            renderPagination(totalPages);
            loadSummaryStats(); // Perbarui rekap angka sidebar kiri
        } else {
            document.getElementById('listContainer').innerHTML = `
                <div class="col-12 text-center text-muted p-5">
                    <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                    <p class="mt-2 fw-bold">Gagal memuat data laporan dari server.</p>
                </div>`;
        }
    } catch (err) {
        console.error('Eror muat dashboard data:', err);
    }
}

function renderList() {
    const container = document.getElementById('listContainer');
    if (!container) return;
    container.innerHTML = "";

    if (allReports.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted p-5 bg-white rounded shadow-sm">
                <i class="bi bi-inbox fs-1 mb-2"></i>
                <h6 class="fw-bold">Belum ada aduan warga di kategori ini.</h6>
            </div>`;
        return;
    }

    allReports.forEach(report => {
        // [Di dalam fungsi renderList bagian loop allReports.forEach]

// Logika Dinamis indikasi tebal lebar Progress Bar & Style Badge (Mendukung versi Inggris & Indonesia)
let progressWidth = "25%";
let progressColor = "bg-secondary";
let badgeStyle = "bg-secondary";

if (report.status === 'REPORTED' || report.status === 'VERIFIED') {
    progressWidth = "50%"; 
    progressColor = "bg-info text-dark"; 
    badgeStyle = "bg-info text-dark";
} else if (report.status === 'DIPROSES' || report.status === 'IN_PROGRESS') {
    progressWidth = "75%"; 
    progressColor = "bg-primary"; 
    badgeStyle = "bg-primary";
} else if (report.status === 'SELESAI' || report.status === 'RESOLVED') {
    progressWidth = "100%"; 
    progressColor = "bg-success"; 
    badgeStyle = "bg-success"; // Otomatis berubah hijau jika RESOLVED
}

        // Tombol Edit hanya dimunculkan jika statusnya DRAFT dan milik user yang sedang aktif login
        const tombolEditHtml = (report.status === 'DRAFT' && report.is_owner) ? 
            `<button class="btn btn-sm btn-outline-warning fw-bold mt-3" onclick="editDraft(${report.id})">
                <i class="bi bi-pencil-square me-1"></i>Edit Draft
             </button>` : '';

        const cardTemplate = `
            <div class="col-12">
                <div class="card border-0 shadow-sm p-4 position-relative rounded-3">
                    <span class="badge ${badgeStyle} position-absolute top-0 end-0 m-4 fw-bold p-2">${report.status}</span>
                    <h5 class="fw-bold mb-1 text-primary pe-5">${report.title}</h5>
                    <p class="text-muted small mb-2">
                        <i class="bi bi-person-circle me-1"></i>Pelapor: <b>${report.reporter || 'Anonim'}</b> | 
                        <i class="bi bi-geo-alt-fill text-danger me-1"></i>Lokasi: ${report.location}
                    </p>
                    <p class="text-secondary small mb-3">${report.description}</p>
                    
                    <div class="mt-2">
                        <div class="d-flex justify-content-between text-muted small mb-1">
                            <span>Status Penanganan Masalah:</span>
                            <span class="fw-bold text-dark">${progressWidth}</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar ${progressColor} progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${progressWidth}"></div>
                        </div>
                    </div>
                    ${tombolEditHtml}
                </div>
            </div>`;
        container.innerHTML += cardTemplate;
    });
}

// 🔥 LOGIKA BARU: PAGINASI PINTAR (SLIDING WINDOW) AGAR TIDAK MELUBER KELUAR LAYAR
function renderPagination(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    container.innerHTML = "";

    if (totalPages <= 1) return; // Menyembunyikan paginasi jika hanya ada 1 halaman

    // Mengatur jendela halaman aktif (Maksimal menampilkan 5 tombol angka di layar)
    let maxLeft = (currentPage - 2);
    let maxRight = (currentPage + 2);

    if (maxLeft < 1) {
        maxLeft = 1;
        maxRight = Math.min(totalPages, 5);
    }

    if (maxRight > totalPages) {
        maxRight = totalPages;
        maxLeft = Math.max(1, totalPages - 4);
    }

    // 1. Tombol lompat ke halaman "Awal"
    if (maxLeft > 1) {
        container.innerHTML += `
            <li class="page-item">
                <button class="page-link fw-bold text-primary" onclick="loadDashboardData('${currentTab}', 1)">« Awal</button>
            </li>`;
    }

    // 2. Loop Menggambar Angka Paginasi Terbatas
    for (let i = maxLeft; i <= maxRight; i++) {
        const kelasAktif = i === currentPage ? 'active' : '';
        const itemPaginasi = `
            <li class="page-item ${kelasAktif}">
                <button class="page-link fw-bold" onclick="loadDashboardData('${currentTab}', ${i})">${i}</button>
            </li>`;
        container.innerHTML += itemPaginasi;
    }

    // 3. Tombol lompat ke halaman "Akhir"
    if (maxRight < totalPages) {
        container.innerHTML += `
            <li class="page-item">
                <button class="page-link fw-bold text-primary" onclick="loadDashboardData('${currentTab}', ${totalPages})">Akhir »</button>
            </li>`;
    }
}

// ==================== 2. MENGHITUNG STATISTIK SIDEBAR (BYPASS PAGINATION) ====================
async function loadSummaryStats() {
    try {
        // Trik bypass batasan halaman menggunakan limit parameter yang diatur sengaja sangat besar
        const response = await requestAPI(`/api/report?tab=my_reports&page_size=1000`, 'GET');
        if (response && response.status === 200) {
           // [Di dalam fungsi loadSummaryStats bagian response status === 200]
const data = await response.json();
const listDataWarga = data.results || [];

// Memanfaatkan manipulasi array dengan toleransi dua bahasa status
const totalDraft = listDataWarga.filter(r => r.status === 'DRAFT').length;
const totalDiproses = listDataWarga.filter(r => r.status === 'DIPROSES' || r.status === 'IN_PROGRESS').length;
const totalSelesai = listDataWarga.filter(r => r.status === 'SELESAI' || r.status === 'RESOLVED').length;

if (document.getElementById('countDraft')) document.getElementById('countDraft').innerText = totalDraft;
if (document.getElementById('countDiproses')) document.getElementById('countDiproses').innerText = totalDiproses;
if (document.getElementById('countSelesai')) document.getElementById('countSelesai').innerText = totalSelesai;
        }
    } catch (err) {
        console.error('Kalkulasi rekap stats gagal:', err);
    }
}

// ==================== 3. MANAGEMENT MODAL FORMULIR (POST & PUT) ====================
async function editDraft(id) {
    editingReportId = id; // Isi variabel global dengan id objek draft yang di klik
    try {
        const response = await requestAPI(`/api/report/${id}`, 'GET');
        if (response && response.status === 200) {
            const dataLama = await response.json();
            
            // Isi otomatis kolom formulir dengan data lama aduan draft
            document.getElementById('reportTitle').value = dataLama.title;
            document.getElementById('reportCategory').value = dataLama.category;
            document.getElementById('reportLocation').value = dataLama.location;
            document.getElementById('reportDescription').value = dataLama.description;

            document.getElementById('reportModalLabel').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Edit Draft Laporan`;
            bsModalInstance.show(); // Tampilkan pop-up modal
        }
    } catch (err) {
        alert("Eror memuat data draft laporan warga.");
    }
}

async function handleSaveReport(targetStatus) {
    const payload = {
        title: document.getElementById('reportTitle').value,
        category: document.getElementById('reportCategory').value,
        location: document.getElementById('reportLocation').value,
        description: document.getElementById('reportDescription').value,
        status: targetStatus
    };

    if (!payload.title || !payload.location || !payload.description) {
        alert("Mohon isi seluruh bidang kolom formulir!");
        return;
    }

    let linkEndpoint = '/api/report';
    let metodeHTTP = 'POST';

    // Jika global variabel terisi ID, ubah rute dan metode secara dinamis menjadi PUT (Kasus Edit)
    if (editingReportId !== null) {
        linkEndpoint = `/api/report/${editingReportId}`;
        metodeHTTP = 'PUT';
    }

    try {
        const response = await requestAPI(linkEndpoint, metodeHTTP, payload);
        if (response && (response.status === 201 || response.status === 200)) {
            alert(editingReportId === null ? "Laporan berhasil didaftarkan!" : "Draft laporan sukses diperbarui!");
            
            bsModalInstance.hide(); // Tutup pop-up modal form
            document.getElementById('reportForm').reset();
            editingReportId = null; // Kembalikan nilai global id ke null
            
            // Ambil ulang data lokal agar antarmuka diperbarui secara instan tanpa trigger window reload
            loadDashboardData(currentTab, 1);
        } else {
            const dataEror = await response.json();
            alert("Operasi Gagal Diproses: " + JSON.stringify(dataEror));
        }
    } catch (err) {
        alert("Terjadi kendala jaringan saat berkomunikasi dengan server.");
    }
}