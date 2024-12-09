/*import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';
import { auth } from './auth.js'; // Importa o auth configurado no arquivo principal

// Função de logout
window.logout = async function () {
    try {
        // Realiza o logout
        await signOut(auth);
        console.log("Logout bem-sucedido!");

        // Limpa qualquer estado local
        localStorage.clear();
        sessionStorage.clear();

        // Redireciona para a página de login
        window.location.replace('/Deslogar');
    } catch (error) {
        console.error("Erro ao realizar logout:", error.message);
        alert('Erro ao realizar logout. Tente novamente.');
    }
};
*/
