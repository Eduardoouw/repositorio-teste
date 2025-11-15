// === VARIÁVEIS GLOBAIS DE ÁUDIO ===
let context = null;
let baseNoteBuffer = null;
const BASE_NOTE = 'C4';
const BASE_NOTE_FILE_PATH = 'sons/69.ogg'; // Ajuste o caminho conforme necessário
let baseNoteFrequency = 0;

// === CONTROLE DE GRAVAÇÃO E REPRODUÇÃO ===
let currentSequence = [];
let recording = false;
let playbackTimeout = null;
let currentOctaveShift = 0; // Para controle de oitava
window.globalVolume = 0.7; // Volume inicial de 70/100

// === MÚSICAS PRÉ-CARREGADAS (Apenas para demonstração de uso) ===
const MUSICAS = [
    { nome: "Música 1 - MINECRAFT", seq: "[IP] - O [QY] - [QEI] -- [IP] - O [QY] - T [IP] - O [QY] - [EI] -- [IP] - O [QY] I T E [IP] - T [QY] - [EI] - [TO] [IP] - O [QYP] E [TS] [IP] - [OS] [QD] - [EOS] P O [IP] - O [QYP] - I [T] -- [QY] - [EI] -- [TO] - P [QI] TO" },
    { nome: "Música 2 - FUR ELISE", seq: "f - D - f - D - f - a - d - s - [6ep] - 0 - e - t - u - p - [3a] - 0 - W - u - O - a - [6s] - 0 - e - u - f - D - f - D - f - a - d - s - [6ep] - 0 - e - t - u - p - [3a] - 0 - W - u - s - a - [6p] - 0 - e - a - s - d - [8f] - w - t - o - g - f - [5d] - w - r - i - f - d - [6s] - 0 - e - u - d - s - [3a] - 0 - u - u - f - u - f - f - x - D - f - D - f - D - f - D - f - D - f - D - f - D - f - a - d - s - [6p] - 0 - e - t - u - p - [3a] - 0 - W - u - O - a - [6s] - 0 - e - u - f - D - f - D - f - a - d - s - [6p] - 0 - e - t - u - p - [3a] - 0 - W - u - s - a - [6p] - 0 - e - a - s - d - [8f] - w - t - o - g - f - [5d] - w - r - i - f - d - [6s] - 0 - e - u - d - s - [3a] - 0 - u - s - a - [pe6]" },
];


// === MAPEAMENTO TECLADO → NOTA ===
const blackKeyMap = {
    'Q':'C#3', 'W':'D#3', 'E':'F#3', 'R':'G#3', 'T':'A#3',
    'Y':'C#4', 'U':'D#4', 'I':'F#4', 'O':'G#4', 'P':'A#4',
    'S':'C#5', 'D':'D#5', 'F':'F#5', 'G':'G#5', 'H':'A#5',
    'J':'C#6', 'K':'D#6', 'L':'F#6'
};

const keyMap = {
    // C3 a B3
    'z':'C3', 'x':'D3', 'c':'E3', 'v':'F3', 'b':'G3', 'n':'A3', 'm':'B3',
    // C4 a B4
    'a':'C4', 's':'D4', 'd':'E4', 'f':'F4', 'g':'G4', 'h':'A4', 'j':'B4',
    // C5 a B5
    'q':'C5', 'w':'D5', 'e':'E5', 'r':'F5', 't':'G5', 'y':'A5', 'u':'B5',
    // C6 a B6
    'i':'C6', 'o':'D6', 'p':'E6', 'é':'F6', 
};

// Mapeamento inverso para destacar as teclas no teclado virtual
const noteToKeyMap = {};
for (const key in keyMap) { noteToKeyMap[keyMap[key]] = key; }
for (const key in blackKeyMap) { noteToKeyMap[blackKeyMap[key]] = key; }


// === FREQUÊNCIAS DAS NOTAS (Referência: A4 = 440 Hz) ===
const noteFrequencies = {};
const notesInOctave = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const baseFrequencyA4 = 440; 
const baseNoteIndex = notesInOctave.indexOf("A") + 4 * 12; 

for (let octave = 0; octave <= 8; octave++) {
    for (let i = 0; i < notesInOctave.length; i++) {
        const noteName = notesInOctave[i] + octave;
        const n = i + octave * 12 - baseNoteIndex;
        noteFrequencies[noteName] = baseFrequencyA4 * Math.pow(2, n / 12);
    }
}

