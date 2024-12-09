const descricaoInput = document.getElementById("descricao");
const unidadeInput = document.getElementById("unidade");
const quantidadeInput = document.getElementById("quantidade");
const observacaoInput = document.getElementById("observacao");
const addServicoButton = document.getElementById("addServico");
const servicesList = document.getElementById("servicesList");
const generatePdfButton = document.getElementById("generatePdf");

const servicos = [];

addServicoButton.addEventListener("click", () => {
  const descricao = descricaoInput.value;
  const unidade = parseFloat(unidadeInput.value);
  const quantidade = parseInt(quantidadeInput.value);
  const observacao = observacaoInput.value;

  if (!descricao || isNaN(unidade) || isNaN(quantidade)) {
    Swal.fire({
        position: "center",
        icon: "error",
        title: "Por favor, preencha todos os campos!",
        showConfirmButton: false,
        timer: 1500
      });
    return;
  }

  const valor = unidade * quantidade;

  const servico = { descricao, unidade, quantidade, valor, observacao };
  servicos.push(servico);

  descricaoInput.value = "";
  unidadeInput.value = "";
  quantidadeInput.value = "";
  observacaoInput.value = "";

  renderServices();
});

function renderServices() {
  servicesList.innerHTML = "";

  servicos.forEach((servico, index) => {
    const serviceCard = document.createElement("div");
    serviceCard.classList.add("service-card");

    serviceCard.innerHTML = `
      <p><strong>Descrição:</strong> ${servico.descricao}</p>
      <p><strong>Preço por Unidade:</strong> R$${servico.unidade.toFixed(2)}</p>
      <p><strong>Quantidade:</strong> ${servico.quantidade}</p>
      <p><strong>Valor Total:</strong> R$${servico.valor.toFixed(2)}</p>
      <button onclick="editService(${index})">Editar</button>
      <button onclick="deleteService(${index})">Excluir</button>
    `;

    servicesList.appendChild(serviceCard);
  });
}

function deleteService(index) {
    Swal.fire({
      title: 'Excluir Serviço',
      text: 'Tem certeza que deseja excluir este serviço?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true 
    }).then((result) => {
      if (result.isConfirmed) {
        servicos.splice(index, 1);
        renderServices();
  
        Swal.fire({
          title: 'Excluído!',
          text: 'O serviço foi excluído com sucesso.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  }
  

function editService(index) {
    Swal.fire({
      title: 'Editar Serviço',
      text: 'Tem certeza que deseja editar este serviço?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, editar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const servico = servicos[index];
        descricaoInput.value = servico.descricao;
        unidadeInput.value = servico.unidade;
        quantidadeInput.value = servico.quantidade;
        observacaoInput.value = servico.observacao;
        servicos.splice(index, 1);
        renderServices();
  
        Swal.fire({
          title: 'Serviço em Edição',
          text: 'O serviço foi carregado para edição.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  }
  

generatePdfButton.addEventListener("click", () => {
    if(servicos.length === 0) {
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Nenhum serviço adicionado!",
            showConfirmButton: false,
            timer: 1500
        })
        return;
    }
const { jsPDF } = window.jspdf;
const doc = new jsPDF();


doc.setFillColor(40, 167, 69);
doc.rect(0, 0, 210, 20, "F");
doc.setFont("helvetica", "bold");
doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.text("Orçamento - Serviços", 10, 13);


doc.setFontSize(12);
doc.setTextColor(0, 0, 0);
let startY = 30;

const columnHeaders = ["Descrição", "Preço/Unidade", "Quantidade", "Total"];
const columnWidths = [70, 40, 30, 30]; 
const startX = 10;


doc.setFont("helvetica", "bold");
columnHeaders.forEach((header, index) => {
const columnX = startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
doc.text(header, columnX, startY);
});

startY += 5;
doc.setLineWidth(0.5);
doc.line(startX, startY, startX + columnWidths.reduce((a, b) => a + b, 0), startY);  

doc.setFont("helvetica", "normal");
let totalGeral = 0;

servicos.forEach(servico => {
startY += 10;

if (startY > 270) {
  doc.addPage();
  startY = 30;

  doc.setFont("helvetica", "bold");
  columnHeaders.forEach((header, index) => {
    const columnX = startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
    doc.text(header, columnX, startY);
  });
  startY += 5;
  doc.line(startX, startY, startX + columnWidths.reduce((a, b) => a + b, 0), startY); 
  doc.setFont("helvetica", "normal");
}

const values = [
  servico.descricao,
  `R$${servico.unidade.toFixed(2)}`,
  `${servico.quantidade}`,
  `R$${servico.valor.toFixed(2)}`
];

values.forEach((value, index) => {
  const columnX = startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
  doc.text(value, columnX, startY);
});

totalGeral += servico.valor;
});

const observacoes = servicos.filter(servico => servico.observacao.trim());
if (observacoes.length > 0) {
startY += 15;
doc.setFont("helvetica", "bold");
doc.text("Observações:", startX, startY);

doc.setFont("helvetica", "normal");
observacoes.forEach(servico => {
  startY += 10;
  doc.text(`- ${servico.observacao}`, startX, startY);
});
}

startY += 10;
doc.setFont("helvetica", "bold");
doc.text("Valor Total Geral:", startX, startY);
doc.text(`R$${totalGeral.toFixed(2)}`, startX + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0), startY, { align: "right" });

doc.save("orcamento.pdf");
});
