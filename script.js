// ============================================================================
// S.N.A.X. ARCADE: FREIDORA EXPRESS (DESPACHO CONTRARRELOJ)
// Alitas y Boneless van bañados en salsa; Papas son complemento directo sin salsa.
// ============================================================================

const DEFAULT_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwi34XoQ39_oyZPUD8sdneu9l1So_w2P-31Wm1SgfQ-MszxYJTPOTL_YuusYQ0dZrgtRw/exec";

function getSheetsWebAppUrl() {
    return localStorage.getItem('snax_sheets_url') || DEFAULT_SHEETS_WEBAPP_URL;
}

// --- Web Audio API Synthesizer (Chiptune + Efectos de Cocina) ---
let soundEnabled = true;
let audioCtx = null;
let bgmInterval = null;
let bgmStep = 0;

const BGM_LEAD = [
    523.25, 0, 659.25, 587.33,
    523.25, 0, 392.00, 440.00,
    523.25, 659.25, 783.99, 659.25,
    587.33, 523.25, 493.88, 0
];
const BGM_BASS = [
    130.81, 130.81, 196.00, 196.00,
    174.61, 174.61, 130.81, 130.81,
    146.83, 146.83, 196.00, 196.00,
    130.81, 196.00, 130.81, 0
];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function startBGM() {
    stopBGM();
    if (!soundEnabled) return;
    initAudio();
    bgmStep = 0;
    bgmInterval = setInterval(() => {
        if (!soundEnabled || gameState !== 'PLAYING' || !audioCtx) return;
        const now = audioCtx.currentTime;
        const lead = BGM_LEAD[bgmStep % BGM_LEAD.length];
        const bass = BGM_BASS[bgmStep % BGM_BASS.length];

        if (lead > 0) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(lead, now);
            gain.gain.setValueAtTime(0.028, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.13);
        }
        if (bass > 0) {
            const oscB = audioCtx.createOscillator();
            const gainB = audioCtx.createGain();
            oscB.type = 'triangle';
            oscB.frequency.setValueAtTime(bass, now);
            gainB.gain.setValueAtTime(0.045, now);
            gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            oscB.connect(gainB);
            gainB.connect(audioCtx.destination);
            oscB.start(now);
            oscB.stop(now + 0.14);
        }
        bgmStep++;
    }, 170);
}

function stopBGM() {
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'pick_piece') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    } else if (type === 'serve_ok') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.05);
        osc.frequency.setValueAtTime(783.99, now + 0.10);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
    } else if (type === 'serve_hot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(783.99, now + 0.05);
        osc.frequency.setValueAtTime(1046.50, now + 0.10);
        gain.gain.setValueAtTime(0.17, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(165, now);
        osc.frequency.linearRampToValueAtTime(42, now + 0.26);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
        osc.start(now);
        osc.stop(now + 0.26);
    } else if (type === 'reward') {
        osc.type = 'square';
        const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
        const times = [0, 0.08, 0.16, 0.24, 0.34, 0.42];
        notes.forEach((f, i) => osc.frequency.setValueAtTime(f, now + times[i]));
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.60);
        osc.start(now);
        osc.stop(now + 0.60);
    } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.setValueAtTime(185, now + 0.18);
        osc.frequency.linearRampToValueAtTime(65, now + 0.62);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.62);
        osc.start(now);
        osc.stop(now + 0.62);
    } else if (type === 'bonus') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
    }
}

// --- Sprites Pixel Art 16x16 ---
const PALETTE = {
    '.': null,
    'K': '#09090b',
    'W': '#ffffff',
    'B': '#d97706',
    'L': '#fbbf24',
    'O': '#ea580c',
    'R': '#dc2626',
    'D': '#7f1d1d',
    'M': '#9a3412',
    'G': '#22c55e',
    'E': '#15803d',
    'Y': '#facc15',
    'U': '#fef08a',
    'S': '#cbd5e1'
};

