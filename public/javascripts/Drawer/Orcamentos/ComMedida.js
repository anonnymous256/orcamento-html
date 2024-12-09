import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-storage-compat.js';


const firebaseConfig = {
  apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
  authDomain: "orcamento-html.firebaseapp.com",
  databaseURL: "https://orcamento-html-default-rtdb.firebaseio.com",
  projectId: "orcamento-html",
  storageBucket: "orcamento-html.firebasestorage.app",
  messagingSenderId: "363402110339",
  appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
  measurementId: "G-ZMY6CHL8QW"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const form = document.getElementById('form');
const produtosEscolhidos = document.getElementById('produtos-escolhidos');
const btnModelos = document.getElementById('btn-modelos');
const btnprctmat = document.getElementById('por-mat-btn');
const clientesSelect = document.getElementById('clientes');
const btnTotal = document.getElementById('btn-total');
const btnSalvar = document.getElementById('btn-salvar');

let clienteNome = '';

// OBTER ID DO USER AUTHENTICADO

const logoImg = document.getElementById('user-logo');

// Função para obter a logo da empresa
async function obterLogoEmpresa(uid) {
    try {
        // Obter o documento do Firestore na coleção de empresas
        const empresaDoc = await db.collection('empresas').doc(uid).get();

        if (empresaDoc.exists) {
            const empresaData = empresaDoc.data();
            // Retornar o valor do campo `logo`
            return empresaData.logo || null;
        } else {
            console.error('Empresa não encontrada no Firestore.');
            return null;
        }
    } catch (error) {
        console.error('Erro ao obter a logo da empresa:', error);
        return null;
    }
}

// Detectar usuário autenticado e carregar a logo


// CARREGAR CLIENTES NO SELECT 

async function carregarClientes() {

    const noOpt = document.createElement('option');
    noOpt.setAttribute('disabled', true);
    noOpt.setAttribute('selected', true);
    noOpt.textContent = 'Selecione um cliente';
    clientesSelect.appendChild(noOpt);

    try {
        const snapshot = await db.collection('clientes').get();
        snapshot.forEach((doc) => {
            const cliente = doc.data();
            const option = document.createElement('option');
            option.value = cliente.nome;
            option.textContent = cliente.nome;
            clientesSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar os clientes:', error);
        Swal.fire('Erro!', 'Erro ao carregar os clientes.', 'error');
    }
}

// FUNCIONALIDADE DO BOTAO DE PORCENTAGEM MATERIAL


btnprctmat.addEventListener('click', () =>  {
    Swal.fire({
        title: 'Porcentagem Material',
        input: 'number',
        inputAttributes: {
            min: 0,
            max: 100,
            step: 1
        },
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        showLoaderOnConfirm: true,
        preConfirm: (porcentagemMaterial) => {
            if (!porcentagemMaterial) {
                Swal.showValidationMessage(`Porcentagem Material`);
                return;
            }
            return porcentagemMaterial;
        },        
    }).then((result) => {
        if (result.isConfirmed) {

            const porcentagemMaterial = parseFloat(result.value); 
            const material = document.getElementById('material');
            const material_value = parseFloat(material.value); 
            const material_mais_porcentagem = material_value + (material_value * (porcentagemMaterial / 100));
            material.value = material_mais_porcentagem.toFixed(2);
    
        }
    });
});


// FUNCIONALIDADE DO BOTAO DE MODELOS
btnModelos.addEventListener('click', async () => {

    const cliente = document.getElementById('clientes').value;
    const descricao = document.getElementById('descricao-servico').value.trim();
    const altura = document.getElementById('altura').value;
    const largura = document.getElementById('largura').value;
    const metro = document.getElementById('metro').value;
    const material = document.getElementById('material').value;
    const quantidade = document.getElementById('quantidade').value;
    const total = document.getElementById('total').value;
    const corVidro = document.getElementById('cor-vidro').value;
    const corFerragem = document.getElementById('cor-ferragem').value;

    clienteNome = cliente;

    if (
        cliente !== "0" &&
        descricao &&
        altura &&
        largura &&
        metro &&
        material &&
        quantidade
    ) {
        try {
            // Consumir as rotas para obter os modelos
            const responseClientes = await fetch('/listarModelos');
            if (!responseClientes.ok) {
                throw new Error(`Erro ao carregar modelos dos clientes: ${responseClientes.statusText}`);
            }
            const imagensClientes = await responseClientes.json();

            const responseFixos = await fetch('/listarModelosFixos');
            if (!responseFixos.ok) {
                throw new Error(`Erro ao carregar modelos fixos: ${responseFixos.statusText}`);
            }
            const imagensFixos = await responseFixos.json();

            if (!imagensClientes.length && !imagensFixos.length) {
                Swal.fire('Aviso!', 'Nenhum modelo disponível.', 'info');
                return;
            }

            const adicionarEventos = (imagens) => {
                document.querySelectorAll("[data-index]").forEach((el) => {
                    el.addEventListener("click", () => {
                        const index = el.getAttribute("data-index");
                        const produto = criarProduto(
                            cliente,
                            descricao,
                            altura,
                            largura,
                            metro,
                            material,
                            quantidade,
                            total,
                            imagens,
                            index,
                            corVidro,
                            corFerragem
                        );
            
                        adicionarProduto(produto);
                        Swal.close();
                        form.reset();
                    });
                });
            };

            const criarProduto = (cliente, descricao, altura, largura, metro, material, quantidade, total, imagens, index, corVidro, corFerragem) => {
                const produto = {
                    cliente,
                    descricao,
                    altura,
                    largura,
                    metro,
                    material,
                    quantidade,
                    total,
                    modelo: {
                        imagem: imagens[index],
                        nome: `Modelo ${parseInt(index) + 1}`,
                    },
                };
            
                if (corVidro) produto.corVidro = corVidro;
                if (corFerragem) produto.corFerragem = corFerragem;
            
                return produto;
            };       
            // Função para criar o grid de imagens
            const criarGridImagens = (imagens) => {
                let gridHTML = `<div style="display: flex; justify-content: space-around; flex-wrap: wrap;">`;
                imagens.forEach((imagem, index) => {
                    gridHTML += `
                        <div style="text-align: center; cursor: pointer;" data-index="${index}">
                            <img src="${imagem}" alt="${imagem}" style="width: 150px; height: 150px; margin-bottom: 10px;">
                            <p>Modelo ${index + 1}</p>
                        </div>
                    `;
                });
                gridHTML += `</div>`;
                return gridHTML;
            };

            // Criar o conteúdo do modal com abas
            const gridClientes = criarGridImagens(imagensClientes);
            const gridFixos = criarGridImagens(imagensFixos);

            const modalHTML = `
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
                    <button id="btnFixos" style="padding: 10px 20px; cursor: pointer; border: none; background-color: #007bff; color: white; border-radius: 5px;">Modelos Fixos</button>
                    <button id="btnClientes" style="padding: 10px 20px; cursor: pointer; border: none; background-color: #6c757d; color: white; border-radius: 5px;">Modelos dos Clientes</button>
                </div>
                <div id="conteudoModelos">${gridFixos}</div>
            `;

            Swal.fire({
                title: 'Selecione o modelo',
                html: modalHTML,
                showConfirmButton: false,
                didRender: () => {
                    // Alternar entre os modelos fixos e de clientes
                    const btnFixos = document.getElementById('btnFixos');
                    const btnClientes = document.getElementById('btnClientes');
                    const conteudoModelos = document.getElementById('conteudoModelos');

                    btnFixos.addEventListener('click', () => {
                        conteudoModelos.innerHTML = gridFixos;
                        btnFixos.style.backgroundColor = '#007bff';
                        btnClientes.style.backgroundColor = '#6c757d';
                        adicionarEventos(imagensFixos);
                    });

                    btnClientes.addEventListener('click', () => {
                        conteudoModelos.innerHTML = gridClientes;
                        btnClientes.style.backgroundColor = '#007bff';
                        btnFixos.style.backgroundColor = '#6c757d';
                        adicionarEventos(imagensClientes);
                    });

                    // Adicionar eventos iniciais para modelos fixos
                    adicionarEventos(imagensFixos);
                }
            });
        } catch (error) {
            console.error('Erro ao carregar os modelos:', error);
            Swal.fire('Erro!', 'Erro ao carregar os modelos.', 'error');
        }
    } else {
        Swal.fire('Erro!', 'Preencha todos os campos antes de selecionar o modelo.', 'error');
    }
});


// FUNCIONALIDADE DO BOTAO DE CALCULAR TOTAL
btnTotal.addEventListener('click', () => {
    
    const material = document.getElementById('material');
    const porcentagemGeralEl = document.getElementById('porcentagem-geral');
    const quantidadeEl = document.getElementById('quantidade');
    const valorMetroEl = document.getElementById('metro');
    const larguraEl = document.getElementById('largura');
    const alturaEl = document.getElementById('altura');

    if (
        !material || 
        !porcentagemGeralEl || 
        !quantidadeEl || 
        !valorMetroEl || 
        !larguraEl || 
        !alturaEl
    ) {
        Swal.fire('Erro!', 'Algum campo não foi encontrado no DOM.', 'error');
        return;
    }

    const materialValor = parseFloat(material.value) || 0;
    const porcentagemGeral = parseFloat(porcentagemGeralEl.value) || 0;
    const quantidade = parseFloat(quantidadeEl.value) || 0;
    const valorMetro = parseFloat(valorMetroEl.value) || 0;
    const largura = parseFloat(larguraEl.value) || 0;
    const altura = parseFloat(alturaEl.value) || 0;

    if (
        material.value === '' || 
        porcentagemGeralEl.value === '' || 
        quantidadeEl.value === '' || 
        valorMetroEl.value === '' || 
        larguraEl.value === '' || 
        alturaEl.value === ''
    ) {
        Swal.fire('Erro!', 'Preencha todos os campos antes de calcular o total.', 'error');
        return;
    }

    const total = (valorMetro * (largura * altura) + materialValor);
    const totalFinal = (total + (total * (porcentagemGeral / 100))) * quantidade;

    document.getElementById('total').value = totalFinal.toFixed(2);
});

// Adicionar produtos a serviços
function adicionarProduto(produto) {
    const li = document.createElement('li');
    const { corVidro, corFerragem } = produto;
    let text = `
        <p><strong>Material:</strong> <span class="material">${formatarParaReal(produto.material)}</span></p>
    `;

    if (corVidro) text += `<p><strong>Cor Vidro:</strong> <span class="vidro">${corVidro}</span></p>`;
    if (corFerragem) text += `<p><strong>Cor Ferragem:</strong> <span class="ferragem">${corFerragem}</span></p>`;

    li.classList.add('product-card');
    li.innerHTML = `
        <div class="product-image-div">
            <img src="${produto.modelo.imagem}" alt="${produto.modelo.imagem}" class="product-image">
        </div>
        <h3 class="product-title">${produto.modelo.nome}</h3>
        <p><strong>Cliente:</strong><span class="cliente">${produto.cliente}</span></p>
        <p><strong>Descrição:</strong> <span class="descricao">${produto.descricao}</span></p>
        <p><strong>Dimensões (A x L):</strong> <span class="dimensoes">${produto.altura}m x ${produto.largura}m</span></p>
        <p><strong>Quantidade:</strong><span class="quantidade">${produto.quantidade}</span></p>
        <p><strong>Valor/m²:</strong><span class="metro"> ${formatarParaReal(produto.metro)} </span></p>
        ${text}
        <p style="color:red"><strong>Total:</strong>R$<span class="total">${parseFloat(produto.total).toFixed(2)}</span></p>
        <div class="product-actions">
            <button class="edit-btn"><i class="fas fa-edit" style="background-color: #007bff;"></i></button>
            <button class="edit-photo-btn" style="background-color: #6c757d;"><i class="fa-solid fa-image"></i></button>
            <button class="delete-btn" style="background-color: #dc3545;"><i class="fas fa-trash"></i></button>
        </div>
    `;

    li.querySelector('.delete-btn').addEventListener('click', () => {
        li.remove();
        if (!produtosEscolhidos.children.length) {
            btnSalvar.style.display = 'none';
        }
    });

    li.querySelector('.edit-btn').addEventListener('click', () => {
        abrirModalEdicao(produto, li);
    });

    li.querySelector('.edit-photo-btn').addEventListener('click', () => {
        abrirModalEdicaoFoto(produto, li);
    });

    produtosEscolhidos.appendChild(li);
    btnSalvar.style.display = 'block';
}

async function abrirModalEdicao(produto, li) {
    const clientes = await db.collection('clientes').get();

    const clientesOptions = clientes.docs.map((doc) => {
        const data = doc.data();
        return `<option value="${data.nome}">${data.nome}</option>`;
    }).join('');

    // Gerar inputs adicionais com base nas propriedades do produto
    const camposExtras = `
        ${produto.corVidro ? `
            <label for="edit-vidro">Vidro</label>
            <input type="text" id="edit-vidro" value="${produto.corVidro}" placeholder="Vidro">` : ''}
        ${produto.corFerragem ? `
            <label for="edit-ferragem">Ferragem</label>
            <input type="text" id="edit-ferragem" value="${produto.corFerragem}" placeholder="Ferragem">` : ''}
    `;

    const modalHTML = `
    <form id="form-edicao" style="display: flex; flex-direction: column; gap: 15px;" class="swal-modal-edicao">
        <label for="edit-cliente">Cliente</label>
        <select id="edit-cliente" required>
            <option value="" disabled selected>Selecione o Cliente</option>
            ${clientesOptions}
        </select>

        <label for="edit-descricao">Descrição</label>
        <input type="text" id="edit-descricao" value="${produto.descricao}" placeholder="Descrição" required>

        <label for="edit-altura">Altura (m)</label>
        <input type="number" id="edit-altura" value="${produto.altura}" placeholder="Altura (m)" required>

        <label for="edit-largura">Largura (m)</label>
        <input type="number" id="edit-largura" value="${produto.largura}" placeholder="Largura (m)" required>

        <label for="edit-metro">Valor/m²</label>
        <input type="number" id="edit-metro" value="${produto.metro}" placeholder="Valor/m²" required>

        <label for="edit-material">Valor Material</label>
        <input type="number" id="edit-material" value="${produto.material}" placeholder="Valor Material" required>

        <label for="edit-quantidade">Quantidade</label>
        <input type="number" id="edit-quantidade" value="${produto.quantidade}" placeholder="Quantidade" required>
        
        ${camposExtras}

        <label for="edit-total">Total</label>
        <input type="number" id="edit-total" value="${parseFloat(produto.total).toFixed(2)}" placeholder="Total" required>

    </form>
    `;

    Swal.fire({
        title: 'Editar Produto',
        html: modalHTML,
        showCancelButton: true,
        confirmButtonText: 'Salvar Alterações',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const cliente = document.getElementById('edit-cliente').value;
            const descricao = document.getElementById('edit-descricao').value;
            const altura = document.getElementById('edit-altura').value;
            const largura = document.getElementById('edit-largura').value;
            const metro = document.getElementById('edit-metro').value;
            const material = document.getElementById('edit-material').value;
            const quantidade = document.getElementById('edit-quantidade').value;
            const total = document.getElementById('edit-total').value;
            const vidro = produto.corVidro ? document.getElementById('edit-vidro').value : null;
            const ferragem = produto.corFerragem ? document.getElementById('edit-ferragem').value : null;

            if (!cliente || !descricao || !altura || !largura || !metro || !material || !quantidade) {
                Swal.showValidationMessage('Preencha todos os campos corretamente.');
                return false;
            }

            produto.cliente = cliente;
            produto.descricao = descricao;
            produto.altura = altura;
            produto.largura = largura;
            produto.metro = metro;
            produto.material = material;
            produto.quantidade = quantidade;
            produto.total = total;

            if (vidro !== null) produto.corVidro = vidro;
            if (ferragem !== null) produto.corFerragem = ferragem;

            // Atualizar o card na interface
            li.querySelector('.cliente').innerHTML = `${cliente}`;
            li.querySelector('.descricao').innerHTML = `${descricao}`;
            li.querySelector('.dimensoes').innerHTML = `${altura}m x ${largura}m`;
            li.querySelector('.quantidade').innerHTML = `${quantidade}`;
            li.querySelector('.metro').innerHTML = `${formatarParaReal(metro)}`;
            li.querySelector('.material').innerHTML = `${formatarParaReal(material)}`;

            const vidroElement = li.querySelector('.vidro');
            const ferragemElement = li.querySelector('.ferragem');

            if (vidroElement) vidroElement.innerHTML = vidro ? `${vidro}` : '';
            if (ferragemElement) ferragemElement.innerHTML = ferragem ? `${ferragem}` : '';
            
            li.querySelector('.total').innerHTML = `${total}`;
        }
    });
}


async function abrirModalEdicaoFoto(produto, li) {
    
    await carregarModelos(produto, (modeloSelecionado) => {
        produto.modelo = modeloSelecionado;

        // Atualizar imagem do card na interface
        li.querySelector('.product-image').src = modeloSelecionado.imagem;

        // Atualizar o nome do modelo no card
        li.querySelector('.product-title').innerText = modeloSelecionado.nome;
    });

}
async function carregarModelos(produtoAtual = null, callback) {
    try {
        const responseClientes = await fetch('/listarModelos');
        const imagensClientes = await responseClientes.json();

        const responseFixos = await fetch('/listarModelosFixos');
        const imagensFixos = await responseFixos.json();

        // Função para criar a grid de imagens
        const criarGridImagens = (imagens) => {
            let gridHTML = `<div style="display: flex; justify-content: space-around; flex-wrap: wrap;">`;
            imagens.forEach((imagem, index) => {
                gridHTML += `
                    <div style="text-align: center; cursor: pointer;" data-index="${index}">
                        <img src="${imagem}" alt="${imagem}" style="width: 150px; height: 150px; margin-bottom: 10px;">
                        <p>Modelo ${index + 1}</p>
                    </div>
                `;
            });
            gridHTML += `</div>`;
            return gridHTML;
        };

        // Função para exibir os modelos no modal
        const exibirModelos = (imagens) => {
            return `
                <div>
                    <h3>Selecione um modelo:</h3>
                    ${criarGridImagens(imagens)}
                </div>
            `;
        };

        // Criação do conteúdo do modal
        const modalHTML = `
            <div>
                <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                    <button id="btnModelosFixos">Modelos Fixos</button>
                    <button id="btnModelosCliente">Modelos Cliente</button>
                </div>
                <div id="modelosGrid">${exibirModelos(imagensFixos)}</div>
            </div>
        `;

        // Exibe o modal com o conteúdo
        const swalInstance = await Swal.fire({
            title: 'Escolha um modelo',
            html: modalHTML,
            showConfirmButton: false,
            didRender: () => {
                // Evento de clique nos modelos
                document.querySelectorAll('[data-index]').forEach((el, index) => {
                    el.addEventListener('click', () => {
                        const imagem = el.querySelector('img').src;
                        callback({ imagem, nome: `Modelo ${index + 1}` });
                        Swal.close();
                    });
                });

                // Eventos para os botões de mudança de modelo
                document.getElementById('btnModelosFixos').addEventListener('click', () => {
                    document.getElementById('modelosGrid').innerHTML = exibirModelos(imagensFixos);
                    // Atualizar os eventos dos novos modelos exibidos
                    document.querySelectorAll('[data-index]').forEach((el, index) => {
                        el.addEventListener('click', () => {
                            const imagem = el.querySelector('img').src;
                            callback({ imagem, nome: `Modelo ${index + 1}` });
                            Swal.close();
                        });
                    });
                });

                document.getElementById('btnModelosCliente').addEventListener('click', () => {
                    document.getElementById('modelosGrid').innerHTML = exibirModelos(imagensClientes);
                    // Atualizar os eventos dos novos modelos exibidos
                    document.querySelectorAll('[data-index]').forEach((el, index) => {
                        el.addEventListener('click', () => {
                            const imagem = el.querySelector('img').src;
                            callback({ imagem, nome: `Modelo ${index + 1}` });
                            Swal.close();
                        });
                    });
                });
            }
        });

    } catch (error) {
        Swal.fire('Erro!', 'Erro ao carregar os modelos.', 'error');
    }
}

async function converterPDF() {

    //Confirmar se quer converter
    if(document.getElementById("produtos-escolhidos").children.length == 0){
        Swal.fire({
            icon: 'warning',
            title: 'Nenhum produto selecionado',
            text: 'Selecione ao menos um produto para converter para PDF.',
          });
          return;
    }
    await Swal.fire({
        title: 'Tem certeza?',
        text: ' Vocês quer converter para PDF ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, converter!'
    }).then((result) => {
        if (result.isConfirmed) {
            gerarPdf();
        }
        
    })
   
}

async function dadosEmpresa() {
    
    const empresas = await db.collection('empresas') 
    .get();
    const empresa = empresas.docs[0].data();

    return empresa;
}

async function carregarClientesId(nome) {

    console.log("nome: " + nome);
    const clientes = await db.collection('clientes').where('nome', '==', nome).get(); 
    const cliente = clientes.docs[0].data();
    return cliente;

}

async function gerarPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const empresaData = await dadosEmpresa();
    const clienteData = await carregarClientesId(clienteNome);
    let valorTotalFinal = 0;

    // Definir uma fonte moderna, por exemplo, "Roboto"
    doc.addFont("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.ttf", "Roboto", "normal");
    doc.setFont("Roboto", "normal", 12);

    try {
        // Obter o usuário autenticado
        const user = auth.currentUser;
        if (!user) {
            console.error('Nenhum usuário autenticado.');
            return;
        }

          // Obter a logo do Firestore
          const logoDoc = await db.collection('empresas').doc(user.uid).get();
          const logoBase64 = logoDoc.exists ? logoDoc.data().logo : null;
  
          if (logoBase64) {
              // Adicionar a logo ao PDF
              doc.addImage(logoBase64, "PNG", 10, 10, 50, 20); // Ajuste a posição e o tamanho conforme necessário
          } else {
              console.error('Logo não encontrada no Firestore.');
          }
      } catch (error) {
          console.error('Erro ao obter a logo da empresa:', error);
      }

    // Informações da empresa
    doc.setFont("Roboto", "bold", 14);
    doc.setTextColor(0, 51, 102); // Cor para o título da empresa
    doc.text(`${empresaData.nome}`, 10, 50);
    doc.setFont("Roboto", "normal", 10);
    doc.setTextColor(0, 0, 0); // Cor do texto padrão
    doc.text(`CNPJ: ${empresaData.cnpj}`, 10, 60);
    doc.text(`Endereço: ${empresaData.endereco}`, 10, 70);
    doc.text(`Telefone: ${empresaData.telefone}`, 10, 80);

    // Linha separadora
    doc.setDrawColor(0);
    doc.line(10, 85, 200, 85);

    // Informações do cliente
    doc.setFont("Roboto", "bold", 12);
    doc.setTextColor(0, 51, 102); // Cor para o título
    doc.text("Dados do Cliente", 10, 95);
    doc.setFont("Roboto", "normal", 10);
    doc.setTextColor(0, 0, 0); // Cor do texto
    doc.text(`Nome: ${clienteData.nome}`, 10, 105);
    doc.text(`Endereço: ${clienteData.endereco}`, 10, 115);
    doc.text(`Telefone: ${clienteData.telefone}`, 10, 125);

    // Linha separadora
    doc.setDrawColor(0);
    doc.line(10, 130, 200, 130);

    // Função para calcular o tamanho do texto
    // Função para calcular o tamanho do texto com base na largura máxima
    function getTextDimensions(text, fontSize = 12, maxWidth = 130) {
        doc.setFont("Roboto", "normal", fontSize);
        
        // Dividir o texto com base na largura máxima
        const lines = doc.splitTextToSize(text, maxWidth);

        // A altura total será a altura de uma linha multiplicada pelo número de linhas
        const textHeight = lines.length * fontSize;  
        return { width: maxWidth, height: textHeight };
    }


    // Produtos
    let currentY = 140;
    const produtos = document.getElementById("produtos-escolhidos").querySelectorAll("li");

    const baseURL = 'https://orcamento-html.onrender.com'
    produtos.forEach(async (produto, index) => {
        if (currentY > 250) {
            doc.addPage();
            currentY = 10;
        }
    
        const modelo = produto.querySelector("h3").innerText;
        const descricao = produto.querySelector(".descricao").innerText;
        const dimensoes = produto.querySelector(".dimensoes").innerText;
        const quantidade = produto.querySelector(".quantidade").innerText;
        const valorTotal = produto.querySelector(".total").innerText;
        const vidro = produto.querySelector(".vidro") ? produto.querySelector(".vidro").innerText : null;
        const ferragem = produto.querySelector(".ferragem") ? produto.querySelector(".ferragem").innerText : null;
    
        const caminhoRelativo = produto.querySelector("img").alt;

        // Construir a URL completa
        const imagemURL = baseURL + caminhoRelativo;
    
        console.log("URL da imagem completa:", imagemURL);
    
        // Busca a imagem como base64
        const imagemResponse = await fetch(imagemURL);
        const imagemBlob = await imagemResponse.blob();
        const imagemBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(imagemBlob);
        });
        
        console.log(modelo, descricao, dimensoes, quantidade, valorTotal);

        const valorNumerico = parseFloat(
            valorTotal
                .replace("R$", "") 
                .trim()
        );
    
        if (!isNaN(valorNumerico)) {
            console.log(`Valor numérico: ${valorNumerico}`);
            valorTotalFinal += valorNumerico;
        } else {
            console.error(`Valor inválido encontrado: "${valorTotal}"`);
        }

    
        // Definindo cores alternadas para os cards
        const cardColors = [
            [240, 240, 240]
        ];
    
        const currentColor = cardColors[0];
    
        // Calcular o tamanho da descrição
        const descricaoDims = getTextDimensions(descricao, 9);
        const descricaoHeight = descricaoDims.height;
    
        // Calcular altura total do card com base na descrição
        const totalCardHeight = 45 + descricaoHeight + 5; // 60px é o espaço inicial do card
    
        // Desenhando o Card com bordas arredondadas
        const cardY = currentY;
        doc.setDrawColor(0);
        doc.setFillColor(...currentColor); // Usando a cor definida para o card
        doc.roundedRect(10, cardY, 190, totalCardHeight, 5, 5, 'F'); // Card com bordas arredondadas
    
        const modeloY = cardY + 10;
        doc.setFont("Roboto", "bold", 7);
         // Cor do texto padrão
        doc.setTextColor(0, 51, 102);
        doc.text(`Modelo: ${modelo}`, 50, modeloY);
    
        doc.setTextColor(0, 0, 0);

        // Adicionando a descrição
        const descricaoY = modeloY + 7;
        doc.setFont("Roboto", "normal", 7);
        doc.text(`Descrição: ${descricao}`, 50, descricaoY, { maxWidth: 130 });

        // Ajustar a posição das dimensões para ficar mais próximo da descrição
        const dimensoesY = descricaoY + 2 + descricaoHeight/2;  // Ajustar o espaço de 5 para 3
        doc.text(`Dimensões (A x L): ${dimensoes}`, 50, dimensoesY);
    
        // Ajustar a posição da quantidade para seguir após as dimensões
        const quantidadeY = dimensoesY + 7;  // Distância entre dimensões e quantidade
        doc.text(`Quantidade: ${quantidade}`, 50, quantidadeY);
        
        let vidroY = quantidadeY;
        if(vidro != null) {
              // Distância entre quantidade e vidro
            vidroY = quantidadeY + 7;
            doc.text(`Vidro: ${vidro}`, 50, vidroY);
        }

        let ferragemY = vidroY;

        if(ferragem != null) {
            ferragemY = vidroY + 7;
            doc.text(`Ferragem: ${ferragem}`, 50, ferragemY);
        }
        const valorTotalY = ferragemY + 7;  // Distância entre quantidade e valor total
        doc.setTextColor(255, 0, 0);
        doc.text(`Valor Total: ${formatarParaReal(parseFloat(valorTotal.replace("R$", "").trim()))}`, 50, valorTotalY);

       
        doc.setTextColor(0, 0, 0);
        // Adicionando a imagem à esquerda do card com padding
        doc.addImage(imagemBase64, "JPEG", 15, cardY + 5, 30, 30);
    
        // Atualizando a posição para o próximo card
        currentY += totalCardHeight + 5;
    });
    doc.setDrawColor(0);
    doc.line(10, currentY, 200, currentY);

    doc.text(`Valor Total: ${formatarParaReal(valorTotalFinal)}`, 10, 280);
    // Baixar o PDF
    doc.save("relatorio.pdf");
}

