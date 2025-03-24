import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-storage-compat.js';

// Configuração Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
    authDomain: "orcamento-html.firebaseapp.com",
    projectId: "orcamento-html",
    storageBucket: "orcamento-html.firebasestorage.app",
    messagingSenderId: "363402110339",
    appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
    measurementId: "G-ZMY6CHL8QW"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Variável para armazenar o ID do documento atual e o índice máximo de produtos
let currentDocId = '';
let maxProdutoIndex = 0;
let clientesList = []; // Array para armazenar a lista de clientes

// Função para carregar os dados do orçamento
async function loadService() {
    const docId = window.location.pathname.split('/')[2];  // Captura o ID da URL
    console.log("ID do serviço capturado:", docId);
    currentDocId = docId; // Armazenar o ID para uso posterior

    if (!docId) {
        alert("ID do serviço não encontrado.");
        return;
    }

    // Carregar a lista de clientes
    await loadClientes();

    try {
        // Obtém a subcoleção de "subservicos" do documento específico
        const subServicosSnapshot = await db.collection("servicos").doc(docId).collection("subservicos").get();

        if (!subServicosSnapshot.empty) {
            console.log("Subcoleção de produtos carregada.");

            const produtosContainer = document.getElementById("produtos-container");
            produtosContainer.innerHTML = "";  // Limpar qualquer conteúdo anterior

            // Variável para armazenar o índice
            let produtoIndex = 1;

            // Iterar sobre cada documento na subcoleção
            subServicosSnapshot.forEach((subDoc) => {
                const produto = subDoc.data();
                console.log(`Produto ${produtoIndex}:`, produto);
            
                const produtoDiv = document.createElement("div");
                produtoDiv.classList.add("produto");
                produtoDiv.dataset.docId = subDoc.id; // Armazenar o ID do documento
            
                // Usando o índice manualmente para cada campo
                produtoDiv.innerHTML = `
                <button type="button" class="delete-product-button" data-doc-id="${subDoc.id}" data-index="${produtoIndex}"><i class="fas fa-trash"></i> </button>
                    <h3>Produto ${produtoIndex}</h3>
                    ${produto.cliente ? `<div><label for="cliente${produtoIndex}">Cliente</label><input type="text" id="cliente${produtoIndex}" name="cliente${produtoIndex}" value="${produto.cliente}" /></div>` : ''} 
                    ${produto.descricao ? `<div><label for="descricao${produtoIndex}">Descrição</label><input type="text" id="descricao${produtoIndex}" name="descricao${produtoIndex}" value="${produto.descricao}" /></div>` : ''} 
                    ${produto.dimensoes ? `<div><label for="dimensoes${produtoIndex}">Dimensões</label><input type="text" id="dimensoes${produtoIndex}" name="dimensoes${produtoIndex}" value="${produto.dimensoes}" /></div>` : ''} 
                    ${produto.material ? `<div><label for="material${produtoIndex}">Material</label><input type="text" id="material${produtoIndex}" name="material${produtoIndex}" value="${produto.material}" /></div>` : ''} 
                    ${produto.porcentagem ? `<div><label for="porcentagem${produtoIndex}">Porcentagem</label><input type="text" id="porcentagem${produtoIndex}" name="porcentagem${produtoIndex}" value="${produto.porcentagem}" /></div>` : ''} 
                    ${produto.quantidade ? `<div><label for="quantidade${produtoIndex}">Quantidade</label><input type="text" id="quantidade${produtoIndex}" name="quantidade${produtoIndex}" value="${produto.quantidade}" /></div>` : ''} 
                    ${produto.valorMetro ? `<div><label for="valorMetro${produtoIndex}">Valor por Metro</label><input type="text" id="valorMetro${produtoIndex}" name="valorMetro${produtoIndex}" value="${produto.valorMetro}" /></div>` : ''} 
                    ${produto.ferragem ? `<div><label for="ferragem${produtoIndex}">Ferragem</label><input type="text" id="ferragem${produtoIndex}" name="ferragem${produtoIndex}" value="${produto.ferragem}" /></div>` : ''} 
                    ${produto.vidro ? `<div><label for="vidro${produtoIndex}">Vidro</label><input type="text" id="vidro${produtoIndex}" name="vidro${produtoIndex}" value="${produto.vidro}" /></div>` : ''} 
                    ${produto.valorTotal ? `<div><label for="valorTotal${produtoIndex}">Valor Total</label><input type="text" id="valorTotal${produtoIndex}" name="valorTotal${produtoIndex}" value="${produto.valorTotal}" /><button type="button" class="calcular-total" data-index="${produtoIndex}"><i class="fas fa-calculator"></i></button></div>` : ''} 
                    ${produto.imagemBase64 ? `<div><label for="modelo${produtoIndex}">Imagem</label><img id="produtoImagem${produtoIndex}" src="${produto.imagemBase64}" alt="Produto ${produtoIndex}" width="200"/></div>` : ''} 
                    <button type="button" class="edit-image-button" data-index="${produtoIndex}">Editar Imagem</button>
                `;
            
                produtosContainer.appendChild(produtoDiv);

                // Atualizar o índice máximo para uso posterior
                maxProdutoIndex = Math.max(maxProdutoIndex, produtoIndex);

                // Incrementar o índice
                produtoIndex++;
            });
            


            const getValue = (id) => {
                const element = document.getElementById(id);
                const value = element ? element.value.trim() : "";
            
                // Remover "R$" e substituir a vírgula por ponto
                const cleanValue = value.replace("R$", "").replace(",", ".").trim();
            
                // Converter para float, se for válido
                const numericValue = parseFloat(cleanValue);
            
                // Se não for um número válido, retornar 0
                return isNaN(numericValue) ? 0 : numericValue;
            };
            
            const getDimension = (id) => {
                const element = document.getElementById(id);
                const value = element ? element.value.trim() : "";
            
                // Verificar se a dimensão está no formato correto (largura x altura)
                const dimensionValues = value.split("x").map(v => parseFloat(v.trim()));
            
                // Se houver dois valores válidos para a dimensão, retorná-los multiplicados
                if (dimensionValues.length === 2 && !isNaN(dimensionValues[0]) && !isNaN(dimensionValues[1])) {
                    return dimensionValues[0] * dimensionValues[1];
                }
            
                // Se não for um formato válido, retornar 0
                return 0;
            };

            document.querySelectorAll('.delete-product-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const index = e.target.getAttribute('data-index');
            
                    // Verifique se o índice foi capturado corretamente
                    if (!index) {
                        console.error("Índice do produto não encontrado.");
                        return;
                    }
            
                    // Confirmação de exclusão com SweetAlert2
                    const result = await Swal.fire({
                        title: `Tem certeza de que deseja excluir o produto ${index}?`,
                        text: "Ele será removido temporemente do orçamento.",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sim, excluir',
                        cancelButtonText: 'Cancelar',
                    });
            
                    if (!result.isConfirmed) return;
            
                    try {
                        // Remove o produto visualmente do DOM
                        const produtoDiv = button.closest('.produto');
                        if (produtoDiv) {
                            produtoDiv.remove();
                        } else {
                            console.error(`Produto com índice ${index} não encontrado.`);
                        }
                    } catch (error) {
                        console.error("Erro ao excluir o produto:", error);
                        Swal.fire("Erro", "Erro ao excluir o produto.", "error");
                    }
                });
            });
            
            
            
            
            document.querySelectorAll('.calcular-total').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
            
                    // Obter os valores com a função getValue
                    const valorMetro = getValue(`valorMetro${index}`);
                    const dimensao = getDimension(`dimensoes${index}`);
                    const material = getValue(`material${index}`);
                    const porcentagemGeral = getValue(`porcentagem${index}`);
                    const quantidade = getValue(`quantidade${index}`);
            
                    // Cálculo inicial: (valorMetro * (largura * altura) + material)
                    let total = (valorMetro * dimensao) + material;
            
                    // Cálculo final: (total + (total * (porcentagemGeral / 100))) * quantidade
                    let totalFinal = (total + (total * (porcentagemGeral / 100))) * quantidade;
            
                    // Atualizar o campo de valor total
                    const valorTotalField = document.getElementById(`valorTotal${index}`);
                    if (valorTotalField) {
                        valorTotalField.value = totalFinal.toFixed(2);
                    }
                });
            });
            

            // Adiciona evento de clique nos botões de editar imagem
            document.querySelectorAll('.edit-image-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    openImageModal(index); // Abre o modal para o produto específico
                });
            });
        } else {
            Swal.fire('Erro!', 'Orçamento não encontrado.', 'error');
        }
    } catch (error) {
        console.error("Erro ao carregar orçamento:", error);
    }
}

