import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
    authDomain: "orcamento-html.firebaseapp.com",
    projectId: "orcamento-html",
    storageBucket: "orcamento-html.appspot.com",
    messagingSenderId: "363402110339",
    appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
    measurementId: "G-ZMY6CHL8QW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await carregarClientes();
        await carregarLogo();
    } else {
        alert("Você precisa estar logado.");
        window.location.replace("/Deslogar");
    }
});

async function carregarLogo() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const empresaRef = doc(db, 'empresas', user.uid);
        const empresaSnap = await getDoc(empresaRef);

        if (empresaSnap.exists()) {
            const empresaData = empresaSnap.data();
            const logoBase64 = empresaData.logo;
            const logoImg = document.getElementById('logo-usuario');
            logoImg.src = logoBase64 && logoBase64.startsWith("data:image/") ? logoBase64 : "assets/img/placeholder-logo.png";

            document.getElementById('nome-empresa').textContent = empresaData.nome || 'Nome da Empresa Não Disponível';
            document.getElementById('endereco-empresa').textContent = `Endereço: ${empresaData.endereco || 'Endereço não disponível'}`;
            document.getElementById('cnpj-empresa').textContent = `CNPJ: ${empresaData.cnpj || 'CNPJ não disponível'}`;
            document.getElementById('telefone-empresa').textContent = `Telefone: ${empresaData.telefone || 'Telefone não disponível'}`;
        } else {
            Swal.fire('Erro!', 'Dados da empresa não encontrados.', 'error');
        }
    } catch (error) {
        Swal.fire('Erro!', 'Erro ao carregar os dados da empresa.', 'error');
    }
}