// === FUNÇÕES DE ÁUDIO ===

function getFrequency(note) {
    return noteFrequencies[note];
}

function getBaseNoteFrequency() {
    return noteFrequencies[BASE_NOTE] || 0;
}

function loadBaseNote() {
    if (context === null) {
        context = new (window.AudioContext || window.webkitAudioContext)();
    }

    baseNoteFrequency = getBaseNoteFrequency();
    
    return fetch(BASE_NOTE_FILE_PATH)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            baseNoteBuffer = audioBuffer;
            console.log("Som base carregado com sucesso!");
            renderPiano(); 
            return audioBuffer;
        })
        .catch(error => {
            console.error("Falha ao carregar som:", error);
            alert("Erro crítico: não foi possível carregar o som do piano. Verifique o caminho para 'sons/69.ogg'.");
        });
}

function applyPitchShift(baseFrequency, targetFrequency) {
    if (baseFrequency === 0) return 1.0;
    return targetFrequency / baseFrequency;
}

const activeSources = {}; 

function playNote(note, keyElement, startTime) {
    if (!baseNoteBuffer || !context) return;
    
    if (activeSources[note]) return;

    const now = context.currentTime;
    const targetFrequency = getFrequency(note);
    if (!targetFrequency) return;
    
    const playbackRate = applyPitchShift(baseNoteFrequency, targetFrequency);
    const duration = 1.5; 
    const endTime = now + duration;
    
    const source = context.createBufferSource();
    source.buffer = baseNoteBuffer;
    source.playbackRate.setValueAtTime(playbackRate, now);
    
    const gainNode = context.createGain();
    const baseVolume = window.globalVolume; 

    // Envelope de Volume (ADSR simplificado)
    let startVolume = baseVolume;
    const boostMultiplier = 0.3; 
    
    if (playbackRate > 1.0) {
        const boost = (playbackRate - 1.0) * boostMultiplier;
        startVolume = baseVolume * (1.0 + boost);
    } else if (playbackRate < 1.0) {
        const boost = (1.0 - playbackRate) * boostMultiplier;
        startVolume = baseVolume * (1.0 + boost);
    }
    if (startVolume > 1.2) startVolume = 1.2; 

    gainNode.gain.setValueAtTime(startVolume, now);
    gainNode.gain.linearRampToValueAtTime(0.0, endTime);
    
    source.connect(gainNode).connect(context.destination);
    
    source.start(now);
    source.stop(endTime);
    
    activeSources[note] = source;

    source.onended = () => {
        delete activeSources[note];
        if (keyElement) {
            keyElement.classList.remove('active');
        }
    };
    
    updateDisplay(note, targetFrequency.toFixed(2));
    
    if (keyElement) {
        keyElement.classList.add('active');
    }

    if (recording) {
        currentSequence.push({ 
            note: note, 
            time: (now - startTime) * 1000, 
            display: note,
            isBlack: note.includes('#'),
            isChord: false,
        });
        updateVisualSequence();
    }
}

function stopNote(note, keyElement) {
    if (keyElement) {
        keyElement.classList.remove('active');
    }
}

// === LÓGICA DE TECLADO E PIANO ===

const pressedKeys = {}; 

function handleKeyDown(key, isShift) {
    let note;
    let keyToPlay = key.toLowerCase();

    if (isShift && blackKeyMap[key.toUpperCase()]) {
        note = blackKeyMap[key.toUpperCase()];
    } 
    else if (keyMap[keyToPlay]) {
        note = keyMap[keyToPlay];
    }
    
    if (!note || pressedKeys[key]) return;

    // Aplica o shift de oitava
    const currentNoteName = note.slice(0, -1);
    const currentOctave = parseInt(note.slice(-1));
    const shiftedOctave = currentOctave + currentOctaveShift;
    const shiftedNote = currentNoteName + shiftedOctave;
    
    if (noteFrequencies[shiftedNote]) {
        note = shiftedNote;
    } else {
        return; 
    }

    const keyElement = document.querySelector(`[data-note="${note}"]`);
    
    pressedKeys[key] = true;
    
    const startTime = recording ? context.currentTime : 0;
    playNote(note, keyElement, startTime);
}

