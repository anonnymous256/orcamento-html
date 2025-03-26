// Projeto.js
const modelsData = {};

function goBack() {
    console.log("Voltar para tela anterior do sistema");
    window.history.back();
}

function backToMainScreen() {
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('model-screen').classList.add('hidden');
}

function openModelScreen(category) {
    document.getElementById('model-screen-title').textContent = category;
    const container = document.getElementById('models-container');
    container.innerHTML = '';

    if (modelsData[category]) {
        modelsData[category].forEach((model, index) => {
            const modelCard = document.createElement('div');
            modelCard.className = 'model-card';
            modelCard.onclick = function () {
                openModelDetails(category, index);
            };
            modelCard.innerHTML = `
            <div class="model-image-container">
                <img src="${model.image}" alt="${model.title}" class="model-image">
            </div>
            <div class="model-info">
                <div style="display: flex; justify-content: space-between; width: 100%;">
                    <h6 class="model-cod"><strong>Código:</strong></h6>
                    <h6 class="model-cod">${model.Codigo}</h6>
                </div>
                <hr> <!-- Linha divisória opcional para separar as seções -->
                <h4 class="model-title"><strong>Descrição:</strong></h4>
                <p class="model-description">${model.descricao}</p>
            </div>
        `;
        container.appendChild(modelCard);
        });        
    } else {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum modelo disponível para esta categoria.</p>';
    }

    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('model-screen').classList.remove('hidden');
}

// Nova função para abrir a página de detalhes do modelo
function openModelDetails(category, index) {
    window.location.href = `/projeto-detalhamento?category=${category}&index=${index}`;
}