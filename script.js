const form = document.getElementById('absensiForm');
const message = document.getElementById('message');
const riwayatList = document.getElementById('riwayatList');
const tanggal = document.getElementById('tanggal');

// Set tanggal otomatis
function setTanggal() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    tanggal.textContent = now.toLocaleDateString('id-ID', options);
}
setTanggal();
setInterval(setTanggal, 60000);

// Web App URL - GANTI DENGAN URL GOOGLE APPS SCRIPT ANDA
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzRFtljh1WrSESM3uCBsGnUg4Ipap2pioQmycMuRi5NbuwBwvdOHufXQ3eiF8CORNsF/exec';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        nama: document.getElementById('nama').value,
        kelas: document.getElementById('kelas').value,
        status: document.getElementById('status').value,
        timestamp: new Date().toISOString()
    };

    try {
        showMessage('Menyimpan...', 'info');
        
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        showMessage('✅ Absensi berhasil disimpan!', 'success');
        form.reset();
        loadRiwayat();
        
    } catch (error) {
        showMessage('❌ Gagal menyimpan absensi. Coba lagi!', 'error');
        console.error('Error:', error);
    }
});

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
    setTimeout(() => {
        message.textContent = '';
        message.className = '';
    }, 4000);
}

async function loadRiwayat() {
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getRiwayat`);
        const data = await response.json();
        tampilkanRiwayat(data);
    } catch (error) {
        riwayatList.innerHTML = '<p>Belum ada data absensi hari ini</p>';
    }
}

function tampilkanRiwayat(data) {
    if (!data || data.length === 0) {
        riwayatList.innerHTML = '<p>Belum ada data absensi hari ini</p>';
        return;
    }
    
    riwayatList.innerHTML = data.map(item => `
        <div class="absensi-item">
            <div>
                <strong>${item.nama}</strong> - ${item.kelas}
                <br><small>${new Date(item.timestamp).toLocaleString('id-ID')}</small>
            </div>
            <span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span>
        </div>
    `).join('');
}

// Load riwayat saat halaman dimuat
loadRiwayat();
setInterval(loadRiwayat, 30000); // Refresh setiap 30 detik
