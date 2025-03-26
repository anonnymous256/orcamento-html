// Variáveis globais para armazenar os dados do modelo atual
let currentModel = null;
let currentCategory = null;
let cartItems = []; // Array para armazenar itens no carrinho

// Definir a variável modelsData se ela ainda não existir
if (typeof modelsData === 'undefined') {
    var modelsData = {};
}

// Função executada quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Recuperar os dados do modelo da URL
    const urlParams = new URLSearchParams(window.location.search);
    const modelIndex = urlParams.get('index');
    currentCategory = urlParams.get('category');
    
    // Carregar o carrinho do localStorage
    loadCartFromStorage();
    updateCartCount();
    
    if (modelIndex && currentCategory) {
        // Carregar os dados do modelo
        carregarDadosModelo(currentCategory, parseInt(modelIndex));
    } else {
        // Redirecionar para a página principal se não houver parâmetros
        window.location.href = '/projeto';
    }
    
    // Adicionar evento de clique ao botão de lista de materiais
    document.getElementById('lista-materiais-btn').addEventListener('click', abrirModalMateriais);
    
    // Adicionar evento de clique ao botão de gerar PDF no modal
    document.getElementById('btn-pdf-materiais').addEventListener('click', function() {
        gerarPDFMateriais(currentModel.materiais);
    });
    
    // Adicionar evento de clique ao botão de gerar PDF no header
    document.getElementById('btn-gerar-pdf').addEventListener('click', function() {
        abrirModalMateriais();
        setTimeout(() => {
            gerarPDFMateriais(currentModel.materiais);
        }, 500);
    });
    
    // Adicionar evento de clique ao botão do carrinho
    document.getElementById('btn-cart').addEventListener('click', abrirModalCarrinho);
    
    // Adicionar evento de clique ao botão de limpar carrinho
    document.getElementById('btn-clear-cart').addEventListener('click', limparCarrinho);
    
    // Adicionar evento de clique ao botão de gerar PDF do carrinho
    document.getElementById('btn-pdf-cart').addEventListener('click', function() {
        if (cartItems.length === 0) {
            alert('O carrinho está vazio. Adicione itens antes de gerar o PDF.');
            return;
        }
        gerarPDFMateriais(cartItems);
    });
    
    // Adicionar evento de clique ao botão de adicionar todos ao carrinho
    document.getElementById('btn-add-all-to-cart').addEventListener('click', adicionarTodosAoCarrinho);
});

// Função para carregar os dados do modelo selecionado
function carregarDadosModelo(category, index) {
    // Importar dinamicamente o arquivo JS correspondente à categoria
    const script = document.createElement('script');
    script.src = `/javascripts/ModelosMaterial/${category}.js`;
    
    script.onload = function() {
        // Aguardar um momento para garantir que o script foi processado
        setTimeout(function() {
            // Verificar se os dados existem
            if (modelsData && modelsData[category] && modelsData[category][index]) {
                currentModel = modelsData[category][index];
                
                // Preencher os detalhes na página
                document.getElementById('model-title').textContent = `Detalhes - ${category}`;
                document.getElementById('header-title').textContent = `${category} - Detalhes`;
                document.getElementById('detail-name').textContent = currentModel.titulo;
                document.getElementById('detail-description').textContent = currentModel.descricao;
                document.getElementById('detail-image').src = currentModel.image;
                document.getElementById('detail-image').alt = currentModel.titulo;
                
                console.log("Modelo carregado:", currentModel);
            } else {
                console.error("Dados do modelo não encontrados:", category, index, modelsData);
                alert('Modelo não encontrado!');
                window.location.href = '/projeto';
            }
        }, 100); // Pequeno delay para garantir que o script foi processado
    };
    
    script.onerror = function() {
        console.error("Erro ao carregar script:", `/javascripts/ModelosMaterial/${category}.js`);
        alert('Erro ao carregar dados do modelo!');
        window.location.href = '/projeto';
    };
    
    document.body.appendChild(script);
}

// Função para voltar para a tela de modelos
function voltarParaModelos() {
    window.history.back();
}

