const express = require('express');
const path = require('path');
const app = express();

// Bereitstellung der statischen Dateien aus dem dist-Ordner
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Leite alle Anfragen auf index.html weiter, um das clientseitige Routing zu unterstützen
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
