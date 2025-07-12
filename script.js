// Mendapatkan elemen dari DOM
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageLoader = document.getElementById('imageLoader');
const downloadBtn = document.getElementById('downloadBtn');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');

// Variabel untuk menyimpan gambar dan statusnya
const frameImage = new Image();
frameImage.src = 'twibbon.png'; // Pastikan nama file sesuai

let userImage = new Image();
let scale = 1.0;
let offsetX = 0;
let offsetY = 0;

// Variabel untuk fungsionalitas geser (drag)
let isDragging = false;
let startX;
let startY;

// Fungsi utama untuk menggambar ulang kanvas
function redrawCanvas() {
    // 1. Bersihkan kanvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Gambar foto pengguna (jika sudah diunggah)
    if (userImage.src) {
        const imgWidth = userImage.width * scale;
        const imgHeight = userImage.height * scale;
        ctx.drawImage(userImage, offsetX, offsetY, imgWidth, imgHeight);
    }

    // 3. Gambar bingkai di atasnya
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}

// Event Listener saat bingkai selesai dimuat
frameImage.onload = () => {
    redrawCanvas();
};

// Event listener saat pengguna memilih foto
imageLoader.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        userImage = new Image();
        userImage.src = event.target.result;
        userImage.onload = () => {
            // Reset posisi dan skala saat gambar baru dimuat
            scale = Math.max(canvas.width / userImage.width, canvas.height / userImage.height);
            offsetX = (canvas.width - userImage.width * scale) / 2;
            offsetY = (canvas.height - userImage.height * scale) / 2;
            
            redrawCanvas();
            downloadBtn.disabled = false; // Aktifkan tombol download
        };
    };
    reader.readAsDataURL(e.target.files[0]);
}, false);

// Event listener untuk kontrol zoom
zoomInBtn.addEventListener('click', () => {
    scale += 0.05;
    redrawCanvas();
});

zoomOutBtn.addEventListener('click', () => {
    if (scale > 0.1) { // Batasi zoom out
        scale -= 0.05;
        redrawCanvas();
    }
});

// --- FUNGSI UNTUK MEMULAI, MENGGESER, DAN MENGHENTIKAN DRAG ---
function startDrag(e) {
    isDragging = true;
    // Dapatkan posisi awal baik dari mouse atau sentuhan
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    startX = clientX - canvas.offsetLeft - offsetX;
    startY = clientY - canvas.offsetTop - offsetY;
    canvas.style.cursor = 'grabbing';
}

function doDrag(e) {
    if (isDragging) {
        // Mencegah scroll halaman di mobile saat menggeser gambar
        e.preventDefault(); 
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        offsetX = clientX - canvas.offsetLeft - startX;
        offsetY = clientY - canvas.offsetTop - startY;
        redrawCanvas();
    }
}

function stopDrag() {
    isDragging = false;
    canvas.style.cursor = 'grab';
}

// --- PENAMBAHAN EVENT LISTENER UNTUK MOUSE DAN SENTUHAN ---

// 1. Event Listener untuk Mouse (Desktop)
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', doDrag);
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mouseleave', stopDrag);

// 2. Event Listener untuk Sentuhan (Mobile)
canvas.addEventListener('touchstart', startDrag);
canvas.addEventListener('touchmove', doDrag);
canvas.addEventListener('touchend', stopDrag);
canvas.addEventListener('touchcancel', stopDrag);


// Event listener untuk tombol download
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'hasil-mpls-2025.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
