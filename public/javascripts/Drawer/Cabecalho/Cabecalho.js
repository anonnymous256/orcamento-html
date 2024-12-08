import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

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
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuário logado:", user.uid);
        loadCompanyData(user.uid);
        document.getElementById("botao").onclick = () => submitForm(user.uid);
    } else {
        alert("Você precisa estar logado.");
        window.location.replace("/Deslogar");
    }
});

async function submitForm(userId) {
    const nome = document.getElementById("nome").value;
    const cnpj = document.getElementById("cnpj").value;
    const endereco = document.getElementById("endereco").value;
    const telefone = document.getElementById("telefone").value;
    const razaoSocial = document.getElementById("razao-social").value;
    const instagram = document.getElementById("instagram").value;
    const logoInput = document.getElementById("logo");
    let logoBase64 = "";

    if (!nome || !cnpj || !endereco || !telefone || !instagram) {
        Swal.fire({
            position: "center",
            icon: "info",
            title: "Preencha todos os campos obrigatórios",
            showConfirmButton: false,
            timer: 1500
          });
        return;
    }

    else if (logoInput.files.length > 0) {
        const file = logoInput.files[0];
        logoBase64 = await fileToBase64(file);
        
    }

    const data = { nome, cnpj, endereco, telefone,razaoSocial, instagram, logo: logoBase64 };

    const docRef = doc(db, "empresas", userId); // Salva pelo UID do usuário
    await setDoc(docRef, data);

    Swal.fire({
        position: "center",
        icon: "success",
        title: "Empresa atualizada com sucesso!",
        showConfirmButton: false,
        timer: 1500
      });
    loadCompanyData(userId);
}

async function loadCompanyData(userId) {
    const docRef = doc(db, "empresas", userId); // Busca pelo UID do usuário
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById("empresa-nome").textContent = `Nome: ${data.nome}`;
        document.getElementById("empresa-cnpj").textContent = `CNPJ: ${data.cnpj}`;
        document.getElementById("empresa-endereco").textContent = `Endereço: ${data.endereco}`;
        document.getElementById("empresa-telefone").textContent = `Telefone: ${data.telefone}`;
        document.getElementById("empresa-razao-social").textContent = `Razão Social: ${data.razaoSocial}`;
        document.getElementById("empresa-instagram").textContent = `Instagram: ${data.instagram}`;
        if (data.logo) {
            document.getElementById("logo-preview").src = data.logo;
        }
    } else {
        console.log("Nenhuma empresa encontrada.");
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}


  