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

// Verificar se o usuário está autenticado
function checkUserAuthentication(user) {

  if (!user) {
    Swal.fire("Erro!", "Você precisa estar autenticado para visualizar os orçamentos.", "error");
    window.location.href = "/Inicio";
    return false;
  }
  console.log("Usuário autenticado:", user.uid);
  return true;
}

// Carregar orçamentos
async function loadBudgets(user, search = "") {
  if (!checkUserAuthentication(user)) return;

  budgetList.innerHTML = "<li>Carregando...</li>";

  try {
    const query = db.collection("servicos").where("userId", "==", user.uid);
    const snapshot = await query.get();

    console.log("Consulta Firestore executada.");
    console.log("Documentos encontrados:", snapshot.docs.length);

    if (!snapshot.empty) {
      const docsWithProducts = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        console.log("Dados do documento:", data);

        // Buscar produtos na subcoleção "subservicos"
        const subservicosSnapshot = await doc.ref.collection("subservicos").get();
        const produtos = subservicosSnapshot.docs.map(subDoc => subDoc.data());

        console.log("Produtos encontrados no documento:", produtos);

        // Filtrar produtos pelo cliente
        const produtosFiltrados = produtos.filter(produto => {
          const cliente = produto.cliente?.toLowerCase() || "";
          return cliente.includes(search.toLowerCase());
        });

        if (produtosFiltrados.length > 0) {
          docsWithProducts.push({
            id: doc.id,
            produtos: produtosFiltrados,
          });
        }
      }

      console.log("Documentos após filtragem:", docsWithProducts.length);

      if (docsWithProducts.length > 0) {
        renderBudgets(docsWithProducts);
      } else {
        budgetList.innerHTML = "<li>Nenhum orçamento encontrado.</li>";
      }
    } else {
      budgetList.innerHTML = "<li>Nenhum orçamento encontrado.</li>";
    }
  } catch (error) {
    console.error("Erro ao carregar orçamentos:", error);
    budgetList.innerHTML = "<li>Erro ao carregar dados. Veja o console para mais detalhes.</li>";
  }
}



// Renderizar orçamentos
function renderBudgets(docsWithProducts) {
  budgetList.innerHTML = "";
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



// Exibir itens da subcoleção
async function displaySubcollectionItems(docId) {
  try {
    const subcollectionRef = db.collection("servicos").doc(docId).collection("subservicos");
    const snapshot = await subcollectionRef.get();

    if (!snapshot.empty) {
      const subItems = snapshot.docs.map(doc => doc.data());
      console.log("Itens da subcoleção:", subItems);

      // Renderizar os itens no frontend
      budgetList.innerHTML = subItems
        .map(item => `
          <li>
            <strong>Modelo:</strong> ${item.modelo}<br>
            <strong>Descrição:</strong> ${item.descricao}<br>
            <strong>Cliente:</strong> ${item.cliente}<br>
            <strong>Dimensões:</strong> ${item.dimensoes}<br>
            <strong>Material:</strong> ${item.material}<br>
            <strong>Vidro:</strong> ${item.vidro}<br>
            <strong>Quantidade:</strong> ${item.quantidade}<br>
            <strong>Total:</strong> ${item.valorTotal}
          </li>
        `)
        .join("");
    } else {
      Swal.fire("Informação", "Nenhum item encontrado na subcoleção.", "info");
    }
  } catch (error) {
    console.error("Erro ao carregar subcoleção:", error);
    Swal.fire("Erro", "Não foi possível carregar os itens.", "error");
  }
}

// Evento de busca
searchInput.addEventListener("input", e => {
  const searchTerm = e.target.value.trim().toLowerCase();
  if (auth.currentUser) {
    loadBudgets(auth.currentUser, searchTerm);
  }
});

// Verificar autenticação na inicialização
auth.onAuthStateChanged(user => {
  if (user) {
    loadBudgets(user);
  } else {
    window.location.href = "/Inicio";
  }
});