const SPRITES = {
    wing: [
        "..KKK...........",
        ".KWWWK..........",
        ".KWSSWK.........",
        "..KWWKK.........",
        "...KWWKKKK......",
        "....KOOOOOKK....",
        "....KOOLLOOOK...",
        "...KOOLWLOOOOK..",
        "...KOOLLOOOOORK.",
        "..KOOOOOOOOORRRK",
        "..KOOOOOOORRRRRK",
        "..KOOOOORRRRRRDK",
        "...KOOORRRRRDDK.",
        "....KKRRRRDDKK..",
        "......KKKKKK....",
        "................"
    ],
    boneless: [
        "....KKK...KK....",
        "...KBBBK.KBBK...",
        "..KBLLBBKKMMMK..",
        ".KBLWLBMMMMMMMK.",
        ".KBLLBMMDDDDMMMK",
        "KBBMMDDDDWDDDMMK",
        "KBMMMDDDDDDDDMMK",
        ".KMMMMDDDDDDMMMK",
        "KBBMMMMDDDDDMMK.",
        "KBLLMMMMDDDDMMMK",
        ".KBBBMMMMMMDDDDK",
        "..KKKKMMMMMMDDK.",
        ".....KMMMMMMKK..",
        "......KKKKKK....",
        "................",
        "................"
    ],
    fries: [
        ".....KK..KK.....",
        "...KKUYKKUYKK...",
        "..KUYBYKUYBYUK..",
        ".KKUYBYKUYBYUKK.",
        "KUYBYBYKUYBYBYUK",
        "KUYBYBYKUYBYBYUK",
        "KRRRRRRRRRRRRRRK",
        "KRRKKKKKKKKKKRRK",
        "KRRKYYYYYYYYKRRK",
        ".KRKYYYYYYYYKRK.",
        ".KRKKKKKKKKKKRK.",
        ".KRRRRRRRRRRRRK.",
        "..KRRRRRRRRRRK..",
        "...KKKKKKKKKK...",
        "................",
        "................"
    ],
    sauce_atomic: [
        "......KKKK......",
        ".....KWWWWK.....",
        ".....KSSSSK.....",
        "....KKKKKKKK....",
        "...KRRRRRRRRK...",
        "..KRRWWRRRRRDK..",
        "..KRRWRRRRRRDK..",
        "..KRRRRRRRRDDK..",
        "..KRRYYYYYRDDK..",
        "..KRYYYYYYRDDK..",
        "..KRRYYYYYRDDK..",
        "..KRRRRRRRRDDK..",
        "..KRRRRRRRRDDK..",
        "...KRRRRRRDDK...",
        "....KKKKKKKK....",
        "................"
    ],
    sauce_mango: [
        "......KKKK......",
        ".....KWWWWK.....",
        ".....KSSSSK.....",
        "....KKKKKKKK....",
        "...KOOOOOOOOK...",
        "..KOOWWOOOOOMK..",
        "..KOOWOOOOOOMK..",
        "..KOOOOOOOOMMK..",
        "..KOOYYYYYOMMK..",
        "..KOYYYYYYOMMK..",
        "..KOOYYYYYOMMK..",
        "..KOOOOOOOOMMK..",
        "..KOOOOOOOOMMK..",
        "...KOOOOOOMMK...",
        "....KKKKKKKK....",
        "................"
    ],
    sauce_bbq: [
        "......KKKK......",
        ".....KWWWWK.....",
        ".....KSSSSK.....",
        "....KKKKKKKK....",
        "...KMMMMMMMMK...",
        "..KMMWWMMMMDDK..",
        "..KMMWMMMMMDDK..",
        "..KMMMMMMMMDDK..",
        "..KMMYYYYYMDDK..",
        "..KMYYYYYYMDDK..",
        "..KMMYYYYYMDDK..",
        "..KMMMMMMMMDDK..",
        "..KMMMMMMMMDDK..",
        "...KMMMMMMDDK...",
        "....KKKKKKKK....",
        "................"
    ],
    sauce_limon: [
        "......KKKK......",
        ".....KWWWWK.....",
        ".....KSSSSK.....",
        "....KKKKKKKK....",
        "...KGGGGGGGGK...",
        "..KGGWWGGGGEEK..",
        "..KGGWGGGGGEEK..",
        "..KGGGGGGGGEEK..",
        "..KGGYYYYYGEEK..",
        "..KGYYYYYYGEEK..",
        "..KGGYYYYYGEEK..",
        "..KGGGGGGGGEEK..",
        "..KGGGGGGGGEEK..",
        "...KGGGGGGEEK...",
        "....KKKKKKKK....",
        "................"
    ],
    heart: [
        ".KKK...KKK..",
        "KRRRK.KRRRK.",
        "KRWWRKRRRRRK",
        "KRWRRRRRRRRK",
        "KRRRRRRRRRRK",
        ".KRRRRRRRRK.",
        "..KRRRRRRK..",
        "...KRRRRK...",
        "....KRRK....",
        ".....KK....."
    ]
};

function createSpriteCanvas(spriteKey, size = 32) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    c.className = 'shrink-0 block';
    const ctx = c.getContext('2d');
    const matrix = SPRITES[spriteKey];
    const px = size / 16;
    for (let r = 0; r < matrix.length; r++) {
        for (let col = 0; col < matrix[r].length; col++) {
            const color = PALETTE[matrix[r][col]];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(Math.floor(col * px), Math.floor(r * px), Math.ceil(px), Math.ceil(px));
            }
        }
    }
    return c;
}

// --- Ingredientes del Menú S.N.A.X. ---
// Alitas y Boneless requieren salsa (needsSauce: true).
// Papas son complemento directo (needsSauce: false).
const PIECES = [
    { id: 'wing', name: 'ALITAS', key: '1', sprite: 'wing', needsSauce: true, border: 'border-amber-400', bg: 'bg-zinc-900 hover:bg-zinc-800' },
    { id: 'boneless', name: 'BONELESS', key: '2', sprite: 'boneless', needsSauce: true, border: 'border-orange-400', bg: 'bg-zinc-900 hover:bg-zinc-800' },
    { id: 'fries', name: 'PAPAS', key: '3', sprite: 'fries', needsSauce: false, border: 'border-emerald-400', bg: 'bg-zinc-900 hover:bg-zinc-800' }
];

const SAUCES = [
    { id: 'atomic', name: 'ATOMIC', key: 'Q', sprite: 'sauce_atomic', badgeBg: 'bg-red-600 text-white', border: 'border-red-400' },
    { id: 'mango', name: 'MANGO HAB.', key: 'W', sprite: 'sauce_mango', badgeBg: 'bg-orange-500 text-black', border: 'border-orange-300' },
    { id: 'bbq', name: 'BBQ', key: 'E', sprite: 'sauce_bbq', badgeBg: 'bg-amber-800 text-yellow-200', border: 'border-amber-500' },
    { id: 'limon', name: 'PIM. LIMÓN', key: 'R', sprite: 'sauce_limon', badgeBg: 'bg-emerald-500 text-black', border: 'border-emerald-300' }
];