// Função para abrir o modal de lista de materiais
function abrirModalMateriais() {
    const modal = document.getElementById('material-modal');
    const materialList = document.getElementById('material-list');

    // Limpar a lista atual
    materialList.innerHTML = '';

    // Verificar se o modelo tem lista de materiais
    if (currentModel && currentModel.materiais && currentModel.materiais.length > 0) {
        // Criar um objeto para agrupar materiais por categoria
        let categorias = {};

        currentModel.materiais.forEach(material => {
            if (!categorias[material.categoria]) {
                categorias[material.categoria] = [];
            }
            
            // Criar uma cópia do material e adicionar um ID único
            const materialCopy = { ...material };
            materialCopy.id = `${currentCategory}_${currentModel.titulo.replace(/\s+/g, '_')}_${material.nome.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 9)}`;
            materialCopy.modeloCategoria = currentCategory;
            materialCopy.modeloTitulo = currentModel.titulo;
            materialCopy.modeloImage = currentModel.image;
            
            categorias[material.categoria].push(materialCopy);
        });

        // Preencher a lista de materiais agrupados por categoria
        for (let categoria in categorias) {
            const categoriaTitle = document.createElement('h6');
            categoriaTitle.className = 'categoria-title';
            categoriaTitle.textContent = categoria;
            materialList.appendChild(categoriaTitle);

            const categoriaContainer = document.createElement('div');
            categoriaContainer.className = 'categoria-materiais';

            categorias[categoria].forEach(material => {
                const item = document.createElement('div');
                item.className = 'material-item';
                
                // Verificar se a imagem existe
                const imageUrl = material.image || 'images/placeholder.png';
                
                // Verificar se o item já está no carrinho
                const isInCart = cartItems.some(item => 
                    item.nome === material.nome && 
                    item.modeloCategoria === material.modeloCategoria && 
                    item.modeloTitulo === material.modeloTitulo
                );
                
                item.innerHTML = `
                    <img src="${imageUrl}" alt="${material.nome}" class="material-image">
                    <div>
                        <span class="material-name"><strong>${material.nome}</strong></span>
                        ${material.quantidade ? `<div class="material-quantity">Qtd: ${material.quantidade}</div>` : ''}
                    </div>
                    <div class="material-actions">
                        <button class="btn-pdf-single" onclick="gerarPDFMaterialUnico('${material.id}')">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="${isInCart ? 'btn-remove-cart' : 'btn-add-cart'}" id="cart-btn-${material.id}" 
                            onclick="${isInCart ? 'removerDoCarrinho' : 'adicionarAoCarrinho'}('${material.id}')">
                            <i class="fas ${isInCart ? 'fa-trash' : 'fa-cart-plus'}"></i>
                        </button>
                    </div>
                `;
                categoriaContainer.appendChild(item);
            });

            materialList.appendChild(categoriaContainer);
        }
    } else {
        // Mostrar mensagem se não houver materiais
        materialList.innerHTML = '<p style="text-align: center; padding: 20px;">Nenhum material cadastrado para este modelo.</p>';
    }

    // Mostrar o modal
    modal.classList.add('show');
}

// Função para fechar o modal de materiais
function fecharModalMateriais() {
    const modal = document.getElementById('material-modal');
    modal.classList.remove('show');
}

