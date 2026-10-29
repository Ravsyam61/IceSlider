const level1 = [
  "############",
  "#P..S..#S..#",
  "#..##......#",
  "#....H...S.#",
  "#..#..##...#",
  "#..#....X..#",
  "#.S...#....#",
  "#...#..S..E#",
  "############"
];

const level2 = [
  "############",
  "#P.....#...#",
  "#..#.S#.S..#",
  "#..#H.#....#",
  "#.....#S...#",
  "#..##...#X.#",
  "#....HS.#..#",
  "#......#.SE#",
  "############"
];

const level3 = [
  "############",
  "#P....#.S..#",
  "#.#.S.##...#",
  "#.#H.......#",
  "#....##S.X.#",
  "#..#.S..#..#",
  "#..#H...#..#",
  "#......#.SE#",
  "############"
];

const semuaLevel = [level1, level2, level3];
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const ukuranTile = 64;
const kecepatan = 320;
const levelText = document.getElementById("levelText");
const timerText = document.getElementById("timerText");
const hpText = document.getElementById("hpText");
let daftarPopupBintang = [];
const starsText = document.getElementById("starsText");
const fieldText = document.getElementById("fieldText");
const statusText = document.getElementById("statusText");
const menu = document.getElementById("menu");
const menuTitle = document.getElementById("menuTitle");
const menuEyebrow = document.getElementById("menuEyebrow");
const menuDescription = document.getElementById("menuDescription");
const menuButton = document.getElementById("menuButton");
const menuHint = document.getElementById("menuHint");
const bestTimePanel = document.getElementById("bestTimePanel");
const bestTimeText = document.getElementById("bestTimeText");
const restartButton = document.getElementById("restartButton");
const muteButton = document.getElementById("muteButton");
let suaraMute = false;
let sentuhanAktif = false;
let awalSentuhX = 0;
let awalSentuhY = 0;

let gameState = "start";
let levelSekarang = 0;
let map = [];
let player = { x: 1, y: 1 };
let posisiAwal = { x: 1, y: 1 };
let gambarX = 64;
let gambarY = 64;
let arahX = 0;
let arahY = 0;
let sedangMeluncur = false;
let jumlahBintang = 0;
let hp = 3;
let waktu = 90;
let intervalTimer = null;
let waktuKebal = 0;
let waktuFrameLalu = 0;
let totalWaktuBermain = 0;
let mulaiWaktuPercobaan = 0;
let waktuTerbaik = 0;

function bacaWaktuTerbaik() {
  try {
    let tersimpan = Number(localStorage.getItem("iceSliderBestTime"));
    if (Number.isFinite(tersimpan) && tersimpan > 0) waktuTerbaik = tersimpan;
  } catch (error) {
  }
  tampilkanWaktuTerbaik();
}

function tampilkanWaktuTerbaik() {
  if (waktuTerbaik === 0) {
    bestTimeText.textContent = "Belum ada rekor";
    return;
  }
  let totalDetik = Math.floor(waktuTerbaik / 1000);
  let menit = Math.floor(totalDetik / 60);
  let detik = totalDetik % 60;
  let desimal = Math.floor((waktuTerbaik % 1000) / 100);
  bestTimeText.textContent = menit + ":" + (detik < 10 ? "0" : "") + detik + "." + desimal;
}

function catatWaktuPercobaan() {
  if (gameState === "playing") {
    let sekarang = performance.now();
    totalWaktuBermain += sekarang - mulaiWaktuPercobaan;
    mulaiWaktuPercobaan = sekarang;
  }
}

function simpanWaktuTerbaik() {
  if (totalWaktuBermain <= 0) return;
  if (waktuTerbaik === 0 || totalWaktuBermain < waktuTerbaik) {
    waktuTerbaik = totalWaktuBermain;
    try {
      localStorage.setItem("iceSliderBestTime", String(waktuTerbaik));
    } catch (error) {
    }
  }
}

function kembaliKeStart() {
  gameState = "start";
  levelSekarang = 0;
  totalWaktuBermain = 0;
  muatLevel();
  menuTitle.textContent = "ICE SLIDER";
  menuEyebrow.textContent = "READY TO SLIDE?";
  menuDescription.textContent = "Meluncurlah di atas es, hindari obstacle, dan kumpulkan 5 bintang sebelum waktu habis.";
  menuButton.textContent = "Start Game →";
  menuHint.textContent = "WASD / tombol panah / swipe untuk meluncur";
  tampilkanWaktuTerbaik();
  bestTimePanel.hidden = false;
  menu.hidden = false;
  restartButton.disabled = true;
  menuButton.focus();
}

