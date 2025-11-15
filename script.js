// === VARIÁVEIS GLOBAIS ===
let context = null;
let baseNoteBuffer = null;
const BASE_NOTE = 'C4';
const BASE_NOTE_FILE_PATH = 'sons/69.ogg';
let baseNoteFrequency = 0;

// === CONTROLES FIXOS (Controles de Interface REMOVIDOS) ===
const globalVolume = 0.7; // Volume fixo (70%)
const currentOctaveShift = 0; // Oitava fixa

// === LÓGICA DE SEQUÊNCIA E GRAVAÇÃO (REATIVADA) ===
let currentSequence = []; 
let recording = false;
let startTime = null;
let playbackTimeout = null;
let playbackIndex = 0;

// === MÚSICAS PRÉ-CARREGADAS (REATIVADA) ===
const MUSICAS = {
    'Parabéns a Você': [
        { note: 'G4', duration: 500 }, { note: 'G4', duration: 500 }, { note: 'A4', duration: 1000 },
        { note: 'G4', duration: 1000 }, { note: 'C5', duration: 1000 }, { note: 'B4', duration: 1500 }
    ],
    'Brilha Brilha Estrelinha': [
        { note: 'C4', duration: 500 }, { note: 'C4', duration: 500 }, { note: 'G4', duration: 500 },
        { note: 'G4', duration: 500 }, { note: 'A4', duration: 500 }, { note: 'A4', duration: 500 },
        { note: 'G4', duration: 1000 }
    ]
};

// === MAPEAMENTO TECLADO → NOTA ===
const blackKeyMap = {
    'Q':'C#3', 'W':'D#3', 'E':'F#3', 'R':'G#3', 'T':'A#3',
    'Y':'C#4', 'U':'D#4', 'I':'F#4', 'O':'G#4', 'P':'A#4',
    'S':'C#5', 'D':'D#5', 'F':'F#5', 'G':'G#5', 'H':'A#5',
    'J':'C#6', 'K':'D#6', 'L':'F#6' 
};

const keyMap = {
    'z':'C3', 'x':'D3', 'c':'E3', 'v':'F3', 'b':'G3', 'n':'A3', 'm':'B3',
    'a':'C4', 's':'D4', 'd':'E4', 'f':'F4', 'g':'G4', 'h':'A4', 'j':'B4',
    'q':'C5', 'w':'D5', 'e':'E5', 'r':'F5', 't':'G5', 'y':'A5', 'u':'B5',
    'i':'C6', 'o':'D6', 'p':'E6', 'é':'F6', 
};

const noteToKeyMap = {};
for (const key in keyMap) { noteToKeyMap[keyMap[key]] = key; }
for (const key in blackKeyMap) { noteToKeyMap[blackKeyMap[key]] = key; }

// === FREQUÊNCIAS DAS NOTAS ===
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
            return audioBuffer;
        })
        .catch(error => {
            console.error("Falha ao carregar som:", error);
            alert("Erro crítico: não foi possível carregar o som do piano. Verifique o caminho para 'sons/69.ogg'. O piano visual será exibido.");
        });
}

const activeSources = {}; 

