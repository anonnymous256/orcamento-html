import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

async function carregarClientes() {
    const tabela = document.getElementById("tabela-clientes");
    const tbody = tabela.querySelector("tbody");
    const carregando = document.getElementById("carregando");

    try {
        const q = query(
            collection(db, "clientes"),
            where("userId", "==", auth.currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        tbody.innerHTML = ""; 
        querySnapshot.forEach(doc => {
            const cliente = doc.data();
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td data-label="Nome">${cliente.nome || "—"}</td>
                <td data-label="Email">${cliente.email || "—"}</td>
                <td data-label="Telefone">${cliente.telefone || "—"}</td>
                <td data-label="Endereço">${cliente.endereco || "—"}</td>
                <td data-label="Data de Criação">${cliente.createdAt?.toDate().toLocaleDateString("pt-BR") || "—"}</td>
                <td>
                    <button class="btn-editar" data-id="${doc.id}">Editar</button>
                </td>
            `;

            linha.querySelector(".btn-editar").addEventListener("click", () => {
                abrirModalDeEdicao(doc.id, cliente);
            });

            tbody.appendChild(linha);
        });

        carregando.style.display = "none";
        tabela.style.display = "table";
    } catch (error) {
        carregando.innerHTML = "Erro ao carregar clientes.";
        console.error("Erro ao carregar clientes:", error);
    }
}

function abrirModalDeEdicao(clienteId, cliente) {
    
    document.getElementById("edit-name").value = cliente.nome || "";
    document.getElementById("edit-email").value = cliente.email || "";
    document.getElementById("edit-telefone").value = cliente.telefone || "";
    document.getElementById("edit-endereco").value = cliente.endereco || "";

    
    console.log("Abrindo modal para cliente:", clienteId); 
    document.getElementById("edit-modal").style.display = "flex";
    document.getElementById("edit-form").onsubmit = (e) => {
        e.preventDefault();
        atualizarCliente(clienteId);
    };
}


function fecharModal() {
    document.getElementById("edit-modal").style.display = "none";
}


document.querySelector(".modal .close").addEventListener("click", fecharModal);

async function atualizarCliente(clienteId) {
    
    const nome = document.getElementById("edit-name").value;
    const email = document.getElementById("edit-email").value;
    const telefone = document.getElementById("edit-telefone").value;
    const endereco = document.getElementById("edit-endereco").value;

    try {
        const clienteRef = doc(db, "clientes", clienteId);
        await updateDoc(clienteRef, {
            nome,
            email,
            telefone,
            endereco,
            updatedAt: serverTimestamp()
        });
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Cliente atualizado com sucesso!",
            showConfirmButton: false,
            timer: 1500
          });
        fecharModal(); 
        carregarClientes(); 
    } catch (error) {
        console.error("Erro ao atualizar o cliente:", error);
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Erro ao atualizar o cliente.",
            showConfirmButton: false,
            timer: 1500
          });
    }
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        carregarClientes();
    } else {
        window.location.href = "/login"; 
    }
});
