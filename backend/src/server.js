const express = require('express');
const cors = require('cors');
require('dotenv').config();

const driver = require('./db');
const apiRoutes = require('./routes'); // NEW: Import our routes

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'EchoGraph API is running.' });
});

// NEW: Mount the routes under the /api prefix
app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
    await driver.close();
    console.log('CognoDB connection closed.');
    process.exit(0);
});