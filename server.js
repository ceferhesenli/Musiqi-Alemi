// const express = require("express");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const PORT = 3000;

// // public qovluğunu açır
// app.use(express.static("public"));

// // audio qovluğunu açır (mahnılar üçün)
// app.use("/audio", express.static("audio"));

// // 🎵 MAHNILARI OXUYUR
// app.get("/api/songs", (req, res) => {
//     const categories = ["az", "turk", "rus", "foreign"];
//     let allSongs = [];

//     categories.forEach(category => {
//         const folderPath = path.join(__dirname, "audio", category);

//         if (fs.existsSync(folderPath)) {
//             const files = fs.readdirSync(folderPath);

//             files.forEach(file => {
//                 if (file.endsWith(".mp3")) {
//                     allSongs.push({
//                         name: file.replace(".mp3", ""),
//                         artist: "Unknown",
//                         file: `/audio/${category}/${file}`,
//                         category:
//                             category === "az" ? "azerbaijani" :
//                             category === "turk" ? "turkish" :
//                             category === "rus" ? "russian" : "foreign"
//                     });
//                 }
//             });
//         }
//     });

//     res.json(allSongs);
// });

// // server start
// app.listen(PORT, () => {
//     console.log("Server işləyir: http://localhost:3000");
// });



// !2ci

// const express = require("express");
// const axios = require("axios");
// const path = require("path");
// require('dotenv').config();

// const app = express();
// const PORT = 9000;

// // public qovluğunu açır
// app.use(express.static("public"));

// // Google Drive Folder ID
// const DRIVE_FOLDER_ID = "1v5cfyKp4TVDy6gEsoAkJvje3URcpMaTM";

// // ← BURAYA KOPYALANAN API KEY-İ YAPIŞDIR
// const GOOGLE_API_KEY = "AIzaSyBxMJPqonSHDBeSQSI-j8YLEGDnIsxonL0";

// // Kategoriyalar
// const categories = {
//     "az": "azerbaijani",
//     "turk": "turkish",
//     "rus": "russian",
//     "foreign": "foreign"
// };

// // 🎵 GOOGLE DRIVE-DAN MAHNILARI OXUYUR
// app.get("/api/songs", async (req, res) => {
//     try {
//         let allSongs = [];

//         // Hər kategoriya üçün
//         for (const [folderName, categoryName] of Object.entries(categories)) {
//             try {
//                 // Google Drive-da qovluğu tap
//                 const folderQuery = `'${DRIVE_FOLDER_ID}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
                
//                 const folderResponse = await axios.get(
//                     `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery )}&fields=files(id,name)&key=${GOOGLE_API_KEY}`
                    
//                 );

//                 if (folderResponse.data.files.length === 0) {
//                     console.log(`${folderName} qovluğu tapılmadı`);
//                     continue;
//                 }

//                 const categoryFolderId = folderResponse.data.files[0].id;

//                 // Qovluğun içindəki MP3 faylları tap
//                 const filesQuery = `'${categoryFolderId}' in parents and mimeType='audio/mpeg' and trashed=false`;
                
//                 const filesResponse = await axios.get(
//                     `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(filesQuery )}&fields=files(id,name)&key=${GOOGLE_API_KEY}`
//                 );



//                 filesResponse.data.files.forEach(file => {
//     allSongs.push({
//         name: file.name.replace(".mp3", ""),
//         artist: "Unknown",
//         file: `https://drive.google.com/uc?export=download&id=${file.id}`,
//         category: categoryName
//     });
// });

//                 console.log(`${folderName}: ${filesResponse.data.files.length} mahnı tapıldı`);

//             } catch (error) {
//                 console.error(`${folderName} kategoriyası oxunarkən xəta:`, error.message);
//             }
//         }

//         console.log(`Cəmi: ${allSongs.length} mahnı`);
//         res.json(allSongs);
//     } catch (error) {
//         console.error("API xətası:", error.message);
//         res.status(500).json({ error: "Mahnılar oxunarkən xəta baş verdi" });
//     }
// });

// // server start
// app.listen(PORT, () => {
//     console.log(`Server işləyir: http://localhost:${PORT}` );
// });


// !3cu

const express = require("express");
const axios = require("axios");
require('dotenv').config();

const app = express();
const PORT = 9000;

app.use(express.static("public"));

// Google Drive Folder ID
const DRIVE_FOLDER_ID = "1v5cfyKp4TVDy6gEsoAkJvje3URcpMaTM";

// API KEY
const GOOGLE_API_KEY = "AIzaSyBxMJPqonSHDBeSQSI-j8YLEGDnIsxonL0";

// Kategoriyalar
const categories = {
    "az": "azerbaijani",
    "turk": "turkish",
    "rus": "russian",
    "foreign": "foreign"
};

// 🎵 MAHNILARI GÖTÜRÜR
app.get("/api/songs", async (req, res) => {
    try {
        let allSongs = [];

        for (const [folderName, categoryName] of Object.entries(categories)) {

            const folderQuery = `'${DRIVE_FOLDER_ID}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

            const folderResponse = await axios.get(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(folderQuery)}&fields=files(id,name)&key=${GOOGLE_API_KEY}`
            );

            if (folderResponse.data.files.length === 0) continue;

            const categoryFolderId = folderResponse.data.files[0].id;

            const filesQuery = `'${categoryFolderId}' in parents and mimeType='audio/mpeg' and trashed=false`;

            const filesResponse = await axios.get(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(filesQuery)}&fields=files(id,name)&key=${GOOGLE_API_KEY}`
            );

            filesResponse.data.files.forEach(file => {
                allSongs.push({
                    name: file.name.replace(".mp3", ""),
                    artist: "Unknown",
                    file: `/api/play/${file.id}`, // ✅ BURANI DƏYİŞDİK
                    category: categoryName
                });
            });
        }

        res.json(allSongs);

    } catch (error) {
        console.error("API xətası:", error.message);
        res.status(500).json({ error: "Xəta baş verdi" });
    }
});


// 🎧 STREAM (ƏSAS HİSSƏ)
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

app.listen(PORT, () => {
    console.log(`Server işləyir: http://localhost:${PORT}`);
});