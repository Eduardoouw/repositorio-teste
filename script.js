// === VARIÁVEIS GLOBAIS ===
let context = null;
let baseNoteBuffer = null;
const BASE_NOTE = 'C4';
const BASE_NOTE_FILE_PATH = 'sons/69.ogg';
let baseNoteFrequency = 0;

// === USUÁRIOS (LOGIN/CADASTRO PERSISTENTE) ===

// 1. Inicializa USERS com 'let' para permitir que seja reatribuído.
let USERS = []; 

// 2. Tenta carregar a lista salva no localStorage.
const storedUsers = localStorage.getItem('pianoUsers');

if (storedUsers) {
    // Se existir, carrega a lista atualizada (incluindo cadastros).
    USERS = JSON.parse(storedUsers);
} else {
    // Se não existir (primeira vez), cria a lista inicial de exemplo.
    USERS = [
        { email: "ana@gmail.com", password: "1234", name: "Ana Silva" },
        { email: "XD@gmail.com", password: "XDXDXD", name: "XD" },
        { email: "lucas@gmail.com", password: "dev2025", name: "Lucas Mendes" },
        { email: "bea@gmail.com", password: "musica123", name: "Beatriz Costa" },
        { email: "rita@gmail.com", password: "12345", name: "Rita Steyer" }
    ];
    // Salva a lista inicial para que o cadastro.js possa acessá-la.
    localStorage.setItem('pianoUsers', JSON.stringify(USERS));
}

