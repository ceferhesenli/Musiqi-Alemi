const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();


const cors = require("cors");
app.use(cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.use(express.static("public"));
app.use("/audio", express.static("audio"));

// 🎵 MAHNILARI OXU
app.get("/api/songs", (req, res) => {
  const categories = ["az", "turk", "rus", "foreign"];
  let allSongs = [];

  categories.forEach((category) => {
    const folderPath = path.join(__dirname, "audio", category);

    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);

      files.forEach((file) => {
        if (file.endsWith(".mp3")) {
          allSongs.push({
            name: file.replace(".mp3", ""),
            artist: "unkown",
            file: `/audio/${category}/${file}`,
            category:
              category === "az"
                ? "azerbaijani"
                : category === "turk"
                  ? "turkish"
                  : category === "rus"
                    ? "russian"
                    : "foreign",
          });
        }
      });
    }
  });

  res.json(allSongs);
});

app.listen(PORT, () => {
  console.log("Server işləyir: http://localhost:3000");
});
