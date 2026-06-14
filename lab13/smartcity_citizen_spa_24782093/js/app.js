// js/app.js

// Deklarasi State Management Aplikasi SPA
let currentTab = 'my_reports';
let currentPage = 1;
let editingReportId = null;
let allReports = [];
let bsModalInstance = null; // Menyimpan instansiasi objek Bootstrap Modal Form

// 🎯 FIX GLOBAL DELEGATION: Memastikan klik tombol tab tidak macet akibat siklus re-render router SPA
document.addEventListener('click', function (e) {
    const tabMyReports = e.target.closest('#tabMyReports');
    if (tabMyReports) {
        e.preventDefault();
        switchTab('my_reports', tabMyReports);
    }

    const tabFeed = e.target.closest('#tabFeed');
    if (tabFeed) {
        e.preventDefault();
        switchTab('feed', tabFeed);
    }
});

function initDashboardPage() {
    // Daftarkan instansiasi Bootstrap Modal secara manual ke objek DOM JavaScript
    const modalEl = document.getElementById('reportModal');
    if (modalEl) bsModalInstance = new bootstrap.Modal(modalEl);

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
    
    const elMyReports = document.getElementById('tabMyReports');
    const elFeed = document.getElementById('tabFeed');
    
    if (elMyReports) elMyReports.classList.remove('active');
    if (elFeed) elFeed.classList.remove('active');
    
    if (element) element.classList.add('active');

    loadDashboardData(currentTab, currentPage);
}

