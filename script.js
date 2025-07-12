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
        // Simpan konteks sebelum transformasi
        ctx.save();
        
        // Hitung posisi tengah untuk zoom
        const imgWidth = userImage.width * scale;
        const imgHeight = userImage.height * scale;
        
        ctx.drawImage(userImage, offsetX, offsetY, imgWidth, imgHeight);
        
        // Kembalikan konteks ke keadaan semula
        ctx.restore();
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

// Event listener untuk fungsionalitas geser (Pan/Drag)
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - canvas.offsetLeft - offsetX;
    startY = e.clientY - canvas.offsetTop - offsetY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX = e.clientX - canvas.offsetLeft - startX;
        offsetY = e.clientY - canvas.offsetTop - startY;
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});


// Event listener untuk tombol download
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'hasil-mpls-2025.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
