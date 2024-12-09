import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { 
    getAuth, 
    setPersistence, 
    browserSessionPersistence, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
    authDomain: "orcamento-html.firebaseapp.com",
    projectId: "orcamento-html",
    storageBucket: "orcamento-html.appspot.com",
    messagingSenderId: "363402110339",
    appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
    measurementId: "G-ZMY6CHL8QW"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configura a persistência para a sessão do navegador
setPersistence(auth, browserSessionPersistence)
    .then(() => {
        console.log("Persistência configurada para sessão.");
        observeAuthState(); // Inicializar o observador do estado de autenticação
    })
    .catch((error) => {
        console.error("Erro ao configurar persistência:", error.message);
    });

// Observa o estado de autenticação do usuário
function observeAuthState() {
    onAuthStateChanged(auth, (user) => {
        const currentPath = window.location.pathname;

        if (user) {
            console.log("Usuário autenticado:", user.email);
            if (currentPath === '/Deslogar' || currentPath === '/Login') {
                window.location.replace('/Inicio'); // Redireciona para a página inicial
            }
        } else {
            console.log("Usuário não autenticado.");
            if (currentPath !== '/Deslogar' && currentPath !== '/Login') {
                window.location.replace('/Deslogar'); // Redireciona para a tela de login
            }
        }
    });
}

// Função de login
window.login = async function () {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        // Garante a persistência de sessão ao realizar login
        await setPersistence(auth, browserSessionPersistence);

        // Faz o login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Login bem-sucedido:", user.email);

        // Redirecionar para a página inicial
        window.location.replace('/Inicio');
    } catch (error) {
        console.error("Erro ao fazer login:", error.message);
        alert(`Erro ao fazer login: ${error.message}`);
    }
};

// Função de logout
window.logout = async function () {
    try {
        // Realiza o logout
        await signOut(auth);
        console.log("Logout bem-sucedido!");

        // Limpa o estado local
        localStorage.clear();
        sessionStorage.clear();

        // Redireciona para a página de login
        window.location.replace('/Deslogar');
    } catch (error) {
        console.error("Erro ao realizar logout:", error.message);
        alert('Erro ao realizar logout. Tente novamente.');
    }
};