async function carregarClientes() {
    const user = auth.currentUser;
    if (!user) return;

    const clientesSelect = document.getElementById('cliente');
    const noOpt = document.createElement('option');
    noOpt.setAttribute('disabled', true);
    noOpt.setAttribute('selected', true);
    noOpt.textContent = 'Selecione um cliente';
    clientesSelect.innerHTML = '';
    clientesSelect.appendChild(noOpt);

    try {
        const clientesRef = collection(db, 'clientes');
        const q = query(clientesRef, where('userId', '==', user.uid), orderBy('nome', 'asc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            Swal.fire('Aviso!', 'Nenhum cliente encontrado.', 'info');
            return;
        }

        snapshot.forEach((doc) => {
            const cliente = doc.data();
            const option = document.createElement('option');
            option.value = cliente.nome;
            option.textContent = cliente.nome;
            option.dataset.id = doc.id;
            clientesSelect.appendChild(option);
        });

        clientesSelect.addEventListener('change', (event) => {
            const selectedOption = event.target.selectedOptions[0];
            const clienteId = selectedOption.dataset.id;
            atualizarEndereco(clienteId);
        });

    } catch (error) {
        Swal.fire('Erro!', 'Erro ao carregar os clientes.', 'error');
    }
}

async function atualizarEndereco(clienteId) {
    const enderecoInput = document.getElementById('input-end');
    if (!clienteId) {
        enderecoInput.value = '';
        return;
    }

    try {
        const clienteRef = doc(db, 'clientes', clienteId);
        const clienteSnap = await getDoc(clienteRef);

        if (clienteSnap.exists()) {
            const clienteData = clienteSnap.data();
            const endereco = clienteData.endereco || '';
            enderecoInput.value = endereco || '';
            if (!endereco) Swal.fire('Aviso!', 'O cliente selecionado não possui endereço cadastrado.', 'info');
        } else {
            enderecoInput.value = '';
            Swal.fire('Erro!', 'Cliente não encontrado no banco de dados.', 'error');
        }
    } catch (error) {
        Swal.fire('Erro!', 'Erro ao buscar o endereço do cliente.', 'error');
    }
}

function EnvDados() {
    const iptCliente = document.querySelector('#cliente');
    const rcbCliente = document.querySelector('.nome-cliente');
    const iptData = document.querySelector('#input-data');
    const rcbData = document.querySelector('.data-recibo');
    const iptEnd = document.querySelector('#input-end');
    const rcbEnd = document.querySelector('.end-recibo');
    const iptForma = document.querySelector('#formapagamento');

    const tabela = document.querySelector('.tabela-servicos');
    const desc = document.querySelector('#desc-serv');
    const quantidade = document.querySelector('#quantidade');
    const valor = document.querySelector('#valor');

    let contador = 1;

    this.pressBtn = function () {
        document.addEventListener('click', e => {
            const el = e.target;

            if (el.classList.contains('enviar')) {
                if (!iptCliente.value) {
                    Swal.fire('Erro!', 'Por favor, selecione um cliente antes de enviar os dados.', 'error');
                    return;
                }


                this.envInfoCliente(iptCliente.value, iptEnd.value);
                this.addServ(contador, desc.value, quantidade.value, this.formtValor());
                this.limpaServ();
            };

            if (el.classList.contains('remover')) {
                Swal.fire({
                    title: 'Tem certeza?',
                    text: "Você deseja remover o ultimo item adicionado?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sim, remover',
                    cancelButtonText: 'Cancelar',
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.rmvTr();
                    }
                });
            };

            if (el.classList.contains('baixar')) {
                if (this.calcularTotalValor() === 0) {
                    Swal.fire('Erro!', 'A tabela de serviços está vazia. Adicione um serviço antes de gerar o PDF.', 'error');
                    return;
                }
                this.baixarPdf();
            };
        });
    };

    this.envInfoCliente = function (nome, end) {
        const h1Declaracao = document.querySelector("h1:nth-of-type(1)");
        const declaracaoDiv = document.querySelector(".recibo-declaracao");
        const h1Pagamento = document.querySelector("h1:nth-of-type(2)");
        const pagamentoDiv = document.querySelector(".pagamento-recibo");
        const h1Servicos = document.querySelector("h1:nth-of-type(3)");
        const tabelaServicos = document.querySelector(".tabela-servicos");

        rcbCliente.innerHTML = `Cliente: ${nome}`;
        rcbData.innerHTML = `Data: ${this.formtData()}`;
        rcbEnd.innerHTML = `Endereço para Instalação: ${end}`;

        const totalValor = this.calcularTotalValor();
        const valorTotalFormatado = `R$ ${totalValor.toFixed(2).replace('.', ',')}`;

        // Declaração com valor total
        const declaracao = `Declaro que recebi de ${nome}, com endereço em ${end}, o valor de ${valorTotalFormatado} em ${this.formtData()}, referente a:`;

        const FormadePagamento = `${iptForma.value}`;
        document.getElementById('declaracao-recibo').innerText = declaracao;
        document.getElementById('forma-pagamento').innerText = FormadePagamento;

        // Remove a classe 'hidden' para exibir os elementos
    h1Declaracao.classList.remove("hidden");
    declaracaoDiv.classList.remove("hidden");
    h1Pagamento.classList.remove("hidden");
    pagamentoDiv.classList.remove("hidden");
    h1Servicos.classList.remove("hidden");
    tabelaServicos.classList.remove("hidden");

        const valorRecibo = document.querySelector('.valor-recibo');
        if (valorRecibo) {
            valorRecibo.innerText = valorTotalFormatado;
        }
    };

    this.calcularTotalValor = function () {
        let total = 0;
        const linhas = document.querySelectorAll('.tabela-servicos tr');

        if (linhas.length > 1) {
            for (let i = 1; i < linhas.length; i++) {
                const linha = linhas[i];
                const valorCell = linha.cells[3];

                if (valorCell) {
                    let valorTexto = valorCell.innerText.trim();
                    if (valorTexto.startsWith('R$')) {
                        valorTexto = valorTexto.replace('R$', '').trim();
                    }

                    if (valorTexto !== "") {
                        valorTexto = valorTexto.replace(',', '.');
                        const valorNumerico = parseFloat(valorTexto);
                        const quantidade = linha.cells[2].innerText.trim();
                        total += valorNumerico * parseFloat(quantidade);
                    }
                }
            }
        }

        return total;
    };

    this.addServ = function (cont, desc, quantidade, valor) {
        const linhas = document.querySelectorAll('.tabela-servicos tr');

        // Verifica se o número de itens na tabela já chegou ao limite de 12
        if (linhas.length - 1 >= 12) {
            Swal.fire('Limite Atingido', 'Você pode adicionar no máximo 12 itens na lista.', 'warning');
            return;
        }

        if (!desc || !quantidade || !valor || quantidade <= 0 || valor <= 0) {
            Swal.fire('Erro!', 'Por favor, preencha todos os campos (descrição, quantidade e valor).', 'error');
            return;
        }


        const tr = document.createElement('tr');
        tabela.appendChild(tr);

        const valorOriginal = valor;

        const itens = [cont, desc, quantidade, valorOriginal];
        for (let i = 0; i < itens.length; i++) {
            const td = document.createElement('td');
            td.innerText = itens[i];
            tr.appendChild(td);
        }

        contador++;

        this.envInfoCliente(iptCliente.value, iptEnd.value);
    };


    this.formtData = function () {
        const dataIpt = new Date(iptData.value),
            dia = (dataIpt.getDate() + 1).toString(),
            diaF = (dia.length == 1) ? `0${dia}` : dia,
            mes = (dataIpt.getMonth() + 1).toString(),
            mesF = (mes.length == 1) ? `0${mes}` : mes,
            anoF = dataIpt.getFullYear();
        return `${diaF}/${mesF}/${anoF}`;
    };

    this.formtValor = function () {
        const valorInput = valor.value.trim();
        const valorNumerico = parseFloat(valorInput.replace(',', '.'));
        if (isNaN(valorNumerico)) {
            return "R$ 0,00";
        }
        return `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;
    };

    this.limpaServ = function () {
        desc.value = '';
        quantidade.value = '';
        valor.value = '';
    };

    this.rmvTr = function () {
        tabela.removeChild(tabela.lastChild);
        this.envInfoCliente(iptCliente.value, iptEnd.value);
    };

    this.baixarPdf = function () {
        const item = document.querySelector('.recibo');
        const opt = {
            filename: iptCliente.value + 'recibo.pdf',
            html2canvas: { dpi: 150, scale: 3, letterRendering: true },
            jsPDF: { format: 'a4', orientation: 'portrait' },
        };
        html2pdf().set(opt).from(item).save();
    };
}

const enviar = new EnvDados();
enviar.pressBtn();