function handleKeyUp(key) {
    const keyToPlay = key.toLowerCase();
    
    let note = keyMap[keyToPlay] || blackKeyMap[key.toUpperCase()];
    if (!note) return;

    const currentNoteName = note.slice(0, -1);
    const currentOctave = parseInt(note.slice(-1));
    const shiftedOctave = currentOctave + currentOctaveShift;
    const shiftedNote = currentNoteName + shiftedOctave;

    note = noteFrequencies[shiftedNote] ? shiftedNote : null;
    if (!note) return;

    const keyElement = document.querySelector(`[data-note="${note}"]`);
    
    delete pressedKeys[key];
    
    stopNote(note, keyElement);
}

// === RENDERIZAÇÃO DO PIANO (DOM) ===

function renderPiano() {
    const piano = document.getElementById('piano');
    if (!piano) return;
    
    piano.innerHTML = ''; 
    
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let whiteIndex = 0;
    const maxWhiteKeys = 36; 
    
    // Renderiza 6 oitavas (C1 até B6) para o piano virtual
    for (let octave = 1; octave <= 6; octave++) {
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i] + octave;
            const isWhite = notes[i].length === 1;
            
            if (isWhite && whiteIndex < maxWhiteKeys) {
                const key = document.createElement('div');
                key.className = 'key white-key';
                key.dataset.note = note;
                key.style.left = `${whiteIndex * 36}px`;
                
                const noteLabel = document.createElement('span');
                noteLabel.className = 'note-label';
                noteLabel.textContent = noteToKeyMap[note] || ''; 
                key.appendChild(noteLabel);
                
                piano.appendChild(key);
                whiteIndex++;
            } else if (!isWhite) {
                const blackKeyIndex = [1, 3, 6, 8, 10].indexOf(i); 
                
                if (blackKeyIndex !== -1) {
                    const key = document.createElement('div');
                    key.className = 'key black-key';
                    key.dataset.note = note;
                    
                    // Offsets para C# D# - F# G# A# -
                    const offset = [24, 48, 108, 132, 156]; 
                    
                    // Cálculo da posição baseado na oitava e no índice
                    key.style.left = `${((octave - 1) * 7 * 36) + offset[blackKeyIndex]}px`;
                    
                    const noteLabel = document.createElement('span');
                    noteLabel.className = 'note-label';
                    noteLabel.textContent = noteToKeyMap[note] || ''; 
                    key.appendChild(noteLabel);
                    
                    piano.appendChild(key);
                }
            }
        }
    }
    
    // Adiciona event listeners (Mouse e Touch)
    piano.querySelectorAll('.key').forEach(key => {
        key.addEventListener('mousedown', (e) => {
            const note = e.currentTarget.dataset.note;
            const keyChar = noteToKeyMap[note];
            
            if (keyChar) {
                handleKeyDown(keyChar, keyChar.toUpperCase() === keyChar); 
            } else {
                playNote(note, e.currentTarget, recording ? context.currentTime : 0);
            }
        });
        key.addEventListener('mouseup', (e) => {
            const note = e.currentTarget.dataset.note;
            const keyChar = noteToKeyMap[note];
            
            if (keyChar) {
                handleKeyUp(keyChar);
            } else {
                stopNote(note, e.currentTarget);
            }
        });
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const note = e.currentTarget.dataset.note;
            playNote(note, e.currentTarget, recording ? context.currentTime : 0);
        });
        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            const note = e.currentTarget.dataset.note;
            stopNote(note, e.currentTarget);
        });
    });
}

// === FUNÇÕES DE REPRODUÇÃO E SEQUÊNCIA ===

const sequenceReader = document.getElementById('sequenceReader');
const sequenceTrack = document.getElementById('sequenceTrack');

function updateDisplay(note, frequency = "0.00") {
    document.getElementById('current-note').textContent = note;
    document.getElementById('current-frequency').textContent = frequency + ' Hz';
}