// Função para carregar a lista de clientes do usuário atual
async function loadClientes() {
    try {
        // Espera a autenticação estar pronta
        const user = await new Promise((resolve, reject) => {
            const unsubscribe = auth.onAuthStateChanged(user => {
                unsubscribe(); // Para de observar após o primeiro evento
                resolve(user);
            }, reject);
        });

        if (!user) {
            console.error('Usuário não autenticado.');
            return;
        }

        console.log('Usuário logado:', user.uid); // Verifique se o UID está correto

        const snapshot = await db.collection('clientes')
            .where('userId', '==', user.uid)
            .orderBy('nome', 'asc')
            .get();

        clientesList = [];
        snapshot.forEach((doc) => {
            const cliente = doc.data();
            clientesList.push({
                id: doc.id,
                nome: cliente.nome,
                email: cliente.email,
                endereco: cliente.endereco,
                telefone: cliente.telefone
            });
        });

        console.log("Lista de clientes carregada:", clientesList);
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        Swal.fire('Erro', 'Não foi possível carregar a lista de clientes.', 'error');
    }
}

// Carregar o serviço quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
    loadService();
    
    // Adicionar evento ao botão de adicionar novo produto
    const addButton = document.getElementById('add-new-product-button');
    if (addButton) {
        addButton.addEventListener('click', openNewProductModal);
    }
    
    // Adicionar evento ao botão de salvar alterações
    const saveButton = document.getElementById('save-changes-button');
    if (saveButton) {
        saveButton.addEventListener('click', saveAllChanges);
    }
});