const gambarKarakter = new Image();
gambarKarakter.src = "images/Player.png";
const gambarLubang = new Image();
gambarLubang.src = "images/Hole.png";
const gambarIgloo = new Image();
gambarIgloo.src = "images/Igloo.png";

const suaraSliding = new Audio("sfx/Sliding.wav");
const suaraBintang = new Audio("sfx/Collect.mp3");
const suaraMenang = new Audio("sfx/victory.mp3");
const suaraKalah = new Audio("sfx/gameover.mp3");
const suaraHit = new Audio("sfx/hitobstacle.mp3");
const suaraJatuh = new Audio("sfx/fallhole.wav");
const musikBgm = new Audio("sfx/bgm.mp3");
musikBgm.loop = true; 
musikBgm.volume = 0.25; 
suaraSliding.loop = true;
suaraSliding.volume = 0.35;
suaraBintang.volume = 0.65;
suaraMenang.volume = 0.65;
suaraKalah.volume = 0.65;
suaraHit.volume = 0.65;
suaraJatuh.volume = 0.65;

function ubahMute() {
  suaraMute = !suaraMute;
  const semuaSuara = [
    musikBgm, suaraSliding, suaraBintang, suaraMenang,
    suaraKalah, suaraHit, suaraJatuh
  ];
  for (let i = 0; i < semuaSuara.length; i++) {
    semuaSuara[i].muted = suaraMute;
  }
  muteButton.textContent = suaraMute ? "Unmute (M)" : "Mute (M)";
  muteButton.setAttribute("aria-pressed", suaraMute ? "true" : "false");
}

function putarSuara(suara) {
  suara.currentTime = 0;
  suara.play().catch(function () {
  });
}

function hentikanSuara(suara) {
  suara.pause();
  suara.currentTime = 0;
}

function berhentiMeluncur() {
  sedangMeluncur = false;
  hentikanSuara(suaraSliding);
}

function muatLevel() {
  sentuhanAktif = false;
  hentikanSuara(suaraHit);
  hentikanSuara(suaraJatuh);
  hentikanSuara(musikBgm);
  hentikanSuara(suaraBintang);
  hentikanSuara(suaraMenang);
  hentikanSuara(suaraKalah);
  clearInterval(intervalTimer);
  intervalTimer = null;
  map = [];
  for (let y = 0; y < semuaLevel[levelSekarang].length; y++) {
    map.push(semuaLevel[levelSekarang][y].split(""));
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "P") {
        posisiAwal = { x: x, y: y };
        map[y][x] = ".";
      }
    }
  }
  player = { x: posisiAwal.x, y: posisiAwal.y };
  gambarX = player.x * ukuranTile;
  gambarY = player.y * ukuranTile;
  arahX = 0;
  arahY = 0;
  berhentiMeluncur();
  daftarPopupBintang = [];
  jumlahBintang = 0;
  hp = 3;
  waktu = 90;
  waktuKebal = 0;
  statusText.textContent = "Kumpulkan 5 bintang untuk memunculkan igloo.";
  perbaruiHUD();
}

function mulaiGame() {
  catatWaktuPercobaan(); // Waktu sebelum restart tetap masuk total.
  muatLevel();
  gameState = "playing";
  mulaiWaktuPercobaan = performance.now();
  bestTimePanel.hidden = true;
  putarSuara(musikBgm);
  menu.hidden = true;
  restartButton.disabled = false;
  intervalTimer = setInterval(hitungWaktu, 1000);
}

function hitungWaktu() {
  if (gameState !== "playing") return;
  waktu--;
  perbaruiHUD();
  if (waktu <= 0) gameOver("Waktu habis. Coba rute lain dan meluncur lagi!");
}

function restartGame() {
  mulaiGame();
}

function cekDinding(x, y) {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return true;
  return map[y][x] === "#";
}

function gerakPemain(dx, dy) {
  if (gameState !== "playing" || sedangMeluncur) return;
  if (cekDinding(player.x + dx, player.y + dy)) return;
  arahX = dx;
  arahY = dy;
  sedangMeluncur = true;
  putarSuara(suaraSliding);
}