// === MÚSICAS PRÉ-CARREGADAS ===
const MUSICAS = [
    { nome: "Música 1 - MINECRAFT", seq: "[IP] - O [QY] - [QEI] -- [IP] - O [QY] - T [IP] - O [QY] - [EI] -- [IP] - O [QY] I T E [IP] - T [QY] - [EI] - [TO] [IP] - O [QYP] E [TS] [IP] - [OS] [QD] - [EOS] P O [IP] - O [QYP] - I [T] -- [QY] - [EI] -- [TO] - P [QI] TO" },
    { nome: "Música 2 - FUR ELISE", seq: "f - D - f - D - f - a - d - s - [6ep] - 0 - e - t - u - p - [3a] - 0 - W - u - O - a - [6s] - 0 - e - u - f - D - f - D - f - a - d - s - [6ep] - 0 - e - t - u - p - [3a] - 0 - W - u - s - a - [6p] - 0 - e - a - s - d - [8f] - w - t - o - g - f - [5d] - w - r - i - f - d - [6s] - 0 - e - u - d - s - [3a] - 0 - u - u - f - u - f - f - x - D - f - D - f - D - f - D - f - D - f - D - f - D - f - a - d - s - [6p] - 0 - e - t - u - p - [3a] - 0 - W - u - O - a - [6s] - 0 - e - u - f - D - f - D - f - a - d - s - [6p] - 0 - e - t - u - p - [3a] - 0 - W - u - s - a - [6p] - 0 - e - a - s - d - [8f] - w - t - o - g - f - [5d] - w - r - i - f - d - [6s] - 0 - e - u - d - s - [3a] - 0 - u - s - a - [pe6]" },
    { nome: "Música 3 - MINECRAFT 2", seq: "6 - 0 - e - r - T - r - e - 0 - 9 - Q - T - u - T - e - 6 - 0 - e - r - T - r - e - 0 - 9 - Q - T - u - T - e - O - 0 - e - r - T - r - [pe] - 0 - I - Q - T - u - T - e - u - I - O - 0 - e - r - T - r - [ea] - S - [QI] - T - u - T - e - S - f - [h5] - [GQ] - [ed] - [9p] - [7a] - 5 - 7 - 9 - Q - e - [h5] - G - [ed] - [9p] - [7a] - 5 - 7 - 9 - Q - e - p - [6u] - 0 - e - r - T - r - e - 0 - 6 - 0 - e - r - T - u - p - S - | - [7yd] - S - p - [uf] - [IG] - [9yd] - Q - e - T - p - S - [5d] - 7 - S - d - e - G - S - | - r - e - [3r] - % - 7 - 0 - W - 0 - 7 - % - 3 - % - 7 - 0 - W - 0 - 6 - 5 - 7 - 9 - Q - e - Q - 9 - 7 - 6 - (0 - e - T - r - e - 0 - 3 - % - 7 - 0 - W - 3 - % - 7 - 0 - W - d - d - D - d - s - d - o - s - P - o - P - s - s - s - d - s - P - s - d - P - o - o - P - o - P - o - [od] - d - D - d - [so] - P - d - s - d - o - o - P - p - p - d - d - [^P] - p - d - c - ^ - [g@] - d - s - P - s - d - P - [sp] - i - o - i - u - i - d - d - s - d - o - i - i - g - d - s - P - s - d - P - s - i - o - i - u - i - d - d - S - d - J - j - g - o - p - P - P - p - P - d - [spi] - s - P - s - p - [iP] - P - p - P - i - o - o - p - P - P - p - P - d - s - s - s - P - s - P - p - s - P - i - p - s - j - l - z - c - b - d - d - D - d - s - d - o - s - P - o - P - s - s - s - d - s - P - s - d - P - o - o - P - o - P - o - d - d - D - d - s - P - d - s - d - o - o - P - p - p - p - d - d - P - y - i - p - y - i - p - d - i - P - d - g - [^PJ] - J - J - J - J - J - J - J - J - J - J - J - J - J - j - j - k - l - z - x - c - v - b - n - l - z - x - c - v - b - n - l - J - J - -J - J - J - J - J - J - J - J - J - J - J - J - J" },
    { nome: "Música 4 - SUPER MARIO BROS", seq: "h - f - f - f - s - f - h - o - soupa - P - p - o - f - h -j - g - h - f - s - d - a - soupa - P - p - o - f - h - j - g - h - f - s - d - a - h - G - g - D - f - O - p - s - p - s - d - h - G - g - D - f - l - l - l - h - G - g - D - f - O - p - s - p - s - d - D - d - s - h - G - g - D - f - O - p - s - p - s - d - h - G - g - D - f - l - l - l - h - G - g - D - f - O - p - s - p - s - d - [DO] - [id] - [us] - s - s - s - s - d - f - s - p - o - s - s - s - s - d - f - s - s - s - s - d - f - s - p - o - f - f - f - s - f - h - o - soupa - P - p - o - f - h - j - g - h - f - s - d - a - soupa - P - p - o - f - h - j - g - h - f - s - d - a - h - G - g - D - f - O - p - s - p - s - d - h - G - g - D - f - l - l - l - h - G - g - D - f - O - p - s - p - s - d - [DO] - [id] - [us]"},
    { nome: "Música 5 - RUSH E", seq: "u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - [uf] - [uf ] - [uf0] - [uf0] - [uf0x] - [uf0x] - [uf0x3] - [uf0x3] - 6 - [80] - 3 - [80] - 346 - [80] - 3 - [80] - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - i - u - Y - u - p - s - d - d - d - d - d - s - a - d - s - s - s - s - s - a - p - s - a - a - a - a - O - a - P -u - | - u -  u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - i - u - Y - u - p - s - f - g - h - | - hgf - hgfd - gfdS - fdpiy - apoiuy -Tuy - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - i - u - Y - u - p - s - d - d - d - d - d - s - a - d - s - s - s - s - s - a - p - s - a - a - a - a - O - a - P - u - |u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - u - i - u - Y - u - p - s - f - g - h - | - hgf - hgfd - gfdS - fdpiy - apoiuy -Tuy - u - o - I - o - p - a - p - o - a - p - o - i - o - p - | - i - u - Y - u - i - o - i - u - o - i - y - i - p - d - p - i - y - o - I - o - p - a - p - o - p - o - i - u - i - | - s - o - a - p - i - p - u - y - [et] - [pi]"},
    { nome: "Música 6 - CHANGES", seq: "[ua0] - a - a - a - [aT*] - a - a - a - [aW%] - a - a - a - a - a - a - k - k - Z - L - k - J - [uk0] - k - k - k - L - k - J - [kT*] - k - k - k - L - k - J - [kW%]  - k  - k - k - L - k - J - [ka] - k - a - k - [ka] - k - k - [aZ] - L - k - J - [uk0] - k - k - k - L - k - J - [kT*] - k - k - k - L - k - J - [kW%] - k - k - k - L - k - J - [ka] - k - a - k - [ka] - k - k - [aZ] - L - k - J - [u0] - k - k - k - L - Z - L - k - k - [T*] - k - k - k - L - Z - L - k - k - [W%] - k - k - k - L - Z - L - k - k - a - a - a - a - k - k - Z - L - k - J - [uk0] - k - k - k - L - k - J - [kT*] - k - k - k - L - k - J - [kW%] - k - k - k - L - k - J - k - k - k - k - k - k - Z - L - k - J - [uk0] - k - k - k - L - k - J - [kT*] - k - k - k - L - k - J - [kW%] - k - k - k - L - k - J - k - k - k - k - k - k - Z - L - k - J  -[u0] - k - k - k - L - Z - L - k - k - [T*] - k - k - k - L - Z - L - k  -k - [W%] - k - k - k - L - Z - L - k - k - a - a - a - a - a - a - a - a " },
    { nome: "Música 7 - MOONLIGHT SONATA (BETHOVEN)", seq: "[9e] - y - i - e - y - i - e - y - i - e - y - i - | - [8e] - y - i - e - y - i - e - y - i - e - y - i - E - y - i - E - y - i - E - Y - o - E - Y - o - [6e] - T - o - e - y - i - [6e] - y - u - w - T - u - [9q] - e - y - e - y - i - e - y - i - p - e - y - p - | - [*p] - u - o - e - u - o - e - u - o - p - u - o - p - [9p] - y - i - e - y - i - P - y - o - E - y - o - | - [8p] - t - i - e - t - i  - [8o] - t - u - s - u - o - [4i] - t - i - e - t - i - e - t - i - e - t - i - W - t - i - W - t - i - W - t - i - O - t - i - O - O - t - I - O - t - I - O - t - I - O - t - I - O - * - T - i - W - T - i - W - y - i - o - y - i - [8o] - t - Y - w - t - Y - W - t - y - W - t - y - | - [5o] - t - Y - w - t - Y - [wo] - r - y - w - r - y - [8t] - Y - o - t - Y - o - t - u - o - s - u - o - | - S - i - O - [qt] - i - O - W - i - O - [qa] - i - O - [8s] - u - o - t - u - o - t - u - o - s - u - o - | - S - i - O - [qt] - i - O - W - i - O - [qa] - i - O - [8s] - u - o - t - u - o - [6s] - Y - I - t - Y - I - | - s - y - p - t - y - p - E - y - i - E - y - i - 8 - t - Y - W - t - Y* - E - u - w - E - u - [9y] - w - E - 9 - w - E - [9y] - w - t - [9y] - Q - e | [5w] - E - y - E - y - o - y - o - P - d - o - P - d - d - p - s - y - p - s - y - p - s - d - p - s - d - [5d] - o - P - y - o - P - 0 - o - P - 8 - o - P | *o - p - u - o - p - u - o - p - [8f] - o - p - [9g] - p - d - i - p - d - [5f] - o - P - d - i - a - | 6 - T - u - p - T - u - P - T - u - o - T - u - 6 - T - u - e - T - u - E - T - u - w - T - u - 6 - e - y - q - e - y - 6 - w - T - 0 - w - T - [26qy] - [26qy] - [26qy]"},
    { nome: "Música 8 - LOVELY", seq: "[tp] - a - [0f] - [rd] - [7a] - p - a - [rp] - o - [8u] - I - [8o] - [tp] - a - [0f] - [rd] - [7a] - p - a - [rp] - o - [8u] - I - [8o] - [tp] - a - [0f] - [rd] - [7a] - p - a - [rp] - o - [8u] - I - [8o] - [tp] - a - [0f] - [rd] - [7a] - Q - r - [8k] - j - h - G - f - j - h - G - [0k] - j - h - G - f - G - f - h - [8k] - j - h - G - f - j - h - G - 0 - h - G - G - f - h - [0u]" },
    { nome: "Música 9 - IPHONE RINGTONE", seq: "[oa] - [ua] - [od] - [pf] - [uf] - d - a - f - [yp] - f - d - f - [pT] - [oa] - [ua] - [od] - [pf] - [uf] - d - a - f - [yp] - f - d - f - [pT] - [oa] - [ua] - [od] - [pf] - [uf] - d - a - f - [yp] - f - d - f - [pT] - [oa] - [ua] - [od] - [pf] - [uf] - d - a - f - [yp] - f - d - f - [pT]" },
    { nome: "Música 10 - OLD TOWN ROAD", seq: "[sYW] - [sYW] - [rSI] - [rSI] - [SQP] - [SQP] - [SO0] - [SO0] - [sYW] - [sYW] - [rSI] - [rSI] - [SQP] - [SQP] - [SO0] - [SO0] - [sYWD] - S - [sYWD] - H - [rSID] - S - [rSI] - [SQP] - O - [SQP] - O - [SO0] - a - [SPO0] - O - [sYWD] - S - [sYWD] - H - [rSID] - S - [rSI] - [SQP] - O - [SQP] - O - [SO0] - a - [SPO0] - O - [sYW] - [sYW] - [rSI] - [rSI] - [SQP] - [SQP] - [SO0] - [SO0] - [sYW] - [sYW] - [rSI] - [rSI] - [SQP] - [SQP] - [SO0] - [SO0] - [sYW] - S - [sYWD] - H - [rSID] - S - [rSI] - [SQP] - O - [SQP] - O - [SO0] - a - [SPO0] - O - [sYW] - S - [sYWD] - H - [rSID] - S - [rSI] - [SQP] - O - [SQP] - O - [SO0] - a - [SPO0] - O" }
];

