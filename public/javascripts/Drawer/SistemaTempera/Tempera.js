let items = [];
let selectedImage = null;

// Quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa as abas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById('PortasImagens').style.display = 'grid';
    
    // Adiciona classe active no botão da primeira aba
    document.querySelector('.tabButton').classList.add('active');
    
    // Inicializa a lista de itens com mensagem vazia
    updateEmptyState();
});

function openImageModal() {
    // Verificar se os outros campos estão preenchidos primeiro
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const Quantidade = document.getElementById('Quantidade').value;
    const glassColor = document.getElementById('glassColor').value;
    const glassThickness = document.getElementById('glassThickness').value;

    // Validar formulário antes de abrir o modal
    if (!width || !height || !Quantidade || !glassColor || !glassThickness) {
        Swal.fire({
            position: "center",
            icon: "info",
            title: "Preencha os campos primeiro",
            text: "Complete todos os campos do formulário antes de escolher uma imagem.",
            showConfirmButton: true,
            confirmButtonColor: '#2f7d32'
        });
        return;
    }

    document.getElementById('imageModal').style.display = 'flex';
    // Efeito de entrada suave
    const modalContent = document.querySelector('#imageModal > div');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    }, 50);
}

function closeImageModal() {
    const modalContent = document.querySelector('#imageModal > div');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        document.getElementById('imageModal').style.display = 'none';
    }, 300);
}

function showTab(tabId) {
    // Esconde todas as abas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.style.display = 'none');

    // Mostra a aba selecionada
    document.getElementById(tabId).style.display = 'grid';

    // Atualiza os estilos dos botões
    const buttons = document.querySelectorAll('.tabButton');
    buttons.forEach(button => button.classList.remove('active'));
    
    // Ativa o botão da aba atual
    const activeButton = Array.from(buttons).find(button => button.onclick.toString().includes(tabId));
    if (activeButton) activeButton.classList.add('active');
}

function selectImage(imagePath) {
    selectedImage = imagePath;
    closeImageModal();
    
    // Após selecionar a imagem, adiciona o item automaticamente
    saveItemData();
}

function saveItemData() {
    // Obter dados do formulário
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const Quantidade = document.getElementById('Quantidade').value;
    const glassColor = document.getElementById('glassColor').value;
    const glassThickness = document.getElementById('glassThickness').value;

    // Validar formulário
    if (!width || !height || !Quantidade || !glassColor || !glassThickness || !selectedImage) {
        Swal.fire({
            position: "center",
            icon: "info",
            title: "Formulário incompleto",
            text: "Preencha todos os campos e selecione uma imagem.",
            showConfirmButton: true,
            confirmButtonColor: '#2f7d32'
        });
        return;
    }

    // Criar objeto do item
    const item = {
        id: Date.now(), // ID único para cada item
        width,
        height,
        Quantidade,
        glassColor,
        glassThickness,
        image: selectedImage
    };

    // Adicionar à lista de itens
    items.push(item);
    updatePreview();
    
    // Feedback ao usuário
    Swal.fire({
        position: "center",
        icon: "success",
        title: "Item adicionado com sucesso!",
        showConfirmButton: false,
        timer: 1500
    });

    // Resetar formulário
    document.getElementById('detailsForm').reset();
    selectedImage = null;
}

function updateEmptyState() {
    const previewList = document.getElementById('itemPreviewList');
    
    if (items.length === 0) {
        previewList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Nenhum item adicionado ainda.</p>
                <p>Use o formulário acima para adicionar itens.</p>
            </div>
        `;
    }
}

function updatePreview() {
    const previewList = document.getElementById('itemPreviewList');
    previewList.innerHTML = '';

    if (items.length === 0) {
        updateEmptyState();
        return;
    }

    items.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.dataset.id = item.id;
        
        listItem.innerHTML = `
            <img src="${item.image}" alt="Imagem do item ${index + 1}">
            <div>
                <p><strong>Item ${index + 1}</strong></p>
                <p><i class="fas fa-ruler"></i> Dimensões: ${item.width} × ${item.height} cm</p>
                <p><i class="fas fa-layer-group"></i> Quantidade: ${item.Quantidade}</p>
                <p><i class="fas fa-palette"></i> Cor: ${item.glassColor} | <i class="fas fa-ruler-vertical"></i> Espessura: ${item.glassThickness}</p>
            </div>
            <button class="delete-btn" onclick="removeItem(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        previewList.appendChild(listItem);
    });
    
    // Adicionar estilos ao botão de remoção
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.style.backgroundColor = 'transparent';
        btn.style.border = 'none';
        btn.style.color = '#ff5252';
        btn.style.cursor = 'pointer';
        btn.style.padding = '5px';
        btn.style.fontSize = '1.2rem';
        btn.style.marginLeft = 'auto';
    });
}