function updatePemain(deltaWaktu) {
  if (gameState !== "playing") return;
  waktuKebal = Math.max(0, waktuKebal - deltaWaktu);
  if (!sedangMeluncur) return;

  let tujuanX = player.x + arahX;
  let tujuanY = player.y + arahY;
  if (cekDinding(tujuanX, tujuanY)) {
    berhentiMeluncur();
    return;
  }

  let jarakSisa = Math.abs(tujuanX * ukuranTile - gambarX)
    + Math.abs(tujuanY * ukuranTile - gambarY);
  let langkah = Math.min(kecepatan * deltaWaktu, jarakSisa);
  gambarX += arahX * langkah;
  gambarY += arahY * langkah;

  if (langkah >= jarakSisa) {
    player.x = tujuanX;
    player.y = tujuanY;
    gambarX = player.x * ukuranTile;
    gambarY = player.y * ukuranTile;
    cekItem();
    cekObstacle();
    if (gameState !== "playing") return;
    cekMenang();
    if (cekDinding(player.x + arahX, player.y + arahY)) berhentiMeluncur();
  }
}

function tampilkanPopupBintang() {
  daftarPopupBintang.push({
    x: player.x * ukuranTile + ukuranTile / 2,
    y: player.y * ukuranTile + 8,
    sisaWaktu: 0.65
  });
}

function updatePopupBintang(deltaWaktu) {
  for (let i = daftarPopupBintang.length - 1; i >= 0; i--) {
    daftarPopupBintang[i].y -= 40 * deltaWaktu;
    daftarPopupBintang[i].sisaWaktu -= deltaWaktu;
    if (daftarPopupBintang[i].sisaWaktu <= 0) {
      daftarPopupBintang.splice(i, 1);
    }
  }
}

function gambarPopupBintang() {
  ctx.save();
  for (let i = 0; i < daftarPopupBintang.length; i++) {
    let popup = daftarPopupBintang[i];
    ctx.globalAlpha = popup.sisaWaktu / 0.65;
    gambarBintang(popup.x, popup.y);
  }
  ctx.restore();
}

function cekItem() {
  if (map[player.y][player.x] === "S") {
    map[player.y][player.x] = ".";
    jumlahBintang++;
    tampilkanPopupBintang();
    putarSuara(suaraBintang);
    if (jumlahBintang === 5) statusText.textContent = "Semua bintang terkumpul! Igloo muncul, meluncurlah ke sana.";
    perbaruiHUD();
  }
}

function cekObstacle() {
  let tile = map[player.y][player.x];
  if (tile === "X" && waktuKebal <= 0) {
    hp--;
    putarSuara(suaraHit);
    waktuKebal = 1.2;
    statusText.textContent = "Terkena spike! Kebal terhadap spike selama 1,2 detik.";
  }
  if (tile === "H") {
    hp--;
    putarSuara(suaraJatuh);
    player = { x: posisiAwal.x, y: posisiAwal.y };
    gambarX = player.x * ukuranTile;
    gambarY = player.y * ukuranTile;
    berhentiMeluncur();
    arahX = 0;
    arahY = 0;
    statusText.textContent = "Jatuh ke lubang! Kembali ke awal; bintang tetap tersimpan.";
  }
  perbaruiHUD();
  if (hp <= 0) gameOver("HP habis. Hati-hati dengan spike dan lubang es!");
}

function cekMenang() {
  if (gameState !== "playing") return;
  if (map[player.y][player.x] !== "E") return;
  if (jumlahBintang < 5) {
    statusText.textContent = "Igloo belum muncul. Kumpulkan seluruh 5 bintang dahulu.";
    return;
  }
  catatWaktuPercobaan();
  gameState = "win";
  hentikanSuara(musikBgm);
  putarSuara(suaraMenang);
  berhentiMeluncur();
  clearInterval(intervalTimer);
  intervalTimer = null;
  let levelTerakhir = levelSekarang === semuaLevel.length - 1;
  if (levelTerakhir) simpanWaktuTerbaik();
  menuTitle.textContent = levelTerakhir ? "YOU WIN!" : "LEVEL COMPLETE!";
  menuEyebrow.textContent = levelTerakhir ? "ALL THREE LEVELS COMPLETE" : "NICE SLIDING!";
  menuDescription.textContent = "Bintang: 5 / 5. "
    + (levelTerakhir ? "Ketiga level berhasil ditaklukkan!" : "Siap menjelajahi maze es berikutnya?");
  menuButton.textContent = levelTerakhir ? "Kembali ke Start" : "Next Level →";
  menuHint.textContent = "Sisa waktu: " + waktu + " detik · HP: " + hp;
  menu.hidden = false;
  menuButton.focus();
}