// Função para abrir o modal de adição de novo produto
function openNewProductModal() {
    // Criar o dropdown de clientes
    let clientesOptions = '<option value="" disabled selected>Selecione um cliente</option>';
    clientesList.forEach(cliente => {
        clientesOptions += `<option value="${cliente.nome}">${cliente.nome}</option>`;
    });
    
    Swal.fire({
        title: 'Adicionar Novo Produto',
        html: `
            <form id="new-product-form" class="swal2-form">
                <div class="form-group">
                    <label for="new-cliente">Cliente</label>
                    <select id="new-cliente" class="swal2-select" required>
                        ${clientesOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="new-descricao">Descrição</label>
                    <input type="text" id="new-descricao" class="swal2-input" placeholder="Descrição do produto">
                </div>
                <div class="form-group">
                    <label for="new-altura">Altura (m)</label>
                    <input type="number" id="new-altura" class="swal2-input" placeholder="Altura em metros" step="0.01">
                </div>
                <div class="form-group">
                    <label for="new-largura">Largura (m)</label>
                    <input type="number" id="new-largura" class="swal2-input" placeholder="Largura em metros" step="0.01">
                </div>
                <div class="form-group">
                    <label for="new-valorMetro">Valor por Metro</label>
                    <input type="number" id="new-valorMetro" class="swal2-input" placeholder="Valor por metro" step="0.01">
                </div>
                <div class="form-group">
                    <label for="new-material">Material</label>
                    <input type="number" id="new-material" class="swal2-input" placeholder="Valor do material" step="0.01">
                </div>
                <div class="form-group">
                    <label for="new-quantidade">Quantidade</label>
                    <input type="number" id="new-quantidade" class="swal2-input" placeholder="Quantidade" min="1" value="1">
                </div>
                <div class="form-group">
                    <label for="new-porcentagem">Porcentagem</label>
                    <input type="number" id="new-porcentagem" class="swal2-input" placeholder="Porcentagem" step="0.01" value="0">
                </div>
                <div class="form-group">
                    <label for="new-vidro">Cor do Vidro</label>
                    <input type="text" id="new-vidro" class="swal2-input" placeholder="Cor do vidro">
                </div>
                <div class="form-group">
                    <label for="new-ferragem">Cor da Ferragem</label>
                    <input type="text" id="new-ferragem" class="swal2-input" placeholder="Cor da ferragem">
                </div>
                <div class="form-group">
                    <label for="new-valorTotal">Valor Total</label>
                    <input type="number" id="new-valorTotal" class="swal2-input" placeholder="Valor total" step="0.01" readonly>
                </div>
                <button type="button" id="calculate-total-button" class="swal2-confirm swal2-styled">Calcular Total</button>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Adicionar Produto',
        cancelButtonText: 'Cancelar',
        focusConfirm: false,
        didOpen: () => {
            // Adicionar evento para calcular o total
            document.getElementById('calculate-total-button').addEventListener('click', () => {
                const altura = parseFloat(document.getElementById('new-altura').value) || 0;
                const largura = parseFloat(document.getElementById('new-largura').value) || 0;
                const valorMetro = parseFloat(document.getElementById('new-valorMetro').value) || 0;
                const material = parseFloat(document.getElementById('new-material').value) || 0;
                const quantidade = parseInt(document.getElementById('new-quantidade').value) || 1;
                const porcentagem = parseFloat(document.getElementById('new-porcentagem').value) || 0;
                
                // Cálculo do valor total
                const total = (valorMetro * (altura * largura) + material);
                const totalFinal = (total + (total * (porcentagem / 100))) * quantidade;
                
                document.getElementById('new-valorTotal').value = totalFinal.toFixed(2);
            });
        },
        preConfirm: () => {
            // Validar os campos obrigatórios
            const cliente = document.getElementById('new-cliente').value;
            const descricao = document.getElementById('new-descricao').value;
            const altura = document.getElementById('new-altura').value;
            const largura = document.getElementById('new-largura').value;
            const valorMetro = document.getElementById('new-valorMetro').value;
            
            if (!cliente || !descricao || !altura || !largura || !valorMetro) {
                Swal.showValidationMessage('Por favor, preencha todos os campos obrigatórios');
                return false;
            }
            
            // Retornar os dados do formulário
            return {
                cliente: document.getElementById('new-cliente').value,
                descricao: document.getElementById('new-descricao').value,
                altura: document.getElementById('new-altura').value,
                largura: document.getElementById('new-largura').value,
                valorMetro: document.getElementById('new-valorMetro').value,
                material: document.getElementById('new-material').value,
                quantidade: document.getElementById('new-quantidade').value,
                porcentagem: document.getElementById('new-porcentagem').value,
                vidro: document.getElementById('new-vidro').value,
                ferragem: document.getElementById('new-ferragem').value,
                valorTotal: document.getElementById('new-valorTotal').value
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Adicionar o novo produto à lista
            addNewProduct(result.value);
        }
    });
}

// Função para adicionar o novo produto à lista e ao Firestore
async function addNewProduct(productData) {
    try {
        // Abrir modal para seleção de imagem
        const imageUrl = await selectProductImage();
        if (!imageUrl) {
            Swal.fire('Aviso', 'É necessário selecionar uma imagem para o produto', 'warning');
            return;
        }

        // Incrementar o índice máximo de produtos
        maxProdutoIndex++;
        const newIndex = maxProdutoIndex;

        // Criar o elemento do produto
        const produtoDiv = document.createElement('div');
        produtoDiv.classList.add('produto');
        produtoDiv.dataset.isNew = 'true'; // Marcar como novo produto

        // Calcular dimensões para exibição
        const dimensoes = `${productData.altura}m x ${productData.largura}m`;

        // Construir o HTML do novo produto
        produtoDiv.innerHTML = `
            <button type="button" class="delete-product-button" data-index="${newIndex}"><i class="fas fa-trash"></i></button>
            <h3>Produto ${newIndex}</h3>
            <div><label for="cliente${newIndex}">Cliente</label><input type="text" id="cliente${newIndex}" name="cliente${newIndex}" value="${productData.cliente}" /></div>
            <div><label for="descricao${newIndex}">Descrição</label><input type="text" id="descricao${newIndex}" name="descricao${newIndex}" value="${productData.descricao}" /></div>
            <div><label for="dimensoes${newIndex}">Dimensões</label><input type="text" id="dimensoes${newIndex}" name="dimensoes${newIndex}" value="${dimensoes}" /></div>
            <div><label for="material${newIndex}">Material</label><input type="text" id="material${newIndex}" name="material${newIndex}" value="${productData.material}" /></div>
            <div><label for="porcentagem${newIndex}">Porcentagem</label><input type="text" id="porcentagem${newIndex}" name="porcentagem${newIndex}" value="${productData.porcentagem}" /></div>
            <div><label for="quantidade${newIndex}">Quantidade</label><input type="text" id="quantidade${newIndex}" name="quantidade${newIndex}" value="${productData.quantidade}" /></div>
            <div><label for="valorMetro${newIndex}">Valor por Metro</label><input type="text" id="valorMetro${newIndex}" name="valorMetro${newIndex}" value="${productData.valorMetro}" /></div>
            <div><label for="ferragem${newIndex}">Ferragem</label><input type="text" id="ferragem${newIndex}" name="ferragem${newIndex}" value="${productData.ferragem}" /></div>
            <div><label for="vidro${newIndex}">Vidro</label><input type="text" id="vidro${newIndex}" name="vidro${newIndex}" value="${productData.vidro}" /></div>
            <div><label for="valorTotal${newIndex}">Valor Total</label><input type="text" id="valorTotal${newIndex}" name="valorTotal${newIndex}" value="${productData.valorTotal}" /><button type="button" class="calcular-total" data-index="${newIndex}"><i class="fas fa-calculator"></i></button></div>
            <div><label for="modelo${newIndex}">Imagem</label><img id="produtoImagem${newIndex}" src="${imageUrl}" alt="Produto ${newIndex}" width="200"/></div>
            <button type="button" class="edit-image-button" data-index="${newIndex}">Editar Imagem</button>
        `;

        // Adicionar o novo produto ao container
        document.getElementById('produtos-container').appendChild(produtoDiv);

        // Adicionar eventos aos botões do novo produto
        produtoDiv.querySelector('.delete-product-button').addEventListener('click', async (e) => {
            const index = e.target.getAttribute('data-index');
            
            // Confirmação de exclusão com SweetAlert2
            const result = await Swal.fire({
                title: `Tem certeza de que deseja excluir o produto ${index}?`,
                text: "Ele será removido do orçamento.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, excluir',
                cancelButtonText: 'Cancelar',
            });
            
            if (result.isConfirmed) {
                produtoDiv.remove();
            }
        });

        produtoDiv.querySelector('.calcular-total').addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            
            // Obter os valores
            const valorMetroEl = document.getElementById(`valorMetro${index}`);
            const dimensoesEl = document.getElementById(`dimensoes${index}`);
            const materialEl = document.getElementById(`material${index}`);
            const porcentagemEl = document.getElementById(`porcentagem${index}`);
            const quantidadeEl = document.getElementById(`quantidade${index}`);
            
            if (!valorMetroEl || !dimensoesEl || !materialEl || !porcentagemEl || !quantidadeEl) {
                console.error("Algum elemento não foi encontrado");
                return;
            }
            
            // Extrair valores numéricos
            const valorMetro = parseFloat(valorMetroEl.value.replace(/[^\d.-]/g, '')) || 0;
            const dimensoes = dimensoesEl.value.split('x').map(d => parseFloat(d) || 0);
            const altura = dimensoes[0] || 0;
            const largura = dimensoes[1] || 0;
            const material = parseFloat(materialEl.value.replace(/[^\d.-]/g, '')) || 0;
            const porcentagem = parseFloat(porcentagemEl.value) || 0;
            const quantidade = parseInt(quantidadeEl.value) || 1;
            
            // Calcular total
            const total = (valorMetro * (altura * largura) + material);
            const totalFinal = (total + (total * (porcentagem / 100))) * quantidade;
            
            // Atualizar o campo
            const valorTotalField = document.getElementById(`valorTotal${index}`);
            if (valorTotalField) {
                valorTotalField.value = totalFinal.toFixed(2);
            }
        });

        produtoDiv.querySelector('.edit-image-button').addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            openImageModal(index);
        });

        // Salvar o novo produto no Firestore
        await saveNewProductToFirestore(productData, imageUrl);

        Swal.fire('Sucesso!', 'Produto adicionado com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao adicionar novo produto:", error);
        Swal.fire('Erro', 'Ocorreu um erro ao adicionar o produto.', 'error');
    }
}

// Função para selecionar uma imagem para o produto
async function selectProductImage() {
    return new Promise((resolve) => {
        // Abrir o modal de seleção de imagem
        document.getElementById('image-modal').style.display = 'flex';
        
        // Função temporária para capturar a seleção de imagem
        window.selectImageForNewProduct = (imagePath) => {
            // Fechar o modal
            document.getElementById('image-modal').style.display = 'none';
            // Retornar o caminho da imagem selecionada
            resolve(imagePath);
            // Remover a função temporária
            delete window.selectImageForNewProduct;
        };
        
        // Carregar as imagens com a função temporária
        loadImagesForNewProduct();
    });
}

// Função para carregar imagens para o novo produto
async function loadImagesForNewProduct() {
    try {
        // Carregar as imagens de cada categoria
        const responseClientes = await fetch('/listarModelos');
        const clientesImages = await responseClientes.json();

        const responseModelosFixos = await fetch('/listarModelosFixos');
        const modelosFixosImages = await responseModelosFixos.json();

        const responseNovasImages = await fetch('/listarNovos');
        const novasImages = await responseNovasImages.json();

        // Adicionar imagens nas abas correspondentes
        const clientesList = document.querySelector("#clientes #image-list");
        const fixosList = document.querySelector("#fixos #image-list");
        const novosList = document.querySelector("#novos #image-list");

        clientesList.innerHTML = ""; // Limpa antes de adicionar
        fixosList.innerHTML = "";
        novosList.innerHTML = "";

        // Adicionar imagens com evento de clique para a função temporária
        clientesImages.forEach((imagePath) => {
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = 'Modelo Cliente';
            imgElement.addEventListener('click', () => window.selectImageForNewProduct(imagePath));
            clientesList.appendChild(imgElement);
        });

        modelosFixosImages.forEach((imagePath) => {
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = 'Modelo Fixo';
            imgElement.addEventListener('click', () => window.selectImageForNewProduct(imagePath));
            fixosList.appendChild(imgElement);
        });

        novasImages.forEach((imagePath) => {
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = 'Novo Modelo';
            imgElement.addEventListener('click', () => window.selectImageForNewProduct(imagePath));
            novosList.appendChild(imgElement);
        });
    } catch (error) {
        console.error("Erro ao carregar as imagens:", error);
    }
}

// Função para salvar o novo produto no Firestore
async function saveNewProductToFirestore(productData, imageUrl) {
    try {
        if (!currentDocId) {
            console.error("ID do documento não encontrado.");
            return;
        }

        // Converter a imagem para base64 se não estiver nesse formato
        let imageBase64 = imageUrl;
        if (!imageUrl.startsWith('data:')) {
            imageBase64 = await toBase64(imageUrl);
        }

        // Criar o objeto do produto para salvar no Firestore
        const produto = {
            cliente: productData.cliente,
            descricao: productData.descricao,
            dimensoes: `${productData.altura}m x ${productData.largura}m`,
            material: productData.material,
            porcentagem: productData.porcentagem,
            quantidade: productData.quantidade,
            valorMetro: productData.valorMetro,
            ferragem: productData.ferragem,
            vidro: productData.vidro,
            valorTotal: productData.valorTotal,
            imagemBase64: imageBase64,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp() // Adicionar timestamp de criação
        };

        // Adicionar o produto à subcoleção 'subservicos'
        const docRef = await db.collection('servicos').doc(currentDocId).collection('subservicos').add(produto);
        
        // Atualizar o atributo data-doc-id do elemento do produto no DOM
        const produtosContainer = document.getElementById('produtos-container');
        const produtoElements = produtosContainer.querySelectorAll('.produto');
        const newProductElement = produtoElements[produtoElements.length - 1];
        if (newProductElement && newProductElement.dataset.isNew) {
            newProductElement.dataset.docId = docRef.id;
            delete newProductElement.dataset.isNew;
        }
        
        console.log("Produto adicionado ao Firestore com sucesso! ID:", docRef.id);
    } catch (error) {
        console.error("Erro ao salvar o produto no Firestore:", error);
        throw error;
    }
}

// Função para abrir o modal de seleção de imagem
function openImageModal(index) {
    document.getElementById('image-modal').style.display = 'flex';
    loadImages(index);
}

// Evento para fechar o modal
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('image-modal').style.display = 'none';
});

// Função para carregar as imagens do servidor
async function loadImages(index) {
    try {
        // Carregar as imagens de cada categoria
        const responseClientes = await fetch('/listarModelos');
        const clientesImages = await responseClientes.json();

        const responseModelosFixos = await fetch('/listarModelosFixos');
        const modelosFixosImages = await responseModelosFixos.json();

        const responseNovasImages = await fetch('/listarNovos');
        const novasImages = await responseNovasImages.json();

        // Adicionar imagens nas abas correspondentes
        const clientesList = document.querySelector("#clientes #image-list");
        const fixosList = document.querySelector("#fixos #image-list");
        const novosList = document.querySelector("#novos #image-list");

        clientesList.innerHTML = ""; // Limpa antes de adicionar
        fixosList.innerHTML = "";
        novosList.innerHTML = "";

        clientesImages.forEach((imagePath) => {
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = 'Modelo Cliente';
            imgElement.addEventListener('click', () => selectImage(imagePath, index));
            clientesList.appendChild(imgElement);
        });

        modelosFixosImages.forEach((imagePath) => {
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = 'Modelo Fixo';
            imgElement.addEventListener('click', () => selectImage(imagePath, index));
            fixosList.appendChild(imgElement);
        });

        novasImages.forEach((imagePath) => {
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = 'Novo Modelo';
            imgElement.addEventListener('click', () => selectImage(imagePath, index));
            novosList.appendChild(imgElement);
        });
    } catch (error) {
        console.error("Erro ao carregar as imagens:", error);
    }
}

document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.getAttribute("data-tab")).classList.add("active");
    });
});

// Função para substituir a imagem do produto
function selectImage(imagePath, index) {
    // Substituir a imagem do produto no formulário
    const produtoImagemElement = document.querySelector(`#produtoImagem${index}`);
    produtoImagemElement.src = imagePath;

    // Fechar o modal
    document.getElementById('image-modal').style.display = 'none';
}

// Função para converter imagem para base64
function toBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL();
            resolve(dataURL);
        };
        img.onerror = (error) => reject(error);
        img.src = url;
    });
}