// === MAPEAMENTO VISUAL (rótulos nas teclas) ===
const noteLabelMap = {
    'C1':'1', 'D1':'2', 'E1':'3', 'F1':'4', 'G1':'5', 'A1':'6', 'B1':'7',
    'C2':'8', 'D2':'9', 'E2':'0', 'F2':'q', 'G2':'w', 'A2':'e', 'B2':'r',
    'C3':'t', 'D3':'y', 'E3':'u', 'F3':'i', 'G3':'o', 'A3':'p', 'B3':'a',
    'C4':'s', 'D4':'d', 'E4':'f', 'F4':'g', 'G4':'h', 'A4':'j', 'B4':'k',
    'C5':'l', 'D5':'z', 'E5':'x', 'F5':'c', 'G5':'v', 'A5':'b', 'B5':'n', 'C6':'m',
    'C#1':'!', 'D#1':'@', 'F#1':'$', 'G#1':'%', 'A#1':'*',
    'C#2':'(', 'D#2':'Q', 'F#2':'W', 'G#2':'E', 'A#2':'T',
    'C#3':'Y', 'D#3':'I', 'F#3':'O', 'G#3':'P', 'A#3':'S',
    'C#4':'D', 'D#4':'G', 'F#4':'H', 'G#4':'J', 'A#4':'L',
    'C#5':'Z', 'D#5':'C', 'F#5':'V', 'G#5':'B'
};

// === MAPEAMENTO TECLADO → NOTA ===
const keyMap = {
    '1':'C1', '2':'D1', '3':'E1', '4':'F1', '5':'G1', '6':'A1', '7':'B1',
    '8':'C2', '9':'D2', '0':'E2', 'q':'F2', 'w':'G2', 'e':'A2', 'r':'B2',
    't':'C3', 'y':'D3', 'u':'E3', 'i':'F3', 'o':'G3', 'p':'A3', 'a':'B3',
    's':'C4', 'd':'D4', 'f':'E4', 'g':'F4', 'h':'G4', 'j':'A4', 'k':'B4',
    'l':'C5', 'z':'D5', 'x':'E5', 'c':'F5', 'v':'G5', 'b':'A5', 'n':'B5', 'm':'C6',
    '!':'C#1', '@':'D#1', '$':'F#1', '%':'G#1', '*':'A#1',
    '(':'C#2', 'Q':'D#2', 'W':'F#2', 'E':'G#2', 'T':'A#2',
    'Y':'C#3', 'I':'D#3', 'O':'F#3', 'P':'G#3', 'S':'A#3',
    'D':'C#4', 'G':'D#4', 'H':'F#4', 'J':'G#4', 'L':'A#4',
    'Z':'C#5', 'C':'D#5', 'V':'F#5', 'B':'G#5'
};

// === MAPEAMENTO INVERSO (para o leitor visual) ===
const noteToKey = {};
for (const [note, key] of Object.entries(noteLabelMap)) {
    noteToKey[note] = key;
}

