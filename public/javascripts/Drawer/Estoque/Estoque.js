import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
    import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
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

    // Função para carregar produtos do Firestore com filtro de categoria
    async function carregarProdutos(filtroCategoria = "Todos") {
      const tabela = document.getElementById("product-table");
      const tbody = tabela.querySelector("tbody");

      const user = auth.currentUser;
      if (!user) {
        alert("Por favor, faça login para visualizar os produtos.");
        return;
      }

      try {
        let q;
        if (filtroCategoria === "Todos") {
          q = query(
            collection(db, "produtos"),
            where("userId", "==", user.uid)  // Filtro para pegar produtos do usuário logado
          );
        } else {
          q = query(
            collection(db, "produtos"),
            where("userId", "==", user.uid),
            where("categoria", "==", filtroCategoria)  // Filtro para categoria específica
          );
        }

        const querySnapshot = await getDocs(q);
        tbody.innerHTML = ""; // Limpa a tabela

        querySnapshot.forEach((doc) => {
          const produto = doc.data();
          const row = document.createElement("tr");
          row.dataset.id = doc.id; // Adiciona o ID do documento na linha

          row.innerHTML = `
                        <td>${produto.nomeProduto}</td>
                        <td>${produto.quantidade}</td>
                        <td>${produto.categoria}</td>
                        <td>${produto.valor}</td>
                        <td>${produto.validade}</td>
                        <td class="action-buttons">
                            <button class="edit">Editar</button>
                            <button class="delete">Excluir</button>
                        </td>
                    `;
          tbody.appendChild(row);
        });
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        alert("Ocorreu um erro ao carregar os produtos.");
      }
    }

    // Verificar se o usuário está logado e carregar os produtos
    onAuthStateChanged(auth, (user) => {
      if (user) {
        carregarProdutos(); // Carrega os produtos do usuário logado
      } else {
        window.location.href = "/login"; // Redireciona para o login se o usuário não estiver logado
      }
    });

    // Função para adicionar um produto ao Firestore
    async function saveProduct(event) {
      event.preventDefault();
      const nomeProduto = document.getElementById("product-name").value;
      const quantidade = document.getElementById("product-quantity").value;
      const valor = document.getElementById("product-valor").value;
      const categoria = document.getElementById("product-category").value;
      const validade = document.getElementById("product-Valid").value;
      const user = auth.currentUser;

      if (!user) {
        alert("Por favor, faça login para adicionar um produto.");
        return;
      }if (!nomeProduto || !quantidade || !categoria || !validade || !valor) {
        Swal.fire({
          position: "center",
          icon: "info",
          title: "Preencha todos os campos",
          showConfirmButton: false,
          timer: 1500
        });
      }

      try {
        await addDoc(collection(db, "produtos"), {
          nomeProduto,
          quantidade,
          valor,
          categoria,
          validade,
          userId: user.uid, 
          createdAt: serverTimestamp()
        });
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Produto adicionado com sucesso",
          showConfirmButton: false,
          timer: 1500
        });
        document.getElementById("add-product-form").reset();
        carregarProdutos(); // Atualiza a lista de produtos após adicionar um novo
      } catch (error) {
        console.error("Erro ao salvar o produto:", error);
        alert("Ocorreu um erro ao adicionar o produto.");
      }
    }

    // Adicionar evento para o formulário de adicionar produto
    document.getElementById("add-product-form").addEventListener("submit", saveProduct);

    // Adicionar evento para o filtro de categoria
    document.getElementById("filter-category").addEventListener("change", (event) => {
      const categoriaSelecionada = event.target.value;
      carregarProdutos(categoriaSelecionada); // Carrega os produtos filtrados
    });

    // Função para editar o produto
    function editarProduto(event) {
      const row = event.target.closest("tr");
      const nomeProduto = row.querySelector("td:nth-child(1)").textContent;
      const quantidade = row.querySelector("td:nth-child(2)").textContent;
      const categoria = row.querySelector("td:nth-child(3)").textContent;
      const valor = row.querySelector("td:nth-child(4)").textContent;
      const validade = row.querySelector("td:nth-child(5)").textContent;

      document.getElementById("edit-product-name").value = nomeProduto;
      document.getElementById("edit-product-quantity").value = quantidade;
      document.getElementById("edit-product-valor").value = valor;
      document.getElementById("edit-product-category").value = categoria;
      document.getElementById("edit-product-Valid").value = validade;

      document.getElementById("edit-modal").style.display = "block";

      const produtoId = event.target.dataset.id;
      document.getElementById("edit-form").onsubmit = (e) => {
        atualizarProduto(e, produtoId);
      };
    }

    // Função para atualizar o produto no Firestore
    async function atualizarProduto(event, produtoId) {
      event.preventDefault();

      const nomeProduto = document.getElementById("edit-product-name").value;
      const quantidade = document.getElementById("edit-product-quantity").value;
      const valor = document.getElementById("edit-product-valor").value;
      const categoria = document.getElementById("edit-product-category").value;
      const validade = document.getElementById("edit-product-Valid").value;

      const user = auth.currentUser;

      if (!user) {
        alert("Por favor, faça login para editar o produto.");
        return;
      }

      try {
        const produtoRef = doc(db, "produtos", produtoId);
        await updateDoc(produtoRef, {
          nomeProduto,
          quantidade,
          valor,
          categoria,
          validade,
          updatedAt: serverTimestamp()
        });
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Produto atualizado com sucesso!",
          showConfirmButton: false,
          timer: 1500
        });
        document.getElementById("edit-modal").style.display = "none";
        carregarProdutos();
      } catch (error) {
        console.error("Erro ao atualizar o produto:", error);
        alert("Ocorreu um erro ao atualizar o produto.");
      }
    }

    // Função para excluir o produto
    function excluirProduto(event) {
      const row = event.target.closest("tr");
      const produtoId = row.dataset.id;

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      });
      swalWithBootstrapButtons.fire({
        title: "Você tem certeza?",
        text: "Não será possivel recuperar o produto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, deletar!",
        cancelButtonText: "Não, cancelar!",
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          deletarProduto(produtoId);
          carregarProdutos();
          swalWithBootstrapButtons.fire({
            title: "Deletado!",
            text: "O produto foi deletado com sucesso.",
            icon: "success"
          });
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire({
            title: "Cancelado",
            text: "O produto foi preservado :)",
            icon: "error"
          });
        }
      });

      document.getElementById("confirm-delete").onclick = () => {
        deletarProduto(produtoId);
      };
    }

    // Função para deletar o produto do Firestore
    async function deletarProduto(produtoId) {
      try {
        await deleteDoc(doc(db, "produtos", produtoId));
        document.getElementById("delete-modal").style.display = "none";
        carregarProdutos();
      } catch (error) {
        console.error("Erro ao excluir o produto:", error);
        alert("Ocorreu um erro ao excluir o produto.");
      }
    }

    // Evento de fechamento do modal de edição
    document.querySelector("#edit-modal .close").addEventListener("click", () => {
      document.getElementById("edit-modal").style.display = "none";
    });

    // Evento de fechamento do modal de exclusão
    document.querySelector("#delete-modal .close").addEventListener("click", () => {
      document.getElementById("delete-modal").style.display = "none";
    });

    // Adicionar eventos para os botões de editar e excluir
    document.getElementById("product-table").addEventListener("click", (event) => {
      if (event.target.classList.contains("edit")) {
        const produtoId = event.target.closest("tr").dataset.id;
        event.target.dataset.id = produtoId;
        editarProduto(event);
      }
      if (event.target.classList.contains("delete")) {
        excluirProduto(event);
      }
    });