function playNote(note, keyElement, recordDuration = false) {
    if (!baseNoteBuffer || !context) {
        // Se o buffer não carregou, não toca o som, mas continua a gravação/display
        if (!keyElement) return; // Evita erro se for uma nota tocada por software sem elemento
    }
    
    // Se o contexto está nulo, a nota visual ainda deve aparecer.
    if (keyElement) {
        if (activeSources[note]) return;
        keyElement.classList.add('active');
    }

    const targetFrequency = getFrequency(note);
    updateDisplay(note, targetFrequency ? targetFrequency.toFixed(2) : "0.00");
    
    if (baseNoteBuffer && context) {
        const now = context.currentTime;
        if (!targetFrequency) return;
        
        const playbackRate = targetFrequency / baseNoteFrequency;
        const duration = 1.5; 
        const endTime = now + duration;
        
        const source = context.createBufferSource();
        source.buffer = baseNoteBuffer;
        source.playbackRate.setValueAtTime(playbackRate, now);
        
        const gainNode = context.createGain();
        let startVolume = globalVolume; 
        const boostMultiplier = 0.3; 
        
        // Lógica de volume
        if (playbackRate > 1.0) startVolume = globalVolume * (1.0 + (playbackRate - 1.0) * boostMultiplier);
        else if (playbackRate < 1.0) startVolume = globalVolume * (1.0 + (1.0 - playbackRate) * boostMultiplier);
        if (startVolume > 1.2) startVolume = 1.2; 

        gainNode.gain.setValueAtTime(startVolume, now);
        gainNode.gain.linearRampToValueAtTime(0.0, endTime);
        
        source.connect(gainNode).connect(context.destination);
        source.start(now);
        source.stop(endTime);
        
        activeSources[note] = source;

        source.onended = () => {
            delete activeSources[note];
            if (keyElement) keyElement.classList.remove('active');
        };
    }
    
    // === LÓGICA DE GRAVAÇÃO (REATIVADA) ===
    if (recording) {
        const now = Date.now();
        const elapsed = startTime ? now - startTime : 0;
        startTime = now;
        
        currentSequence.push({
            note: note,
            duration: elapsed,
            key: keyElement ? keyElement.dataset.keychar : null
        });
        updateSequenceReader(note, elapsed, true);
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
    
    const keyElement = document.querySelector(`[data-note="${note}"]`);
    
    pressedKeys[key] = true;
    
    playNote(note, keyElement, true);
}

function handleKeyUp(key) {
    const keyToPlay = key.toLowerCase();
    
    let note = keyMap[keyToPlay] || blackKeyMap[key.toUpperCase()];
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
    const maxWhiteKeys = 36; // 36 teclas brancas

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
                
                const keyChar = noteToKeyMap[note];
                if (keyChar) {
                    noteLabel.textContent = keyChar.toUpperCase();
                    key.dataset.keychar = keyChar.toUpperCase(); 
                } else {
                    noteLabel.textContent = note;
                }

                key.appendChild(noteLabel);
                piano.appendChild(key);
                whiteIndex++;
            } 
            else if (!isWhite) {
                const blackKeyIndex = [1, 3, 6, 8, 10].indexOf(i); 
                
                // CORREÇÃO VISUAL: Renderiza se for uma tecla preta válida (C#, D#, F#, G#, A#) e estiver dentro do limite visual.
                if (blackKeyIndex !== -1 && whiteIndex <= maxWhiteKeys) { 
                    
                    const key = document.createElement('div');
                    key.className = 'key black-key';
                    key.dataset.note = note;
                    
                    const offset = [24, 48, 108, 132, 156]; 
                    key.style.left = `${((octave - 1) * 7 * 36) + offset[blackKeyIndex]}px`;
                         
                    const noteLabel = document.createElement('span');
                    noteLabel.className = 'note-label';
                    
                    const keyChar = noteToKeyMap[note];
                    
                    if (keyChar) {
                        noteLabel.textContent = keyChar.toUpperCase(); 
                        key.dataset.keychar = keyChar.toUpperCase();
                    } else {
                        noteLabel.textContent = note; 
                    }
                    
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
            if (keyChar) { handleKeyDown(keyChar, keyChar.toUpperCase() === keyChar); } 
            else { playNote(note, e.currentTarget, true); }
        });
        key.addEventListener('mouseup', (e) => {
            const note = e.currentTarget.dataset.note;
            const keyChar = noteToKeyMap[note];
            if (keyChar) { handleKeyUp(keyChar); } 
            else { stopNote(note, e.currentTarget); }
        });
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const note = e.currentTarget.dataset.note;
            playNote(note, e.currentTarget, true);
        });
        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            const note = e.currentTarget.dataset.note;
            stopNote(note, e.currentTarget);
        });
    });
}

// === FUNÇÕES DE REPRODUÇÃO ===