// Função para abrir o modal do carrinho
function abrirModalCarrinho() {
    const modal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    
    // Limpar o conteúdo atual
    cartItemsContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px;"></i><p>Seu carrinho está vazio</p><p style="font-size: 14px; margin-top: 10px;">Adicione itens da lista de materiais</p></div>';
    } else {
        // Agrupar itens por modelo
        let modelos = {};
        
        cartItems.forEach(item => {
            const modelKey = `${item.modeloCategoria}_${item.modeloTitulo}`;
            if (!modelos[modelKey]) {
                modelos[modelKey] = {
                    categoria: item.modeloCategoria,
                    titulo: item.modeloTitulo,
                    image: item.modeloImage,
                    itens: []
                };
            }
            modelos[modelKey].itens.push(item);
        });
        
        // Adicionar itens agrupados por modelo
        for (let modelKey in modelos) {
            const modelo = modelos[modelKey];
            
            // Criar cabeçalho do grupo
            const groupHeader = document.createElement('div');
            groupHeader.className = 'cart-group-header';
            groupHeader.innerHTML = `
                <div class="cart-group-title">${modelo.categoria}</div>
                <button class="btn-remove-cart" onclick="removerModeloDoCarrinho('${modelKey}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(groupHeader);
            
            // Adicionar informações do modelo
            const modelInfo = document.createElement('div');
            modelInfo.className = 'cart-model-info';
            modelInfo.innerHTML = `<strong>${modelo.titulo}</strong>`;
            cartItemsContainer.appendChild(modelInfo);
            
            // Agrupar itens por categoria
            let categorias = {};
            modelo.itens.forEach(item => {
                if (!categorias[item.categoria]) {
                    categorias[item.categoria] = [];
                }
                categorias[item.categoria].push(item);
            });
            
            // Adicionar itens por categoria
            for (let categoria in categorias) {
                const categoriaTitle = document.createElement('h6');
                categoriaTitle.className = 'categoria-title';
                categoriaTitle.textContent = categoria;
                cartItemsContainer.appendChild(categoriaTitle);
                
                categorias[categoria].forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    
                    const imageUrl = item.image || 'images/placeholder.png';
                    
                    cartItem.innerHTML = `
                        <img src="${imageUrl}" alt="${item.nome}" class="material-image">
                        <div class="cart-item-info">
                            <span class="material-name"><strong>${item.nome}</strong></span>
                            ${item.quantidade ? `<div class="material-quantity">Qtd: ${item.quantidade}</div>` : ''}
                        </div>
                        <div class="material-actions">
                            <button class="btn-remove-cart" onclick="removerDoCarrinho('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    cartItemsContainer.appendChild(cartItem);
                });
            }
            
            // Adicionar separador entre modelos
            if (Object.keys(modelos).indexOf(modelKey) < Object.keys(modelos).length - 1) {
                const divider = document.createElement('hr');
                divider.style.margin = '20px 0';
                divider.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                cartItemsContainer.appendChild(divider);
            }
        }
    }
    
    modal.classList.add('show');
}

// Função para fechar o modal do carrinho
function fecharModalCarrinho() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('show');
}

// Função para adicionar um item ao carrinho
function adicionarAoCarrinho(materialId) {
    // Encontrar o material pelo ID
    let material = null;
    
    if (currentModel && currentModel.materiais) {
        for (let mat of currentModel.materiais) {
            // Verificar se o material tem o ID gerado
            if (mat.id === materialId) {
                material = mat;
                break;
            }
        }
        
        // Se não encontrou pelo ID, pode ser que o ID foi gerado dinamicamente
        if (!material) {
            for (let mat of currentModel.materiais) {
                const tempId = `${currentCategory}_${currentModel.titulo.replace(/\s+/g, '_')}_${mat.nome.replace(/\s+/g, '_')}_`;
                if (materialId.startsWith(tempId)) {
                    material = { ...mat };
                    material.id = materialId;
                    material.modeloCategoria = currentCategory;
                    material.modeloTitulo = currentModel.titulo;
                    material.modeloImage = currentModel.image;
                    break;
                }
            }
        }
    }
    
    if (material) {
        // Verificar se o item já está no carrinho
        const existingIndex = cartItems.findIndex(item => 
            item.nome === material.nome && 
            item.modeloCategoria === material.modeloCategoria && 
            item.modeloTitulo === material.modeloTitulo
        );
        
        if (existingIndex === -1) {
            // Adicionar ao carrinho
            cartItems.push({...material}); // Usar spread para criar uma cópia
            
            // Atualizar o botão
            const button = document.getElementById(`cart-btn-${materialId}`);
            if (button) {
                button.className = 'btn-remove-cart';
                button.innerHTML = '<i class="fas fa-trash"></i>';
                button.onclick = function() { removerDoCarrinho(materialId); };
            }
            
            // Salvar no localStorage
            saveCartToStorage();
            
            // Atualizar contador do carrinho
            updateCartCount();
            
            // Mostrar feedback
            showToast('Item adicionado ao carrinho');
        }
    }
}

