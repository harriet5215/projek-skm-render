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
    res.send('Server Pergerakan Staf SKM (Apps Script API) sedang berjalan.');
});

app.post('/submit-mohon', async (req, res) => {
    if (!APPS_SCRIPT_URL) {
        return res.status(500).json({ success: false, message: 'URL Apps Script tidak ditetapkan di server.' });
    }

    try {
        const params = new URLSearchParams();
        params.append('timestamp', new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }));
        params.append('nama_staf', req.body.nama_staf || '');
        params.append('jenis_pergerakan', req.body.jenis_pergerakan || '');
        params.append('destinasi', req.body.destinasi || '');
        
        // ## DATA BARU DI SINI ##
        params.append('masa_mula', req.body.masa_mula || '');
        params.append('masa_tamat', req.body.masa_tamat || '');
        
        params.append('tarikh_mula', req.body.tarikh_mula || '');
        params.append('tarikh_akhir', req.body.tarikh_akhir || '');
        params.append('tempat_bertugas', req.body.tempat_bertugas || '');
        params.append('tujuan', req.body.tujuan || '');
        params.append('status', 'BARU');

        const response = await axios.post(APPS_SCRIPT_URL, params, {
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.data && response.data.success) {
            console.log('Data berjaya dihantar ke Apps Script.');
            res.status(200).json({ success: true, message: 'Permohonan berjaya direkodkan!' });
        } else {
            console.error('Apps Script mengembalikan error:', response.data.error);
            res.status(500).json({ success: false, message: `Gagal menghantar permohonan. Ralat Skrip: ${response.data.error || 'Unknown'}` });
        }

    } catch (error) {
        console.error('Ralat menghantar data ke Apps Script:', error.message);
         const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        res.status(500).json({ success: false, message: `Gagal menghantar permohonan. Ralat: ${errorMessage}` });
    }
});

app.get('/get-rekod', async (req, res) => {
    if (!APPS_SCRIPT_URL) {
        return res.status(500).json({ message: 'URL Apps Script tidak ditetapkan.' });
    }

    try {
        const response = await axios.get(APPS_SCRIPT_URL);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Ralat mengambil data dari Apps Script:', error);
        res.status(500).json({ message: "Gagal mengambil rekod." });
    }
});

app.listen(port, () => {
    console.log(`Server sedang berjalan di port ${port}`);
});