function gameOver(pesan) {
  catatWaktuPercobaan();
  gameState = "lose";
  hentikanSuara(musikBgm);
  putarSuara(suaraKalah);
  berhentiMeluncur();
  clearInterval(intervalTimer);
  intervalTimer = null;
  menuTitle.textContent = "GAME OVER";
  menuEyebrow.textContent = "ONE MORE SLIDE?";
  menuDescription.textContent = pesan + " Bintang: " + jumlahBintang + " / 5.";
  menuButton.textContent = "Try Again →";
  menuHint.textContent = "Ulangi level ini dengan 3 HP dan 90 detik.";
  menu.hidden = false;
  menuButton.focus();
}

function perbaruiHUD() {
  levelText.innerHTML = "0" + (levelSekarang + 1) + " <small>/ 03</small>";
  fieldText.textContent = "0" + (levelSekarang + 1);
  starsText.innerHTML = "★ " + jumlahBintang + " <small>/ 5</small>";
  let menit = Math.floor(waktu / 60);
  let detik = waktu % 60;
  timerText.textContent = "0" + menit + ":" + (detik < 10 ? "0" : "") + detik;
  timerText.classList.toggle("urgent", waktu <= 10);
  hpText.textContent = "♥ ".repeat(Math.max(0, hp)) + "♡ ".repeat(3 - Math.max(0, hp));
  hpText.setAttribute("aria-label", hp + " dari 3 HP");
}

