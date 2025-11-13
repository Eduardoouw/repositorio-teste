// === LÓGICA DE CADASTRO ===

let USERS = [];
const storedUsers = localStorage.getItem('pianoUsers');

if (storedUsers) {
    USERS = JSON.parse(storedUsers);
} else {
    USERS = [
        { email: "ana@gmail.com", password: "1234", name: "Ana Silva", profilePic: null },
        { email: "XD@gmail.com", password: "XDXDXD", name: "XD", profilePic: null },
        { email: "lucas@gmail.com", password: "dev2025", name: "Lucas Mendes", profilePic: null },
        { email: "bea@gmail.com", password: "musica123", name: "Beatriz Costa", profilePic: null },
        { email: "rita@gmail.com", password: "12345", name: "Rita Steyer", profilePic: null }
    ];
    localStorage.setItem('pianoUsers', JSON.stringify(USERS));
}

// Variável para armazenar a imagem de perfil em Base64
let userProfilePicBase64 = null; 

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const regError = document.getElementById('regError');
    const regSuccess = document.getElementById('regSuccess');

    const profilePicInput = document.getElementById('profilePicInput');
    const selectProfilePicBtn = document.getElementById('selectProfilePicBtn');
    const profilePicPreview = document.getElementById('profilePicPreview');

    // Abre o seletor de arquivo ao clicar no botão "Escolher Foto"
    selectProfilePicBtn.addEventListener('click', () => {
        profilePicInput.click();
    });

    // Lida com a seleção do arquivo de imagem
    profilePicInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Exibe a pré-visualização
                profilePicPreview.innerHTML = `<img src="${e.target.result}" alt="Foto de Perfil">`;
                // Salva a imagem como Base64
                userProfilePicBase64 = e.target.result; 
            };
            reader.readAsDataURL(file); // Converte o arquivo para Base64
        } else {
            // Se nenhum arquivo for selecionado, restaura o ícone padrão
            profilePicPreview.innerHTML = `<i class="fas fa-camera"></i>`;
            userProfilePicBase64 = null;
        }
    });

    registrationForm.addEventListener('submit', handleRegistration);

    function handleRegistration(e) {
        e.preventDefault();
        
        regError.style.display = 'none';
        regSuccess.style.display = 'none';

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // 1. Validação (mantida)
        if (password.length < 4) {
            displayError("A senha deve ter pelo menos 4 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            displayError("As senhas não coincidem.");
            return;
        }

        if (USERS.some(user => user.email === email)) {
            displayError("Este e-mail já está cadastrado.");
            return;
        }

        // 2. Criação do Novo Usuário (agora inclui a foto de perfil Base64)
        const newUser = {
            email: email,
            password: password,
            name: name,
            profilePic: userProfilePicBase64 // Adiciona a imagem Base64 aqui
        };

        // 3. Simulação de Cadastro (Salva no LocalStorage)
        USERS.push(newUser);
        localStorage.setItem('pianoUsers', JSON.stringify(USERS));
        
        // 4. Feedback
        displaySuccess("Cadastro realizado com sucesso! Você pode fazer login agora.");
        registrationForm.reset();
        profilePicPreview.innerHTML = `<i class="fas fa-camera"></i>`; // Reseta a pré-visualização
        userProfilePicBase64 = null; // Limpa a imagem Base64

        // Redireciona para o login após 3 segundos
        setTimeout(() => {
            window.location.href = 'index.html#loginModal'; 
        }, 3000);
    }

    function displayError(message) {
        regError.textContent = message;
        regError.style.display = 'block';
    }

    function displaySuccess(message) {
        regSuccess.textContent = message;
        regSuccess.style.display = 'block';
    }
});