let currentSequence = [];
let isPlayingMusic = false;
let playbackSpeed = 1.0; // <--- ADICIONE ESTA LINHA


// === INICIALIZAÇÃO DO ÁUDIO ===
document.addEventListener('click', () => {
    if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        loadBaseSound();
    }
}, { once: true });

// === FUNÇÕES DE ÁUDIO ===
function getFrequency(note) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const A4Index = 43;
    let noteIndex = -1;
    for (let octave = 0; octave <= 8; octave++) {
        for (let i = 0; i < notes.length; i++) {
            noteIndex++;
            if (notes[i] + octave === note) {
                const n = noteIndex - A4Index;
                return parseFloat((440 * Math.pow(2, n / 12)).toFixed(2));
            }
        }
    }
    return 0;
}

function updateDisplay(note) {
    const freq = getFrequency(note);
    document.getElementById('current-note').textContent = note;
    document.getElementById('current-frequency').textContent = `${freq} Hz`;
}

function loadBaseSound() {
    if (!context) return Promise.reject("AudioContext não inicializado");
    baseNoteFrequency = getFrequency(BASE_NOTE);
    return fetch(BASE_NOTE_FILE_PATH)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            baseNoteBuffer = audioBuffer;
            console.log("Som base (C4) carregado com sucesso!");
            return audioBuffer;
        })
        .catch(error => {
            console.error("Falha ao carregar o som base:", error);
            alert("Erro: Não foi possível carregar 'sons/69.ogg'.");
        });
}

function playNote(note) {
    if (!context || !baseNoteBuffer) return;
    const targetFrequency = getFrequency(note);
    const playbackRate = targetFrequency / baseNoteFrequency;

    const source = context.createBufferSource();
    const gainNode = context.createGain();

    source.buffer = baseNoteBuffer;
    source.playbackRate.value = playbackRate;
    source.connect(gainNode);
    gainNode.connect(context.destination);

    const now = context.currentTime;
    const fadeOutTime = 1.5;
    const endTime = now + fadeOutTime;

    const baseVolume = 0.8;
    const boostMultiplier = 0.5;
    let startVolume = baseVolume;

    if (playbackRate < 1.0) {
        const boost = (1.0 - playbackRate) * boostMultiplier;
        startVolume = baseVolume * (1.0 + boost);
    }
    if (startVolume > 1.2) startVolume = 1.2;


    gainNode.gain.setValueAtTime(startVolume, now);
    gainNode.gain.linearRampToValueAtTime(0.0, endTime);

    source.start(now);
    source.stop(endTime);
}

// === RENDERIZAÇÃO DO PIANO ===
function renderPiano() {
    const piano = document.getElementById('piano');
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let whiteIndex = 0;
    const maxWhiteKeys = 36;

    for (let octave = 1; octave <= 6; octave++) {
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i] + octave;
            if (notes[i].length === 1 && whiteIndex < maxWhiteKeys) {
                const white = document.createElement('div');
                white.className = 'key white-key';
                white.dataset.note = note;
                const label = noteLabelMap[note] || '';
                white.innerHTML = `<span class="note-label">${label}</span>`;
                white.style.left = `${whiteIndex * 36}px`;
                piano.appendChild(white);

                if (notes[i + 1] && notes[i + 1].includes('#')) {
                    const blackNote = notes[i + 1] + octave;
                    if (noteLabelMap[blackNote]) {
                        const black = document.createElement('div');
                        black.className = 'key black-key';
                        black.dataset.note = blackNote;
                        black.innerHTML = `<span class="note-label">${noteLabelMap[blackNote]}</span>`;
                        black.style.left = `${(whiteIndex * 36) + 24}px`;
                        piano.appendChild(black);
                    }
                }
                whiteIndex++;
            }
        }
    }

    document.querySelectorAll('.key').forEach(key => {
        const note = key.dataset.note;
        key.addEventListener('mousedown', () => {
            key.classList.add('active');
            playNote(note);
            updateDisplay(note);
            createSpark(key);

            if (!isPlayingMusic) {
                const keyLabel = noteToKey[note];
                const isBlack = note.includes('#');     
                currentSequence.push({ notes: note, display: keyLabel, isChord: false, isBlack: isBlack });
                updateVisualSequence();
            }
        });
        key.addEventListener('mouseup', () => key.classList.remove('active'));
        key.addEventListener('mouseleave', () => key.classList.remove('active'));
    });
}

// === EVENTOS DO TECLADO ===
document.addEventListener('keydown', e => {
    const note = keyMap[e.key];
    if (note && !e.repeat) {
        const keyEl = document.querySelector(`[data-note="${note}"]`);
        if (keyEl) {
            keyEl.classList.add('active');
            playNote(note);
            updateDisplay(note);
            createSpark(keyEl);

            if (!isPlayingMusic) {
                const keyLabel = noteToKey[note];
                const isBlack = note.includes('#');
                currentSequence.push({ notes: note, display: keyLabel, isChord: false, isBlack: isBlack });
                updateVisualSequence();
            }
        }
    }
});

document.addEventListener('keyup', e => {
    const note = keyMap[e.key];
    if (note) {
        const keyEl = document.querySelector(`[data-note="${note}"]`);
        if (keyEl) keyEl.classList.remove('active');
    }
});

// === EFEITO DE FAÍSCA ===
function createSpark(keyElement) {
    const oldSpark = keyElement.querySelector('.spark-effect');
    if (oldSpark) oldSpark.remove();
    const spark = document.createElement('div');
    spark.className = 'spark-effect';
    keyElement.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
}



// === LEITOR VISUAL ===
const sequenceTrack = document.getElementById('sequenceTrack');
const sequenceReader = document.getElementById('sequenceReader');