async function dadosEmpresa() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("Nenhum usuário autenticado.");
            return null;
        }

        // Obter o documento da empresa correspondente ao usuário
        const empresaDoc = await db.collection('empresas').doc(user.uid).get();
        if (empresaDoc.exists) {
            return empresaDoc.data();
        } else {
            console.error("Dados da empresa não encontrados para o usuário autenticado.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        return null;
    }
}

async function gerarPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const empresaData = await dadosEmpresa();
    let valorTotalFinal = 0;

    // Definir uma fonte moderna, por exemplo, "Roboto"
    doc.addFont("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.ttf", "Roboto", "normal");
    doc.setFont("Roboto", "normal", 12);

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('Nenhum usuário autenticado.');
            return;
        }

        const logoDoc = await db.collection('empresas').doc(user.uid).get();
        const logoBase64 = logoDoc.exists ? logoDoc.data().logo : null;

        if (logoBase64) {
            const logoWidth = 90;
            const logoHeight = 30;
            const centerX = (doc.internal.pageSize.getWidth() - logoWidth) / 2;
            const topMargin = 10;
            doc.addImage(logoBase64, "PNG", centerX, topMargin, logoWidth, logoHeight);
        } else {
            console.error('Logo não encontrada no Firestore.');
        }

    } catch (error) {
        console.error('Erro ao obter a logo da empresa:', error);
    }

    // Informações da empresa
    doc.setFont("Roboto", "bold", 14);
    doc.setTextColor(0, 51, 102);
    doc.text(`${empresaData.nome}`, 10, 50);
    doc.setFont("Roboto", "normal", 10);
    doc.setTextColor(0, 0, 0);
    doc.text(`CNPJ: ${empresaData.cnpj}`, 10, 60);
    doc.text(`Endereço: ${empresaData.endereco}`, 10, 70);
    doc.text(`Telefone: ${empresaData.telefone}`, 10, 80);

    // Linha separadora
    doc.setDrawColor(0);
    doc.line(10, 85, 200, 85);

    // Produtos
    let currentY = 100;
    const produtos = document.getElementById("produtos-container").querySelectorAll("div.produto");

    produtos.forEach((produto, index) => {
        const cliente = produto.querySelector("input[name^='cliente']").value;
        const descricao = produto.querySelector("input[name^='descricao']").value;
        const dimensoes = produto.querySelector("input[name^='dimensoes']").value;
        const quantidade = produto.querySelector("input[name^='quantidade']").value;
        const vidro = produto.querySelector("input[name^='vidro']").value;
        const ferragem = produto.querySelector("input[name^='ferragem']").value;
        const valorTotal = produto.querySelector("input[name^='valorTotal']").value;
        valorTotalFinal += parseFloat(valorTotal);

        // Verificar se há espaço suficiente na página
        if (currentY > 250) {
            doc.addPage();  // Cria uma nova página se não houver espaço suficiente
            currentY = 10;  // Reinicia a posição Y para o topo da nova página
        }

        // Adiciona o card do produto
        const cardHeight = 63;
        const cardY = currentY;

        // Definindo o card cinza
        doc.setDrawColor(0);
        doc.setFillColor(240, 240, 240); // Cor cinza
        doc.roundedRect(10, cardY, 190, cardHeight, 5, 5, 'F'); // Card com bordas arredondadas

        // Adicionando o texto do produto no card
        const modeloY = cardY + 10;
        doc.setFont("Roboto", "bold", 7);
        doc.setTextColor(0, 51, 102);
        doc.text(`Produto ${index + 1}:`, 53, modeloY);
        doc.setTextColor(0, 0, 0);
        doc.setFont("Roboto", "normal", 7);

        // Utilizando splitTextToSize para garantir que a descrição caiba dentro do card
        const descricaoMaxWidth = 140; // Largura máxima para a descrição no card
        const descricaoLinhas = doc.splitTextToSize(`Descrição: ${descricao}`, descricaoMaxWidth);

        // Calcula a altura que será ocupada pela descrição
        const descricaoAltura = descricaoLinhas.length * 5; // 5 é o valor aproximado da altura por linha
        let nextY = modeloY + 7 + descricaoAltura;

        // Adiciona as linhas da descrição
        doc.text(descricaoLinhas, 53, modeloY + 7);

        // Adiciona as outras informações abaixo da descrição
        doc.text(`Dimensões (A x L): ${dimensoes}`, 53, nextY + 2);
        doc.text(`Quantidade: ${quantidade}`, 53, nextY + 8);
        doc.text(`Vidro: ${vidro}`, 53, nextY + 15);
        doc.text(`Ferragem: ${ferragem}`, 53, nextY + 22);
        doc.text(`Valor Total: R$ ${valorTotal}`, 53, nextY + 29);
        doc.setTextColor(0, 51, 102);

        // Se houver imagem, adicione dentro do card
        const imagemBase64 = produto.querySelector("img[id^='produtoImagem']").src;
        if (imagemBase64) {
            const imageWidth = 40; // Tamanho da imagem no PDF
            const imageHeight = 40; // Ajuste o tamanho conforme necessário

            // Verifica se a imagem cabe no card
            doc.addImage(imagemBase64, 'PNG', 10, cardY + 5, imageWidth, imageHeight); // Adiciona a imagem dentro do card
        }

        // Atualiza a posição Y para a próxima linha
        currentY += cardHeight + 10 + descricaoAltura;
    });

    // Total
    doc.setFont("Roboto", "bold", 14);
    doc.text(`Total: R$ ${valorTotalFinal.toFixed(2)}`, 10, currentY + 20);

    // Gerar PDF
    doc.save("orcamento.pdf");
}