// Função para adicionar todos os materiais do modelo atual ao carrinho
function adicionarTodosAoCarrinho() {
    if (!currentModel || !currentModel.materiais || currentModel.materiais.length === 0) {
        showToast('Não há materiais para adicionar');
        return;
    }
    
    let adicionados = 0;
    
    currentModel.materiais.forEach(material => {
        // Criar uma cópia do material com informações do modelo
        const materialCopy = { ...material };
        materialCopy.id = `${currentCategory}_${currentModel.titulo.replace(/\s+/g, '_')}_${material.nome.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 9)}`;
        materialCopy.modeloCategoria = currentCategory;
        materialCopy.modeloTitulo = currentModel.titulo;
        materialCopy.modeloImage = currentModel.image;
        
        // Verificar se o item já está no carrinho
        const existingIndex = cartItems.findIndex(item => 
            item.nome === material.nome && 
            item.modeloCategoria === materialCopy.modeloCategoria && 
            item.modeloTitulo === materialCopy.modeloTitulo
        );
        
        if (existingIndex === -1) {
            // Adicionar ao carrinho
            cartItems.push(materialCopy);
            adicionados++;
        }
    });
    
    if (adicionados > 0) {
        // Salvar no localStorage
        saveCartToStorage();
        
        // Atualizar contador do carrinho
        updateCartCount();
        
        // Atualizar os botões na lista de materiais
        abrirModalMateriais();
        
        // Mostrar feedback
        showToast(`${adicionados} item(s) adicionado(s) ao carrinho`);
    } else {
        showToast('Todos os itens já estão no carrinho');
    }
}

// Função para remover um item do carrinho
function removerDoCarrinho(materialId) {
    // Encontrar o índice do item no carrinho
    const index = cartItems.findIndex(item => item.id === materialId);
    
    if (index !== -1) {
        // Remover do array
        cartItems.splice(index, 1);
        
        // Atualizar o botão se estiver visível
        const button = document.getElementById(`cart-btn-${materialId}`);
        if (button) {
            button.className = 'btn-add-cart';
            button.innerHTML = '<i class="fas fa-cart-plus"></i>';
            button.onclick = function() { adicionarAoCarrinho(materialId); };
        }
        
        // Salvar no localStorage
        saveCartToStorage();
        
        // Atualizar contador do carrinho
        updateCartCount();
        
        // Atualizar o modal do carrinho se estiver aberto
        if (document.getElementById('cart-modal').classList.contains('show')) {
            abrirModalCarrinho();
        }
        
        // Mostrar feedback
        showToast('Item removido do carrinho');
    }
}

// Função para remover todos os itens de um modelo do carrinho
function removerModeloDoCarrinho(modelKey) {
    const [categoria, titulo] = modelKey.split('_');
    
    // Filtrar os itens para manter apenas os que não são deste modelo
    const originalLength = cartItems.length;
    cartItems = cartItems.filter(item => 
        !(item.modeloCategoria === categoria && item.modeloTitulo.replace(/\s+/g, '_') === titulo)
    );
    
    const removidos = originalLength - cartItems.length;
    
    if (removidos > 0) {
        // Salvar no localStorage
        saveCartToStorage();
        
        // Atualizar contador do carrinho
        updateCartCount();
        
        // Atualizar o modal do carrinho
        abrirModalCarrinho();
        
        // Mostrar feedback
        showToast(`${removidos} item(s) removido(s) do carrinho`);
    }
}

// Função para limpar o carrinho
function limparCarrinho() {
    if (cartItems.length === 0) return;
    
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        cartItems = [];
        saveCartToStorage();
        updateCartCount();
        abrirModalCarrinho(); // Atualizar a visualização
        showToast('Carrinho limpo com sucesso');
    }
}

// Função para atualizar o contador de itens no carrinho
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    countElement.textContent = cartItems.length;
    
    if (cartItems.length === 0) {
        countElement.style.display = 'none';
    } else {
        countElement.style.display = 'flex';
    }
}