function updateVisualSequence() {
    if (!sequenceTrack || isPlayingMusic) return;
    sequenceTrack.innerHTML = '';
    currentSequence.forEach((item, i) => {
        const span = document.createElement('span');
        span.className = 'sequence-item';
        span.textContent = item.display;
        if (item.isBlack) span.classList.add('black');
        else if (item.isChord) span.classList.add('chord');
        else span.classList.add('white');
        span.dataset.index = i;
        sequenceTrack.appendChild(span);
    });
    scrollToCurrentNote(-1);
}

function scrollToCurrentNote(index) {
    if (!sequenceReader || !sequenceTrack) return;
    const item = sequenceTrack.querySelector(`.sequence-item[data-index="${index - 2}"]`);
    if (item) {
        const newTransformX = -item.offsetLeft + (sequenceReader.offsetWidth / 2) - (item.offsetWidth / 2) - 25;
        sequenceTrack.style.transform = `translateX(${newTransformX}px)`;
    } else {
        sequenceTrack.style.transform = `translateX(0px)`;
    }
}

function highlightKeyInSequence(index) {
    if (!sequenceTrack) return;
    sequenceTrack.querySelectorAll('.sequence-item').forEach((el, i) => {
        el.classList.toggle('playing', i === index);
    });
    scrollToCurrentNote(index);
}

// === REPRODUÇÃO DE MÚSICA ===
function parseToken(token) {
    const isChord = token.startsWith('[') && token.endsWith(']');
    const clean = token.replace(/[\[\]]/g, '').trim();
    if (!clean) return [];
    const keys = clean.split('');
    const notes = keys.map(k => keyMap[k.toUpperCase()] || keyMap[k]).filter(Boolean);
    if (notes.length === 0) return [];
    return [{
        notes: notes.join(','),
        display: keys.join(''),
        isChord: isChord || notes.length > 1,
        isBlack: notes[0].includes('#')
    }];
}

function parseSequenceString(str) {
    const parts = str.split(/\s+/);
    const result = [];
    let buffer = '';
    for (let t of parts) {
        if (t === '-' || t === '--') {
            if (buffer) result.push(...parseToken(buffer));
            buffer = '';
            result.push({ isPause: true, duration: t === '--' ? 400 : 200 });
        } else {
            buffer += (buffer ? ' ' : '') + t;
        }
    }
    if (buffer) result.push(...parseToken(buffer));
    return result.filter(x => x);
}

function playSequenceFromList(seq) {
    if (isPlayingMusic) return;
    isPlayingMusic = true;
    currentSequence = seq;

    const playMusicButton = document.getElementById('playMusicButton');

    sequenceTrack.innerHTML = '';
    currentSequence.forEach((item, i) => {
        if (item.isPause) return;
        const span = document.createElement('span');
        span.className = 'sequence-item';
        span.textContent = item.display;
        if (item.isBlack) span.classList.add('black');
        else if (item.isChord) span.classList.add('chord');
        else span.classList.add('white');
        span.dataset.index = i;
        sequenceTrack.appendChild(span);
    });
    scrollToCurrentNote(-1);

    let time = 0;
    // MODIFICADO: Usa a velocidade
    const baseNoteDuration = 200;
    const noteDuration = baseNoteDuration / playbackSpeed; 
    const playPromises = [];

    seq.forEach((item, index) => {
        if (item.isPause) {
            time += item.duration;
        } else {
            const notesToPlay = item.notes.split(',');
            notesToPlay.forEach(note => {
                playPromises.push(new Promise(resolve => {
                    setTimeout(() => {
                        playNote(note);
                        const keyEl = document.querySelector(`[data-note="${note}"]`);
                        if (keyEl) {
                            keyEl.classList.add('active');
                            setTimeout(() => keyEl.classList.remove('active'), noteDuration - 50);
                        }
                        resolve();
                    }, time);
                }));
            });
            playPromises.push(new Promise(resolve => {
                setTimeout(() => {
                    highlightKeyInSequence(index);
                    resolve();
                }, time);
            }));
            time += noteDuration;
        }
    });

}

