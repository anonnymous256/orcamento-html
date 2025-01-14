import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
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

const modal = document.getElementById("stock-modal");
const modalClose = modal.querySelector(".close");
const openModalBtn = document.getElementById("por-material-btn"); // Alterado para o botão de valor do metro
const stockTableBody = document.getElementById("stock-table-body");
const totalAmountElement = document.getElementById("total-amount");
const metroInput = document.getElementById("material");

let totalAmount = 0;

// Abre o modal de estoque ao clicar no botão de valor do metro
openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    carregarEstoque();
});

// Fecha o modal de estoque
modalClose.addEventListener("click", () => {
    modal.style.display = "none";
});

// Carregar os produtos do estoque
async function carregarEstoque() {
    const user = auth.currentUser;

    if (!user) {
        Swal.fire({
            icon: 'warning',
            title: 'Você precisa estar logado',
            text: 'Você precisa estar logado para ver o estoque.',
            showConfirmButton: false,
            timer: 1500,
        });
        return;
    }

    stockTableBody.innerHTML = "";

    try {
        // Modificação aqui: Filtrar os produtos com base no userId
        const querySnapshot = await getDocs(collection(db, "produtos"));
        querySnapshot.forEach((doc) => {
            const produto = doc.data();

            // Verificar se o produto pertence ao usuário autenticado
            if (produto.userId === user.uid) { 
                let valor = parseFloat(produto.valor);
                if (isNaN(valor)) valor = 0; 
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${produto.nomeProduto}</td>
                    <td>${produto.quantidade}</td>
                    <td>R$ ${valor.toFixed(2)}</td>
                    <td>
                        <button data-id="${doc.id}" data-preco="${valor}" class="decrease-btn">Consumir</button>
                    </td>
                `;
                stockTableBody.appendChild(row);
            }
        });

        // Adicionar eventos para os botões "Consumir"
        stockTableBody.querySelectorAll(".decrease-btn").forEach((button) => {
            button.addEventListener("click", () => consumirProduto(button.dataset.id, button.dataset.preco));
        });
    } catch (error) {
        console.error("Erro ao carregar estoque:", error);
        Swal.fire({
            icon: 'warning',
            title: 'Erro ao carregar estoque',
            text: 'Ocorreu um erro ao carregar o estoque. Por favor, tente novamente.',
            showConfirmButton: false,
            timer: 1500,
        });
    }
}


// Função para consumir um produto e atualizar o valor do metro
async function consumirProduto(produtoId, preco) {
    try {
        const produtoRef = doc(db, "produtos", produtoId);
        const produtoSnap = await getDoc(produtoRef);

        if (produtoSnap.exists()) {
            const produto = produtoSnap.data();

            if (produto.quantidade > 0) {
                await updateDoc(produtoRef, { quantidade: produto.quantidade - 1 });
                totalAmount += parseFloat(preco);
                totalAmountElement.textContent = `Total: R$ ${totalAmount.toFixed(2)}`;
                metroInput.value = totalAmount.toFixed(2); // Atualiza o campo de metro com o total
                carregarEstoque();
                Swal.fire({
                    icon: 'success',
                    title: 'Iten consumido com sucesso',
                    text: 'O produto foi consumido com sucesso.',
                    showConfirmButton: false,
                    timer: 1000,
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Estoque esgotado',
                    text: 'Adicione itens ao estoque para consumir.',
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Produto não encontrado',
                text: 'Ocorreu um erro ao consumir o produto. Por favor, tente novamente.',
                showConfirmButton: false,
                timer: 1500,
            });
        }
    } catch (error) {
        console.error("Erro ao consumir produto:", error);
        Swal.fire({
            icon: 'warning',
            title: 'Erro ao consumir produto',
            text: 'Ocorreu um erro ao consumir o produto. Por favor, tente novamente.',
            showConfirmButton: false,
            timer: 1500,
        });
    }
}