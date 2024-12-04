import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

async function saveClient() {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const endereco = document.getElementById("endereco").value;

    if (!nome || !telefone) {
        Swal.fire({
            position: "center",
            icon: "info",
            title: "Preencha todos os campos",
            showConfirmButton: false,
            timer: 1500
          });
        return;
    }

    const user = auth.currentUser; 
    if (!user) {
        alert("Por favor, faça login para adicionar um cliente.");
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "clientes"), {
            nome,
            email,
            telefone,
            endereco,
            userId: user.uid,
            createdAt: serverTimestamp()

        });
        console.log("Cliente salvo com sucesso! ID do documento:", docRef.id);
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Cliente cadastrado com sucesso!",
            showConfirmButton: false,
            timer: 1500
          });
        document.getElementById("formulario-cliente").reset(); 
    } catch (error) {
        console.error("Erro ao salvar cliente: ", error);
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Ocorreu um erro ao salvar o cliente",
            showConfirmButton: false,
            
          });
    }
}

window.saveClient = saveClient;