function removeItem(id) {
    Swal.fire({
        title: 'Remover item?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f7d32',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, remover!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            items = items.filter(item => item.id !== id);
            updatePreview();
            
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Item removido com sucesso!",
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}

async function generateFinalPDF() {
    // Mostrar loading
    Swal.fire({
        title: 'Gerando PDF',
        html: 'Aguarde enquanto o documento está sendo gerado...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    if (items.length === 0) {
        Swal.close();
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Nenhum item adicionado!",
            text: "Adicione pelo menos um item para gerar o PDF.",
            showConfirmButton: true,
            confirmButtonColor: '#2f7d32'
        });
        return;
    }

    // Constantes para layout
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const usableWidth = pageWidth - (margin * 2);

    // Dados do documento
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR');
    const numeroDocumento = `${Date.now()}`.substring(6); // Últimos dígitos do timestamp

    // Função para criar cabeçalho em cada página
    function criarCabecalho(pagina) {
        // Linhas de decoração no topo
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, margin, pageWidth - margin, margin);
        
        // Título do documento
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        
        const titulo = "ESPECIFICAÇÕES";
        const tituloWidth = doc.getTextWidth(titulo);
        const tituloX = (pageWidth - tituloWidth) / 2;
        
        doc.text(titulo, tituloX, margin + 10);
        
        // Informações do documento
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Data: ${dataFormatada}`, margin, margin + 10);
        doc.text(`Documento Nº: ${numeroDocumento}`, pageWidth - margin - 50, margin + 10);
        
        // Linha de separação após o cabeçalho
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
        
        // Informação de página
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(`Página ${pagina}`, pageWidth - margin - 20, pageHeight - 5);
        
        // Retornar posição Y após o cabeçalho
        return margin + 25;
    }

    // Criar rodapé em cada página
    function criarRodape() {
        const rodapeY = pageHeight - 10;
        
        // Linha de separação
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(margin, rodapeY - 5, pageWidth - margin, rodapeY - 5);
        
        // Texto do rodapé
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text(`Documento gerado em ${dataFormatada}`, margin, rodapeY);
    }

    let pagina = 1;
    let yPosition = criarCabecalho(pagina);

    // Adicionar cada item ao PDF
    for (const [index, item] of items.entries()) {
        // Altura estimada para cada item completo
        const blockHeight = 160;
        
        // Verificar se há espaço suficiente para o próximo bloco
        if (yPosition + blockHeight > pageHeight - 30) {
            criarRodape();
            doc.addPage();
            pagina++;
            yPosition = criarCabecalho(pagina);
        }

        // Título do item
        doc.setFillColor(240, 240, 240);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        
        // Retângulo para o título do item
        doc.rect(margin, yPosition, usableWidth, 10, 'FD');
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        
        const itemTitle = `ITEM ${index + 1}`;
        doc.text(itemTitle, margin + 5, yPosition + 7);
        
        yPosition += 15;

        try {
            // Bloco principal para os detalhes do item
            const itemBlockStart = yPosition;
            const itemContentHeight = 120; // Aumentado para acomodar melhor o conteúdo
            
            // Container principal para os detalhes (só contorno)
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.rect(margin, yPosition, usableWidth, itemContentHeight);

            // Adicionar imagem centralizada
            try {
                const image = await fetch(item.image)
                    .then(res => res.blob())
                    .then(blob => {
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                resolve(e.target.result);
                            };
                            reader.readAsDataURL(blob);
                        });
                    });

                const imageWidth = 50;
                const imageHeight = 50;
                const imageX = (pageWidth - imageWidth) / 2;
                doc.addImage(image, 'PNG', imageX, yPosition + 5, imageWidth, imageHeight);
            } catch (error) {
                console.error("Erro ao carregar imagem:", error);
                doc.setTextColor(150, 0, 0);
                doc.setFontSize(10);
                doc.text("Erro ao carregar imagem", margin + 50, yPosition + 30);
            }

            // Avançar após a imagem
            yPosition += 60;

            // Tabela de especificações - com espaçamentos melhorados
            doc.setFontSize(10);
            
            // Bloco de dimensões
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            doc.line(margin + 5, yPosition, pageWidth - margin - 5, yPosition);
            
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("DIMENSÕES", margin + 10, yPosition + 6);
            doc.setFont("helvetica", "normal");
            
            // Três colunas de informações
            const colWidth = usableWidth / 3;
            doc.text(`Largura: ${item.width} cm`, margin + 10, yPosition + 15);
            doc.text(`Altura: ${item.height} cm`, margin + 10 + colWidth, yPosition + 15);
            doc.text(`Quantidade: ${item.Quantidade}`, margin + 10 + (colWidth * 2), yPosition + 15);
            
            // Avançar para a próxima seção
            yPosition += 20;
            
            // Bloco de cor do vidro - MELHORADO
            doc.line(margin + 5, yPosition, pageWidth - margin - 5, yPosition);
            doc.setFont("helvetica", "bold");
            doc.text("COR DO VIDRO", margin + 10, yPosition + 6);
            doc.setFont("helvetica", "normal");
            
            // Organizar cores em linha com melhor espaçamento
            const glassColors = ["Incolor", "Fumê", "Verde", "Pontilhado", "Bronze"];
            let colorX = margin + 10;
            const colorSpacing = usableWidth / glassColors.length;
            const checkboxSize = 4;
            
            glassColors.forEach(color => {
                const isSelected = color === item.glassColor;
                
                // Desenhar quadrado para checkbox
                if (isSelected) {
                   
                    
                    
                    // Checkbox preenchido
                    doc.setFillColor(0, 128, 0); // Verde para o checkbox selecionado
                    doc.rect(colorX, yPosition + 10, checkboxSize, checkboxSize, 'F');
                } else {
                    // Checkbox vazio
                    doc.setDrawColor(100, 100, 100);
                    doc.rect(colorX, yPosition + 10, checkboxSize, checkboxSize);
                }
                
                // Restaurar cor para texto
                doc.setTextColor(0, 0, 0);
                if (isSelected) {
                    doc.setFont("helvetica", "bold");
                }
                doc.text(color, colorX + checkboxSize + 2, yPosition + 15);
                if (isSelected) {
                    doc.setFont("helvetica", "normal");
                }
                
                colorX += colorSpacing;
            });
            
            // Avançar para a próxima seção
            yPosition += 20;
            
            // Bloco de espessura do vidro - MELHORADO
            doc.line(margin + 5, yPosition, pageWidth - margin - 5, yPosition);
            doc.setFont("helvetica", "bold");
            doc.text("ESPESSURA DO VIDRO", margin + 10, yPosition + 6);
            doc.setFont("helvetica", "normal");
            
            // Organizar espessuras em linha com melhor espaçamento
            const thicknesses = ["6mm", "8mm", "10mm"];
            let thicknessX = margin + 10;
            const thicknessSpacing = usableWidth / 3;
            
            thicknesses.forEach(thickness => {
                const isSelected = thickness === item.glassThickness;
                
                // Desenhar quadrado para checkbox
                if (isSelected) {
                    
                    // Checkbox preenchido
                    doc.setFillColor(0, 128, 0); // Verde para o checkbox selecionado
                    doc.rect(thicknessX, yPosition + 10, checkboxSize, checkboxSize, 'F');
                } else {
                    // Checkbox vazio
                    doc.setDrawColor(100, 100, 100);
                    doc.rect(thicknessX, yPosition + 10, checkboxSize, checkboxSize);
                }
                
                // Restaurar cor para texto
                doc.setTextColor(0, 0, 0);
                if (isSelected) {
                    doc.setFont("helvetica", "bold");
                }
                doc.text(thickness, thicknessX + checkboxSize + 2, yPosition + 15);
                if (isSelected) {
                    doc.setFont("helvetica", "normal");
                }
                
                thicknessX += thicknessSpacing;
            });
            
            // Garantir que o próximo item comece abaixo deste bloco
            yPosition = itemBlockStart + itemContentHeight + 20;
        } catch (error) {
            console.error("Erro ao gerar item:", error);
            doc.setTextColor(150, 0, 0);
            doc.setFontSize(10);
            doc.text(`Erro ao processar item ${index + 1}`, margin, yPosition);
            yPosition += 20; // Avançar mesmo em caso de erro
        }
    }

    // Adicionar rodapé na última página
    criarRodape();
    
    // Fechar o Swal de loading
    Swal.close();
    
    // Salvar o PDF
    const filename = `Especificacao_Temperados_${numeroDocumento}.pdf`;
    doc.save(filename);
    
    // Confirma que o PDF foi gerado
    Swal.fire({
        icon: 'success',
        title: 'PDF gerado com sucesso!',
        text: `O arquivo ${filename} foi gerado e está pronto para download.`,
        confirmButtonColor: '#2f7d32'
    });
}