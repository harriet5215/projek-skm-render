const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors'); // Import pakej CORS

const app = express();
const port = 3000;

// --- BAHAGIAN BARU: Guna CORS ---
// Ini membenarkan JavaScript dari borang.html berhubung dengan server ini
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/hzist3f2phba7'; // <-- JANGAN LUPA GANTI INI

app.post('/submit-mohon', async (req, res) => {
    const dataToSend = {
        data: {
            timestamp: new Date().toLocaleString('en-MY'),
            nama_staf: req.body.nama_staf,
            jenis_pergerakan: req.body.jenis_pergerakan,
            destinasi: req.body.destinasi,
            tarikh_mula: req.body.tarikh_mula,
            masa_pergi: req.body.masa_pergi,
            tujuan: req.body.tujuan,
            status: 'BARU'
        }
    };

    try {
        await axios.post(SHEETDB_API_URL, dataToSend);
        
        console.log('Data berjaya dihantar ke SheetDB.');
        
        // --- PERUBAHAN UTAMA: Hantar respons JSON ---
        res.status(200).json({ success: true, message: 'Permohonan berjaya direkodkan!' });

    } catch (error) {
        console.error('Ralat menghantar data ke SheetDB:', error.response ? error.response.data : error.message);
        
        // --- PERUBAHAN UTAMA: Hantar ralat dalam format JSON ---
        res.status(500).json({ success: false, message: 'Gagal menghantar permohonan.' });
    }
});

app.listen(port, () => {
    console.log(`Server sedang berjalan di http://localhost:${port}`);
});