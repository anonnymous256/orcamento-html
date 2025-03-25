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
      Swal.fire({
          icon: 'error',
          title: 'Não autenticado',
          text: 'Você precisa estar logado para acessar esta página.',
          confirmButtonColor: '#2f7d32'
      }).then(() => {
          window.location.href = '/login';
      });
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
          Swal.fire({
              icon: 'info',
              title: 'Nenhum cliente',
              text: 'Você não possui clientes cadastrados. Cadastre pelo menos um cliente para continuar.',
              confirmButtonColor: '#2f7d32'
          });
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
      Swal.fire({
          icon: 'error',
          title: 'Erro ao carregar clientes',
          text: 'Não foi possível carregar a lista de clientes. Tente novamente mais tarde.',
          confirmButtonColor: '#2f7d32'
      });
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
const totalValueElement = document.getElementById("totalValue");

const servicos = [];

// Função para atualizar o total do orçamento
function atualizarTotalOrcamento() {
    let total = 0;
    servicos.forEach(servico => {
        total += servico.valor;
    });
    totalValueElement.textContent = `R$ ${total.toFixed(2)}`;
    return total;
}

addServicoButton.addEventListener("click", () => {
  const descricao = descricaoInput.value.trim();
  const unidade = parseFloat(unidadeInput.value);
  const quantidade = parseInt(quantidadeInput.value);
  const observacao = observacaoInput.value.trim();

  if (!descricao || isNaN(unidade) || isNaN(quantidade) || quantidade <= 0) {
    Swal.fire({
      icon: "error",
      title: "Campos incompletos",
      text: "Por favor, preencha todos os campos obrigatórios corretamente.",
      confirmButtonColor: '#2f7d32'
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
  
  descricaoInput.focus();

  renderServices();
  
  Swal.fire({
    icon: "success",
    title: "Serviço adicionado",
    text: "O serviço foi adicionado com sucesso.",
    timer: 1500,
    showConfirmButton: false,
    position: 'top-end',
    toast: true
  });
});

function renderServices() {
  servicesList.innerHTML = "";

  servicos.forEach((servico, index) => {
    const serviceCard = document.createElement("div");
    serviceCard.classList.add("service-card");

    serviceCard.innerHTML = `
      <h3>${servico.descricao}</h3>
      <p>
        <strong>Preço por Unidade:</strong>
        <span>R$ ${servico.unidade.toFixed(2)}</span>
      </p>
      <p>
        <strong>Quantidade:</strong>
        <span>${servico.quantidade}</span>
      </p>
      <p>
        <strong>Valor Total:</strong>
        <span class="card-value">R$ ${servico.valor.toFixed(2)}</span>
      </p>
      ${servico.observacao ? `<p><strong>Observação:</strong> <span>${servico.observacao}</span></p>` : ''}
      <div class="actions">
        <button onclick="editService(${index})" class="btn-warning">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button onclick="deleteService(${index})" class="btn-danger">
          <i class="fas fa-trash"></i> Excluir
        </button>
      </div>
    `;

    servicesList.appendChild(serviceCard);
  });
  
  // Atualiza o valor total
  atualizarTotalOrcamento();
}

// Definindo as funções no escopo global para acesso via onclick
window.deleteService = function(index) {
  Swal.fire({
    title: 'Excluir Serviço',
    text: 'Tem certeza que deseja excluir este serviço?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      servicos.splice(index, 1);
      renderServices();

      Swal.fire({
        title: 'Excluído!',
        text: 'O serviço foi excluído com sucesso.',
        icon: 'success',
        confirmButtonColor: '#2f7d32',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

window.editService = function(index) {
  Swal.fire({
    title: 'Editar Serviço',
    text: 'Deseja editar este serviço?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sim, editar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ffc107',
    cancelButtonColor: '#6c757d'
  }).then((result) => {
    if (result.isConfirmed) {
      const servico = servicos[index];
      descricaoInput.value = servico.descricao;
      unidadeInput.value = servico.unidade;
      quantidadeInput.value = servico.quantidade;
      observacaoInput.value = servico.observacao;
      
      // Scroll até o formulário para facilitar a edição
      document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
      
      servicos.splice(index, 1);
      renderServices();

      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Serviço em edição',
        text: 'Os dados foram carregados para edição.',
        showConfirmButton: false,
        timer: 2000,
        toast: true
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

      const empresaRef = doc(firestore, 'empresas', user.uid);
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
      icon: 'error',
      title: 'Cliente não selecionado',
      text: 'Por favor, selecione um cliente para gerar o orçamento.',
      confirmButtonColor: '#2f7d32'
    });
    return;
  }
  
  if (servicos.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Nenhum serviço adicionado',
      text: 'Adicione pelo menos um serviço para gerar o orçamento.',
      confirmButtonColor: '#2f7d32'
    });
    return;
  }

  // Mostrar loading
  Swal.fire({
    title: 'Gerando PDF',
    html: 'Aguarde enquanto o orçamento está sendo gerado...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Obtendo os dados da empresa
  const empresa = await dadosEmpresa();
  let logoBase64 = empresa?.logo || null;

  let startY = 15;

  // Adicionando a logo centralizada no topo, se disponível
  if (logoBase64) {
      const imgWidth = 40;
      const imgHeight = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = (pageWidth - imgWidth) / 2;

      doc.addImage(logoBase64, 'JPEG', centerX, startY, imgWidth, imgHeight);
      startY += imgHeight + 10;
  }

  // Exibindo dados da empresa com uma formatação profissional
  if (empresa) {
      // Título do orçamento centralizado
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0); // Texto preto para maior legibilidade
      
      const title = "ORÇAMENTO";
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(title, (pageWidth - titleWidth) / 2, startY);
      startY += 10;
      
      // Dados da empresa
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(empresa.nome, 10, startY);
      doc.setFont("helvetica", "normal");

      if (empresa.endereco) {
          startY += 6;
          doc.setFontSize(10);
          doc.text(empresa.endereco, 10, startY); 
      }

      if (empresa.cnpj) {
          startY += 6;
          doc.text(`CNPJ: ${empresa.cnpj}`, 10, startY); 
      }

      if (empresa.telefone) {
          startY += 6;
          doc.text(`Telefone: ${empresa.telefone}`, 10, startY);
      }

      startY += 10;
  }

  // Linha de separação após o cabeçalho - preto simples
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, startY, 200, startY);
  startY += 10;

  // Data do orçamento e número de referência
  const dataAtual = new Date();
  const dataFormatada = dataAtual.toLocaleDateString('pt-BR');
  const numeroOrcamento = `${Date.now()}`.substring(6); // Últimos dígitos do timestamp
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Coluna esquerda - data
  doc.text(`Data: ${dataFormatada}`, 10, startY);
  
  // Coluna direita - número do orçamento
  doc.text(`Orçamento Nº: ${numeroOrcamento}`, 140, startY);
  startY += 15;

  // Exibir os dados do cliente
  const clienteData = await dadosCliente(clienteNome);
  if (clienteData) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO CLIENTE", 10, startY);
    startY += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome: ${clienteData.nome}`, 10, startY);
    startY += 5;
    
    if (clienteData.endereco) {
      doc.text(`Endereço: ${clienteData.endereco}`, 10, startY);
      startY += 5;
    }
    
    if (clienteData.telefone) {
      doc.text(`Telefone: ${clienteData.telefone}`, 10, startY);
      startY += 5;
    }
    
    if (clienteData.email) {
      doc.text(`Email: ${clienteData.email}`, 10, startY);
      startY += 5;
    }
    
    startY += 10;
  }

  // Título da seção de serviços - simples, sem cores de fundo
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SERVIÇOS", 10, startY);
  startY += 8;

  // Cabeçalho da tabela
  const columnHeaders = ["Descrição", "Preço/Unidade", "Quantidade", "Total"];
  const columnWidths = [85, 35, 30, 40];
  const tableStartX = 10;
  const headerHeight = 10; // Altura aproximada do cabeçalho da tabela

  // Função para desenhar o cabeçalho da tabela
  function desenharCabecalhoTabela(posY) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    // Linha superior da tabela
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(tableStartX, posY - 4, tableStartX + columnWidths.reduce((a, b) => a + b, 0), posY - 4);

    // Cabeçalhos das colunas
    columnHeaders.forEach((header, index) => {
      const columnX = tableStartX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
      doc.text(header, columnX + 3, posY);
    });

    // Linha abaixo do cabeçalho
    doc.line(tableStartX, posY + 3, tableStartX + columnWidths.reduce((a, b) => a + b, 0), posY + 3);
    
    // Retornar a nova posição Y
    return posY + 8;
  }
  
  // Desenha o cabeçalho inicial
  startY = desenharCabecalhoTabela(startY);
  doc.setFont("helvetica", "normal");
  
  let totalGeral = 0;
  
  // Linhas da tabela sem alternância de cores
  for (let i = 0; i < servicos.length; i++) {
    const servico = servicos[i];
    
    // Estimar a altura necessária para este item
    // Calculando quanto espaço a descrição ocupará
    const descricaoQuebrada = doc.splitTextToSize(servico.descricao, columnWidths[0] - 6);
    const itemHeight = 10 + (descricaoQuebrada.length - 1) * 5 + 5; // altura base + linhas adicionais + espaço
    
    // Verificar se há espaço suficiente na página atual ou precisamos de uma nova
    if (startY + itemHeight > 270) {
      doc.addPage();
      startY = 30; // Começar no topo da nova página com margem
      startY = desenharCabecalhoTabela(startY);
      doc.setFont("helvetica", "normal");
    }
    
    // Valores na tabela
    const columnX1 = tableStartX + 3;
    const columnX2 = tableStartX + columnWidths[0] + 3;
    const columnX3 = tableStartX + columnWidths[0] + columnWidths[1] + 3;
    const columnX4 = tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 3;
    
    // Adicionar os dados do serviço
    // Descrição (pode ocupar múltiplas linhas)
    if (descricaoQuebrada.length > 1) {
      doc.text(descricaoQuebrada, columnX1, startY);
      startY += (descricaoQuebrada.length - 1) * 5; // Ajuste da altura para texto multi-linha
    } else {
      doc.text(servico.descricao, columnX1, startY);
    }
    
    // Dados numéricos
    doc.text(`R$ ${servico.unidade.toFixed(2)}`, columnX2, startY);
    doc.text(`${servico.quantidade}`, columnX3, startY);
    doc.text(`R$ ${servico.valor.toFixed(2)}`, columnX4, startY);
    
    totalGeral += servico.valor;
    
    // Linha horizontal para separar os itens - linha cinza clara
    startY += 5;
    doc.setDrawColor(220, 220, 220); // Cinza claro
    doc.setLineWidth(0.1);
    doc.line(tableStartX, startY, tableStartX + columnWidths.reduce((a, b) => a + b, 0), startY);
    
    // Aumentar a posição Y para o próximo item
    startY += 5;
  }

  // Linha de fechamento da tabela
  doc.setDrawColor(0, 0, 0); // Preto
  doc.setLineWidth(0.3);
  doc.line(tableStartX, startY, tableStartX + columnWidths.reduce((a, b) => a + b, 0), startY);

  // Exibir observações, se houver
  const observacoes = servicos.filter(servico => servico.observacao.trim());
  if (observacoes.length > 0) {
      startY += 15;
      
      // Verificar se há espaço suficiente para o título e pelo menos uma observação
      if (startY > 260) {
        doc.addPage();
        startY = 30;
      }
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("OBSERVAÇÕES", 10, startY);
      startY += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      observacoes.forEach(servico => {
          const observacaoQuebrada = doc.splitTextToSize(`• ${servico.descricao}: ${servico.observacao}`, 180);
          
          // Verificar se precisa nova página para a observação
          if (startY + observacaoQuebrada.length * 5 > 270) {
              doc.addPage();
              startY = 30;
              doc.setFontSize(11);
              doc.setFont("helvetica", "bold");
              doc.text("OBSERVAÇÕES (continuação)", 10, startY);
              startY += 8;
              doc.setFont("helvetica", "normal");
              doc.setFontSize(10);
          }
          
          // Adicionar cada linha da observação
          observacaoQuebrada.forEach(line => {
              doc.text(line, 10, startY);
              startY += 5;
          });
      });
  }

  // Valor Total Geral - destaque sóbrio
  startY += 10;
  
  // Verificar se há espaço para o box de total
  if (startY > 260) {
    doc.addPage();
    startY = 30;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0); // Texto preto
  doc.setFontSize(12);
  
  // Box simples para o total
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(tableStartX, startY - 7, columnWidths.reduce((a, b) => a + b, 0), 12);
  
  doc.text("VALOR TOTAL:", tableStartX + 10, startY);
  doc.text(`R$ ${totalGeral.toFixed(2)}`, tableStartX + 120, startY);

  // Informações de validade e condições
  startY += 20;
  
  // Verificar se há espaço para as condições comerciais
  if (startY > 260) {
    doc.addPage();
    startY = 30;
  }
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  // Tabela simples para condições comerciais
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(10, startY, 190, 25);
  
  doc.setFont("helvetica", "bold");
  doc.text("CONDIÇÕES COMERCIAIS", 105, startY + 5, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  doc.text("Validade da proposta: 15 dias", 15, startY + 12);
  doc.text("Forma de pagamento: A combinar", 15, startY + 19);
  doc.text("Prazo de execução: A combinar", 120, startY + 12);
  
  // Assinatura
  startY += 35;
  
  // Verificar se há espaço para a assinatura
  if (startY > 270) {
    doc.addPage();
    startY = 30;
  }
  
  doc.line(60, startY, 150, startY);
  startY += 5;
  doc.text("Assinatura / Carimbo", 105, startY, { align: 'center' });
  
  // Fechar o Swal de loading
  Swal.close();

  // Salvar o PDF
  const filename = `Orcamento_${clienteNome.replace(/[^\w]/g, '_')}_${numeroOrcamento}.pdf`;
  doc.save(filename);
  
  // Confirma que o PDF foi gerado
  Swal.fire({
    icon: 'success',
    title: 'PDF gerado com sucesso!',
    text: `O arquivo ${filename} foi gerado e está pronto para download.`,
    confirmButtonColor: '#2f7d32'
  });
});

// Inicializar a renderização
renderServices();