//Salvar no firebase como mapa
btnSalvar.addEventListener('click', async () => {
    try {
        const data = {
            produtos: Array.from(produtosEscolhidos.querySelectorAll('li')).map((li) => {
                const modelo = li.querySelector('img').alt;
                const cliente = li.querySelector('.cliente').textContent;
                const descricao = li.querySelector('.descricao').textContent;
                const dimensoes = li.querySelector('.dimensoes').textContent;
                const quantidade = li.querySelector('.quantidade').textContent;3
                const valorMetro = li.querySelector('.metro').textContent;
                const material = li.querySelector('.material').textContent;
                const vidro = li.querySelector('.vidro').textContent ? li.querySelector('.vidro').textContent : 'Sem cor de vidro';
                const ferragem = li.querySelector('.ferragem').textContent ? li.querySelector('.ferragem').textContent : 'Sem cor deferragem';
                const valorTotal = li.querySelector('.total').textContent;
                return { modelo, cliente, descricao, dimensoes, quantidade, valorMetro, material, ferragem, vidro, valorTotal };
            })
        };
        if(data.produtos.length === 0) {
            Swal.fire('Erro!', 'Nenhum produto foi escolhido.', 'error');
            return;
        }

        await db.collection('servicos').add(data);

        Swal.fire('Sucesso!', 'Dados salvos com sucesso.', 'success');
    } catch (error) {
        console.error('Erro ao salvar os dados:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao salvar os dados.', 'error');
    }
});

function formatarParaReal(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

await carregarClientes();
document.getElementById("btn-converter").addEventListener("click", converterPDF);
