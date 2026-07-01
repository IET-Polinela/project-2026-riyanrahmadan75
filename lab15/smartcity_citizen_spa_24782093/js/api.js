// js/api.js
// BASE_URL ke backend Django lokal. Playwright test akan intercept semua /api/** otomatis.
const BASE_URL = 'http://127.0.0.1:8000';

async function requestAPI(endpoint, method = 'GET', bodyData = null) {
    const headers = { 'Content-Type': 'application/json' };

    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config = { method, headers };

    if (bodyData && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = JSON.stringify(bodyData);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        if (response.status === 401) {
            localStorage.clear();
            window.location.hash = '#login';
        }
        return response;
    } catch (error) {
        console.error('Koneksi API Gagal:', error);
        throw error;
    }
}