// --- Catálogo Oficial de Premios S.N.A.X. ---
const REWARD_TIERS = [
    {
        id: 'disc10',
        points: 1500,
        title: '10% DE DESCUENTO',
        shortLabel: '10% OFF',
        code: 'SNAX10',
        desc: 'En tu próximo pedido de alitas o boneless'
    },
    {
        id: 'freefries',
        points: 2800,
        title: 'PAPAS FRANCESAS GRATIS',
        shortLabel: 'PAPAS GRATIS',
        code: 'PAPAS8BIT',
        desc: 'Orden de papas doradas gratis al comprar tu combo'
    },
    {
        id: 'extrapcs',
        points: 4200,
        title: '+3 PIEZAS EXTRA GRATIS',
        shortLabel: '+3 PIEZAS',
        code: '3EXTRAS',
        desc: '3 alitas o boneless extra gratis en tu orden'
    },
    {
        id: 'grandwings',
        points: 15000,
        title: '🔥 ORDEN DE ALITAS GRANDES GRATIS',
        shortLabel: 'ALITAS GRANDES',
        code: 'ALITASGRATIS',
        desc: 'PREMIO MAYOR • Orden grande de alitas bañadas en tu salsa favorita',
        isGrandPrize: true
    }
];

// --- Referencias DOM ---
const gameHud = document.getElementById('game-hud');
const gamePlayZone = document.getElementById('game-play-zone');
const scoreValEl = document.getElementById('score-val');
const streakValEl = document.getElementById('streak-val');
const livesContainerEl = document.getElementById('lives-container');
const comboBadgeEl = document.getElementById('combo-badge');
const hudPlayerTagEl = document.getElementById('hud-player-tag');
const paceBadgeEl = document.getElementById('pace-badge');

const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('gameover-screen');

