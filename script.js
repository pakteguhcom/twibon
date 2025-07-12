// Mendapatkan elemen dari DOM
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageLoader = document.getElementById('imageLoader');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn'); // Ambil tombol bagikan
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');

// Variabel untuk menyimpan gambar dan statusnya
const frameImage = new Image();
frameImage.src = 'twibbon.png'; 

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (userImage.src) {
        const imgWidth = userImage.width * scale;
        const imgHeight = userImage.height * scale;
        ctx.drawImage(userImage, offsetX, offsetY, imgWidth, imgHeight);
    }
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
            scale = Math.max(canvas.width / userImage.width, canvas.height / userImage.height);
            offsetX = (canvas.width - userImage.width * scale) / 2;
            offsetY = (canvas.height - userImage.height * scale) / 2;
            
            redrawCanvas();
            downloadBtn.disabled = false;
            shareBtn.disabled = false; // Aktifkan juga tombol bagikan
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
    if (scale > 0.1) {
        scale -= 0.05;
        redrawCanvas();
    }
});

// Fungsi untuk interaksi geser (drag & drop)
function startDrag(e) {
    isDragging = true;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    startX = clientX - canvas.offsetLeft - offsetX;
    startY = clientY - canvas.offsetTop - offsetY;
    canvas.style.cursor = 'grabbing';
}

function doDrag(e) {
    if (isDragging) {
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

// Event listener untuk mouse dan sentuhan
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', doDrag);
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mouseleave', stopDrag);
canvas.addEventListener('touchstart', startDrag, { passive: false });
canvas.addEventListener('touchmove', doDrag, { passive: false });
canvas.addEventListener('touchend', stopDrag);
canvas.addEventListener('touchcancel', stopDrag);

// Event listener untuk tombol download
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'hasil-twibbon.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// === FUNGSI BARU UNTUK BERBAGI GAMBAR ===
shareBtn.addEventListener('click', async () => {
    // Cek apakah browser mendukung Web Share API
    if (navigator.share) {
        canvas.toBlob(async (blob) => {
            // Buat file dari data blob kanvas
            const file = new File([blob], 'hasil-twibbon.png', { type: 'image/png' });
            const shareData = {
                files: [file],
                title: 'Foto Twibbon Keren!',
                text: 'Ini foto saya yang sudah jadi.',
            };
            
            try {
                // Panggil dialog share
                await navigator.share(shareData);
                console.log('Gambar berhasil dibagikan');
            } catch (err) {
                console.error('Error saat membagikan:', err);
            }
        }, 'image/png');
    } else {
        // Fallback jika browser tidak mendukung
        alert('Fitur "Bagikan" tidak didukung di browser ini. Silakan unduh gambar dan bagikan secara manual.');
    }
});
