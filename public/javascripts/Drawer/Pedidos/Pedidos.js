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
      measurementId: "G-ZMY6CHL8QW"
    };
  
    // Inicializar Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    const auth = firebase.auth(); // Referência para o Firebase Auth
  
    const searchInput = document.getElementById("search");
    const budgetList = document.getElementById("budget-list");
  
    // Função para verificar se o usuário está autenticado
    function checkUserAuthentication(user) {
      if (!user) {
        console.error("Usuário não autenticado.");
        Swal.fire("Erro!", "Você precisa estar autenticado para visualizar os orçamentos.", "error");
        window.location.href = '/Inicio';  // Redirecionar para a página de login ou exibir a tela de login
        return false;
      }
      return true;
    }
  
    // Função para carregar orçamentos
    async function loadBudgets(user, search = "") {
      if (!checkUserAuthentication(user)) return; // Verifica se o usuário está autenticado
  
      budgetList.innerHTML = "<li>Carregando...</li>";
  
      try {
        let query = db.collection("servicos").where("userId", "==", user.uid);  // Filtra pelos orçamentos do usuário logado
  
        const snapshot = await query.get();
        console.log("Consulta executada:", search);
  
        if (!snapshot.empty) {
          const filteredDocs = snapshot.docs.filter(doc => {
            const data = doc.data();
            // Aqui estamos buscando pelo nome do cliente dentro do array "produtos"
            const produtos = Array.isArray(data.produtos) ? data.produtos : [data.produtos];
  
            // Verificar se algum produto contém um cliente que corresponde à pesquisa
            return produtos.some(produto => {
              const cliente = produto.cliente ? produto.cliente.toLowerCase() : '';
              return cliente.includes(search.toLowerCase());
            });
          });
  
          if (filteredDocs.length > 0) {
            renderBudgets(filteredDocs);
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
    function renderBudgets(docs) {
      budgetList.innerHTML = "";
      docs.forEach((doc) => {
        const data = doc.data();
        console.log(data.produtos); // Verifique a estrutura dos dados
  
        // Tratar 'produtos' como um array ou objeto
        let produtos = Array.isArray(data.produtos) ? data.produtos : [data.produtos];
  
        if (produtos.length > 0) {
          const listItem = document.createElement("li");
          listItem.classList.add("budget-item");
  
          // Exibir apenas o nome do cliente e a quantidade de itens
          const nomeCliente = produtos[0].cliente || "Sem nome";
          const quantidadeItens = produtos.length;
  
          listItem.innerHTML = ` 
            <div><strong>Cliente:</strong> ${nomeCliente}</div>
            <div><strong>Itens no Serviço:</strong> ${quantidadeItens}</div>
          `;
  
          // Adicionar evento de clique
          listItem.addEventListener("click", () => {
            openEditPage(doc.id);
          });
  
          budgetList.appendChild(listItem);
        } else {
          console.error("Erro: produtos não está presente ou está vazio.");
          budgetList.innerHTML = "<li>Erro: dados inválidos.</li>";
        }
      });
    }
  
    function openEditPage(docId) {
      window.location.href = `/Editar/${docId}`;
    }
  
    // Evento para busca
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim().toLowerCase();
      if (auth.currentUser) {
        loadBudgets(auth.currentUser, searchTerm);
      }
    });
  
    // Verificar se o usuário está autenticado na inicialização
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Usuário autenticado:", user);
        loadBudgets(user);  // Carregar os orçamentos do usuário autenticado
      } else {
        console.log("Usuário não autenticado");
        window.location.href = '/Inicio';  // Redirecionar para a página de login
      }
    });