const loginBox = document.getElementById('login-box');
const lockedPlayerBanner = document.getElementById('locked-player-banner');
const lockedPlayerDisplay = document.getElementById('locked-player-display');
const playerNameInput = document.getElementById('player-name-input');
const loginErrorMsg = document.getElementById('login-error-msg');
const sheetsStatusPill = document.getElementById('sheets-status-pill');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const pauseSoundBtn = document.getElementById('pause-sound-btn');
const exitMenuBtn = document.getElementById('exit-menu-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverMenuBtn = document.getElementById('gameover-menu-btn');
const soundToggleBtn = document.getElementById('sound-toggle');

const startHighscoreEl = document.getElementById('start-highscore');
const finalPlayerNameEl = document.getElementById('final-player-name');
const finalScoreEl = document.getElementById('final-score');
const highscoreValEl = document.getElementById('highscore-val');
const finalRankProfileEl = document.getElementById('final-rank-profile');
const finalCommentEl = document.getElementById('final-comment');
const pausePaceSummaryEl = document.getElementById('pause-pace-summary');
const popupContainer = document.getElementById('popup-container');

const ordersRailEl = document.getElementById('orders-rail');
const prepPieceSlotEl = document.getElementById('prep-piece-slot');
const prepSauceSlotEl = document.getElementById('prep-sauce-slot');
const prepStatusTextEl = document.getElementById('prep-status-text');
const clearTrayBtn = document.getElementById('clear-tray-btn');
const piecesPadEl = document.getElementById('pieces-pad');
const saucesPadEl = document.getElementById('sauces-pad');

const rewardToast = document.getElementById('reward-toast');
const rewardToastTitle = document.getElementById('reward-toast-title');
const rewardToastCode = document.getElementById('reward-toast-code');
const openRewardsBtn = document.getElementById('open-rewards-btn');
const closeRewardsBtn = document.getElementById('close-rewards-btn');
const rewardsModal = document.getElementById('rewards-modal');
const rewardsCatalogList = document.getElementById('rewards-catalog-list');

const openGuideBtn = document.getElementById('open-guide-btn');
const closeGuideBtn = document.getElementById('close-guide-btn');
const guideModal = document.getElementById('guide-modal');

const unlockedCouponBox = document.getElementById('unlocked-coupon-box');
const noCouponHint = document.getElementById('no-coupon-hint');
const couponTitleEl = document.getElementById('coupon-title');
const couponDescEl = document.getElementById('coupon-desc');
const couponCodeTextEl = document.getElementById('coupon-code-text');
const copyCouponBtn = document.getElementById('copy-coupon-btn');
const allUnlockedBadgesEl = document.getElementById('all-unlocked-badges');

// --- Estado del Juego ---
let gameState = 'START';
let loopInterval = null;
let lastTick = 0;

let score = 0;
let lives = 3;
let streak = 0;
let maxStreak = 0;
let ordersServed = 0;
let ordersFailed = 0;

let activeOrders = [];
let nextOrderId = 1;
let spawnCooldown = 0;
let selectedPieceId = null;

let currentPlayerName = (localStorage.getItem('snax_player_name') || '').trim();
let highscore = parseInt(localStorage.getItem('snax_freidora_highscore') || '0', 10);
let unlockedRewardsThisRun = [];
let rewardToastTimeout = null;

let speedMultiplier = 1.0;
let currentPaceLabel = 'INICIAL';
let previousPaceLabel = 'INICIAL';

// --- Pantallas y Login ---
function showLoginScreen() {
    startScreen.classList.remove('hidden');
    gameHud.classList.add('hidden');
    gamePlayZone.classList.add('hidden');
}

function showGameScreen() {
    startScreen.classList.add('hidden');
    gameHud.classList.remove('hidden');
    gamePlayZone.classList.remove('hidden');
}

function syncPlayerLoginUI() {
    if (currentPlayerName) {
        loginBox.classList.add('hidden');
        playerNameInput.value = currentPlayerName;
        playerNameInput.disabled = true;
        lockedPlayerDisplay.textContent = currentPlayerName.toUpperCase();
        lockedPlayerBanner.classList.remove('hidden');
    } else {
        loginBox.classList.remove('hidden');
        playerNameInput.disabled = false;
        lockedPlayerBanner.classList.add('hidden');
    }
}
syncPlayerLoginUI();
showLoginScreen();
startHighscoreEl.textContent = highscore;

// --- Google Sheets ---
function syncSheetsStatusUI() {
    const url = getSheetsWebAppUrl();
    if (url && url.startsWith('http')) {
        sheetsStatusPill.textContent = 'CONECTADO';
        sheetsStatusPill.className = 'pixel-font px-2.5 py-1 rounded bg-[#07261d] border border-[#10b981] text-[#34d399] text-[8px] sm:text-[9px] tracking-wider';
    } else {
        sheetsStatusPill.textContent = 'MODO LOCAL';
        sheetsStatusPill.className = 'pixel-font px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-gray-400 text-[8px] sm:text-[9px] tracking-wider';
    }
}
syncSheetsStatusUI();

async function sendToGoogleSheets(payload) {
    const url = getSheetsWebAppUrl();
    if (!url || !url.startsWith('http')) return;
    try {
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.warn('No se pudo enviar el registro a Google Sheets:', err);
    }
}

// --- Catálogo de Premios ---
function buildRewardsCatalog() {
    rewardsCatalogList.innerHTML = '';
    REWARD_TIERS.forEach(tier => {
        const card = document.createElement('div');
        if (tier.isGrandPrize) {
            card.className = 'bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-2 border-yellow-400 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(250,204,21,0.35)]';
            card.innerHTML = `
                <div>
                    <div class="pixel-font text-[9px] text-yellow-300 flex items-center gap-1">
                        <span>👑 PREMIO MAYOR • ${tier.points.toLocaleString()} PTS</span>
                    </div>
                    <div class="pixel-font text-[10px] sm:text-xs text-white mt-0.5">${tier.title}</div>
                    <div class="text-xs text-amber-200 leading-tight mt-0.5">${tier.desc}</div>
                </div>
                <span class="pixel-font text-[9px] bg-yellow-400 text-black font-bold border border-white px-2 py-1 rounded shrink-0">${tier.code}</span>
            `;
        } else {
            card.className = 'bg-gray-900 border border-amber-500/50 rounded-lg p-2.5 flex items-center justify-between gap-2';
            card.innerHTML = `
                <div>
                    <div class="pixel-font text-[9px] text-amber-400">${tier.points.toLocaleString()} PTS</div>
                    <div class="pixel-font text-[10px] sm:text-xs text-white mt-0.5">${tier.title}</div>
                    <div class="text-xs text-gray-400 leading-tight mt-0.5">${tier.desc}</div>
                </div>
                <span class="pixel-font text-[9px] bg-black border border-yellow-400 text-yellow-400 px-2 py-1 rounded shrink-0">${tier.code}</span>
            `;
        }
        rewardsCatalogList.appendChild(card);
    });
}
buildRewardsCatalog();

function showRewardToast(tier) {
    if (rewardToastTimeout) clearTimeout(rewardToastTimeout);
    rewardToastTitle.textContent = tier.title;
    rewardToastCode.textContent = tier.code;
    rewardToast.classList.remove('hidden');
    rewardToastTimeout = setTimeout(() => {
        rewardToast.classList.add('hidden');
    }, 3400);
}

function checkMilestoneRewards() {
    for (const tier of REWARD_TIERS) {
        if (score >= tier.points && !unlockedRewardsThisRun.some(r => r.id === tier.id)) {
            unlockedRewardsThisRun.push(tier);
            playSound('reward');
            showRewardToast(tier);
        }
    }
}

// --- Guía de Recetas ---
function buildRecipeGuide() {
    const grid = document.getElementById('recipe-guide-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const steps = [
        { title: '1. ALITAS [1] Y BONELESS [2]', desc: 'Selecciónalos primero en la freidora y luego elige su salsa [Q, W, E o R] para despachar.' },
        { title: '2. PAPAS [3] (COMPLEMENTO)', desc: 'Las papas NO llevan salsa. Al presionar Papas [3] se despachan al instante.' },
        { title: '3. DESPACHO CALIENTE (+50)', desc: 'Si entregas antes de que baje la mitad del tiempo, ganas bono extra.' },
        { title: '4. RACHA x2', desc: 'Encadena 4 órdenes seguidas sin fallar para duplicar tus puntos.' }
    ];

    steps.forEach(s => {
        const card = document.createElement('div');
        card.className = 'bg-black/70 border border-slate-800 rounded p-2.5';
        card.innerHTML = `
            <div class="pixel-font text-[9px] text-yellow-400 mb-1">${s.title}</div>
            <div class="text-xs text-gray-300 leading-snug">${s.desc}</div>
        `;
        grid.appendChild(card);
    });
}
buildRecipeGuide();

// --- Construcción de Botoneras de Cocina ---
function buildStationControls() {
    piecesPadEl.innerHTML = '';
    PIECES.forEach(piece => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.pieceId = piece.id;
        btn.className = `station-btn ${piece.bg} border-2 ${piece.border} rounded-lg p-2 flex flex-col items-center justify-center gap-1 shadow-md`;
        btn.appendChild(createSpriteCanvas(piece.sprite, 36));

        const lbl = document.createElement('span');
        lbl.className = 'pixel-font text-[8px] sm:text-[10px] text-white';
        lbl.textContent = piece.name;

        const keyTag = document.createElement('span');
        keyTag.className = piece.needsSauce
            ? 'text-[11px] text-amber-300 font-bold leading-none'
            : 'text-[11px] text-emerald-400 font-bold leading-none';
        keyTag.textContent = piece.needsSauce ? `[${piece.key}] + SALSA` : `[${piece.key}] DIRECTO`;

        btn.appendChild(lbl);
        btn.appendChild(keyTag);
        btn.addEventListener('click', () => handlePieceAction(piece.id));
        piecesPadEl.appendChild(btn);
    });

    saucesPadEl.innerHTML = '';
    SAUCES.forEach(sauce => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.sauceId = sauce.id;
        btn.className = `station-btn bg-zinc-900 hover:bg-zinc-800 border-2 ${sauce.border} rounded-lg p-2 flex items-center justify-center sm:flex-col gap-2 sm:gap-1 shadow-md`;
        btn.appendChild(createSpriteCanvas(sauce.sprite, 32));

        const textWrap = document.createElement('div');
        textWrap.className = 'text-left sm:text-center';
        textWrap.innerHTML = `
            <span class="pixel-font text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded ${sauce.badgeBg} block">${sauce.name}</span>
            <span class="text-[11px] text-gray-300 font-bold block mt-0.5">[TECLA ${sauce.key}]</span>
        `;
        btn.appendChild(textWrap);
        btn.addEventListener('click', () => serveWithSauce(sauce.id));
        saucesPadEl.appendChild(btn);
    });
}
buildStationControls();

