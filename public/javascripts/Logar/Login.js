 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
 import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";


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

 onAuthStateChanged(auth, (user) => {
   if (user) {
     console.log("Usuário já está autenticado:", user);
     
     window.location.replace('/Inicio'); 
   } else {
     console.log("Nenhum usuário autenticado");
   }
 });


 window.login = function() {
   const email = document.getElementById('login-email').value;
   const password = document.getElementById('login-password').value;

   if (!email || !password) {
     alert('Por favor, preencha todos os campos.');
     return;
   }

   signInWithEmailAndPassword(auth, email, password)
     .then((userCredential) => {
       
       const user = userCredential.user;
       console.log("Login bem-sucedido:", user);
       window.location.href = '/Inicio'; 
     })
     .catch((error) => {
       const errorMessage = error.message;
       alert(`Erro ao fazer login: ${errorMessage}`);
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