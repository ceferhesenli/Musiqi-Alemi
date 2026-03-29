
// ======================
// ELEMENTLƏR
// ======================
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

const playerFooter = document.getElementById('playerFooter');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const closeBtn = document.getElementById('closeBtn');
const floatingAlbumArt = document.getElementById('floatingAlbumArt');
const floatingAlbumImg = document.getElementById('floatingAlbumImg');

const songsModal = document.getElementById('songsModal');
const modalTitle = document.getElementById('modalTitle');
const modalSongsList = document.getElementById('modalSongsList');
const modalCloseBtn = document.getElementById('modalCloseBtn');


const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');


// menu-list
let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
 navbar.classList.toggle('active');
}
 window.onscroll = () =>{
 navbar.classList.remove('active');
 }
 

// !menu-list
// ======================
// MAHNILAR
// ======================
let tracks = [];

fetch("https://musiqi-d-nyas.onrender.com")
    .then(res => res.json())
    .then(data => {
        tracks = data;
        console.log("Mahnılar yükləndi:", tracks);
    });

let currentAudio = null;
let currentTrack = null;
let isPlaying = false;

// ======================
// PLAY TRACK FUNKSIYASI
// ======================

function playTrack(track) {
    if (currentAudio) currentAudio.pause();

    currentAudio = new Audio(track.file);
    
    currentAudio.addEventListener('timeupdate', () => {
    const currentTime = currentAudio.currentTime;
    const duration = currentAudio.duration;

    if (duration) {
        const percent = (currentTime / duration) * 100;
        progress.style.width = percent + '%';

        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
    }
});
    currentAudio.play();

    currentTrack = track;
    isPlaying = true;

    playerFooter.style.display = 'block';
    playerTitle.textContent = track.name;
    playerArtist.textContent = track.artist;

    floatingAlbumArt.style.display = 'block';
    floatingAlbumImg.src = track.image || 'image/music3.jpg';

    // 🔥 MAHNI BİTƏNDƏ NÖVBƏTİ KEÇİR
    currentAudio.onended = () => {
        playNextTrack();
    };

    updatePlayButton();
}

function formatTime(time) {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function playNextTrack() {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(t => t.file === currentTrack.file);

    const nextTrack = tracks[currentIndex + 1] || tracks[0];

    playTrack(nextTrack);
}

let isDragging = false;

// MOUSE BASANDA
progressBar.addEventListener('mousedown', () => {
    isDragging = true;
});

// MOUSE BURAXANDA
document.addEventListener('mouseup', () => {
    isDragging = false;
});

// MOUSE HƏRƏKƏT EDƏNDƏ
document.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentAudio) return;

    const rect = progressBar.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;

    // sərhədlər
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;

    const percent = offsetX / rect.width;
    progress.style.width = (percent * 100) + '%';

    currentAudio.currentTime = percent * currentAudio.duration;
});




// ======================
// PLAY/PAUSE FUNKSIYASI
// ======================
playPauseBtn.onclick = () => {
    if (!currentAudio) return;

    if (isPlaying) {
        currentAudio.pause();
        isPlaying = false;
    } else {
        currentAudio.play();
        isPlaying = true;
    }

    updatePlayButton();
};

function updatePlayButton() {
    playPauseBtn.textContent = isPlaying ? '⏸️ Pause' : '▶️ Play';
}


// YÜKLƏ
downloadBtn.onclick = () => {
    if (!currentTrack) return;
    
    const link = document.createElement('a');
    link.href = currentTrack.file;
    link.download = currentTrack.name + '.mp3';
    link.click();
};

// SEVİMLİ
favoriteBtn.onclick = () => {
    alert('❤️ ' + currentTrack.name + ' sevimli əlavə edildi!');
};

// ======================
// FOOTER BAĞLAMA
// ======================
closeBtn.onclick = () => {
    playerFooter.classList.add('closing');
    setTimeout(() => {
        playerFooter.style.display = 'none';
        playerFooter.classList.remove('closing');
    }, 300);
};

floatingAlbumArt.onclick = () => {
    playerFooter.style.display = 'block';
};

// ======================
// AXTARIŞ FUNKSIYASI
// ======================
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    searchResults.innerHTML = '';

    if (!query) return;

    const results = tracks.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query)
    );

    results.forEach(track => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.textContent = `${track.name} - ${track.artist}`;

        div.onclick = () => {
            playTrack(track);
        };

        searchResults.appendChild(div);
    });
});

// ======================
// CARD → MODAL
// ======================

document.querySelectorAll('.song-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        openModal(category);
    });
});




function openModal(category) {
    const categoryNames = {
        'azerbaijani': 'Azərbaycanca Mahnılar',
        'turkish': 'Türkçə Mahnılar',
        'foreign': 'Xarici Mahnılar',
        'russian': 'Rusça Mahnılar'
    };

    modalTitle.textContent = categoryNames[category] || 'Mahnılar';

    modalSongsList.innerHTML = '';

    const filteredTracks = tracks.filter(track => track.category === category);

    filteredTracks.forEach(track => {
        const div = document.createElement('div');
        div.className = 'modal-song-item';

        div.innerHTML = `
            <div class="modal-song-info">
                <p class="modal-song-name">${track.name}</p>
                <p class="modal-song-artist">${track.artist}</p>
            </div>
            <button class="modal-song-play-btn">▶️</button>
        `;

        div.querySelector('button').addEventListener('click', () => {
            playTrack(track);
            songsModal.style.display = 'none';
        });

        modalSongsList.appendChild(div);
    });

    songsModal.style.display = 'flex';
}




// / Mahnı siyahısı

// !filter düymeleri

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        if (filter === 'all') {
            document.querySelectorAll('.song-card').forEach(card => {
                card.style.display = 'block';
            });
        } else {
            document.querySelectorAll('.song-card').forEach(card => {
                if (card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    });
});
// filter düymeleri


// ======================
// MODAL BAĞLAMA
// ======================
modalCloseBtn.addEventListener('click', () => {
    songsModal.style.display = 'none';
});

songsModal.addEventListener('click', (e) => {
    if (e.target === songsModal) songsModal.style.display = 'none';
});
