// --- Dificultad Progresiva (Con Muro Infierno S.N.A.X. a los 4,400 pts) ---
function updateDifficultyByScore() {
    if (score >= 4400) {
        speedMultiplier = 2.65 + Math.min(0.85, (score - 4400) / 1400);
        currentPaceLabel = 'INFIERNO SNAX';
    } else if (score >= 2800) {
        speedMultiplier = 1.95 + ((score - 2800) / 1600) * 0.70;
        currentPaceLabel = 'HORA PICO';
    } else if (score >= 1500) {
        speedMultiplier = 1.50 + ((score - 1500) / 1300) * 0.45;
        currentPaceLabel = 'COCINA LLENA';
    } else if (score >= 600) {
        speedMultiplier = 1.20 + ((score - 600) / 900) * 0.30;
        currentPaceLabel = 'CALENTANDO';
    } else {
        speedMultiplier = 1.0 + (score / 600) * 0.20;
        currentPaceLabel = 'INICIAL';
    }

    paceBadgeEl.textContent = `TURNO: ${currentPaceLabel}`;
    if (score >= 4400) {
        paceBadgeEl.className = 'pixel-font text-[7px] sm:text-[8px] bg-fuchsia-800 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-300 animate-bounce shrink-0';
    } else if (score >= 2800) {
        paceBadgeEl.className = 'pixel-font text-[7px] sm:text-[8px] bg-purple-700 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-300 animate-pulse shrink-0';
    } else if (score >= 1500) {
        paceBadgeEl.className = 'pixel-font text-[7px] sm:text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded border border-yellow-300 shrink-0';
    } else if (score >= 600) {
        paceBadgeEl.className = 'pixel-font text-[7px] sm:text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded border border-white shrink-0';
    } else {
        paceBadgeEl.className = 'pixel-font text-[7px] sm:text-[8px] bg-zinc-800 text-gray-200 px-1.5 py-0.5 rounded border border-zinc-600 shrink-0';
    }

    if (currentPaceLabel !== previousPaceLabel && score > 0) {
        createPopup(`🔥 ${currentPaceLabel}`, '#facc15');
    }
    previousPaceLabel = currentPaceLabel;
}

// --- Popups y Vidas ---
function createPopup(text, color = '#facc15') {
    const popup = document.createElement('div');
    popup.className = 'absolute left-1/2 top-1/3 -translate-x-1/2 pixel-font text-[10px] sm:text-xs font-bold pointer-events-none transition-all duration-700 ease-out whitespace-nowrap z-40';
    popup.style.color = color;
    popup.style.textShadow = '2px 2px 0px #000';
    popup.textContent = text;
    popupContainer.appendChild(popup);

    requestAnimationFrame(() => {
        popup.style.transform = 'translate(-50%, -32px)';
        popup.style.opacity = '0';
    });
    setTimeout(() => popup.remove(), 700);
}

function renderLivesHUD() {
    livesContainerEl.innerHTML = '';
    for (let i = 0; i < Math.max(0, lives); i++) {
        const hCanvas = createSpriteCanvas('heart', 24);
        hCanvas.style.width = '16px';
        hCanvas.style.height = '14px';
        livesContainerEl.appendChild(hCanvas);
    }
}

function updateHUD() {
    scoreValEl.textContent = String(score).padStart(6, '0');
    streakValEl.textContent = streak;
    renderLivesHUD();
}

// --- Gestión de Comandas y Charola ---
function createOrder() {
    const piece = PIECES[Math.floor(Math.random() * PIECES.length)];
    // Solo Alitas y Boneless llevan salsa; Papas salen sin salsa (null)
    const sauce = piece.needsSauce
        ? SAUCES[Math.floor(Math.random() * SAUCES.length)]
        : null;

    const baseDuration = Math.max(4.2, 11.5 / speedMultiplier);

    activeOrders.push({
        id: nextOrderId++,
        piece: piece,
        sauce: sauce,
        timeLeft: baseDuration,
        maxTime: baseDuration
    });
}

