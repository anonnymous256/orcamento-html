// Variáveis globais para armazenar os dados do modelo atual
let currentModel = null;
let currentCategory = null;

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
        perguntarQuantidadeMateriais();
    });
});

// Função para carregar os dados do modelo selecionado
function carregarDadosModelo(category, index) {
    const script = document.createElement('script');
    script.src = `/javascripts/ModelosMaterial/${category}.js`;
    
    script.onload = function() {
        setTimeout(function() {
            if (modelsData && modelsData[category] && modelsData[category][index]) {
                currentModel = modelsData[category][index];
                currentModel.categoria = category;
                currentModel.index = index;
                
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
        }, 100);
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

    materialList.innerHTML = '';

    if (currentModel && currentModel.materiais && currentModel.materiais.length > 0) {
        let categorias = {};

        currentModel.materiais.forEach(material => {
            if (!categorias[material.categoria]) {
                categorias[material.categoria] = [];
            }
            categorias[material.categoria].push(material);
        });

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
                const imageUrl = material.image || 'images/placeholder.png';
                
                item.innerHTML = `
                    <img src="${imageUrl}" alt="${material.nome}" class="material-image">
                    <div>
                        <span class="material-name"><strong>${material.nome}</strong></span>
                        ${material.quantidade ? `<div class="material-quantity">Qtd: ${material.quantidade}</div>` : ''}
                    </div>
                `;
                categoriaContainer.appendChild(item);
            });

            materialList.appendChild(categoriaContainer);
        }
    } else {
        materialList.innerHTML = '<p style="text-align: center; padding: 20px;">Nenhum material cadastrado para este modelo.</p>';
    }

    modal.classList.add('show');
}

