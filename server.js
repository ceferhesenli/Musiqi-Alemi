const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// public qovluğunu açır
app.use(express.static("public"));

// audio qovluğunu açır (mahnılar üçün)
app.use("/audio", express.static("audio"));

// 🎵 MAHNILARI OXUYUR
app.get("/api/songs", (req, res) => {
    const categories = ["az", "turk", "rus", "foreign"];
    let allSongs = [];

    categories.forEach(category => {
        const folderPath = path.join(__dirname, "audio", category);

        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath);

            files.forEach(file => {
                if (file.endsWith(".mp3")) {
                    allSongs.push({
                        name: file.replace(".mp3", ""),
                        artist: "Unknown",
                        file: `/audio/${category}/${file}`,
                        category:
                            category === "az" ? "azerbaijani" :
                            category === "turk" ? "turkish" :
                            category === "rus" ? "russian" : "foreign"
                    });
                }
            });
        }
    });

    res.json(allSongs);
});

// server start
app.listen(PORT, () => {
    console.log("Server işləyir: http://localhost:3000");
});