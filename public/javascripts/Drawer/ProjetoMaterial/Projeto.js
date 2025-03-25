function goBack() {
    console.log("Voltar para tela anterior do sistema");
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
        modelsData[category].forEach(model => {
            const modelCard = document.createElement('div');
            modelCard.className = 'model-card';
            modelCard.innerHTML = `
                <div class="model-image-container">
                    <img src="${model.image}" alt="${model.title}" class="model-image">
                </div>
                <div class="model-info">
                    <h3 class="model-title">${model.title}</h3>
                    <p class="model-description">${model.description}</p>
                    <div class="model-price">${model.price}</div>
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