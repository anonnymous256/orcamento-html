 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
 import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged,setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";


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
  })
  .catch((error) => {
    console.error("Erro ao configurar persistência:", error.message);
  });

 onAuthStateChanged(auth, (user) => {
  const isLogoutPage = window.location.pathname === '/Deslogar';

  if (user && !isLogoutPage) {
    console.log("Usuário já está autenticado:", user);
    window.location.replace('/Inicio');
  } else {
    if (!isLogoutPage && window.location.pathname !== "/Deslogar") {
      console.log("Redirecionando usuário deslogado para a tela de login.");
      window.location.replace("/Deslogar");
    }
  }
});


 window.login = function() {
   const email = document.getElementById('login-email').value;
   const password = document.getElementById('login-password').value;

   if (!email || !password) {
    Swal.fire({
      position: "center",
      icon: "info",
      title: "Preencha todos os campos",
      showConfirmButton: false,
      timer: 1500
    });
     return;
   }

   

   signInWithEmailAndPassword(auth, email, password)
     .then((userCredential) => {
       const user = userCredential.user;
       console.log("Login bem-sucedido:", user);
       window.location.replace('/Inicio'); 
     })
     .catch((error) => {
       const errorMessage = error.message;
       Swal.fire({
        position: "center",
        icon: "info",
        title: `Erro ao fazer login: ${errorMessage}`,
        showConfirmButton: false,
        timer: 1500
      });
     });
 }

 
 window.createAccount = function() { 
   const name = document.getElementById('create-name').value;
   const email = document.getElementById('create-email').value;
   const password = document.getElementById('create-password').value;
   const confirmPassword = document.getElementById('create-password-confirm').value;

   if (!name || !email || !password || !confirmPassword) {
     alert('Por favor, preencha todos os campos.');
     return;
   }

   if (password !== confirmPassword) {
     alert('As senhas não coincidem.');
     return;
   }

   createUserWithEmailAndPassword(auth, email, password)
     .then((userCredential) => {
       const user = userCredential.user;
       console.log("Conta criada com sucesso:", user);

       updateProfile(user, {
         displayName: name
       }).then(() => {
         alert('Conta criada com sucesso!');
         
         window.location.href = '/Inicio'; 
       }).catch((error) => {
         alert('Erro ao salvar nome de usuário: ' + error.message);
       });
     })
     .catch((error) => {
       const errorMessage = error.message;
       alert(`Erro ao criar conta: ${errorMessage}`);
     });
 }


 window.toggleForm = function() { 
   const loginContainer = document.getElementById('login-container');
   const signupContainer = document.getElementById('signup-container');
   loginContainer.style.display = loginContainer.style.display === 'none' ? 'block' : 'none';
   signupContainer.style.display = signupContainer.style.display === 'none' ? 'block' : 'none';
 }