import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Função para carregar os clientes dinamicamente
async function carregarClientes() {
    const tabela = document.getElementById("tabela-clientes");
    const tbody = tabela.querySelector("tbody");
    const carregando = document.getElementById("carregando");

    try {
        // Criar a consulta com filtro 'where' para pegar os clientes associados ao usuário logado
        const q = query(
            collection(db, "clientes"),
            where("userId", "==", auth.currentUser.uid)  // Filtro para buscar clientes do usuário logado
        );

        // Obter os documentos filtrados
        const querySnapshot = await getDocs(q);
        tbody.innerHTML = ""; // Limpa o conteúdo existente
        querySnapshot.forEach(doc => {
            const cliente = doc.data();
            const linha = document.createElement("tr");

            // Adiciona células dinamicamente com data-label
            linha.innerHTML = `
                <td data-label="Nome">${cliente.nome || "—"}</td>
                <td data-label="Email">${cliente.email || "—"}</td>
                <td data-label="Telefone">${cliente.telefone || "—"}</td>
                <td data-label="Endereço">${cliente.endereco || "—"}</td>
                <td data-label="Data de Criação">${cliente.createdAt?.toDate().toLocaleDateString("pt-BR") || "—"}</td>
            `;
            tbody.appendChild(linha);
        });

        carregando.style.display = "none";
        tabela.style.display = "table"; // Exibe a tabela
    } catch (error) {
        carregando.innerHTML = "Erro ao carregar clientes.";
        console.error("Erro ao carregar clientes:", error);
    }
}

// Verifica se o usuário está autenticado antes de carregar os dados
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está logado, carrega os dados
        carregarClientes();
    } else {
        // Usuário não está logado, redireciona para a página de login
        window.location.href = "/login"; // Ajuste a URL conforme necessário
    }
});