// === CONTROLES DE MÚSICA ===
function setupMusicControls() {
    const musicSelect = document.getElementById('musicSelect');
    const playMusicButton = document.getElementById('playMusicButton');
    const clearSequence = document.getElementById('clearSequence');

    MUSICAS.forEach((musica, i) => {
        const opt = document.createElement('option');
        opt.value = i + 1;
        opt.textContent = musica.nome;
        musicSelect.appendChild(opt);
    });

    playMusicButton.addEventListener('click', () => {
        const idx = parseInt(musicSelect.value);
        if (idx > 0) {
            playSequenceFromList(parseSequenceString(MUSICAS[idx - 1].seq));
        } else {
            alert("Selecione uma música primeiro.");
        }
    });

    clearSequence.addEventListener('click', () => {
        currentSequence = [];
        recording = [];
        updateVisualSequence();
        musicSelect.value = "";
        document.getElementById('downloadButton').disabled = true;
    });
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    renderPiano();
    updateDisplay('C1');
    setupMusicControls();

    // LOGIN
    // (FIX 3) LÓGICA DE LOGIN ATUALIZADA
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    // Abre o modal de login se não houver usuário no localStorage
    if (!localStorage.getItem('currentUserEmail')) {
        loginModal.classList.add('open');
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const user = USERS.find(u => u.email === email && u.password === password);
        
        if (user) {
            loggedInUser = user; // Define o usuário global
            localStorage.setItem('currentUserEmail', user.email); // Salva a sessão
            
            updateUserInfoDisplay(); // Atualiza a UI
            
            loginModal.classList.remove('open');
            loginError.style.display = 'none';
            loginForm.reset();
        } else {
            loggedInUser = null; // Limpa por segurança
            localStorage.removeItem('currentUserEmail');
            loginError.style.display = 'block';
        }
    });

    // (FIX 4) LÓGICA DE LOGOUT ATUALIZADA
    document.getElementById('logoutBtn').addEventListener('click', () => {
        loggedInUser = null; // Limpa o usuário global
        localStorage.removeItem('currentUserEmail'); // Limpa a sessão
        
        updateUserInfoDisplay(); // Atualiza a UI (esconde info)
        
        loginModal.classList.add('open'); // Abre o modal de login
        loginError.style.display = 'none';
    });

    // MENU
    const menuButton = document.getElementById('menuButton');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    menuButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        menuButton.classList.toggle('open');
        sidebarOverlay.classList.toggle('open');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('open');
        menuButton.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        menuButton.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    });

    // MODAIS
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => closeBtn.closest('.modal').classList.remove('open'));
    });

    document.querySelectorAll('.sidebar-menu button[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            document.getElementById(modalId)?.classList.add('open');
            sidebar.classList.remove('open');
            menuButton.classList.remove('open');
            sidebarOverlay.classList.remove('open');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) e.target.classList.remove('open');
    });

});
function loadBaseSound() {
    if (!context) return Promise.reject("AudioContext não inicializado");
    baseNoteFrequency = getFrequency(BASE_NOTE);

    const localPath = 'sons/69.ogg';
    const onlinePath = 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@master/FluidR3_GM/piano-ogg/C4.ogg';

    return fetch(localPath)
        .then(response => {
            if (response.ok) return response.arrayBuffer();
            console.warn("Arquivo local não encontrado. Usando som online...");
            return fetch(onlinePath).then(r => r.arrayBuffer());
        })
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            baseNoteBuffer = audioBuffer;
            console.log("Som base carregado com sucesso!");
            renderPiano(); // ← FORÇA O PIANO A APARECER
            return audioBuffer;
        })
        .catch(error => {
            console.error("Falha total ao carregar som:", error);
            alert("Erro crítico: não foi possível carregar o som do piano.");
        });
}


// === SUAS FUNÇÕES ORIGINAIS (tudo que você já tinha) ===
// (cole aqui todo o seu script.js original até o final)

// === ADIÇÃO FINAL - NOVAS FUNÇÕES (não quebra nada!) ===
document.addEventListener('DOMContentLoaded', () => {
    window.globalVolume = 1.0;

    // Cor das teclas
    document.getElementById('whiteKeyColor')?.addEventListener('input', (e) => {
        const color = e.target.value;
        document.querySelectorAll('.key.white-key').forEach(k => {
            k.style.background = `linear-gradient(to bottom, ${color}, ${darken(color,20)}, ${darken(color,40)})`;
        });
        localStorage.setItem('whiteKeyColor', color);
    });

    // Opacidade
    document.getElementById('keyOpacitySlider')?.addEventListener('input', (e) => {
        const op = e.target.value / 100;
        document.querySelectorAll('.key').forEach(k => k.style.opacity = op);
        document.getElementById('opacityDisplay').textContent = e.target.value + '%';
        localStorage.setItem('keyOpacity', e.target.value);
    });

    // Nome
    document.getElementById('saveNameBtn')?.addEventListener('click', () => {
        const name = document.getElementById('displayNameInput').value.trim();
        if (name) {
            document.getElementById('userEmailDisplay').textContent = name;
            localStorage.setItem('displayName', name);
            alert('Nome salvo: ' + name);
            document.getElementById('displayNameInput').value = '';
        }
    });

    // Modo RGB
    const rgbToggle = document.getElementById('rgbModeToggle');
    if (rgbToggle) {
        rgbToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('rgb-mode', e.target.checked);
            localStorage.setItem('rgbMode', e.target.checked);
        });
        if (localStorage.getItem('rgbMode') === 'true') {
            rgbToggle.checked = true;
            document.body.classList.add('rgb-mode');
        }
    }

    // Carregar configs salvas
    ['whiteKeyColor', 'keyOpacity', 'displayName'].forEach(item => {
        const val = localStorage.getItem(item);
        if (val && document.getElementById(item === 'displayName' ? 'userEmailDisplay' : item.replace('whiteKeyColor','whiteKeyColor'))) {
            if (item === 'keyOpacity') {
                document.getElementById('keyOpacitySlider').value = val;
                document.getElementById('opacityDisplay').textContent = val + '%';
                document.querySelectorAll('.key').forEach(k => k.style.opacity = val / 100);
            }
            if (item === 'displayName') document.getElementById('userEmailDisplay').textContent = val;
        }
    });
});

