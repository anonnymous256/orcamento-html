import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
        import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';


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


        window.logout = function () {
            signOut(auth)
                .then(() => {
                    console.log("Logout bem-sucedido!");
                    window.location.replace('/Deslogar');
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    console.error('Erro ao fazer logout:', errorMessage);
                    alert('Erro ao realizar logout. Tente novamente.');
                });
        }
