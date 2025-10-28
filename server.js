const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Kita pakai axios lagi
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Perlu json parser juga

// ## AMBIL URL APPS SCRIPT DARI ENVIRONMENT ##
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

app.get('/', (req, res) => {
    res.send('Server Pergerakan Staf SKM (Apps Script API) sedang berjalan.');
});

// ## KEMAS KINI FUNGSI SUBMIT-MOHON ##
app.post('/submit-mohon', async (req, res) => {
    if (!APPS_SCRIPT_URL) {
        return res.status(500).json({ success: false, message: 'URL Apps Script tidak ditetapkan di server.' });
    }

    try {
        // Data dikirim sebagai form data ke doPost Apps Script
        const params = new URLSearchParams();
        params.append('timestamp', new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }));
        params.append('nama_staf', req.body.nama_staf || '');
        params.append('jenis_pergerakan', req.body.jenis_pergerakan || '');
        params.append('destinasi', req.body.destinasi || '');
        params.append('tarikh_mula', req.body.tarikh_mula || '');
        params.append('tarikh_akhir', req.body.tarikh_akhir || '');
        params.append('tempat_bertugas', req.body.tempat_bertugas || '');
        params.append('tujuan', req.body.tujuan || '');
        params.append('status', 'BARU');

        // Kirim POST request ke Apps Script
        const response = await axios.post(APPS_SCRIPT_URL, params, {
             headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.data && response.data.success) {
            console.log('Data berjaya dihantar ke Apps Script.');
            res.status(200).json({ success: true, message: 'Permohonan berjaya direkodkan!' });
        } else {
            // Jika Apps Script mengembalikan error
            console.error('Apps Script mengembalikan error:', response.data.error);
            res.status(500).json({ success: false, message: `Gagal menghantar permohonan. Ralat Skrip: ${response.data.error || 'Unknown'}` });
        }

    } catch (error) {
        console.error('Ralat menghantar data ke Apps Script:', error.message);
         // Cek jika error dari axios response
         const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        res.status(500).json({ success: false, message: `Gagal menghantar permohonan. Ralat: ${errorMessage}` });
    }
});

// ## KEMAS KINI FUNGSI GET-REKOD ##
app.get('/get-rekod', async (req, res) => {
    if (!APPS_SCRIPT_URL) {
        return res.status(500).json({ message: 'URL Apps Script tidak ditetapkan.' });
    }

    try {
        // Kirim GET request ke Apps Script
        const response = await axios.get(APPS_SCRIPT_URL);
        res.status(200).json(response.data); // Apps Script sudah mengembalikan JSON
    } catch (error) {
        console.error('Ralat mengambil data dari Apps Script:', error);
        res.status(500).json({ message: "Gagal mengambil rekod." });
    }
});

app.listen(port, () => {
    console.log(`Server sedang berjalan di port ${port}`);
});