function updateVisualSequence() {
    if (!sequenceTrack) return;
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
    
    document.getElementById('playButton').disabled = currentSequence.length === 0;
    document.getElementById('downloadButton').disabled = currentSequence.length === 0;
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

function parseToken(token) {
    let delay = 200; 
    let keys = [];
    let display = '';
    let isChord = false;
    
    if (token.startsWith('[')) {
        isChord = true;
        const keyChars = token.slice(1, -1).split('');
        keys = keyChars.map(char => char.toLowerCase());
        display = keyChars.map(char => {
            if (char.toUpperCase() === char) return blackKeyMap[char] || '';
            return keyMap[char] || '';
        }).join('+');
    } else if (token === '-') {
        delay = 100;
        display = '-';
    } else if (token === '--') {
        delay = 400;
        display = '--';
    } else if (token === '|') {
        delay = 800;
        display = '|';
    } else if (token) {
        const char = token.toLowerCase();
        keys = [char];
        if (token.toUpperCase() === token) { 
             display = blackKeyMap[token] || '';
        } else {
             display = keyMap[char] || '';
        }
    }
    
    return {
        keys: keys,
        display: display,
        delay: delay,
        isChord: isChord,
        isBlack: keys.some(k => k.toUpperCase() === k)
    };
}

function parseSequenceString(seqString) {
    seqString = seqString.replace(/\s+/g, '-'); 
    
    const tokens = seqString.match(/\[.*?\]|[^\[\]\s]/g) || [];
    
    const sequence = [];
    tokens.forEach(token => {
        const item = parseToken(token);
        if (item.display) {
            sequence.push(item);
        }
    });
    return sequence;
}

function playSequenceFromList(sequence) {
    if (playbackTimeout !== null) {
        clearTimeout(playbackTimeout);
        playbackTimeout = null;
    }
    
    currentSequence = sequence;
    updateVisualSequence();

    const playButton = document.getElementById('playButton');
    playButton.disabled = true;
    document.getElementById('playMusicButton').disabled = true;

    let index = 0;

    function playNext() {
        if (index >= currentSequence.length) {
            highlightKeyInSequence(-1);
            playButton.disabled = false;
            document.getElementById('playMusicButton').disabled = false;
            return;
        }

        const item = currentSequence[index];
        highlightKeyInSequence(index);

        if (item.keys.length > 0) {
            const startTime = context.currentTime;
            item.keys.forEach(key => {
                const isShift = key.toUpperCase() === key;
                handleKeyDown(key, isShift);
                setTimeout(() => handleKeyUp(key), 150); 
            });
        }

        index++;
        playbackTimeout = setTimeout(playNext, item.delay);
    }

    playNext();
}

// === HANDLERS DE EVENTOS DE CONTROLES ===

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
        recording = false;
        document.getElementById('recordButton').classList.remove('recording');
        updateVisualSequence();
        musicSelect.value = "0";
    });
}

function setupPianoControls() {
    // 1. Botão Record
    document.getElementById('recordButton').addEventListener('click', (e) => {
        if (!context) {
            loadBaseNote().then(() => {
                recording = !recording;
                e.currentTarget.classList.toggle('recording', recording);
                if (recording) {
                    currentSequence = [];
                    updateVisualSequence();
                }
            });
        } else {
            recording = !recording;
            e.currentTarget.classList.toggle('recording', recording);
            if (recording) {
                currentSequence = [];
                updateVisualSequence();
            }
        }
    });

    // 2. Botão Play
    document.getElementById('playButton').addEventListener('click', () => {
        if (currentSequence.length > 0) {
            playSequenceFromList(currentSequence);
        }
    });
    
    // 3. Botão Download 
    document.getElementById('downloadButton').addEventListener('click', () => {
        if (currentSequence.length === 0) return;
        
        const sequenceString = currentSequence.map(item => {
            if (item.isChord) {
                return `[${item.keys.map(k => k.toUpperCase()).join('')}]`;
            } else if (item.keys.length > 0) {
                return item.keys[0];
            } else {
                return item.display; 
            }
        }).join(' ');

        const blob = new Blob([sequenceString], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'minha_musica_piano.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 4. Volume Control
    document.getElementById('globalVolume').addEventListener('input', (e) => {
        window.globalVolume = e.target.value / 100;
    });

    // 5. Octave Shift Control
    const octaveShiftSelect = document.getElementById('octaveShift');
    octaveShiftSelect.addEventListener('change', (e) => {
        currentOctaveShift = parseInt(e.target.value);
        renderPiano(); 
    });
    currentOctaveShift = parseInt(octaveShiftSelect.value);
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('octaveShift').value = "0";
    document.getElementById('globalVolume').value = "70";

    loadBaseNote(); 
    
    updateDisplay(keyMap.z + currentOctaveShift, getFrequency(keyMap.z).toFixed(2));
    
    setupMusicControls();
    setupPianoControls();
    
    // Listeners do teclado físico
    document.addEventListener('keydown', (e) => {
        if (e.repeat || e.metaKey || e.ctrlKey) return; 
        if (e.key === ' ') e.preventDefault(); 
        handleKeyDown(e.key, e.shiftKey);
    });

    document.addEventListener('keyup', (e) => {
        handleKeyUp(e.key);
    });
});
