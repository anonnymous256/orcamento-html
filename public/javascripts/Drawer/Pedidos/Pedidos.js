import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
  authDomain: "orcamento-html.firebaseapp.com",
  projectId: "orcamento-html",
  storageBucket: "orcamento-html.appspot.com",
  messagingSenderId: "363402110339",
  appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
  measurementId: "G-ZMY6CHL8QW",
};

// Inicializa o Firebase apenas se ainda não foi inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 🔹 Definição do Firestore e Autenticação
const db = firebase.firestore();
const auth = firebase.auth();

// 🔍 Seleciona elementos da interface
const statusFilter = document.getElementById("status-filter");
const budgetList = document.getElementById("budget-list");
const loadMoreBtn = document.getElementById("load-more-btn");

let lastVisible = null;
let isLoading = false;
let isLoadingMore = false;
let noMoreItems = false;

// 🔹 Função para verificar autenticação
function checkUserAuthentication(user) {
  if (!user) {
    Swal.fire("Erro!", "Você precisa estar autenticado para visualizar os orçamentos.", "error");
    window.location.href = "/Inicio";
    return false;
  }
  return true;
}

// 🔹 Carregar orçamentos com filtro de status
async function loadBudgets(user, statusFilterValue = "") {
  if (!checkUserAuthentication(user)) return;

  if (isLoading) return;
  isLoading = true;

  if (!isLoadingMore) {
    budgetList.innerHTML = "<li>Carregando...</li>";
  }

  try {
    let query = db.collection("servicos").where("userId", "==", user.uid).orderBy("criadoEm", "desc").limit(10);

    // Se o status for selecionado, adicionar um filtro por status
    if (statusFilterValue) {
      query = query.where("status", "==", statusFilterValue);
    }

    if (lastVisible) {
      query = query.startAfter(lastVisible); // Paginação
    }

    const snapshot = await query.get();

    if (!snapshot.empty) {
      lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Atualiza o último item carregado
      const docsWithProducts = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data(); // Pega os dados do serviço
        const status = data.status || "Sem status"; // Garantir que o status seja capturado corretamente
        const subservicosSnapshot = await doc.ref.collection("subservicos").get();
        const produtos = subservicosSnapshot.docs.map(subDoc => subDoc.data());

        // Agora, retornamos o serviço e aplicamos o filtro sobre o status
        return { id: doc.id, produtos: produtos, status }; // Incluindo status aqui
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

function editStatus(docId, currentStatus) {
  Swal.fire({
    title: 'Editar Status',
    input: 'select',
    inputOptions: {
      'pendente': 'Pendente',
      'realizado': 'Realizado',
      'cancelado': 'Cancelado',
      'em_producao': 'Em Produção',
      'enviado': 'Enviado'
    },
    inputValue: currentStatus,
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Cancelar',
    preConfirm: (newStatus) => {
      if (newStatus) {
        return updateStatus(docId, newStatus); // Atualiza o status
      }
    }
  });
}

async function updateStatus(docId, newStatus) {
  try {
    await db.collection("servicos").doc(docId).update({
      status: newStatus
    });
    Swal.fire("Sucesso!", "Status atualizado com sucesso.", "success");
    loadBudgets(auth.currentUser);  // Recarrega os orçamentos
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    Swal.fire("Erro!", "Houve um erro ao atualizar o status.", "error");
  }
}

// Mapeamento de status e suas cores correspondentes
const statusColors = {
  'pendente': '#FFA500', // Laranja
  'realizado': '#4CAF50', // Verde
  'cancelado': '#FF0000', // Vermelho
  'producao': '#2196F3', // Azul
  'enviado': '#9C27B0' // Roxo
};


// 🔹 Renderizar orçamentos na tela
function renderBudgets(docsWithProducts) {
  budgetList.innerHTML = ""; // Limpa a lista antes de renderizar

  docsWithProducts.forEach((doc) => {
    const { id, produtos, status } = doc;  // Aqui estamos pegando o status do objeto retornado

    const listItem = document.createElement("li");
    listItem.classList.add("budget-item");

    const quantidadeItens = produtos.length;

    // Obtém a cor correspondente ao status
    const statusColor = statusColors[status] || '#000000'; // Se não encontrar o status, usa cor padrão (preto)

    listItem.innerHTML = `
      <div><strong>Cliente:</strong> ${produtos[0].cliente}</div>
      <div><strong>Itens no Serviço:</strong> ${quantidadeItens}</div>
      <div><span class="status" style="cursor: pointer; color: ${statusColor};">${status}</span></div>
    `;

    // Adicionando o evento ao texto do status (não mais ao ícone)
    const statusElement = listItem.querySelector(".status");
    statusElement.addEventListener("click", (event) => {
      event.stopPropagation(); // Impede que o clique no status dispare outros eventos (como abrir a página de edição)
      editStatus(id, status); // Chama a função para editar o status
    });

    listItem.addEventListener("click", () => {
      openEditPage(id);
    });

    budgetList.appendChild(listItem);
  });
}

// 🔹 Função para abrir a página de edição
function openEditPage(docId) {
  window.location.href = `/Editar/${docId}`;
}

// 🔹 Exibir botão "Carregar mais"
function showLoadMoreButton() {
  loadMoreBtn.style.display = 'block';
  loadMoreBtn.addEventListener("click", async () => {
    if (isLoadingMore) return;

    isLoadingMore = true;
    loadMoreBtn.innerHTML = "Carregando...";

    if (auth.currentUser) {
      await loadBudgets(auth.currentUser, statusFilter.value);
    }

    loadMoreBtn.innerHTML = "Carregar mais";
    isLoadingMore = false;
  });
}

// 🔹 Evento de filtro por status
statusFilter.addEventListener("change", () => {
  if (auth.currentUser) {
    lastVisible = null; // Reseta paginação ao mudar filtro
    loadBudgets(auth.currentUser, statusFilter.value);
  }
});

// 🔹 Verificar autenticação ao carregar a página
auth.onAuthStateChanged(user => {
  if (user) {
    loadBudgets(user);
  } else {
    window.location.href = "/Inicio";
  }
});
