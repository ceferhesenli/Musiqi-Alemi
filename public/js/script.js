
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



const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');



nextBtn.onclick = () => {
    playNextTrack();
};

prevBtn.onclick = () => {
    playPrevTrack();
};




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

fetch("/api/songs")
    .then(res => res.json())
    .then(data => {
        tracks = data;
        console.log("Mahnılar gəldi:", tracks);
    });




let currentAudio = null;
let currentTrack = null;
let isPlaying = false;

// ======================
// PLAY TRACK FUNKSIYASI
// ======================







function playTrack(track) {
    if (currentAudio) currentAudio.pause();

  currentAudio = new Audio(track.file.startsWith('http') 
    ? track.file 
    : window.location.origin + track.file
);



    // currentAudio = new Audio(track.file);
    
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


// ⏭️ NÖVBƏTİ MAHNİ
function playNextTrack() {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(t => t.file === currentTrack.file);
    const nextTrack = tracks[currentIndex + 1] || tracks[0]; // sonrakı yoxdursa birinci
    playTrack(nextTrack);
}

// ⏮️ ƏVVƏLKİ MAHNİ
function playPrevTrack() {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(t => t.file === currentTrack.file);
    const prevTrack = tracks[currentIndex - 1] || tracks[tracks.length - 1]; // əvvəlki yoxdursa sonuncu
    playTrack(prevTrack);
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

    // hər dəfə təmizlə
    modalSongsList.innerHTML = '';

    // tracks-dən filter et
    const filteredTracks = tracks.filter(track => track.category === category);

    // filteredTracks.forEach(track => {
    //     const div = document.createElement('div');
    //     div.className = 'modal-song-item';

    //     div.innerHTML = `
    //         <div class="modal-song-info">
    //             <p class="modal-song-name">${track.name}</p>
    //             <p class="modal-song-artist">${track.artist}</p>
    //         </div>
    //         <button class="modal-song-play-btn">▶️</button>
    //     `;



    //     //! play
        
    //     div.querySelector('button').addEventListener('click', () => {
    //         playTrack(track);
    //         songsModal.style.display = 'none';
    //     });

    //     modalSongsList.appendChild(div);
    // });

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

    // 🎵 Div-ə klik veririk (indi mahnının hər yerinə klik etmək olar)
    div.addEventListener('click', () => {
        playTrack(track);
        songsModal.style.display = 'none';
    });

    // 🎵 Button klikini ayrıca saxlayırıq
    div.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation(); // div klikini təkrar işə salmır
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