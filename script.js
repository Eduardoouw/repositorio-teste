// === VARIÁVEIS GLOBAIS ===
// O contexto de áudio agora é gerenciado pelo Tone.js
let sampler = null; 
const globalVolume = 0.7; // Volume fixo
const currentOctaveShift = 0; // Oitava fixa

// === BANCO DE SONS (SIMULANDO API DE AMOSTRAS) ===
// Usamos a base de amostras gratuitas hospedadas em um CDN.
const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/'; 

// Notas de amostra que serão carregadas. O Tone.js preenche as lacunas
// usando o pitch shifting de notas próximas, mas com alta qualidade.
const SAMPLES_TO_LOAD = {
    'C4': 'C4.mp3',
    'F4': 'F4.mp3',
    'C5': 'C5.mp3',
    'F5': 'F5.mp3',
    'C6': 'C6.mp3'
};

// === LÓGICA DE SEQUÊNCIA E GRAVAÇÃO (MANTIDA) ===
let currentSequence = []; 
let recording = false;
let startTime = null;
let playbackTimeout = null;
let playbackIndex = 0;

// === MÚSICAS PRÉ-CARREGADAS (MANTIDAS) ===
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

// === MAPEAMENTO TECLADO → NOTA e FREQUÊNCIAS (MANTIDAS) ===
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
function getFrequency(note) { return noteFrequencies[note]; }


// === FUNÇÕES DE ÁUDIO (REESCRITAS PARA TONE.JS) ===

function loadPianoSampler() {
    // Esconde os controles e mostra uma mensagem de carregamento durante o download das amostras
    const statusDiv = document.createElement('div');
    statusDiv.id = 'loading-status';
    statusDiv.textContent = 'Carregando amostras de piano... Aguarde.';
    statusDiv.style.cssText = 'color: #00ccff; font-size: 1.2em; margin-bottom: 20px;';
    document.body.insertBefore(statusDiv, document.getElementById('note-display'));

    return new Promise((resolve, reject) => {
        
        // O Sampler carrega as amostras e faz o pitch shifting automaticamente
        sampler = new Tone.Sampler({
            urls: SAMPLES_TO_LOAD,
            baseUrl: SAMPLE_BASE_URL,
            onload: () => {
                sampler.toDestination(); // Conecta a saída ao alto-falante
                
                // Remove a mensagem de carregamento
                statusDiv.remove(); 
                console.log("Sampler de Piano carregado com sucesso!");
                resolve();
            },
            onerror: (e) => {
                statusDiv.textContent = 'Erro ao carregar amostras de piano. Verifique a conexão.';
                console.error("Erro ao carregar Sampler:", e);
                reject(e);
            }
        });
    });
}


function playNote(note, keyElement, recordDuration = false) {
    if (!sampler) return; // Não toca se o sampler não estiver carregado

    // 1. Toca a Nota (Tone.js)
    // O Sampler cuida do pitch (frequência) e aplica o volume global
    // O 0 no terceiro argumento (duration) significa que a nota deve ser mantida
    sampler.triggerAttack(note, Tone.now(), globalVolume); 
    
    // 2. Feedback Visual e Display
    const targetFrequency = getFrequency(note);
    updateDisplay(note, targetFrequency ? targetFrequency.toFixed(2) : "0.00");
    
    if (keyElement) {
        // Usa a classe 'active' para visualização
        keyElement.classList.add('active');
    }
    
    // 3. Lógica de Gravação
    if (recording) {
        const now = Date.now();
        // A duração é o tempo desde o último evento gravado (nota ou início)
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
    if (sampler) {
        // Manda o Sampler parar a nota, simulando a liberação da tecla
        sampler.triggerRelease(note, Tone.now() + 0.1); // Adiciona um pequeno release time
    }
    if (keyElement) {
        keyElement.classList.remove('active');
    }
}

// === LÓGICA DE TECLADO E PIANO (MANTIDA) ===

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
    
    // CORREÇÃO: Passa 'null' para keyElement se for uma tecla física
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

// === RENDERIZAÇÃO E FUNÇÕES DE REPRODUÇÃO (MANTIDAS) ===

function renderPiano() {
    const piano = document.getElementById('piano');
    if (!piano) return;
    
    piano.innerHTML = ''; 
    
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let whiteIndex = 0;
    const maxWhiteKeys = 36; 

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
                
                if (blackKeyIndex !== -1 && noteToKeyMap[note] && whiteIndex <= maxWhiteKeys) { 
                    
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

function playSequence(sequence) {
    if (!sampler) {
         alert("O piano ainda está carregando os sons. Tente novamente em instantes.");
         return;
    }
    
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
            reader.scrollLeft = currentItemElement.offsetLeft - reader.clientWidth / 2 + currentItemElement.clientWidth / 2;
        }

        if (item.note !== '---') {
             const keyElement = document.querySelector(`[data-note="${item.note}"]`);
             if (keyElement) { keyElement.classList.add('active'); }
             // Tone.js usa uma sintaxe de tempo diferente, mas vamos manter a função playNote
             playNote(item.note, keyElement); 
             // Adicionamos um stop após um tempo fixo (simulando a liberação da tecla)
             setTimeout(() => { stopNote(item.note, keyElement); }, 500); 
        }
        
        playbackIndex++;
        playbackTimeout = setTimeout(playNextNote, delay);
    }
    
    playNextNote();
}

// ... (Funções updateDisplay, updateSequenceReader, setupMusicControls mantidas) ...

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
        if (!sampler) {
             alert("Aguarde o carregamento dos sons do piano.");
             return;
        }
        Tone.start(); // Inicia o contexto de áudio ao interagir
        if (!recording) {
            recording = true;
            currentSequence = [];
            startTime = Date.now();
            recordButton.classList.add('recording');
            recordButton.innerHTML = '<i class="fas fa-stop"></i> Parar';
            currentSequence.push({ note: '---', duration: 0 }); 
            updateSequenceReader('---', 0, true);
            
        } else {
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
        if (!sampler) { alert("Aguarde o carregamento dos sons do piano."); return; }
        Tone.start(); 
        if (currentSequence.length > 0) {
            playSequence(currentSequence);
        } else {
            alert("Nenhuma sequência gravada. Pressione 'Gravar' e toque algumas notas.");
        }
    });
    
    // 4. Listener de Tocar Música Selecionada
    playMusicButton.addEventListener('click', () => {
        if (!sampler) { alert("Aguarde o carregamento dos sons do piano."); return; }
        Tone.start();
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
    
    // Garante que o piano visual seja carregado imediatamente (correção anterior)
    renderPiano(); 
    
    // Carrega o Sampler do Tone.js (Sons de Piano da API/CDN)
    loadPianoSampler().then(() => {
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
