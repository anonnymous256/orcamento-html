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

// Função para carregar os dados do orçamento
async function loadService() {
    const docId = window.location.pathname.split('/')[2];  // Captura o ID da URL
    console.log("ID do serviço capturado:", docId);

    if (!docId) {
        alert("ID do serviço não encontrado.");
        return;
    }

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
                        const produtoDiv = document.querySelector(`#produtos-container .produto:nth-child(${index})`);
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

// Carregar o serviço quando a página for carregada
loadService();



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





// Evento de clique para gerar PDF
document.getElementById("generate-pdf-button").addEventListener("click", gerarPdf);


/*
// Função para salvar as alterações
async function saveBudget(docId, produtos) {
    try {
        const servicoRef = db.collection("servicos").doc(docId);

        // Obter os documentos existentes na subcoleção 'subservicos'
        const snapshot = await servicoRef.collection("subservicos").get();
        const existentes = {};
        snapshot.forEach(doc => {
            existentes[doc.id] = doc.data();
        });

        const batch = db.batch();

        for (const produto of produtos) {
            if (produto.id) {
                const subservicoRef = servicoRef.collection("subservicos").doc(produto.id);
                const dadosExistentes = existentes[produto.id];

                // Detectar alterações
                const alterado = Object.keys(produto).some(key => produto[key] !== dadosExistentes[key]);

                console.log("Produto alterado:", produto.id, alterado, produto, dadosExistentes);

                if (alterado) {
                    try {
                        console.log(`Atualizando produto com ID: ${produto.id}`);
                        batch.update(subservicoRef, produto);
                    } catch (error) {
                        console.error(`Erro ao atualizar produto com ID: ${produto.id}`, error);
                    }
                }
            } else {
                console.warn("Produto sem ID, ignorado:", produto);
            }
        }

        console.log("Batch sendo commitado com alterações.");
        await batch.commit();
        console.log("Batch commitado com sucesso.");

        Swal.fire({
            position: "center",
            text: "Sucesso!",
            title: "Itens atualizados com sucesso!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
        });
    } catch (error) {
        console.error("Erro ao salvar orçamento:", error);
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Erro ao atualizar os itens!",
            showConfirmButton: false,
            timer: 1500,
        });
    }
}


// Evento de submit do formulário
document.getElementById("edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const docId = window.location.pathname.split('/')[2]; // Captura o ID da URL novamente

    // Coleta os dados dos produtos no formulário
    const produtos = [];
    const produtoElements = document.querySelectorAll(".produto");
    produtoElements.forEach((produtoElement, index) => {
        const produto = {};

        // Verifique e colete apenas os campos que existem
        const cliente = document.getElementById(`cliente${index}`);
        if (cliente) produto.cliente = cliente.value;

        const descricao = document.getElementById(`descricao${index}`);
        if (descricao) produto.descricao = descricao.value;

        const dimensoes = document.getElementById(`dimensoes${index}`);
        if (dimensoes) produto.dimensoes = dimensoes.value;

        const ferragem = document.getElementById(`ferragem${index}`);
        if (ferragem) produto.ferragem = ferragem.value;

        const material = document.getElementById(`material${index}`);
        if (material) produto.material = material.value;

        const quantidade = document.getElementById(`quantidade${index}`);
        if (quantidade) produto.quantidade = quantidade.value;

        const valorMetro = document.getElementById(`valorMetro${index}`);
        if (valorMetro) produto.valorMetro = valorMetro.value;

        const valorTotal = document.getElementById(`valorTotal${index}`);
        if (valorTotal) produto.valorTotal = valorTotal.value;

        const vidro = document.getElementById(`vidro${index}`);
        if (vidro) produto.vidro = vidro.value;

        // Atualiza a imagem base64
        const imagem = produtoElement.querySelector(`#produtoImagem${index}`);
        if (imagem && imagem.src) produto.imagemBase64 = imagem.src;

        // Verifica se há um ID para identificar produtos existentes
        const produtoId = produtoElement.dataset.produtoId;
        if (produtoId) produto.id = produtoId;

        // Adiciona o produto ao array
        produtos.push(produto);
    });

    // Chama a função para salvar os dados
    await saveBudget(docId, produtos);
});
*/




