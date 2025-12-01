const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

app.get('/', (req, res) => {
    res.send('Server Pergerakan Staf SKM (Admin Support) sedang berjalan.');
});

// 1. HANTAR PERMOHONAN (Kekal)
app.post('/submit-mohon', async (req, res) => {
    if (!APPS_SCRIPT_URL) return res.status(500).json({ success: false, message: 'URL Apps Script tidak ditetapkan.' });

    try {
        const params = new URLSearchParams();
        params.append('action', 'add'); // Beritahu script ini adalah tambah
        params.append('timestamp', new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }));
        // ... masukkan semua field ...
        Object.keys(req.body).forEach(key => params.append(key, req.body[key]));
        // Default fields jika kosong
        if (!req.body.status) params.append('status', 'BARU');

        const response = await axios.post(APPS_SCRIPT_URL, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        
        if (response.data && response.data.success) {
            res.status(200).json({ success: true, message: 'Permohonan berjaya direkodkan!' });
        } else {
            res.status(500).json({ success: false, message: 'Ralat Apps Script.' });
        }
    } catch (error) {
        console.error('Ralat:', error.message);
        res.status(500).json({ success: false, message: 'Ralat Server.' });
    }
});

// 2. AMBIL REKOD (Kekal)
app.get('/get-rekod', async (req, res) => {
    if (!APPS_SCRIPT_URL) return res.status(500).json({ message: 'URL Apps Script tidak ditetapkan.' });
    try {
        const response = await axios.get(APPS_SCRIPT_URL);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil rekod." });
    }
});

// ## 3. LALUAN BARU: PADAM REKOD (ADMIN) ##
app.post('/admin/delete', async (req, res) => {
    if (!APPS_SCRIPT_URL) return res.status(500).json({ message: 'URL Apps Script tidak ditetapkan.' });
    
    try {
        const params = new URLSearchParams();
        params.append('action', 'delete');
        params.append('original_timestamp', req.body.timestamp); // Kunci unik

        const response = await axios.post(APPS_SCRIPT_URL, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        res.json(response.data);
    } catch (error) {
        console.error('Ralat Padam:', error.message);
        res.status(500).json({ success: false, message: "Gagal memadam rekod." });
    }
});

// ## 4. LALUAN BARU: KEMASKINI REKOD (ADMIN) ##
app.post('/admin/update', async (req, res) => {
    if (!APPS_SCRIPT_URL) return res.status(500).json({ message: 'URL Apps Script tidak ditetapkan.' });

    try {
        const params = new URLSearchParams();
        params.append('action', 'update');
        // Masukkan semua data yang hendak diupdate
        Object.keys(req.body).forEach(key => params.append(key, req.body[key]));

        const response = await axios.post(APPS_SCRIPT_URL, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        res.json(response.data);
    } catch (error) {
        console.error('Ralat Update:', error.message);
        res.status(500).json({ success: false, message: "Gagal mengemaskini rekod." });
    }
});

app.listen(port, () => {
    console.log(`Server sedang berjalan di port ${port}`);
});