// Função para fechar o modal de materiais
function fecharModalMateriais() {
    const modal = document.getElementById('material-modal');
    modal.classList.remove('show');
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

// Função para perguntar a quantidade de materiais antes de gerar o PDF
function perguntarQuantidadeMateriais() {
    if (!currentModel || !currentModel.materiais || currentModel.materiais.length === 0) {
        alert('Nenhum material disponível para gerar o PDF.');
        return;
    }

    // Criar modal para perguntar a quantidade
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalQuantidade = document.createElement('div');
    modalQuantidade.className = 'modal-quantidade';
    
    modalQuantidade.innerHTML = `
        <div class="modal-header">
            <h3>Quantidade de Materiais</h3>
            <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">
            <p>Informe o multiplicador para a quantidade de materiais:</p>
            <div class="quantidade-input">
                <button class="btn-qtd minus">-</button>
                <input type="number" id="multiplicador" value="1" min="1" max="100">
                <button class="btn-qtd plus">+</button>
            </div>
            <p class="info-text">Isso multiplicará todas as quantidades de materiais pelo valor informado.</p>
        </div>
        <div class="modal-footer">
            <button class="btn-cancelar">Cancelar</button>
            <button class="btn-confirmar">Confirmar</button>
        </div>
    `;
    
    modalOverlay.appendChild(modalQuantidade);
    document.body.appendChild(modalOverlay);
    
    // Adicionar estilos inline para o modal
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .modal-quantidade {
            background-color: white;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.3s ease;
        }
        
        .modal-header {
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-footer {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .quantidade-input {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
        }
        
        #multiplicador {
            width: 80px;
            text-align: center;
            font-size: 18px;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 0 10px;
        }
        
        .btn-qtd {
            width: 40px;
            height: 40px;
            font-size: 20px;
            background-color: #f1f1f1;
            border: none;
            border-radius: 50%;
            cursor: pointer;
        }
        
        .btn-qtd:hover {
            background-color: #e0e0e0;
        }
        
        .btn-cancelar, .btn-confirmar {
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .btn-cancelar {
            background-color: #f1f1f1;
            color: #333;
        }
        
        .btn-confirmar {
            background-color: #2980b9;
            color: white;
        }
        
        .info-text {
            font-size: 12px;
            color: #777;
            text-align: center;
            margin-top: 10px;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    
    document.head.appendChild(style);
    
    // Adicionar eventos aos botões
    const btnMinus = modalQuantidade.querySelector('.minus');
    const btnPlus = modalQuantidade.querySelector('.plus');
    const inputMultiplicador = modalQuantidade.querySelector('#multiplicador');
    const btnCancelar = modalQuantidade.querySelector('.btn-cancelar');
    const btnConfirmar = modalQuantidade.querySelector('.btn-confirmar');
    const btnClose = modalQuantidade.querySelector('.close-modal');
    
    btnMinus.addEventListener('click', () => {
        const valor = parseInt(inputMultiplicador.value);
        if (valor > 1) {
            inputMultiplicador.value = valor - 1;
        }
    });
    
    btnPlus.addEventListener('click', () => {
        const valor = parseInt(inputMultiplicador.value);
        if (valor < 100) {
            inputMultiplicador.value = valor + 1;
        }
    });
    
    btnCancelar.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    btnClose.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    btnConfirmar.addEventListener('click', () => {
        const multiplicador = parseInt(inputMultiplicador.value) || 1;
        document.body.removeChild(modalOverlay);
        
        // Criar uma cópia do modelo atual para não afetar o original
        const modeloComQuantidade = JSON.parse(JSON.stringify(currentModel));
        
        // Multiplicar as quantidades
        if (modeloComQuantidade.materiais && modeloComQuantidade.materiais.length > 0) {
            modeloComQuantidade.materiais.forEach(material => {
                if (material.quantidade) {
                    // Se for um número, multiplicar
                    const qtdOriginal = parseInt(material.quantidade) || 1;
                    material.quantidade = qtdOriginal * multiplicador;
                } else {
                    // Se não tiver quantidade, definir como o multiplicador
                    material.quantidade = multiplicador;
                }
            });
        }
        
        // Gerar o PDF com as quantidades ajustadas
        gerarPDFMateriais(modeloComQuantidade);
    });
}

// Função para gerar PDF dos materiais com estilo profissional
function gerarPDFMateriais(modelo) {
    if (!modelo || !modelo.materiais || modelo.materiais.length === 0) {
        alert('Nenhum material disponível para gerar o PDF.');
        return;
    }

    // Cores para o PDF
    const cores = {
        primaria: [41, 128, 185], // Azul
        secundaria: [52, 73, 94], // Azul escuro
        texto: [44, 62, 80], // Quase preto
        cinzaClaro: [236, 240, 241], // Cinza muito claro
        cinzaMedio: [189, 195, 199], // Cinza médio
        branco: [255, 255, 255],
        destaque: [231, 76, 60] // Vermelho
    };

    // Iniciar o PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Configurações de página
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    let yPos = margin;

    // Função para adicionar texto com quebra de linha
    function addWrappedText(text, x, y, maxWidth, lineHeight, align = 'left') {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y, { align: align });
        return y + (lines.length * lineHeight);
    }

   

    // Título do modelo
    pdf.setTextColor(...cores.secundaria);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`LISTA DE MATERIAIS`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    pdf.setTextColor(...cores.secundaria);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${modelo.categoria} - ${modelo.titulo}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Descrição do modelo
    if (modelo.descricao) {
        pdf.setTextColor(...cores.texto);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPos = addWrappedText(modelo.descricao, margin, yPos, contentWidth, 5);
        yPos += 5;
    }

    // Adicionar imagem do modelo principal
    if (modelo.image) {
        // Carregar a imagem
        const img = new Image();
        img.src = modelo.image;
        
        // Função para continuar o PDF após carregar a imagem
        function continuarPDF() {
            try {
                // Calcular dimensões proporcionais
                const imgWidth = 60;
                const imgHeight = img.height * (imgWidth / img.width);
                
                // Verificar se a imagem cabe na página atual
                if (yPos + imgHeight + 10 > pageHeight - 20) {
                    // Adicionar nova página
                    pdf.addPage();
                    yPos = margin;
                }
                
                // Adicionar a imagem
                pdf.addImage(img, 'JPEG', (pageWidth - imgWidth) / 2, yPos, imgWidth, imgHeight);
                
                yPos += imgHeight + 10;
                
                // Adicionar título da seção de materiais
                pdf.setFillColor(...cores.secundaria);
                pdf.rect(margin, yPos, contentWidth, 8, 'F');
                
                pdf.setTextColor(...cores.branco);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text('MATERIAIS NECESSÁRIOS', margin + 5, yPos + 5.5);
                
                yPos += 12;
                
                // Agrupar materiais por categoria
                let categorias = {};
                modelo.materiais.forEach(material => {
                    if (!categorias[material.categoria]) {
                        categorias[material.categoria] = [];
                    }
                    categorias[material.categoria].push(material);
                });
                
                // Processar cada categoria
                for (let categoria in categorias) {
                    // Verificar se precisa de nova página
                    if (yPos + 20 > pageHeight - 20) {
                        // Adicionar nova página
                        pdf.addPage();
                        yPos = margin;
                    }
                    
                    // Título da categoria
                    pdf.setFillColor(...cores.cinzaClaro);
                    pdf.rect(margin, yPos, contentWidth, 7, 'F');
                    
                    pdf.setTextColor(...cores.secundaria);
                    pdf.setFontSize(11);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(categoria.toUpperCase(), margin + 5, yPos + 5);
                    
                    yPos += 10;
                    
                    // Processar materiais desta categoria
                    categorias[categoria].forEach((material, idx) => {
                        // Altura estimada para este item (reduzida)
                        const itemHeight = 25; // Altura reduzida para o item com imagem
                        
                        // Verificar se precisa de nova página
                        if (yPos + itemHeight > pageHeight - 20) {
                            // Adicionar nova página
                            pdf.addPage();
                            yPos = margin;
                        }
                        
                        // Fundo alternado para os itens
                        if (idx % 2 === 0) {
                            pdf.setFillColor(...cores.cinzaClaro);
                            pdf.rect(margin, yPos - 3, contentWidth, itemHeight, 'F');
                        }
                        
                        // Carregar imagem do material
                        const materialImg = new Image();
                        materialImg.src = material.image || 'images/placeholder.png';
                        
                        // Adicionar imagem do material
                        if (materialImg.complete) {
                            const materialImgWidth = 20; // Tamanho reduzido
                            const materialImgHeight = 20; // Tamanho reduzido
                            pdf.addImage(materialImg, 'JPEG', margin + 5, yPos, materialImgWidth, materialImgHeight);
                            
                            // Adicionar informações do material
                            pdf.setTextColor(...cores.texto);
                            pdf.setFontSize(10);
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(material.nome, margin + materialImgWidth + 10, yPos + 8);
                            
                            pdf.setFontSize(9);
                            pdf.setFont('helvetica', 'normal');
                            pdf.text(`Quantidade: ${material.quantidade || 'Não especificada'}`, margin + materialImgWidth + 10, yPos + 16);
                            
                            yPos += itemHeight;
                        } else {
                            // Se a imagem não carregou, adicionar apenas o texto
                            pdf.setTextColor(...cores.texto);
                            pdf.setFontSize(10);
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(material.nome, margin + 5, yPos + 5);
                            
                            pdf.setFontSize(9);
                            pdf.setFont('helvetica', 'normal');
                            pdf.text(`Quantidade: ${material.quantidade || 'Não especificada'}`, margin + 5, yPos + 12);
                            
                            yPos += 20;
                        }
                    });
                    
                    yPos += 3; // Espaço reduzido após cada categoria
                }
                
            
                // Salvar o PDF
                const fileName = `materiais_${modelo.categoria}_${modelo.titulo.replace(/\s+/g, '_')}.pdf`;
                pdf.save(fileName);
                
                // Mostrar mensagem de sucesso
                showToast('PDF gerado com sucesso!');
            } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
            }
        }
        
        // Verificar se a imagem já está carregada
        if (img.complete) {
            continuarPDF();
        } else {
            // Aguardar o carregamento da imagem
            img.onload = continuarPDF;
            img.onerror = function() {
                console.warn('Erro ao carregar imagem do modelo. Continuando sem imagem.');
                continuarPDF();
            };
        }
    } else {
        // Se não houver imagem do modelo, continuar sem ela
        continuarPDF();
    }
    
    // Função para continuar sem imagem do modelo
    function continuarPDF() {
        // Adicionar título da seção de materiais
        pdf.setFillColor(...cores.secundaria);
        pdf.rect(margin, yPos, contentWidth, 8, 'F');
        
        pdf.setTextColor(...cores.branco);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MATERIAIS NECESSÁRIOS', margin + 5, yPos + 5.5);
        
        yPos += 12;
        
        // Agrupar materiais por categoria
        let categorias = {};
        modelo.materiais.forEach(material => {
            if (!categorias[material.categoria]) {
                categorias[material.categoria] = [];
            }
            categorias[material.categoria].push(material);
        });
        
        // Processar cada categoria
        for (let categoria in categorias) {
            // Verificar se precisa de nova página
            if (yPos + 20 > pageHeight - 20) {
                // Adicionar nova página
                pdf.addPage();
                yPos = margin;
            }
            
            // Título da categoria
            pdf.setFillColor(...cores.cinzaClaro);
            pdf.rect(margin, yPos, contentWidth, 7, 'F');
            
            pdf.setTextColor(...cores.secundaria);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(categoria.toUpperCase(), margin + 5, yPos + 5);
            
            yPos += 10;
            
            // Processar materiais desta categoria
            categorias[categoria].forEach((material, idx) => {
                // Altura estimada para este item (reduzida)
                const itemHeight = 25; // Altura reduzida para o item com imagem
                
                // Verificar se precisa de nova página
                if (yPos + itemHeight > pageHeight - 20) { 
                    // Adicionar nova página
                    pdf.addPage();
                    yPos = margin;
                }
                
                // Fundo alternado para os itens
                if (idx % 2 === 0) {
                    pdf.setFillColor(...cores.cinzaClaro);
                    pdf.rect(margin, yPos - 3, contentWidth, itemHeight, 'F');
                }
                
                // Carregar imagem do material
                const materialImg = new Image();
                materialImg.src = material.image || 'images/placeholder.png';
                
                // Adicionar imagem do material
                if (materialImg.complete) {
                    const materialImgWidth = 20; // Tamanho reduzido
                    const materialImgHeight = 20; // Tamanho reduzido
                    pdf.addImage(materialImg, 'JPEG', margin + 5, yPos, materialImgWidth, materialImgHeight);
                    
                    // Adicionar informações do material
                    pdf.setTextColor(...cores.texto);
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(material.nome, margin + materialImgWidth + 10, yPos + 8);
                    
                    pdf.setFontSize(9);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(`Quantidade: ${material.quantidade || 'Não especificada'}`, margin + materialImgWidth + 10, yPos + 16);
                    
                    yPos += itemHeight;
                } else {
                    // Se a imagem não carregou, adicionar apenas o texto
                    pdf.setTextColor(...cores.texto);
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(material.nome, margin + 5, yPos + 5);
                    
                    pdf.setFontSize(9);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(`Quantidade: ${material.quantidade || 'Não especificada'}`, margin + 5, yPos + 12);
                    
                    yPos += 20;
                }
            });
            
            yPos += 3; // Espaço reduzido após cada categoria
        }
        
        // Salvar o PDF
        const fileName = `materiais_${modelo.categoria}_${modelo.titulo.replace(/\s+/g, '_')}.pdf`;
        pdf.save(fileName);
        
        // Mostrar mensagem de sucesso
        showToast('PDF gerado com sucesso!');
    }
}