const express = require("express");
const axios = require("axios");
require('dotenv').config();

const app = express();
const PORT = 9000;

// Public qovluğu açır
app.use(express.static("public"));

// Google Drive Folder ID
const DRIVE_FOLDER_ID = "1v5cfyKp4TVDy6gEsoAkJvje3URcpMaTM";

// API Key
const GOOGLE_API_KEY = "AIzaSyBxMJPqonSHDBeSQSI-j8YLEGDnIsxonL0";

// Kategoriyalar
const categories = {
    "az": "azerbaijani",
    "turk": "turkish",
    "rus": "russian",
    "foreign": "foreign"
};

// Mahnılar siyahısı endpoint
app.get("/api/songs", async (req, res) => {
    try {
        let allSongs = [];

        for (const [folderName, categoryName] of Object.entries(categories)) {
            try {
                const folderQuery = `'${DRIVE_FOLDER_ID}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
                
                const folderResponse = await axios.get(
                    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)&key=${GOOGLE_API_KEY}`
                );

                if (!folderResponse.data.files || folderResponse.data.files.length === 0) continue;

                const categoryFolderId = folderResponse.data.files[0].id;

                const filesQuery = `'${categoryFolderId}' in parents and mimeType='audio/mpeg' and trashed=false`;

                const filesResponse = await axios.get(
                    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(filesQuery)}&fields=files(id,name)&key=${GOOGLE_API_KEY}`
                );

                filesResponse.data.files.forEach(file => {
                    allSongs.push({
                        name: file.name.replace(".mp3", ""),
                        artist: "Unknown",
                        // ✅ Burada stream üçün link
                        file: `/api/play/${file.id}`,
                        category: categoryName
                    });
                });

            } catch (err) {
                console.error(`${folderName} xətası:`, err.message);
            }
        }

        res.json(allSongs);
    } catch (error) {
        console.error("API xətası:", error.message);
        res.status(500).json({ error: "Mahnılar oxunarkən xəta baş verdi" });
    }
});

// ✅ STREAM endpoint
app.get("/api/play/:id", async (req, res) => {
    const fileId = req.params.id;

    try {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`;

        const response = await axios({
            method: "GET",
            url,
            responseType: "stream"
        });

        res.setHeader("Content-Type", "audio/mpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("Stream xətası:", error.message);
        res.sendStatus(500);
    }
});




// ALBUM ROOT FOLDER (albums qovluğu)
const ALBUMS_FOLDER_ID = "1Cjxc5nxOVVFubYbAm1rAOU6Hw4jZvcFk";

app.get("/api/albums", async (req, res) => {
    try {
        let albums = [];

        const artistsRes = await axios.get(
            `https://www.googleapis.com/drive/v3/files?q='${ALBUMS_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&key=${GOOGLE_API_KEY}`
        );

        for (const artist of artistsRes.data.files) {

            const songsRes = await axios.get(
                `https://www.googleapis.com/drive/v3/files?q='${artist.id}' in parents and mimeType='audio/mpeg'&fields=files(id,name)&key=${GOOGLE_API_KEY}`
            );

            const songs = songsRes.data.files.map(file => ({
                name: file.name.replace(".mp3", ""),
                artist: artist.name,
                file: `/api/play/${file.id}`
            }));

            albums.push({
                artist: artist.name,
                songs
            });
        }

        res.json(albums);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "albums error" });
    }
});






// Server start
app.listen(PORT, () => {
    console.log(`Server işləyir: http://localhost:${PORT}`);
});