# ❄️ Ice Slider

**Ice Slider** adalah game puzzle 2D bertema es dengan sudut pandang top-down. Kendalikan penguin yang meluncur di dalam maze, kumpulkan seluruh bintang, lalu masuk ke igloo sebelum waktu habis.

Game dibuat menggunakan **HTML, CSS, dan JavaScript murni** dengan **HTML5 Canvas**, tanpa framework, library eksternal, atau build tools. Kodenya menggunakan fungsi dan variabel sederhana agar mudah dipelajari.

## 🎮 Cara Bermain

1. Tekan **Start Game** untuk memulai permainan dan musik latar.
2. Tentukan arah gerak dengan keyboard atau swipe pada arena.
3. Pemain terus meluncur sampai terhalang dinding atau batas map. Melepas tombol tidak menghentikan gerakan.
4. Kumpulkan **5 bintang** untuk memunculkan igloo di posisi exit.
5. Masuk ke igloo sebelum **90 detik** habis untuk menyelesaikan level.
6. Selesaikan ketiga level untuk memenangkan permainan.

Setiap level dimulai dengan **3 HP**. Permainan berakhir jika HP mencapai 0 atau waktu habis. Arah baru tidak diproses selama pemain masih meluncur.

## 🕹️ Kontrol

| Aksi | Keyboard / Tombol | Layar Sentuh |
| --- | --- | --- |
| Meluncur ke atas | `W` / `↑` | Swipe ke atas |
| Meluncur ke bawah | `S` / `↓` | Swipe ke bawah |
| Meluncur ke kiri | `A` / `←` | Swipe ke kiri |
| Meluncur ke kanan | `D` / `→` | Swipe ke kanan |
| Mute / unmute semua suara | `M` atau tombol Mute | Sentuh tombol Mute |
| Mengulang level | Tombol Restart | Sentuh tombol Restart |

Untuk layar sentuh, usap dengan **satu jari di atas Canvas**, lalu lepaskan. Tap dan usapan pendek di bawah 24 piksel diabaikan. Usapan diagonal mengikuti arah yang jaraknya paling besar.

## ✨ Fitur

- Tiga level maze dengan susunan berbeda.
- Animasi sliding per tile menggunakan `requestAnimationFrame`.
- Lima bintang per level sebagai indikator progres.
- Popup ikon bintang di lokasi collect yang naik dan memudar.
- Igloo muncul setelah seluruh bintang terkumpul.
- HUD berisi level, waktu, HP, dan jumlah bintang.
- Timer berubah merah saat tersisa 10 detik atau kurang.
- Tampilan responsif dengan kontrol keyboard dan swipe.
- Musik latar berulang selama bermain dan SFX untuk aksi permainan.
- Mute berlaku untuk seluruh audio dan tetap aktif saat restart atau pindah level.
- Menu Start, Level Complete, You Win, dan Game Over.

## 🧊 Obstacle

| Obstacle | Efek |
| --- | --- |
| Ice Wall | Menghalangi pemain dan menghentikan sliding. |
| Ice Spike | Mengurangi 1 HP. Pemain tetap meluncur dan kebal terhadap spike selama 1,2 detik setelah terkena. |
| Ice Hole | Mengurangi 1 HP, mengembalikan pemain ke posisi awal, dan langsung menghentikan sliding. |

Bintang yang sudah diambil tetap tersimpan setelah jatuh ke lubang. Kekebalan dari spike tidak melindungi pemain dari lubang. **Restart** mengembalikan seluruh kondisi level, termasuk bintang, HP, dan timer.

## 🚀 Menjalankan Secara Lokal

1. Download repository melalui **Code → Download ZIP**, atau clone repository ini.
2. Jika menggunakan ZIP, ekstrak terlebih dahulu.
3. Buka `index.html` menggunakan browser modern.
4. Tekan **Start Game**.

Tidak perlu menjalankan `npm install` atau proses build. Pastikan folder `images` dan `sfx` tetap berada di sebelah `index.html` agar aset dapat dimuat.

## 📁 Struktur Project

```text
IceSlider/
├── index.html          # Struktur halaman, HUD, tombol, dan menu
├── style.css           # Tema es, layout, dan tampilan responsif
├── game.js             # Logika permainan, Canvas, kontrol, dan audio
├── README.md
├── images/
│   ├── Player.png      # Karakter penguin
│   ├── Hole.png        # Lubang es
│   └── Igloo.png       # Tujuan akhir level
└── sfx/
    ├── bgm.mp3         # Musik latar
    ├── Sliding.wav     # Suara meluncur
    ├── Collect.mp3     # Suara mengambil bintang
    ├── hitobstacle.mp3 # Suara terkena spike
    ├── fallhole.wav    # Suara jatuh ke lubang
    ├── victory.mp3     # Suara menyelesaikan level
    └── gameover.mp3    # Suara kalah
```

## 🗺️ Format Map

Level ditulis sebagai array berisi string di `game.js`. Setiap karakter mewakili satu tile.

| Simbol | Arti |
| --- | --- |
| `#` | Dinding |
| `.` | Lantai es |
| `P` | Posisi awal pemain |
| `S` | Bintang |
| `E` | Posisi igloo, terlihat setelah 5 bintang terkumpul |
| `X` | Spike |
| `H` | Lubang es |

Jika mengubah map, pastikan setiap baris memiliki panjang yang sama dan setiap level memiliki lima bintang. Periksa juga posisi berhenti pemain: adanya jalan saja belum menjamin level bisa diselesaikan dengan aturan sliding.