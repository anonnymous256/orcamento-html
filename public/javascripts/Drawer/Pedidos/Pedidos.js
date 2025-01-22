// Configuração do Firebase
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js';

const firebaseConfig = {
  apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
  authDomain: "orcamento-html.firebaseapp.com",
  projectId: "orcamento-html",
  storageBucket: "orcamento-html.appspot.com",
  messagingSenderId: "363402110339",
  appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
  measurementId: "G-ZMY6CHL8QW",
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

const searchInput = document.getElementById("search");
const budgetList = document.getElementById("budget-list");
const loadMoreBtn = document.getElementById("load-more-btn");

let lastVisible = null;
let isLoading = false;
let isLoadingMore = false;
let noMoreItems = false;  // Flag para verificar se há mais itens

// Verificar se o usuário está autenticado
function checkUserAuthentication(user) {
  if (!user) {
    Swal.fire("Erro!", "Você precisa estar autenticado para visualizar os orçamentos.", "error");
    window.location.href = "/Inicio";
    return false;
  }
  return true;
}

// Função de debouncing
let debounceTimeout;
function debounceSearch() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    if (auth.currentUser) {
      loadBudgets(auth.currentUser, searchInput.value.trim().toLowerCase());
    }
  }, 500);
}

// Carregar orçamentos com paginação e carregamento paralelo
async function loadBudgets(user, search = "") {
  if (!checkUserAuthentication(user)) return;

  if (isLoading) return; // Evita múltiplos carregamentos ao mesmo tempo
  isLoading = true;

  if (!isLoadingMore) {
    budgetList.innerHTML = "<li>Carregando...</li>";
  }

  try {
    let query = db.collection("servicos").where("userId", "==", user.uid).orderBy("criadoEm", "desc").limit(10);

    if (lastVisible) {
      query = query.startAfter(lastVisible); // Paginação
    }

    const snapshot = await query.get();

    if (!snapshot.empty) {
      lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Atualiza o último item carregado
      const docsWithProducts = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const subservicosSnapshot = await doc.ref.collection("subservicos").get();
        const produtos = subservicosSnapshot.docs.map(subDoc => subDoc.data());

        const produtosFiltrados = produtos.filter(produto => {
          const cliente = produto.cliente?.toLowerCase() || "";
          return cliente.includes(search.toLowerCase());
        });

        if (produtosFiltrados.length > 0) {
          return { id: doc.id, produtos: produtosFiltrados };
        }
      }));

      const filteredDocs = docsWithProducts.filter(doc => doc); // Remove undefined

      if (filteredDocs.length > 0) {
        renderBudgets(filteredDocs);
        showLoadMoreButton(); // Exibe o botão "Carregar mais"
      } else {
        if (!noMoreItems) {
          Swal.fire("Informação", "Não há mais itens para carregar.", "info");
          noMoreItems = true; // Marca que não há mais itens
        }
        loadMoreBtn.style.display = 'none'; // Oculta o botão quando não houver mais itens
      }
    } else {
      if (!noMoreItems) {
        Swal.fire("Informação", "Não há mais itens para carregar.", "info");
        noMoreItems = true; // Marca que não há mais itens
      }
      loadMoreBtn.style.display = 'none'; // Oculta o botão quando não houver mais itens
    }
  } catch (error) {
    console.error("Erro ao carregar orçamentos:", error);
    budgetList.innerHTML = "<li>Erro ao carregar dados. Veja o console para mais detalhes.</li>";
  }

  isLoading = false;
}

// Renderizar orçamentos
function renderBudgets(docsWithProducts) {
  docsWithProducts.forEach((doc) => {
    const { id, produtos } = doc;

    const listItem = document.createElement("li");
    listItem.classList.add("budget-item");

    const nomeCliente = produtos[0]?.cliente || "Sem nome";
    const quantidadeItens = produtos.length;

    listItem.innerHTML = `
      <div><strong>Cliente:</strong> ${nomeCliente}</div>
      <div><strong>Itens no Serviço:</strong> ${quantidadeItens}</div>
    `;

    listItem.addEventListener("click", () => {
      openEditPage(id);
    });

    budgetList.appendChild(listItem);
  });
}

// Função para abrir a página de edição
function openEditPage(docId) {
  window.location.href = `/Editar/${docId}`;
}

// Exibir o botão "Carregar mais"
function showLoadMoreButton() {
  loadMoreBtn.style.display = 'block';
  loadMoreBtn.addEventListener("click", async () => {
    if (isLoadingMore) return;

    isLoadingMore = true;
    loadMoreBtn.innerHTML = "Carregando...";

    if (auth.currentUser) {
      await loadBudgets(auth.currentUser);
    }

    loadMoreBtn.innerHTML = "Carregar mais";
    isLoadingMore = false;
  });
}

// Evento de busca com debouncing
searchInput.addEventListener("input", debounceSearch);

// Verificar autenticação na inicialização
auth.onAuthStateChanged(user => {
  if (user) {
    loadBudgets(user);
  } else {
    window.location.href = "/Inicio";
  }
});