function renderOrdersRail() {
    ordersRailEl.innerHTML = '';
    for (let slot = 0; slot < 3; slot++) {
        const order = activeOrders[slot];
        const card = document.createElement('div');

        if (!order) {
            card.className = 'bg-zinc-950/60 border-2 border-dashed border-zinc-800 rounded-lg p-2 flex flex-col items-center justify-center text-zinc-600';
            card.innerHTML = `<span class="pixel-font text-[8px]">ESPERANDO</span><span class="text-xs mt-1">COMANDA...</span>`;
            ordersRailEl.appendChild(card);
            continue;
        }

        const pct = Math.max(0, Math.min(100, (order.timeLeft / order.maxTime) * 100));
        const isUrgent = pct <= 32;
        const barColor = pct > 50 ? 'bg-emerald-400' : (pct > 28 ? 'bg-amber-400' : 'bg-red-500');

        card.className = `order-card bg-zinc-900 border-2 ${isUrgent ? 'urgent' : 'border-amber-400/70'} rounded-lg p-2 flex flex-col items-center justify-between text-center shadow-lg`;

        const header = document.createElement('div');
        header.className = 'w-full flex items-center justify-between text-[10px] font-bold text-gray-400';
        header.innerHTML = `<span class="pixel-font text-[7px] text-yellow-400">#${order.id}</span><span>${pct > 50 ? '🔥 +50' : '+35'}</span>`;

        const visuals = document.createElement('div');
        visuals.className = 'flex items-center justify-center gap-1.5 my-1';
        visuals.appendChild(createSpriteCanvas(order.piece.sprite, order.sauce ? 32 : 38));
        if (order.sauce) {
            visuals.appendChild(createSpriteCanvas(order.sauce.sprite, 28));
        }

        const labels = document.createElement('div');
        labels.className = 'w-full';
        if (order.sauce) {
            labels.innerHTML = `
                <div class="pixel-font text-[8px] sm:text-[9px] text-white truncate">${order.piece.name}</div>
                <span class="inline-block mt-0.5 pixel-font text-[7px] px-1.5 py-0.5 rounded ${order.sauce.badgeBg}">${order.sauce.name}</span>
            `;
        } else {
            labels.innerHTML = `
                <div class="pixel-font text-[8px] sm:text-[9px] text-white truncate">${order.piece.name}</div>
                <span class="inline-block mt-0.5 pixel-font text-[7px] px-1.5 py-0.5 rounded bg-zinc-700 text-emerald-300 border border-emerald-500/40">SIN SALSA</span>
            `;
        }

        const barWrap = document.createElement('div');
        barWrap.className = 'w-full h-2 bg-black rounded-full overflow-hidden mt-1.5 border border-zinc-700';
        barWrap.innerHTML = `<div class="h-full ${barColor} transition-all duration-100" style="width:${pct}%"></div>`;

        card.appendChild(header);
        card.appendChild(visuals);
        card.appendChild(labels);
        card.appendChild(barWrap);
        ordersRailEl.appendChild(card);
    }
}

function updatePrepStationUI() {
    prepPieceSlotEl.innerHTML = '';
    prepSauceSlotEl.innerHTML = '';

    document.querySelectorAll('#pieces-pad .station-btn').forEach(btn => {
        if (btn.dataset.pieceId === selectedPieceId) {
            btn.classList.add('ring-2', 'ring-yellow-400', 'bg-zinc-800');
        } else {
            btn.classList.remove('ring-2', 'ring-yellow-400', 'bg-zinc-800');
        }
    });

    if (selectedPieceId) {
        const piece = PIECES.find(p => p.id === selectedPieceId);
        prepPieceSlotEl.appendChild(createSpriteCanvas(piece.sprite, 36));
        prepPieceSlotEl.className = 'w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900 border-2 border-yellow-400 rounded flex items-center justify-center';
        prepSauceSlotEl.innerHTML = `<span class="pixel-font text-[8px] text-orange-400 animate-pulse">SALSA?</span>`;
        prepStatusTextEl.textContent = `¡Listo! Ahora elige la salsa para ${piece.name}`;
    } else {
        prepPieceSlotEl.className = 'w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900 border-2 border-dashed border-zinc-600 rounded flex items-center justify-center';
        prepPieceSlotEl.innerHTML = `<span class="pixel-font text-[8px] text-zinc-500">1.PIEZA</span>`;
        prepSauceSlotEl.innerHTML = `<span class="pixel-font text-[8px] text-zinc-500">2.SALSA</span>`;
        prepStatusTextEl.textContent = 'Alitas/Boneless + Salsa • Papas salen directo';
    }
}

function completeOrderMatch(matchIndex, customLabel = null) {
    const servedOrder = activeOrders[matchIndex];
    activeOrders.splice(matchIndex, 1);
    selectedPieceId = null;

    ordersServed++;
    streak++;
    if (streak > maxStreak) maxStreak = streak;

    const isHot = (servedOrder.timeLeft / servedOrder.maxTime) > 0.5;
    const basePts = isHot ? 50 : 35;
    const multiplier = streak >= 4 ? 2 : 1;
    const earned = basePts * multiplier;

    score += earned;
    playSound(isHot ? 'serve_hot' : 'serve_ok');

    if (multiplier > 1) {
        comboBadgeEl.textContent = 'RACHA x2';
        comboBadgeEl.classList.remove('hidden');
    }

    const msg = customLabel
        ? `${customLabel} +${earned}`
        : (isHot ? `🔥 ¡CALIENTITO! +${earned}` : `¡DESPACHADO! +${earned}`);
    createPopup(msg, isHot ? '#facc15' : '#4ade80');

    updateDifficultyByScore();
    checkMilestoneRewards();
    updateHUD();
    updatePrepStationUI();

    if (activeOrders.length === 0) {
        createOrder();
    }
    renderOrdersRail();
}

function registerMistake(message) {
    lives--;
    streak = 0;
    ordersFailed++;
    selectedPieceId = null;
    comboBadgeEl.classList.add('hidden');

    playSound('error');
    createPopup(message, '#ef4444');
    updateHUD();
    updatePrepStationUI();

    if (lives <= 0) {
        triggerGameOver();
    }
}

