const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwQkDhUO42E6qjzNgT6m4-jMqR47VQsky1gLrHHPKeA2NRwEetbTFhTDmsdAE8EsfsI/exec';
let dataSiswa = [];

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    loadDataSiswa();
    loadRiwayatAbsensi();
    loadIzin();
    loadPengumuman();
    loadLokasi();
    loadDataSiswaList();
    showPage('absensi');
});

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('pageTitle').textContent = event.target.textContent.trim();
}

// Toggle Sidebar Mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Load Data Siswa untuk dropdown
async function loadDataSiswa() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getDataSiswa`);
        dataSiswa = await response.json();
        
        const selects = ['siswaSelect', 'siswaIzin'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Pilih Siswa...</option>' + 
                dataSiswa.map(siswa => 
                    `<option value="${siswa.ID}" data-nama="${siswa.Nama}" data-kelas="${siswa.Kelas}">
                        ${siswa.Nama} - ${siswa.Kelas}
                    </option>`
                ).join('');
        });
    } catch (error) {
        console.error('Error loading siswa:', error);
    }
}

// ABSENSI FORM
document.getElementById('absensiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedOption = document.getElementById('siswaSelect').selectedOptions[0];
    const data = {
        action: 'simpanAbsensi',
        ID: document.getElementById('siswaSelect').value,
        Nama: selectedOption.dataset.nama,
        Kelas: selectedOption.dataset.kelas,
        Status: document.getElementById('statusAbsen').value,
        Keterangan: document.getElementById('keterangan').value,
        Tanggal: new Date().toISOString().split('T')[0],
        Waktu: new Date().toLocaleTimeString('id-ID')
    };

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        showMessage('✅ Absensi berhasil disimpan!', 'success');
        e.target.reset();
        loadRiwayatAbsensi();
        
        // Kirim notif alfa
        if (data.Status === 'Alfa') {
            kirimNotifAlfa(data);
        }
        
    } catch (error) {
        showMessage('❌ Gagal menyimpan!', 'error');
    }
});

// Load Riwayat Absensi
async function loadRiwayatAbsensi() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getRiwayatAbsensi`);
        const data = await response.json();
        document.getElementById('riwayatAbsensi').innerHTML = 
            data.length ? data.map(item => `
                <div class="data-row">
                    <div>
                        <strong>${item.Nama}</strong> - ${item.Kelas}<br>
                        <small>${item.Tanggal} ${item.Waktu}</small>
                    </div>
                    <span class="status-badge status-${item.Status.toLowerCase()}">${item.Status}</span>
                </div>
            `).join('') : '<p>Belum ada absensi hari ini</p>';
    } catch (error) {
        document.getElementById('riwayatAbsensi').innerHTML = 'Error loading data';
    }
}

// IZIN FORM
document.getElementById('izinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedOption = document.getElementById('siswaIzin').selectedOptions[0];
    
    const data = {
        action: 'simpanIzin',
        ID: document.getElementById('siswaIzin').value,
        Nama: selectedOption.dataset.nama,
        Kelas: selectedOption.dataset.kelas,
        TanggalIzin: document.getElementById('tanggalIzin').value,
        Keterangan: document.getElementById('keteranganIzin').value
    };

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        showMessage('✅ Izin berhasil diajukan!', 'success');
        e.target.reset();
        loadIzin();
    } catch (error) {
        showMessage('❌ Gagal mengajukan izin!', 'error');
    }
});

async function loadIzin() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getIzin`);
        const data = await response.json();
        document.getElementById('listIzin').innerHTML = 
            data.map(item => `
                <div class="data-row">
                    <div>
                        <strong>${item.Nama}</strong> - ${item.Kelas}<br>
                        <small>${item.TanggalIzin} | ${item.Keterangan}</small>
                    </div>
                    <span class="status-badge">${item.StatusIzin || 'Pending'}</span>
                </div>
            `).join('') || '<p>Belum ada permintaan izin</p>';
    } catch (error) {
        console.error(error);
    }
}

// PENGUMUMAN
document.getElementById('pengumumanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        action: 'simpanPengumuman',
        Judul: document.getElementById('judulPengumuman').value,
        Isi: document.getElementById('isiPengumuman').value,
        Dari: 'Admin',
        Tanggal: new Date().toISOString().split('T')[0]
    };

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        showMessage('✅ Pengumuman dipublish!', 'success');
        e.target.reset();
        loadPengumuman();
    } catch (error) {
        showMessage('❌ Gagal publish!', 'error');
    }
});

async function loadPengumuman() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getPengumuman`);
        const data = await response.json();
        document.getElementById('listPengumuman').innerHTML = 
            data.map(item => `
                <div class="data-row">
                    <div>
                        <h4>${item.Judul}</h4>
                        <p>${item.Isi}</p>
                        <small>${item.Tanggal} - ${item.Dari}</small>
                    </div>
                </div>
            `).join('') || '<p>Belum ada pengumuman</p>';
    } catch (error) {
        console.error(error);
    }
}

async function loadLokasi() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getLokasi`);
        const data = await response.json();
        document.getElementById('lokasiList').innerHTML = 
            data.map(item => `
                <div class="data-row">
                    <div>
                        <strong>${item.NamaLokasi}</strong><br>
                        <small>Lat: ${item.Lat} | Lng: ${item.Lng} | Radius: ${item.Radius}m</small>
                    </div>
                    <span style="color: ${item.Aktif === 'Ya' ? 'green' : 'red'}">
                        ${item.Aktif}
                    </span>
                </div>
            `).join('') || '<p>Belum ada lokasi</p>';
    } catch (error) {
        console.error(error);
    }
}

async function loadDataSiswaList() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getDataSiswa`);
        const data = await response.json();
        document.getElementById('dataSiswaList').innerHTML = 
            data.map(siswa => `
                <div class="data-row">
                    <div>
                        <strong>ID: ${siswa.ID}</strong><br>
                        ${siswa.Nama} - ${siswa.Kelas}<br>
                        <small>${siswa.EmailWali} | ${siswa.NoHP}</small>
                    </div>
                </div>
            `).join('');
    } catch (error) {
        console.error(error);
    }
}

function showMessage(msg, type) {
    // Implementasi toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function kirimNotifAlfa(data) {
    // Notifikasi alfa otomatis ke email wali
    await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'kirimNotifAlfa',
            ...data
        })
    });
}
