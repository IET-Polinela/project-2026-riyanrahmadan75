// js/api.js
const BASE_URL = 'http://103.151.63.88:8010' ; // Alamat server backend Django kamu 

async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // Otomatis ambil token dari localStorage jika ada, lalu sisipkan ke Authorization Header 
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config = {
        method: method,
        headers: headers
    };

    if (bodyData && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(bodyData);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        if (response.status === 401) {
            // Pengamanan jika token kedaluwarsa global
            localStorage.clear();
            window.location.hash = '#login';
        }
        return response;
    } catch (error) {
        console.error('Koneksi API Gagal:', error);
        throw error;
    }
}