// Função para salvar o carrinho no localStorage
function saveCartToStorage() {
    localStorage.setItem('materialCart', JSON.stringify(cartItems));
}

// Função para carregar o carrinho do localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('materialCart');
    if (savedCart) {
        try {
            cartItems = JSON.parse(savedCart);
        } catch (e) {
            console.error('Erro ao carregar carrinho:', e);
            cartItems = [];
        }
    }
}

// Função para mostrar um toast de feedback
function showToast(message) {
    // Verificar se já existe um toast
    let toast = document.querySelector('.toast');
    
    if (toast) {
        // Se já existe, remover para criar um novo
        toast.remove();
    }
    
    // Criar o elemento toast
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Adicionar ao DOM
    document.body.appendChild(toast);
    
    // Forçar reflow para permitir a animação
    void toast.offsetWidth;
    
    // Mostrar o toast
    toast.style.opacity = '1';
    
    // Remover após alguns segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

// Função para gerar PDF de um único material
function gerarPDFMaterialUnico(materialId) {
    // Primeiro, procurar no modelo atual
    let material = null;
    
    if (currentModel && currentModel.materiais) {
        material = currentModel.materiais.find(m => m.id === materialId);
        
        // Se não encontrou pelo ID, pode ser que o ID foi gerado dinamicamente
        if (!material) {
            for (let mat of currentModel.materiais) {
                const tempId = `${currentCategory}_${currentModel.titulo.replace(/\s+/g, '_')}_${mat.nome.replace(/\s+/g, '_')}_`;
                if (materialId.startsWith(tempId)) {
                    material = { ...mat };
                    material.id = materialId;
                    material.modeloCategoria = currentCategory;
                    material.modeloTitulo = currentModel.titulo;
                    material.modeloImage = currentModel.image;
                    break;
                }
            }
        }
    }
    
    // Se não encontrou no modelo atual, procurar no carrinho
    if (!material) {
        material = cartItems.find(m => m.id === materialId);
    }
    
    if (material) {
        // Gerar PDF apenas para este material
        gerarPDFMateriais([material]);
    }
}

// Função para gerar PDF dos materiais
function gerarPDFMateriais(materiais) {
    // Verificar se as bibliotecas estão carregadas
    if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
        alert('Erro: Bibliotecas necessárias não foram carregadas.');
        return;
    }
    
    // Verificar se há materiais para gerar o PDF
    if (!materiais || materiais.length === 0) {
        alert('Não há materiais para gerar o PDF.');
        return;
    }

    // Criar o conteúdo do PDF
    const pdfContent = document.getElementById('pdf-content');
    pdfContent.innerHTML = ''; // Limpar conteúdo anterior
    
    // Adicionar cabeçalho
    const header = document.createElement('div');
    header.className = 'pdf-header';
    header.innerHTML = `
        <h1>Lista de Materiais</h1>
        <p>Data: ${new Date().toLocaleDateString()}</p>
    `;
    pdfContent.appendChild(header);
    
    // Verificar se estamos gerando PDF para um único modelo ou para múltiplos (carrinho)
    const isMultiModel = materiais !== currentModel.materiais;
    
    if (!isMultiModel) {
        // Adicionar informações do modelo atual
        const modelSection = document.createElement('div');
        modelSection.className = 'pdf-model';
        modelSection.innerHTML = `
            <img src="${currentModel.image}" alt="${currentModel.titulo}" class="pdf-model-image">
            <div class="pdf-model-info">
                <div class="pdf-model-name">${currentModel.titulo}</div>
                <div class="pdf-model-description">${currentModel.descricao}</div>
            </div>
        `;
        pdfContent.appendChild(modelSection);
    } else {
        // Para o carrinho, agrupar por modelo
        let modelos = {};
        
        materiais.forEach(material => {
            const modelKey = `${material.modeloCategoria}_${material.modeloTitulo}`;
            if (!modelos[modelKey]) {
                modelos[modelKey] = {
                    categoria: material.modeloCategoria,
                    titulo: material.modeloTitulo,
                    image: material.modeloImage,
                    itens: []
                };
            }
            modelos[modelKey].itens.push(material);
        });
        
        // Adicionar cada modelo
        for (let modelKey in modelos) {
            const modelo = modelos[modelKey];
            
            const modelSection = document.createElement('div');
            modelSection.className = 'pdf-model';
            modelSection.innerHTML = `
                <img src="${modelo.image}" alt="${modelo.titulo}" class="pdf-model-image">
                <div class="pdf-model-info">
                    <div class="pdf-model-name">${modelo.categoria} - ${modelo.titulo}</div>
                </div>
            `;
            pdfContent.appendChild(modelSection);
            
            // Adicionar título da lista de materiais para este modelo
            const materialsTitle = document.createElement('h2');
            materialsTitle.className = 'pdf-materials-title';
            materialsTitle.textContent = `Materiais - ${modelo.categoria}`;
            pdfContent.appendChild(materialsTitle);
            
            // Agrupar materiais por categoria
            let categorias = {};
            modelo.itens.forEach(material => {
                if (!categorias[material.categoria]) {
                    categorias[material.categoria] = [];
                }
                categorias[material.categoria].push(material);
            });
            
            // Adicionar materiais por categoria
            for (let categoria in categorias) {
                const categoryTitle = document.createElement('h3');
                categoryTitle.className = 'pdf-materials-title';
                categoryTitle.textContent = categoria;
                pdfContent.appendChild(categoryTitle);
                
                categorias[categoria].forEach(material => {
                    const materialItem = document.createElement('div');
                    materialItem.className = 'pdf-material-item';
                    
                    // Verificar se a imagem existe
                    const imageUrl = material.image || 'images/placeholder.png';
                    
                    materialItem.innerHTML = `
                        <img src="${imageUrl}" alt="${material.nome}" class="pdf-material-image">
                        <div class="pdf-material-info">
                            <div class="pdf-material-name">${material.nome}</div>
                            ${material.quantidade ? `<div class="pdf-material-quantity">Quantidade: ${material.quantidade}</div>` : ''}
                        </div>
                    `;
                    pdfContent.appendChild(materialItem);
                });
            }
            
            // Adicionar separador entre modelos
            if (Object.keys(modelos).indexOf(modelKey) < Object.keys(modelos).length - 1) {
                const divider = document.createElement('hr');
                divider.style.margin = '20px 0';
                divider.style.borderColor = '#ccc';
                pdfContent.appendChild(divider);
            }
        }
    }
    
    // Tornar o conteúdo visível temporariamente para capturar
    pdfContent.style.display = 'block';
    
    // Usar html2canvas para capturar o conteúdo
    html2canvas(pdfContent, {
        scale: 2, // Melhor qualidade
        useCORS: true, // Permitir imagens de outros domínios
        logging: false
    }).then(canvas => {
        // Esconder o conteúdo novamente
        pdfContent.style.display = 'none';
        
        // Criar o PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Dimensões da página A4
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Converter o canvas para imagem
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Calcular a altura proporcional para manter a proporção
        const imgWidth = pageWidth - 20; // Margem de 10mm em cada lado
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Adicionar a imagem ao PDF
        let heightLeft = imgHeight;
        let position = 10; // Posição Y inicial (10mm do topo)
        
        // Adicionar a primeira página
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20); // Altura restante após a primeira página
        
        // Adicionar páginas adicionais se necessário
        while (heightLeft > 0) {
            position = heightLeft - imgHeight; // Posição negativa para mover a imagem para cima
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 20);
        }
        
        // Definir nome do arquivo
        let fileName = 'lista_materiais';
        if (isMultiModel) {
            fileName = 'materiais_multiplos_modelos';
        } else if (materiais.length === 1) {
            fileName = `material_${materiais[0].nome.replace(/\s+/g, '_')}`;
        } else {
            fileName = `materiais_${currentCategory}_${currentModel.titulo.replace(/\s+/g, '_')}`;
        }
        
        // Salvar o PDF
        pdf.save(`${fileName}.pdf`);
    }).catch(error => {
        console.error('Erro ao gerar o PDF:', error);
        alert('Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.');
        pdfContent.style.display = 'none';
    });
}