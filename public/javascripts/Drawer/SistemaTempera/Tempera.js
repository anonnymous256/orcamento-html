let items = [];
        let selectedImage = null;

        function openImageModal() {
            document.getElementById('imageModal').style.display = 'flex';
        }

        function closeImageModal() {
            document.getElementById('imageModal').style.display = 'none';
        }

        function showTab(tabId) {
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.style.display = 'none');

            document.getElementById(tabId).style.display = 'block';

            const buttons = document.querySelectorAll('.tabButton');
            buttons.forEach(button => button.style.backgroundColor = '#37474f');
            const activeButton = Array.from(buttons).find(button => button.onclick.toString().includes(tabId));
            if (activeButton) activeButton.style.backgroundColor = '#66bb6a';
        }

        // Exibe a aba de "Porta" como padrão ao abrir o modal
        document.addEventListener('DOMContentLoaded', () => {
            // Inicializa apenas as abas sem abrir o modal
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.style.display = 'none');
            document.getElementById('doorImages').style.display = 'block';
        });


        function selectImage(imagePath) {
            selectedImage = imagePath;
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Imagem selecionada com sucesso!",
                showConfirmButton: false,
                timer: 1300
            });
            closeImageModal();
        }

        function saveItemData() {
            const width = document.getElementById('width').value;
            const height = document.getElementById('height').value;
            const Quantidade = document.getElementById('Quantidade').value;
            const glassColor = document.getElementById('glassColor').value;
            const glassThickness = document.getElementById('glassThickness').value;

            if (!width || !height || !Quantidade || !glassColor || !glassThickness || !selectedImage) {
                Swal.fire({
                    position: "center",
                    icon: "info",
                    title: "Preencha todos os campos obrigatórios!",
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }

            const item = {
                width,
                height,
                Quantidade,
                glassColor,
                glassThickness,
                image: selectedImage
            };

            items.push(item);
            updatePreview();
            Swal.fire({
            position: "center",
            icon: "success",
            title: "Item adicionado com sucesso!",
            showConfirmButton: false,
            timer: 1500
          });

            document.getElementById('detailsForm').reset();
            selectedImage = null;
        }

        function updatePreview() {
            const previewList = document.getElementById('itemPreviewList');
            previewList.innerHTML = '';

            items.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <img src="${item.image}" alt="Imagem do item ${index + 1}">
                    <div>
                        <p><strong>Item ${index + 1}</strong></p>
                        <p>Largura: ${item.width} cm, Altura: ${item.height} cm</p>
                        <p>Quantidade: ${item.Quantidade}</p>
                        <p>Cor do Vidro: ${item.glassColor}, Espessura: ${item.glassThickness}</p>
                    </div>
                `;
                previewList.appendChild(listItem);
            });
        }

        async function generateFinalPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            if (items.length === 0) {
                Swal.fire({
            position: "center",
            icon: "error",
            title: "Nenhum item adicionado!",
            showConfirmButton: false,
            timer: 1500
          });
                return;
            }

            let yPosition = 10;
            const pageHeight = doc.internal.pageSize.getHeight();

            for (const [index, item] of items.entries()) {
                // Verificar se há espaço suficiente para o próximo bloco
                const blockHeight = 150; // Altura estimada para cada item completo
                if (yPosition + blockHeight > pageHeight) {
                    doc.addPage();
                    yPosition = 10;
                }

                // Calcular largura da página para centralização
                const pageWidth = doc.internal.pageSize.getWidth();

                // Destacar o título do item
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");

                const text = `Item ${index + 1}`;
                const textWidth = doc.getTextWidth(text);
                const textX = (pageWidth - textWidth) / 2;

                // Desenhar retângulo para o título do item
                const rectWidth = textWidth + 10;
                const rectX = (pageWidth - rectWidth) / 2;
                doc.rect(rectX, yPosition, rectWidth, 10, 'S');
                doc.text(text, textX, yPosition + 7);

                yPosition += 20;

                // Resetar fonte para o restante do conteúdo
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");

                doc.rect(10, yPosition, 190, 20);
                const glassColors = ["Incolor", "Fumê", "Verde", "Pontilhado", "Bronze"];
                const selectedGlassColor = glassColors.map(color => color === item.glassColor ? `[X] ${color}` : `[ ] ${color}`).join("    ");
                doc.text(`Cor do Vidro: ${selectedGlassColor}`, 15, yPosition + 10);

                yPosition += 25;

                doc.rect(10, yPosition, 190, 20);
                const glassThicknesses = ["6mm", "8mm", "10mm"];
                const selectedGlassThickness = glassThicknesses.map(thickness => thickness === item.glassThickness ? `[X] ${thickness}` : `[ ] ${thickness}`).join("    ");
                doc.text(`Espessura do Vidro: ${selectedGlassThickness}`, 15, yPosition + 10);

                yPosition += 25;

                doc.rect(10, yPosition, 190, 20);
                doc.text(`Quantidade: ${item.Quantidade}`, 15, yPosition + 10);

                yPosition += 25;

                // Adicionar imagem
                const image = await fetch(item.image).then(res => res.blob()).then(blob => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            resolve(e.target.result);
                        };
                        reader.readAsDataURL(blob);
                    });
                });

                const imageWidth = 60;
                const imageHeight = 60;
                const imageX = (pageWidth - imageWidth) / 2; // Centralizar imagem
                doc.addImage(image, 'JPEG', imageX, yPosition, imageWidth, imageHeight);

                yPosition += imageHeight + 5;

                // Verificar espaço antes de largura e altura
                if (yPosition + 40 > pageHeight) {
                    doc.addPage();
                    yPosition = 10;
                }

                // Adicionar retângulos e textos para Largura e Altura
                doc.rect(10, yPosition, 60, 15); // Largura
                doc.text(`Largura do Vão: ${item.width} cm`, 15, yPosition + 10);

                doc.rect(80, yPosition, 60, 15); // Altura
                doc.text(`Altura do Vão: ${item.height} cm`, 85, yPosition + 10);

                yPosition += 20;
            }

            doc.save("Tempera.pdf");
        }