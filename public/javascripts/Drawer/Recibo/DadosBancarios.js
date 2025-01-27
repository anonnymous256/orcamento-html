// Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

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

// Função para salvar os dados no Firestore
async function salvarDadosUsuario(usuarioId, dadosFormulario) {
    const usuarioDocRef = doc(firestore, 'DadosConta', usuarioId); // Cria um documento baseado no UID do usuário
    await setDoc(usuarioDocRef, dadosFormulario);
}

// Função para carregar os dados do Firestore
async function carregarDadosUsuario(usuarioId) {
    const usuarioDocRef = doc(firestore, 'DadosConta', usuarioId);
    const docSnap = await getDoc(usuarioDocRef);
    
    if (docSnap.exists()) {
        return docSnap.data(); // Retorna os dados do usuário se existirem
    } else {
        return null; // Se não houver dados, retorna null
    }
}

// Função para preencher o formulário com dados carregados
function preencherFormularioComDados(dados) {
    if (dados) {
        document.getElementById('nomeBanco').value = dados.nomeBanco || '';
        document.getElementById('numeroConta').value = dados.numeroConta || '';
        document.getElementById('codigoAgencia').value = dados.codigoAgencia || '';
        document.getElementById('tipoConta').value = dados.tipoConta || '';
        document.getElementById('metodoPagamento').value = dados.metodoPagamento || '';
        document.getElementById('chavePix').value = dados.chavePix || '';
        document.getElementById('tipoChavePix').value = dados.tipoChavePix || '';
        document.getElementById('notas').value = dados.notas || '';
    }
}

// Ao carregar a página, verificar o estado do usuário
onAuthStateChanged(auth, async (usuario) => {
    if (usuario) {
        // Quando o usuário está logado, carregar os dados dele
        const dadosUsuario = await carregarDadosUsuario(usuario.uid);
        preencherFormularioComDados(dadosUsuario);
    } else {
        Swal.fire({
            position: "center",
            icon: "warning",
            title: "Você precisa estar logado!",
            showConfirmButton: false,
            timer: 1500
          });
    }
});

// Envio do Formulário
document.getElementById('formularioPagamento').addEventListener('submit', async function(evento) {
    evento.preventDefault();

    const usuario = auth.currentUser;
    if (!usuario) {
        Swal.fire({
            position: "center",
            icon: "warning",
            title: "Você precisa estar logado!",
            showConfirmButton: false,
            timer: 1500
          });
        return;
    }

    const nomeBanco = document.getElementById('nomeBanco').value;
    const numeroConta = document.getElementById('numeroConta').value;
    const codigoAgencia = document.getElementById('codigoAgencia').value;
    const tipoConta = document.getElementById('tipoConta').value;
    const metodoPagamento = document.getElementById('metodoPagamento').value;
    const chavePix = document.getElementById('chavePix').value;
    const tipoChavePix = document.getElementById('tipoChavePix').value;
    const notas = document.getElementById('notas').value;

    const dadosConta = {
        nomeBanco,
        numeroConta,
        codigoAgencia,
        tipoConta,
        metodoPagamento,
        chavePix,
        tipoChavePix,
        notas
    };

    // Salvar os dados com base no UID do usuário
    await salvarDadosUsuario(usuario.uid, dadosConta);


    Swal.fire({
        position: "center",
        icon: "success",
        title: "Dados atualizadod com sucesso!",
        showConfirmButton: false,
        timer: 1500
      });
});
