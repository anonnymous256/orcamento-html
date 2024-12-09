import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';


const firebaseConfig = {
  apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
  authDomain: "orcamento-html.firebaseapp.com",
  projectId: "orcamento-html",
  storageBucket: "orcamento-html.appspot.com",
  messagingSenderId: "363402110339",
  appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
  measurementId: "G-ZMY6CHL8QW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Persistência configurada para sessão.");
    observeAuthState();
  })
  .catch((error) => {
    console.error("Erro ao configurar persistência:", error.message);
  });

function observeAuthState() {
  onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;

    if (user) {
      console.log("Usuário autenticado:", user.email);
      if (currentPath === '/Deslogar' || currentPath === '/Login') {
        window.location.replace('/Inicio');
      }
    } else {
      console.log("Usuário não autenticado.");
      if (currentPath !== '/Deslogar' && currentPath !== '/Login') {
        window.location.replace('/Deslogar');
      }
    }
  });
}

// Função de login
window.login = async function () {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    Swal.fire({
      position: "center",
      icon: "info",
      title: "Preencha todos os campos!",
      showConfirmButton: false,
      timer: 1500
    })
    return;
  }

  try {
    await setPersistence(auth, browserSessionPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login bem-sucedido:", user.email);
    window.location.replace('/Inicio');
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
    Swal.fire({
      position: "center",
      icon: "error",
      title: "Email ou senha incorretos!",
      showConfirmButton: false,
      timer: 1500
    })
  }
};


window.logout = async function () {
  try {
    await signOut(auth);
    console.log("Logout bem-sucedido!");
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/Deslogar');
  } catch (error) {
    console.error("Erro ao realizar logout:", error.message);
    alert('Erro ao realizar logout. Tente novamente.');
  }
};
