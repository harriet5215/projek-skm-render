const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
// Render will set the PORT automatically
const port = process.env.PORT || 3000;

// Use CORS to allow access from any domain
app.use(cors());

// Middleware to read data from the form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Main route to confirm the server is running
app.get('/', (req, res) => {
    res.send('Server Pergerakan Staf SKM sedang berjalan.');
});

// Route to receive application data from index.html
app.post('/submit-mohon', async (req, res) => {
    // Get the SheetDB API URL from Environment Variables on Render
    const SHEETDB_API_URL = process.env.SHEETDB_API_URL;
    
    if (!SHEETDB_API_URL) {
        return res.status(500).json({ success: false, message: 'URL API tidak ditetapkan di server.' });
    }

    const dataToSend = {
        data: {
            timestamp: new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
            nama_staf: req.body.nama_staf,
            jenis_pergerakan: req.body.jenis_pergerakan,
            destinasi: req.body.destinasi,
            tarikh_mula: req.body.tarikh_mula,
            // ## PERUBAHAN DI SINI: TAMBAH TARIKH AKHIR ##
            tarikh_akhir: req.body.tarikh_akhir,
            masa_pergi: req.body.masa_pergi,
            tujuan: req.body.tujuan,
            status: 'BARU'
        }
    };

    try {
        await axios.post(SHEETDB_API_URL, dataToSend);
        console.log('Data berjaya dihantar ke SheetDB.');
        res.status(200).json({ success: true, message: 'Permohonan berjaya direkodkan!' });
    } catch (error) {
        console.error('Ralat menghantar data ke SheetDB:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Gagal menghantar permohonan.' });
    }
});

// Route for dashboard.html to fetch all records
app.get('/get-rekod', async (req, res) => {
    const SHEETDB_API_URL = process.env.SHEETDB_API_URL;

    if (!SHEETDB_API_URL) {
        return res.status(500).json({ message: 'URL API tidak ditetapkan di server.' });
    }

    try {
        const response = await axios.get(SHEETDB_API_URL);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Ralat mengambil data dari SheetDB:', error);
        res.status(500).json({ message: "Gagal mengambil rekod." });
    }
});

app.listen(port, () => {
    console.log(`Server sedang berjalan di port ${port}`);
});