function playSequence(sequence) {
    // ... (Mantida a lógica de playSequence) ...
    if (playbackTimeout) {
        clearTimeout(playbackTimeout);
        playbackIndex = 0;
    }
    
    const sequenceTrack = document.getElementById('sequenceTrack');
    sequenceTrack.innerHTML = '';
    
    sequence.forEach(item => {
        updateSequenceReader(item.note, item.duration, false);
    });

    playbackIndex = 0;

    function playNextNote() {
        if (playbackIndex >= sequence.length) {
            document.querySelectorAll('.sequence-item').forEach(item => item.classList.remove('active'));
            playbackTimeout = null;
            return;
        }

        const item = sequence[playbackIndex];
        const delay = item.duration;

        const prevItem = sequenceTrack.children[playbackIndex - 1];
        if (prevItem) {
            prevItem.classList.remove('active');
        }

        const currentItemElement = sequenceTrack.children[playbackIndex];
        if (currentItemElement) {
            currentItemElement.classList.add('active');
            const reader = document.getElementById('sequenceReader');
            // Scroll para centralizar a nota
            reader.scrollLeft = currentItemElement.offsetLeft - reader.clientWidth / 2 + currentItemElement.clientWidth / 2;
        }

        if (item.note !== '---') {
             const keyElement = document.querySelector(`[data-note="${item.note}"]`);
             if (keyElement) { keyElement.classList.add('active'); }
             // playNote cuida de tocar o som e remover o destaque (via onended)
             playNote(item.note, keyElement); 
        }
        
        playbackIndex++;
        playbackTimeout = setTimeout(playNextNote, delay);
    }
    
    playNextNote();
}

function updateDisplay(note, frequency = "0.00") {
    document.getElementById('current-note').textContent = note;
    document.getElementById('current-frequency').textContent = frequency + ' Hz';
}

function updateSequenceReader(note, duration, clearBefore = false) {
    const sequenceTrack = document.getElementById('sequenceTrack');
    
    if (clearBefore && sequenceTrack.children.length === 0) {
        sequenceTrack.innerHTML = '';
    }

    const item = document.createElement('div');
    item.className = 'sequence-item';
    item.textContent = `${note}`;
    item.title = `Duração: ${duration}ms`;
    
    const minWidth = 30;
    const width = Math.max(minWidth, duration / 10); 
    item.style.width = `${width}px`;

    sequenceTrack.appendChild(item);
    
    if (recording) {
        const reader = document.getElementById('sequenceReader');
        reader.scrollLeft = reader.scrollWidth;
    }
}

// === HANDLERS DE EVENTOS DE CONTROLES ===

function setupMusicControls() {
    const recordButton = document.getElementById('recordButton');
    const playSequenceButton = document.getElementById('playSequenceButton');
    const musicSelect = document.getElementById('musicSelect');
    const playMusicButton = document.getElementById('playMusicButton');
    
    // 1. Popula o seletor de músicas
    for (const name in MUSICAS) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        musicSelect.appendChild(option);
    }

    // 2. Listener de Gravação
    recordButton.addEventListener('click', () => {
        if (!context) {
             alert("Aguarde o carregamento do som ou verifique o caminho do arquivo 'sons/69.ogg'.");
             return;
        }

        if (!recording) {
            // Inicia a gravação
            recording = true;
            currentSequence = [];
            startTime = Date.now();
            recordButton.classList.add('recording');
            recordButton.innerHTML = '<i class="fas fa-stop"></i> Parar';
            currentSequence.push({ note: '---', duration: 0 }); 
            updateSequenceReader('---', 0, true);
            
        } else {
            // Para a gravação
            recording = false;
            recordButton.classList.remove('recording');
            recordButton.innerHTML = '<i class="fas fa-circle"></i> Gravar';
            if (currentSequence.length > 1 && currentSequence[0].note === '---') {
                currentSequence.shift();
            }
        }
    });

    // 3. Listener de Tocar Sequência Gravada
    playSequenceButton.addEventListener('click', () => {
        if (!context) {
             alert("Aguarde o carregamento do som para reproduzir.");
             return;
        }
        if (currentSequence.length > 0) {
            playSequence(currentSequence);
        } else {
            alert("Nenhuma sequência gravada. Pressione 'Gravar' e toque algumas notas.");
        }
    });
    
    // 4. Listener de Tocar Música Selecionada
    playMusicButton.addEventListener('click', () => {
        if (!context) {
             alert("Aguarde o carregamento do som para reproduzir.");
             return;
        }
        const selectedMusicName = musicSelect.value;
        if (selectedMusicName && MUSICAS[selectedMusicName]) {
            playSequence(MUSICAS[selectedMusicName]);
        } else {
            alert("Por favor, selecione uma música para tocar.");
        }
    });
}


// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    
    // CORREÇÃO CRÍTICA: Chama renderPiano() imediatamente para garantir a exibição do teclado.
    renderPiano(); 
    
    loadBaseNote().then(() => {
        // Inicializa o display e os controles de música após o carregamento do áudio
        const initialNote = keyMap.z;
        updateDisplay(initialNote, getFrequency(initialNote).toFixed(2));
        setupMusicControls();
    });
    
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