// ==================== 1. FETCHING DATA & PAGINASI PINTAR (ANTI-MELUBER) ====================
async function loadDashboardData(tab, page) {
    currentTab = tab;
    currentPage = page;

    try {
        // Trik bypass batasan halaman server jika membuka tab personal
        const url = tab === 'my_reports' 
            ? `/api/reports/?tab=my_reports&page_size=1000` 
            : `/api/reports/?tab=${tab}&page=${page}`;

        const response = await requestAPI(url, 'GET');
        
        if (response && response.status === 200) {
            const data = await response.json();
            let rawResults = data.results || [];
            
            if (tab === 'my_reports') {
                // 1. Saring paksa hanya laporan yang pelapornya murni 'riyan'
                const filteredReports = rawResults.filter(report => report.reporter === 'riyan');
                
                // 2. Hitung total halaman asli murni milik riyan (bukan total seluruh kota)
                const totalCount = filteredReports.length;
                const totalPages = Math.ceil(totalCount / 10);
                
                // 3. Potong data (Slice) dinamis berdasarkan halaman aktif saat ini
                const startIndex = (page - 1) * 10;
                const endIndex = startIndex + 10;
                allReports = filteredReports.slice(startIndex, endIndex);
                
                // Render ke layar
                renderList();
                renderPagination(totalPages);
            } else {
                // Untuk Tab Feed Kota (Publik), gunakan data asli bawaan server
                allReports = rawResults;
                const totalCount = data.count || 0;
                const totalPages = Math.ceil(totalCount / 10);
                
                renderList();
                renderPagination(totalPages);
            }
            
            // Jalankan sinkronisasi angka statistik sidebar kiri murni data riyan
            loadSummaryStats(); 
        } else {
            const container = document.getElementById('listContainer');
            if (container) {
                container.innerHTML = `
                    <div class="col-12 text-center text-muted p-5">
                        <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                        <p class="mt-2 fw-bold">Gagal memuat data laporan dari server.</p>
                    </div>`;
            }
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
            <div class="col-12 text-center text-muted p-5 bg-white rounded shadow-sm my-2">
                <i class="bi bi-inbox fs-1 mb-2 text-secondary"></i>
                <h6 class="fw-bold m-0 text-secondary">Belum ada aduan warga di kategori ini.</h6>
            </div>`;
        return;
    }

    allReports.forEach(report => {
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
            badgeStyle = "bg-success"; 
        }

        const tombolEditHtml = (report.status === 'DRAFT' && report.is_owner) ? 
            `<button class="btn btn-sm btn-outline-warning fw-bold mt-3" onclick="editDraft(${report.id})">
                <i class="bi bi-pencil-square me-1"></i>Edit Draft
             </button>` : '';

        const cardTemplate = `
            <div class="col-12 mb-3">
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

function renderPagination(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    container.innerHTML = ""; // Bersihkan sisa halaman lama

    if (totalPages <= 1) return; 

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

    if (maxLeft > 1) {
        container.innerHTML += `
            <li class="page-item">
                <button class="page-link fw-bold text-primary" onclick="loadDashboardData('${currentTab}', 1)">« Awal</button>
            </li>`;
    }

    for (let i = maxLeft; i <= maxRight; i++) {
        const kelasAktif = i === currentPage ? 'active' : '';
        const itemPaginasi = `
            <li class="page-item ${kelasAktif}">
                <button class="page-link fw-bold" onclick="loadDashboardData('${currentTab}', ${i})">${i}</button>
            </li>`;
        container.innerHTML += itemPaginasi;
    }

    if (maxRight < totalPages) {
        container.innerHTML += `
            <li class="page-item">
                <button class="page-link fw-bold text-primary" onclick="loadDashboardData('${currentTab}', ${totalPages})">Akhir »</button>
            </li>`;
    }
}

// ==================== 2. MENGHITUNG STATISTIK SIDEBAR (MURNI PUNYA RIYAN) ====================
async function loadSummaryStats() {
    try {
        const response = await requestAPI(`/api/reports/?tab=my_reports&page_size=1000`, 'GET');
        if (response && response.status === 200) {
            const data = await response.json();
            
            // 🎯 Saring murni hanya laporan yang dibuat oleh 'riyan'
            const listDataWarga = (data.results || []).filter(r => r.reporter === 'riyan');

            const totalDraft = listDataWarga.filter(r => r.status === 'DRAFT').length;
            const totalDiproses = listDataWarga.filter(r => r.status === 'DIPROSES' || r.status === 'IN_PROGRESS').length;
            const totalSelesai = listDataWarga.filter(r => r.status === 'SELESAI' || r.status === 'RESOLVED').length;

            // Fungsi pembantu adaptif untuk mengupdate elemen angka di sidebar
            const applyStatValue = (elementId, labelKeyword, finalValue) => {
                let el = document.getElementById(elementId);
                if (el) {
                    el.innerText = finalValue;
                    return;
                }
                // Jika ID tidak ditemukan, cari elemen HTML berdasarkan kemiripan teks di layar
                const listItems = document.querySelectorAll('.list-group-item, li, div');
                for (let item of listItems) {
                    if (item.textContent.toLowerCase().includes(labelKeyword.toLowerCase())) {
                        let badge = item.querySelector('.badge') || item.querySelector('span:last-child');
                        if (badge) {
                            badge.innerText = finalValue;
                            break;
                        }
                    }
                }
            };

            // Suntik paksa datanya ke tampilan komponen
            applyStatValue('countDraft', 'Draft', totalDraft);
            applyStatValue('countDiproses', 'Diproses', totalDiproses);
            applyStatValue('countSelesai', 'Selesai', totalSelesai);
        }
    } catch (err) {
        console.error('Kalkulasi rekap stats gagal:', err);
    }
}

// ==================== 3. MANAGEMENT MODAL FORMULIR ====================
async function editDraft(id) {
    editingReportId = id; 
    try {
        const response = await requestAPI(`/api/reports/${id}/`, 'GET');
        if (response && response.status === 200) {
            const dataLama = await response.json();
            
            document.getElementById('reportTitle').value = dataLama.title;
            document.getElementById('reportCategory').value = dataLama.category;
            document.getElementById('reportLocation').value = dataLama.location;
            document.getElementById('reportDescription').value = dataLama.description;

            document.getElementById('reportModalLabel').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Edit Draft Laporan`;
            bsModalInstance.show(); 
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

    let linkEndpoint = '/api/reports/';
    let metodeHTTP = 'POST';

    if (editingReportId !== null) {
        linkEndpoint = `/api/reports/${editingReportId}/`;
        metodeHTTP = 'PUT';
    }

    try {
        const response = await requestAPI(linkEndpoint, metodeHTTP, payload);
        if (response && (response.status === 201 || response.status === 200)) {
            alert(editingReportId === null ? "Laporan berhasil didaftarkan!" : "Draft laporan sukses diperbarui!");
            
            bsModalInstance.hide(); 
            document.getElementById('reportForm').reset();
            editingReportId = null; 
            
            loadDashboardData(currentTab, 1);
        } else {
            const dataEror = await response.json();
            alert("Operasi Gagal Diproses: " + JSON.stringify(dataEror));
        }
    } catch (err) {
        alert("Terjadi kendala jaringan saat berkomunikasi dengan server.");
    }
}