function gambarBintang(x, y) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    let sudut = i * Math.PI / 5 - Math.PI / 2;
    let radius = i % 2 === 0 ? 18 : 8;
    let titikX = x + Math.cos(sudut) * radius;
    let titikY = y + Math.sin(sudut) * radius;
    if (i === 0) ctx.moveTo(titikX, titikY);
    else ctx.lineTo(titikX, titikY);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffd266";
  ctx.fill();
  ctx.strokeStyle = "#c79a35";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function gambarTile(tile, x, y) {
  if (tile === "#") {
    ctx.fillStyle = "#76afc7";
    ctx.fillRect(x + 3, y + 5, 58, 57);
    ctx.fillStyle = "#afd8e8";
    ctx.fillRect(x + 3, y + 3, 58, 51);
    ctx.fillStyle = "#d5edf6";
    ctx.fillRect(x + 7, y + 6, 50, 4);
    ctx.strokeStyle = "#cce7f1";
    ctx.beginPath(); ctx.moveTo(x + 45, y + 12); ctx.lineTo(x + 52, y + 19); ctx.stroke();
  } else if (tile === "S") {
    gambarBintang(x + 32, y + 32);
  } else if (tile === "X") {
    ctx.fillStyle = "#398fbd";
    ctx.beginPath(); ctx.moveTo(x + 10, y + 46); ctx.lineTo(x + 22, y + 21);
    ctx.lineTo(x + 30, y + 38); ctx.lineTo(x + 42, y + 16); ctx.lineTo(x + 55, y + 46); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#bcefff";
    ctx.beginPath(); ctx.moveTo(x + 35, y + 30); ctx.lineTo(x + 42, y + 16); ctx.lineTo(x + 48, y + 30); ctx.fill();
  } else if (tile === "H") {
    if (gambarLubang.complete && gambarLubang.naturalWidth > 0) {
      ctx.drawImage(gambarLubang, x, y, ukuranTile, ukuranTile);
    } else {
      ctx.fillStyle = "#24465f";
      ctx.beginPath();
      ctx.ellipse(x + 32, y + 32, 24, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (tile === "E" && jumlahBintang === 5) {
    if (gambarIgloo.complete && gambarIgloo.naturalWidth > 0) {
      ctx.drawImage(gambarIgloo, x + 2, y + 4, 60, 55);
    } else {
      ctx.fillStyle = "#269e90";
      ctx.fillRect(x + 12, y + 9, 40, 47);
    }
  }
}

function gambarPemain() {
  let x = gambarX + 32;
  let y = gambarY + 32;
  ctx.save();
  if (waktuKebal > 0 && Math.floor(waktuKebal * 12) % 2 === 0) ctx.globalAlpha = 0.45;
  if (gambarKarakter.complete && gambarKarakter.naturalWidth > 0) {
    ctx.drawImage(gambarKarakter, gambarX + 2, gambarY + 2, 60, 60);
    ctx.restore();
    return;
  }
  ctx.fillStyle = "#487a9733";
  ctx.beginPath(); ctx.ellipse(x, y + 19, 21, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#215477";
  ctx.beginPath(); ctx.ellipse(x, y + 2, 18, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f5fcff";
  ctx.beginPath(); ctx.ellipse(x, y + 6, 13, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#173d57";
  ctx.beginPath(); ctx.arc(x - 6, y - 2, 2, 0, Math.PI * 2); ctx.arc(x + 6, y - 2, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#eab34e";
  ctx.beginPath(); ctx.moveTo(x - 4, y + 3); ctx.lineTo(x + 4, y + 3); ctx.lineTo(x, y + 8); ctx.fill();
  ctx.fillStyle = "#48c3d3";
  ctx.fillRect(x - 18, y - 17, 36, 6);
  ctx.fillRect(x + 11, y - 17, 6, 14);
  ctx.restore();
}

function gambarGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#e0f2f8" : "#d7edf5";
      ctx.fillRect(x * ukuranTile, y * ukuranTile, ukuranTile, ukuranTile);
      ctx.strokeStyle = "#effaff";
      ctx.lineWidth = 1;
      ctx.strokeRect(x * ukuranTile, y * ukuranTile, ukuranTile, ukuranTile);
      gambarTile(map[y][x], x * ukuranTile, y * ukuranTile);
    }
  }
  gambarPemain();
  gambarPopupBintang();
}

function update(waktuFrame) {
  let deltaWaktu = Math.min((waktuFrame - waktuFrameLalu) / 1000, 0.05);
  waktuFrameLalu = waktuFrame;
  updatePemain(deltaWaktu);
  updatePopupBintang(deltaWaktu);
  gambarGame();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", function (event) {
  let tombol = event.key.toLowerCase();
  if (tombol === "m" && !event.ctrlKey && !event.altKey && !event.metaKey) {
    event.preventDefault();
    if (!event.repeat) ubahMute();
    return;
  }
  if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(tombol)) {
    event.preventDefault();
    if (event.repeat) return;
    if (tombol === "w" || tombol === "arrowup") gerakPemain(0, -1);
    if (tombol === "s" || tombol === "arrowdown") gerakPemain(0, 1);
    if (tombol === "a" || tombol === "arrowleft") gerakPemain(-1, 0);
    if (tombol === "d" || tombol === "arrowright") gerakPemain(1, 0);
  }
});

canvas.addEventListener("touchstart", function (event) {
  sentuhanAktif = false;
  if (gameState !== "playing" || sedangMeluncur || event.touches.length !== 1) return;
  awalSentuhX = event.touches[0].clientX;
  awalSentuhY = event.touches[0].clientY;
  sentuhanAktif = true;
}, { passive: true });

canvas.addEventListener("touchend", function (event) {
  if (!sentuhanAktif) return;
  sentuhanAktif = false;
  if (event.touches.length !== 0 || event.changedTouches.length !== 1) return;

  let selisihX = event.changedTouches[0].clientX - awalSentuhX;
  let selisihY = event.changedTouches[0].clientY - awalSentuhY;
  if (Math.max(Math.abs(selisihX), Math.abs(selisihY)) < 24) return;

  if (Math.abs(selisihX) > Math.abs(selisihY)) {
    if (selisihX > 0) gerakPemain(1, 0);
    else gerakPemain(-1, 0);
  } else {
    if (selisihY > 0) gerakPemain(0, 1);
    else gerakPemain(0, -1);
  }
}, { passive: true });

canvas.addEventListener("touchcancel", function () {
  sentuhanAktif = false;
}, { passive: true });

menuButton.addEventListener("click", function () {
  if (gameState === "win") {
    if (levelSekarang < semuaLevel.length - 1) levelSekarang++;
    else {
      kembaliKeStart();
      return;
    }
  }
  mulaiGame();
});
restartButton.addEventListener("click", restartGame);
muteButton.addEventListener("click", ubahMute);

bacaWaktuTerbaik();
muatLevel();
requestAnimationFrame(update);
