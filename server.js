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

app.get('/', (req, res) => res.send('Server Admin V3 SKM Berjalan.'));

// --- API UNTUK BORANG ---
app.post('/submit-mohon', async (req, res) => {
    if (!APPS_SCRIPT_URL) return res.status(500).json({ success: false, message: 'Config Error' });
    try {
        const params = new URLSearchParams();
        params.append('action', 'add');
        params.append('timestamp', new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }));
        Object.keys(req.body).forEach(key => params.append(key, req.body[key]));
        if (!req.body.status) params.append('status', 'BARU');
        
        const response = await axios.post(APPS_SCRIPT_URL, params);
        res.json(response.data);
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.get('/get-rekod', async (req, res) => {
    if (!APPS_SCRIPT_URL) return res.status(500).json({ message: 'Config Error' });
    try {
        const response = await axios.get(APPS_SCRIPT_URL);
        res.json(response.data);
    } catch (error) { res.status(500).json({ message: "Error fetching records" }); }
});

// --- API UNTUK ADMIN ---
app.post('/admin/login', async (req, res) => {
    if (!APPS_SCRIPT_URL) return res.status(500).json({ message: 'Config Error' });
    try {
        // Hantar GET request dengan params untuk login (Apps Script doGet handle ini)
        const response = await axios.get(`${APPS_SCRIPT_URL}?action=login&username=${req.body.username}&password=${req.body.password}`);
        res.json(response.data);
    } catch (error) { res.status(500).json({ success: false, message: "Login Error" }); }
});

app.post('/admin/delete', async (req, res) => {
    try {
        const params = new URLSearchParams();
        params.append('action', 'delete');
        params.append('original_timestamp', req.body.timestamp);
        const response = await axios.post(APPS_SCRIPT_URL, params);
        res.json(response.data);
    } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/admin/update-profile', async (req, res) => {
    try {
        const params = new URLSearchParams();
        params.append('action', 'update_profile');
        params.append('username', req.body.username);
        params.append('new_password', req.body.new_password);
        params.append('new_nama', req.body.new_nama);
        const response = await axios.post(APPS_SCRIPT_URL, params);
        res.json(response.data);
    } catch (error) { res.status(500).json({ success: false }); }
});

app.listen(port, () => console.log(`Server running on port ${port}`));