function handlePieceAction(pieceId) {
    if (gameState !== 'PLAYING') return;
    const piece = PIECES.find(p => p.id === pieceId);
    if (!piece) return;

    // Si es complemento directo sin salsa (Papas), despacha al instante
    if (!piece.needsSauce) {
        const matchIndex = activeOrders.findIndex(o => o.piece.id === pieceId && o.sauce === null);
        if (matchIndex !== -1) {
            completeOrderMatch(matchIndex, '🍟 ¡PAPAS LISTAS!');
        } else {
            registerMistake('✖ ¡NADIE PIDIÓ PAPAS! -1 VIDA');
        }
        return;
    }

    // Si es Alitas o Boneless, queda listo en charola esperando su salsa
    selectedPieceId = pieceId;
    playSound('pick_piece');
    updatePrepStationUI();
}

function clearTray() {
    selectedPieceId = null;
    updatePrepStationUI();
}

function serveWithSauce(sauceId) {
    if (gameState !== 'PLAYING') return;

    if (!selectedPieceId) {
        playSound('error');
        createPopup('¡PRIMERO ELIGE ALITAS O BONELESS!', '#f97316');
        return;
    }

    const matchIndex = activeOrders.findIndex(
        o => o.piece.id === selectedPieceId && o.sauce && o.sauce.id === sauceId
    );

    if (matchIndex !== -1) {
        completeOrderMatch(matchIndex);
    } else {
        registerMistake('✖ ¡SALSA O PIEZA INCORRECTA! -1 VIDA');
    }
}

// --- Bucle de Tiempo ---
function gameTick() {
    if (gameState !== 'PLAYING') return;

    const now = performance.now();
    const dtSec = Math.min(0.25, (now - lastTick) / 1000);
    lastTick = now;

    if (activeOrders.length < 3) {
        spawnCooldown -= dtSec;
        if (spawnCooldown <= 0 || activeOrders.length === 0) {
            createOrder();
            spawnCooldown = Math.max(0.85, 2.6 / speedMultiplier);
        }
    }

    for (let i = activeOrders.length - 1; i >= 0; i--) {
        activeOrders[i].timeLeft -= dtSec;
        if (activeOrders[i].timeLeft <= 0) {
            activeOrders.splice(i, 1);
            lives--;
            streak = 0;
            ordersFailed++;
            comboBadgeEl.classList.add('hidden');
            playSound('error');
            createPopup('❄ ¡SE ENFRIÓ LA ORDEN! -1 VIDA', '#38bdf8');
            updateHUD();

            if (lives <= 0) {
                triggerGameOver();
                return;
            }
        }
    }

    renderOrdersRail();
}

// --- Controles de Teclado ---
window.addEventListener('keydown', (e) => {
    if (document.activeElement === playerNameInput) return;
    if (e.repeat) return;

    if (e.code === 'Digit1' || e.code === 'Numpad1') handlePieceAction('wing');
    else if (e.code === 'Digit2' || e.code === 'Numpad2') handlePieceAction('boneless');
    else if (e.code === 'Digit3' || e.code === 'Numpad3') handlePieceAction('fries');
    else if (e.code === 'KeyQ') serveWithSauce('atomic');
    else if (e.code === 'KeyW') serveWithSauce('mango');
    else if (e.code === 'KeyE') serveWithSauce('bbq');
    else if (e.code === 'KeyR') serveWithSauce('limon');
    else if (e.code === 'Escape') {
        if (gameState === 'PLAYING' && selectedPieceId) {
            clearTray();
        } else if (gameState === 'PLAYING') {
            pauseGame();
        } else if (gameState === 'PAUSED') {
            resumeGame();
        }
    } else if (e.code === 'KeyP') {
        if (gameState === 'PLAYING') pauseGame();
        else if (gameState === 'PAUSED') resumeGame();
    }
});

// --- Transiciones de Estado ---
function startGame() {
    if (!currentPlayerName) {
        const typedName = playerNameInput.value.trim();
        if (!typedName) {
            loginErrorMsg.classList.remove('hidden');
            playerNameInput.focus();
            return;
        }
        currentPlayerName = typedName;
        localStorage.setItem('snax_player_name', currentPlayerName);
    }

    syncPlayerLoginUI();
    loginErrorMsg.classList.add('hidden');

    hudPlayerTagEl.textContent = currentPlayerName.toUpperCase();
    hudPlayerTagEl.classList.remove('hidden');

    initAudio();
    if (loopInterval) clearInterval(loopInterval);

    score = 0;
    lives = 3;
    streak = 0;
    maxStreak = 0;
    ordersServed = 0;
    ordersFailed = 0;
    activeOrders = [];
    nextOrderId = 1;
    spawnCooldown = 0;
    selectedPieceId = null;
    unlockedRewardsThisRun = [];
    previousPaceLabel = 'INICIAL';

    if (rewardToastTimeout) clearTimeout(rewardToastTimeout);
    rewardToast.classList.add('hidden');
    comboBadgeEl.classList.add('hidden');

    showGameScreen();

    rewardsModal.classList.add('hidden');
    rewardsModal.classList.remove('flex');
    guideModal.classList.add('hidden');
    guideModal.classList.remove('flex');
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('flex');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('flex');
    pauseBtn.classList.remove('hidden');

    updateDifficultyByScore();
    updateHUD();
    updatePrepStationUI();
    createOrder();
    renderOrdersRail();

    gameState = 'PLAYING';
    lastTick = performance.now();
    startBGM();
    loopInterval = setInterval(gameTick, 80);
}

function pauseGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'PAUSED';
    stopBGM();
    if (loopInterval) clearInterval(loopInterval);
    pausePaceSummaryEl.textContent = `Turno: ${currentPaceLabel} (${score} PTS)`;
    pauseScreen.classList.remove('hidden');
    pauseScreen.classList.add('flex');
}

function resumeGame() {
    if (gameState !== 'PAUSED') return;
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('flex');
    lastTick = performance.now();
    gameState = 'PLAYING';
    startBGM();
    loopInterval = setInterval(gameTick, 80);
}

