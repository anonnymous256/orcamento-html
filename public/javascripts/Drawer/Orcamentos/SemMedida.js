// Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { 
    getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
    authDomain: "orcamento-html.firebaseapp.com",
    projectId: "orcamento-html",
    storageBucket: "orcamento-html.appspot.com",
    messagingSenderId: "363402110339",
    appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
    measurementId: "G-ZMY6CHL8QW"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

auth.onAuthStateChanged(async (user) => {
  if (user) {
      console.log("Usuário autenticado:", user.uid);
      await carregarClientes(user.uid);
  } else {
      console.error("Nenhum usuário autenticado.");
      Swal.fire('Erro!', 'Usuário não autenticado.', 'error');
  }
});

async function carregarClientes() {
  const user = auth.currentUser;
  if (!user) {
      console.error('Usuário não autenticado.');
      return;
  }

  console.log("Usuário autenticado:", user.uid);

  const clientesSelect = document.getElementById("clientes");

  const noOpt = document.createElement('option');
  noOpt.setAttribute('disabled', true);
  noOpt.setAttribute('selected', true);
  noOpt.textContent = 'Selecione um cliente';
  clientesSelect.innerHTML = '';
  clientesSelect.appendChild(noOpt);

  try {
      // Consulta correta no Firestore 9+
      const clientesRef = collection(firestore, 'clientes');
      const q = query(clientesRef, where('userId', '==', user.uid), orderBy('nome', 'asc'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
          console.warn("Nenhum cliente encontrado para este usuário.");
          Swal.fire('Aviso!', 'Nenhum cliente encontrado.', 'info');
          return;
      }

      snapshot.forEach((doc) => {
          const cliente = doc.data();
          const option = document.createElement('option');
          option.value = cliente.nome;
          option.textContent = cliente.nome;
          clientesSelect.appendChild(option);
      });
  } catch (error) {
      console.error("Erro ao carregar os clientes:", error);
      Swal.fire('Erro!', 'Erro ao carregar os clientes.', 'error');
  }
}

async function dadosCliente(clienteNome) {
  const user = auth.currentUser;
  if (!user) {
    console.error('Usuário não autenticado.');
    return;
  }

  try {
    // Consulta no Firestore para obter os dados do cliente
    const clientesRef = collection(firestore, 'clientes');
    const q = query(clientesRef, where('nome', '==', clienteNome), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn("Nenhum cliente encontrado com esse nome.");
      return null;
    }

    // Pega os dados do primeiro cliente encontrado (presumindo que o nome é único para o usuário)
    const cliente = snapshot.docs[0].data();
    return cliente;
  } catch (error) {
    console.error("Erro ao buscar os dados do cliente:", error);
    return null;
  }
}



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

async function dadosEmpresa() {
  try {
      const user = auth.currentUser;
      if (!user) {
          console.error("Nenhum usuário autenticado.");
          return null;
      }

      const empresaRef = doc(firestore, 'empresas', user.uid); // Usando firestore corretamente
      const empresaDoc = await getDoc(empresaRef);

      if (empresaDoc.exists()) {
          return empresaDoc.data();
      } else {
          console.error("Dados da empresa não encontrados.");
          return null;
      }
  } catch (error) {
      console.error("Erro ao buscar dados da empresa:", error);
      return null;
  }
}


generatePdfButton.addEventListener("click", async () => { 
  const clienteNome = document.getElementById("clientes").value;
  if (!clienteNome) {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "Selecione um cliente!",
      showConfirmButton: false,
      timer: 1500
    });
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // 🏢 Obtendo os dados da empresa
  const empresa = await dadosEmpresa();
  let logoBase64 = empresa?.logo || null; // Logo da empresa em Base64

  let startY = 10; // Posição inicial dos elementos

  // 🔥 Adicionando a logo centralizada no topo
  if (logoBase64) {
      const imgWidth = 50; // Largura da logo
      const imgHeight = 50; // Altura da logo

      const pageWidth = doc.internal.pageSize.getWidth(); // Largura da página
      const centerX = (pageWidth - imgWidth) / 2; // Centralizando

      doc.addImage(logoBase64, 'JPEG', centerX, startY, imgWidth, imgHeight);
      startY += imgHeight + 10; // Adiciona espaço extra abaixo da logo
  }

  // 🔹 Exibindo dados da empresa com uma formatação mais profissional
  if (empresa) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(empresa.nome, 10, startY); // Nome da empresa
      doc.setFont("helvetica", "normal");

      if (empresa.endereco) {
          startY += 8;
          doc.setFontSize(12);
          doc.text(empresa.endereco, 10, startY); // Endereço da empresa
      }

      if (empresa.cnpj) {
          startY += 8;
          doc.text(`CNPJ: ${empresa.cnpj}`, 10, startY); // CNPJ da empresa
      }

      if (empresa.telefone) {
          startY += 8;
          doc.text(`Telefone: ${empresa.telefone}`, 10, startY); // Telefone da empresa
      }

      startY += 15; // Espaço extra após os dados da empresa
  }

  // Linha de separação após o cabeçalho
  doc.setLineWidth(0.5);
  doc.line(10, startY, 200, startY); // Desenha uma linha de 180mm (largura da página)
  startY += 5; // Espaço após a linha de separação

  // Exibir os dados do cliente
  const clienteData = await dadosCliente(clienteNome);
  if (clienteData) {
    // Dados do cliente
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Exibe os dados do cliente de forma organizada
    doc.text(`Nome do Cliente: ${clienteData.nome}`, 10, startY);
    startY += 7;
    doc.text(`Endereço: ${clienteData.endereco || 'Não disponível'}`, 10, startY);
    startY += 7;
    doc.text(`Telefone: ${clienteData.telefone || 'Não disponível'}`, 10, startY);
    startY += 7;
    doc.text(`Email: ${clienteData.email || 'Não disponível'}`, 10, startY);
    startY += 10;
    
    // Adicionar linha de separação entre dados do cliente e os itens do orçamento
    doc.setLineWidth(0.5);
    doc.line(10, startY, 200, startY);
    startY += 5;
  }

  // 🔹 Tabela de serviços
  const columnHeaders = ["Descrição", "Preço/Unidade", "Quantidade", "Total"];
  const columnWidths = [80, 40, 30, 40]; // Ajuste nas larguras das colunas
  const tableStartX = 10;

  doc.setFont("helvetica", "bold");
  columnHeaders.forEach((header, index) => {
      const columnX = tableStartX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
      doc.text(header, columnX, startY);
  });

  startY += 5;
  doc.setLineWidth(0.5);
  doc.line(tableStartX, startY, tableStartX + columnWidths.reduce((a, b) => a + b, 0), startY);

  doc.setFont("helvetica", "normal");
  let totalGeral = 0;

  servicos.forEach(servico => {
      startY += 10;

      // Adicionar nova página se necessário
      if (startY > 250) {
          doc.addPage();
          startY = 30;

          doc.setFont("helvetica", "bold");
          columnHeaders.forEach((header, index) => {
              const columnX = tableStartX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
              doc.text(header, columnX, startY);
          });
          startY += 5;
          doc.line(tableStartX, startY, tableStartX + columnWidths.reduce((a, b) => a + b, 0), startY);
          doc.setFont("helvetica", "normal");
      }

      // Ajustar descrições longas
      const descricaoQuebrada = doc.splitTextToSize(servico.descricao, columnWidths[0]); // Limita o texto à largura da coluna
      const values = [
          descricaoQuebrada, // Descrição com quebra de linha
          `R$${servico.unidade.toFixed(2)}`,
          `${servico.quantidade}`,
          `R$${servico.valor.toFixed(2)}`
      ];

      // Renderizar linhas com bordas
      values.forEach((value, index) => {
          const columnX = tableStartX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
          if (Array.isArray(value)) {
              value.forEach((line, i) => {
                  doc.text(line, columnX, startY + i * 5);
              });
          } else {
              doc.text(value, columnX, startY);
          }
      });

      // Adiciona bordas na linha do item
      doc.setLineWidth(0.5);
      doc.rect(tableStartX, startY - 4, columnWidths.reduce((a, b) => a + b, 0), 10);

      startY += descricaoQuebrada.length * 5; // Ajustar altura com base nas linhas quebradas
      totalGeral += servico.valor;
  });

  // 🔹 Exibir observações
  const observacoes = servicos.filter(servico => servico.observacao.trim());
  if (observacoes.length > 0) {
      startY += 15;
      doc.setFont("helvetica", "bold");
      doc.text("Observações:", tableStartX, startY);

      doc.setFont("helvetica", "normal");
      observacoes.forEach(servico => {
          const observacaoQuebrada = doc.splitTextToSize(`- ${servico.observacao}`, 190); // Limita a largura do texto
          observacaoQuebrada.forEach(line => {
              startY += 10;

              // Adicionar nova página se necessário
              if (startY > 270) {
                  doc.addPage();
                  startY = 30;
              }

              doc.text(line, tableStartX, startY);
          });
      });
  }

  // 🔹 Valor Total Geral
  startY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Valor Total Geral:", tableStartX, startY);
  doc.text(`R$${totalGeral.toFixed(2)}`, tableStartX + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0), startY, { align: "right" });

  // Adicionando borda no final do orçamento
  doc.setLineWidth(1);
  doc.rect(5, 5, doc.internal.pageSize.width - 10, startY + 10); // Borda ao redor do PDF

  // Salvar o PDF
  doc.save("orcamento.pdf");
});