// Função para salvar todas as alterações no Firestore
async function saveAllChanges() {
    try {
        if (!currentDocId) {
            console.error("ID do documento não encontrado.");
            return;
        }

        // Exibir modal de carregamento
        Swal.fire({
            title: 'Processando',
            text: 'Salvando alterações...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const batch = db.batch();
        const servicoRef = db.collection('servicos').doc(currentDocId);
        
        // Obter todos os produtos do formulário
        const produtos = document.querySelectorAll('#produtos-container .produto');
        
        // Para cada produto, verificar se é um produto existente ou novo
        for (const produto of produtos) {
            const docId = produto.dataset.docId;
            const index = produto.querySelector('.delete-product-button').getAttribute('data-index');
            
            // Coletar os dados do produto
            const produtoData = {
                cliente: produto.querySelector(`#cliente${index}`)?.value || '',
                descricao: produto.querySelector(`#descricao${index}`)?.value || '',
                dimensoes: produto.querySelector(`#dimensoes${index}`)?.value || '',
                material: produto.querySelector(`#material${index}`)?.value || '',
                porcentagem: produto.querySelector(`#porcentagem${index}`)?.value || '',
                quantidade: produto.querySelector(`#quantidade${index}`)?.value || '',
                valorMetro: produto.querySelector(`#valorMetro${index}`)?.value || '',
                ferragem: produto.querySelector(`#ferragem${index}`)?.value || '',
                vidro: produto.querySelector(`#vidro${index}`)?.value || '',
                valorTotal: produto.querySelector(`#valorTotal${index}`)?.value || '',
                imagemBase64: produto.querySelector(`#produtoImagem${index}`)?.src || '',
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp() // Adicionar timestamp de atualização
            };
            
            // Se o produto tem um ID de documento, atualizar
            if (docId) {
                const subservicoRef = servicoRef.collection('subservicos').doc(docId);
                batch.update(subservicoRef, produtoData);
            } 
            // Se é um produto novo (sem ID de documento), já foi adicionado pelo método saveNewProductToFirestore
        }
        
        // Atualizar também o documento principal do serviço
        batch.update(servicoRef, {
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Commitar todas as alterações
        await batch.commit();
        
        Swal.close();
        Swal.fire('Sucesso!', 'Alterações salvas com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao salvar alterações:", error);
        Swal.close();
        Swal.fire('Erro', 'Ocorreu um erro ao salvar as alterações.', 'error');
    }
}

// Evento de clique para gerar PDF
document.getElementById("generate-pdf-button").addEventListener("click", gerarPdf);