function exitToMainMenu() {
    stopBGM();
    if (loopInterval) clearInterval(loopInterval);
    gameState = 'START';
    activeOrders = [];
    selectedPieceId = null;
    comboBadgeEl.classList.add('hidden');
    hudPlayerTagEl.classList.add('hidden');
    pauseBtn.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    pauseScreen.classList.remove('flex');
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('flex');
    syncPlayerLoginUI();
    showLoginScreen();
    startHighscoreEl.textContent = highscore;
}

function triggerGameOver() {
    gameState = 'GAMEOVER';
    stopBGM();
    if (loopInterval) clearInterval(loopInterval);
    pauseBtn.classList.add('hidden');
    rewardToast.classList.add('hidden');
    playSound('gameover');

    if (score > highscore) {
        highscore = score;
        localStorage.setItem('snax_freidora_highscore', String(highscore));
        startHighscoreEl.textContent = highscore;
        finalCommentEl.textContent = `¡NUEVO RÉCORD, ${currentPlayerName.toUpperCase()}!`;
    } else {
        finalCommentEl.textContent = '¡Se saturó la freidora!';
    }

    const totalAttempts = ordersServed + ordersFailed;
    const accuracyPct = totalAttempts > 0 ? Math.round((ordersServed / totalAttempts) * 100) : 0;

    let rankLabel = 'APRENDIZ';
    if (score >= 4200) rankLabel = 'CHEF EJECUTIVO';
    else if (score >= 2800) rankLabel = 'MAESTRO FREIDOR';
    else if (score >= 1500) rankLabel = 'COCINERO PRO';

    finalPlayerNameEl.textContent = currentPlayerName.toUpperCase();
    finalScoreEl.textContent = score;
    highscoreValEl.textContent = highscore;
    finalRankProfileEl.textContent = `${rankLabel} (${accuracyPct}%)`;

    let topCouponCode = 'NINGUNO';
    let allUnlockedCodes = 'NINGUNO';

    if (unlockedRewardsThisRun.length > 0) {
        const topReward = unlockedRewardsThisRun[unlockedRewardsThisRun.length - 1];
        topCouponCode = topReward.code;
        allUnlockedCodes = unlockedRewardsThisRun.map(r => r.code).join(', ');

        couponTitleEl.textContent = topReward.title;
        couponDescEl.textContent = topReward.desc;
        couponCodeTextEl.textContent = topReward.code;
        copyCouponBtn.textContent = 'COPIAR';

        allUnlockedBadgesEl.innerHTML = '';
        unlockedRewardsThisRun.forEach(r => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'pixel-font text-[8px] px-1.5 py-0.5 rounded border ' +
                (r.id === topReward.id ? 'bg-yellow-400 text-black border-white' : 'bg-gray-800 text-yellow-300 border-yellow-500/40');
            chip.textContent = r.shortLabel;
            chip.addEventListener('click', () => {
                couponTitleEl.textContent = r.title;
                couponDescEl.textContent = r.desc;
                couponCodeTextEl.textContent = r.code;
                copyCouponBtn.textContent = 'COPIAR';
            });
            allUnlockedBadgesEl.appendChild(chip);
        });

        unlockedCouponBox.classList.remove('hidden');
        noCouponHint.classList.add('hidden');
    } else {
        unlockedCouponBox.classList.add('hidden');
        noCouponHint.classList.remove('hidden');
    }

    sendToGoogleSheets({
        juego: 'FREIDORA EXPRESS',
        jugador: currentPlayerName,
        puntuacion: score,
        precision: `${accuracyPct}%`,
        detalle: `Entregadas: ${ordersServed} | Falladas: ${ordersFailed}`,
        comboMax: maxStreak,
        rango: `${rankLabel} (${score} PTS)`,
        cupon: topCouponCode,
        cuponesPartida: allUnlockedCodes
    });

    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('flex');
}

// --- Eventos de Interfaz ---
copyCouponBtn.addEventListener('click', () => {
    const code = couponCodeTextEl.textContent;
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand('copy');
        copyCouponBtn.textContent = '¡COPIADO!';
        playSound('bonus');
        setTimeout(() => { copyCouponBtn.textContent = 'COPIAR'; }, 2000);
    } catch (err) {
        copyCouponBtn.textContent = code;
    }
    document.body.removeChild(tempInput);
});

openRewardsBtn.addEventListener('click', () => {
    rewardsModal.classList.remove('hidden');
    rewardsModal.classList.add('flex');
});
closeRewardsBtn.addEventListener('click', () => {
    rewardsModal.classList.add('hidden');
    rewardsModal.classList.remove('flex');
});

openGuideBtn.addEventListener('click', () => {
    guideModal.classList.remove('hidden');
    guideModal.classList.add('flex');
});
closeGuideBtn.addEventListener('click', () => {
    guideModal.classList.add('hidden');
    guideModal.classList.remove('flex');
});

clearTrayBtn.addEventListener('click', clearTray);

playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startGame();
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
pauseRestartBtn.addEventListener('click', startGame);
exitMenuBtn.addEventListener('click', exitToMainMenu);
restartBtn.addEventListener('click', startGame);
gameOverMenuBtn.addEventListener('click', exitToMainMenu);

function toggleAudio() {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? '🔊 AUDIO: ON' : '🔇 AUDIO: OFF';
    pauseSoundBtn.textContent = soundEnabled ? '🔊 SONIDO: ON' : '🔇 SONIDO: OFF';
    if (soundEnabled && gameState === 'PLAYING') startBGM();
    else stopBGM();
}
soundToggleBtn.addEventListener('click', toggleAudio);
pauseSoundBtn.addEventListener('click', toggleAudio);

renderLivesHUD();