function darken(c, a) {
    return '#' + c.replace(/^#/, '').replace(/../g, x => ('0'+(Math.max(0, parseInt(x,16)-a)).toString(16)).substr(-2));
}

// Aplica volume global (se sua função playNote existir)
if (typeof playNote === 'function') {
    const orig = playNote;
    window.playNote = function(note) {
        orig(note);
        // Volume já é aplicado no seu código original ou será melhorado depois
    };
}


// === CHAT DE AJUDA - FUNCIONANDO PERFEITAMENTE ===
document.addEventListener('DOMContentLoaded', () => {
    const conversationDisplay = document.getElementById('conversation-display');
    const choicesArea = document.getElementById('choices-area');
    const restartButton = document.getElementById('restart-button');

    const conversationNodes = {
        start: {
            message: "Olá! Como posso te ajudar com o Piano Virtual hoje?",
            choices: [
                { text: "Como tocar com o teclado?", next: "teclado" },
                { text: "Como gravar uma música?", next: "gravar" },
                { text: "O som não está saindo", next: "sem_som" },
                { text: "Como mudar as cores?", next: "cores" },
                { text: "Quero falar com humano", next: "humano" }
            ]
        },
        teclado: {
            message: "Use as teclas do seu teclado físico!\n\n• a s d f g h j → C4 a B4\n• z x c v b n m → C3 a B3\n• q w e r t y u → C5 a B5\n\nTeclas pretas: segure Shift + letra",
            choices: [{ text: "Entendi, valeu!", next: "start" }]
        },
        gravar: {
            message: "Clique em 'Record Gravar' → toque sua música → clique novamente para parar.\n\nDepois use 'Play Tocar' ou 'Download Baixar' para ouvir/salvar!",
            choices: [{ text: "Show! Obrigado", next: "start" }]
        },
        sem_som: {
            message: "Clique em qualquer tecla do piano primeiro!\n\nO navegador só libera som após uma interação (regra de segurança).\n\nDepois disso tudo funciona normalmente!",
            choices: [{ text: "Agora deu certo!", next: "start" }]
        },
        cores: {
            message: "Abra o menu (≡) → Configurações → use o seletor de cor das teclas brancas.\n\nTem também modo RGB no fundo!",
            choices: [{ text: "Perfeito!", next: "start" }]
        },
        humano: {
            message: "Hehe sou só um robô muito bem feito\n\nMas pode mandar mensagem pra gente no:\ncontato@pianovirtual.com\n\nA gente responde rapidinho!",
            choices: [{ text: "Haha tudo bem!", next: "start" }]
        }
    };

    let currentNode = 'start';

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.className = `message ${type}-message`;
        div.innerHTML = text.replace(/\n/g, '<br>');
        conversationDisplay.appendChild(div);
        conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
    }

    function showChoices(node) {
        choicesArea.innerHTML = '';
        node.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-button';
            btn.textContent = choice.text;
            btn.onclick = () => {
                addMessage(choice.text, 'user');
                currentNode = choice.next;
                addMessage(conversationNodes[currentNode].message, 'bot');
                showChoices(conversationNodes[currentNode]);
            };
            choicesArea.appendChild(btn);
        });
    }

    // Inicia o chat quando abre o modal
    const ajudaModal = document.getElementById('modal5');
    const observer = new MutationObserver(() => {
        if (ajudaModal.classList.contains('open') || ajudaModal.style.display === 'block') {
            setTimeout(() => {
                conversationDisplay.innerHTML = '<div class="message bot-message">Olá! Como posso te ajudar hoje? <span style="font-size:0.8em">♫</span></div>';
                showChoices(conversationNodes.start);
            }, 300);
        }
    });
    observer.observe(ajudaModal, { attributes: true });

    // Botão de reiniciar
    restartButton.onclick = () => {
        conversationDisplay.innerHTML = '<div class="message bot-message">Olá! Como posso te ajudar hoje? <span style="font-size:0.8em">♫</span></div>';
        showChoices(conversationNodes.start);
    };
});

function updateUserUI(user) {
        if (user) {
            userInfo.style.display = 'flex';
            userEmailDisplay.textContent = user.name || user.email;
            
            // --- NOVA LÓGICA PARA EXIBIR A FOTO DE PERFIL ---
            const userProfilePicElement = document.getElementById('userProfilePic'); // Precisamos de um elemento para a foto
            if (!userProfilePicElement) {
                // Cria o elemento da imagem se ele ainda não existir
                const img = document.createElement('img');
                img.id = 'userProfilePic';
                img.className = 'user-profile-pic'; // Adicione uma classe para estilizar
                userInfo.prepend(img); // Adiciona antes do email
            }
            const profilePicElement = document.getElementById('userProfilePic');

            if (user.profilePic) {
                profilePicElement.src = user.profilePic;
                profilePicElement.style.display = 'block';
            } else {
                // Esconde a imagem se não houver foto de perfil
                profilePicElement.style.display = 'none';
                profilePicElement.src = ''; // Limpa a src
            }
            // --- FIM DA NOVA LÓGICA ---

        } else {
            userInfo.style.display = 'none';
            // Garante que a imagem de perfil também seja escondida ao fazer logout
            const profilePicElement = document.getElementById('userProfilePic');
            if (profilePicElement) {
                profilePicElement.style.display = 'none';
                profilePicElement.src = '';
            }
        }
    }


    // === FUNÇÃO DE UI DO USUÁRIO (CONSOLIDADA) ===
function updateUserInfoDisplay() {
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const userInfo = document.getElementById('userInfo');
    
    // Tenta obter o usuário logado da variável global ou do storage
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (currentUserEmail && !loggedInUser) {
        loggedInUser = USERS.find(u => u.email === currentUserEmail) || null;
    }

    if (loggedInUser) {
        // Usuário está logado
        const user = loggedInUser; 
        
        userInfo.style.display = 'flex';
        userEmailDisplay.textContent = user.name || user.email;
        
        // Lógica da Foto de Perfil
        let userProfilePicElement = document.getElementById('userProfilePic');
        if (!userProfilePicElement) {
            const img = document.createElement('img');
            img.id = 'userProfilePic';
            img.className = 'user-profile-pic'; 
            userInfo.prepend(img); // Adiciona a imagem antes do nome
            userProfilePicElement = img;
        }

        if (user.profilePic) {
            userProfilePicElement.src = user.profilePic;
            userProfilePicElement.style.display = 'block';
        } else {
            userProfilePicElement.style.display = 'none';
            userProfilePicElement.src = ''; 
        }
        
    } else {
        // Usuário está deslogado
        userInfo.style.display = 'none';
        
        const profilePicElement = document.getElementById('userProfilePic');
        if (profilePicElement) {
            profilePicElement.style.display = 'none';
            profilePicElement.src = '';
        }
    }
}

// === LÓGICA DE ATUALIZAÇÃO DE PERFIL ===
const updateProfileModal = document.getElementById('updateProfileModal');
const updateProfileBtn = document.getElementById('updateProfileBtn');
const updateProfileForm = document.getElementById('updateProfileForm');
const updateProfileError = document.getElementById('updateProfileError');
const updateProfileSuccess = document.getElementById('updateProfileSuccess');
const updateProfilePicPreview = document.getElementById('updateProfilePicPreview');
const updateProfilePicInput = document.getElementById('updateProfilePicInput');
const selectUpdateProfilePicBtn = document.getElementById('selectUpdateProfilePicBtn');

let updateProfilePicBase64 = null; // Variável temporária para a nova imagem

// Função para exibir erro no modal de atualização
function displayUpdateError(message) {
    updateProfileSuccess.style.display = 'none';
    updateProfileError.textContent = message;
    updateProfileError.style.display = 'block';
}

// Função para exibir sucesso no modal de atualização
function displayUpdateSuccess(message) {
    updateProfileError.style.display = 'none';
    updateProfileSuccess.textContent = message;
    updateProfileSuccess.style.display = 'block';
}

// 1. Abrir Modal e Preencher Dados
if (updateProfileBtn) {
    updateProfileBtn.onclick = () => {
        if (!loggedInUser) return; // Deve estar logado
        
        // Limpa mensagens e formulário
        displayUpdateError('');
        displayUpdateSuccess('');
        
        // Preenche o formulário com os dados atuais
        document.getElementById('updateName').value = loggedInUser.name || '';
        document.getElementById('updateEmail').value = loggedInUser.email;

        // Lógica para pré-visualizar a foto de perfil atual
        updateProfilePicBase64 = loggedInUser.profilePic;
        if (loggedInUser.profilePic) {
            updateProfilePicPreview.innerHTML = `<img src="${loggedInUser.profilePic}" alt="Perfil">`;
        } else {
            updateProfilePicPreview.innerHTML = `<i class="fas fa-camera"></i>`;
        }
        
        // Limpa os campos de senha
        document.getElementById('updateOldPassword').value = '';
        document.getElementById('updateNewPassword').value = '';
        document.getElementById('updateConfirmNewPassword').value = '';

        updateProfileModal.style.display = 'block';
    };
}

// 2. Lógica de Upload de Foto
if (selectUpdateProfilePicBtn && updateProfilePicInput && updateProfilePicPreview) {
    selectUpdateProfilePicBtn.onclick = () => {
        updateProfilePicInput.click();
    };

    updateProfilePicInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updateProfilePicBase64 = e.target.result;
                updateProfilePicPreview.innerHTML = `<img src="${updateProfilePicBase64}" alt="Perfil">`;
            };
            reader.readAsDataURL(file);
        }
    });
}


// 3. Submissão do Formulário de Atualização
if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!loggedInUser) {
            displayUpdateError("Você precisa estar logado para atualizar seu perfil.");
            return;
        }

        const newName = document.getElementById('updateName').value.trim();
        const currentEmail = document.getElementById('updateEmail').value;
        const oldPassword = document.getElementById('updateOldPassword').value;
        const newPassword = document.getElementById('updateNewPassword').value;
        const confirmNewPassword = document.getElementById('updateConfirmNewPassword').value;

        // A. Validação da Senha Atual
        if (oldPassword !== loggedInUser.password) {
            displayUpdateError("Senha atual incorreta.");
            return;
        }
        
        // B. Validação da Nova Senha
        if (newPassword) {
            if (newPassword.length < 4) {
                displayUpdateError("A nova senha deve ter pelo menos 4 caracteres.");
                return;
            }
            if (newPassword !== confirmNewPassword) {
                displayUpdateError("A nova senha e a confirmação não coincidem.");
                return;
            }
        }

        // C. Encontra e Atualiza o Usuário no Array Global USERS
        const userIndex = USERS.findIndex(u => u.email === currentEmail);
        
        if (userIndex !== -1) {
            // Atualiza os dados no array USERS
            USERS[userIndex].name = newName;
            USERS[userIndex].profilePic = updateProfilePicBase64;
            
            if (newPassword) {
                USERS[userIndex].password = newPassword;
            }
            
            // Atualiza a variável de controle do usuário logado
            loggedInUser = USERS[userIndex];
            
            // Salva a lista USERS atualizada no localStorage (Persistência)
            localStorage.setItem('pianoUsers', JSON.stringify(USERS));
            let loggedInUser = null; // <--- ADICIONE ESTA LINHA AQUI

            // D. Feedback e Atualização da Interface
            displayUpdateSuccess("Dados atualizados com sucesso!");
            
            // Atualiza a exibição da barra lateral e fecha o modal
            setTimeout(() => {
                updateUserInfoDisplay(); // Recarrega os novos dados no sidebar
                updateProfileModal.style.display = 'none';
            }, 1500);

        } else {
            displayUpdateError("Erro interno. Usuário não encontrado.");
        }
    });
}
















// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    renderPiano();
    updateDisplay('C1');
    setupMusicControls();

    // LOGIN
    document.getElementById('loginModal').classList.add('open');
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const user = USERS.find(u => u.email === email && u.password === password);
        if (user) {
            document.getElementById('loginModal').classList.remove('open');
            document.getElementById('userInfo').style.display = 'flex';
            document.getElementById('userEmailDisplay').textContent = user.name;
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('loginModal').classList.add('open');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').style.display = 'none';
    });
