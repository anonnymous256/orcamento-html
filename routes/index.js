var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
const app = express();


const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, getDocs, collection } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCm0bhy9OSaZ83OTO0-JQpICl9WMwPc_fk",
  authDomain: "orcamento-html.firebaseapp.com",
  databaseURL: "https://orcamento-html-default-rtdb.firebaseio.com",
  projectId: "orcamento-html",
  storageBucket: "orcamento-html.firebasestorage.app",
  messagingSenderId: "363402110339",
  appId: "1:363402110339:web:b7339cfc945f63a06fc2b6",
  measurementId: "G-ZMY6CHL8QW"
};

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/CriarCli', function(req, res) {
  res.render('Drawer/RelacaoCliente/CriarCliente', { title: 'Express' });
});

router.get('/VerCli', function(req, res) {
  res.render('Drawer/RelacaoCliente/VisualizarCli', { title: 'Express' });
});

router.get('/Inicio', function(req, res) {
  res.render('TelaInicio/inicio', { title: 'Express' });
});

router.get('/Deslogar', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/Cabecalho', function(req, res) {
  res.render('Drawer/Cabecalho/Cabecalho', { title: 'Express' });
});

router.get('/Estoque', function(req, res) {
  res.render('Drawer/Sistema de Estoque/Estoque', { title: 'Express' });
});

router.get('/Fluxo', function(req, res) {
  res.render('Drawer/FluxoDeCaixa/Fluxo', { title: 'Express' });
});

router.get('/SemMedida', function(req, res) {
  res.render('Drawer/Orcamentos/SemMedida', { title: 'Express' });
});

router.get('/ComMedida', function(req, res) {
  res.render('Drawer/Orcamentos/ComMedida', { title: 'Express' });
});

router.get('/Pedidos', function(req, res) {
  res.render('Drawer/Pedidos/Pedidos', { title: 'Express' });
});

router.get('/SemPorcentagem', function(req, res) {
  res.render('Drawer/Orcamentos/SemPorcentagem', { title: 'Express' });
});

router.get('/Tempera', function(req, res) {
  res.render('Drawer/SistemaTempera/Tempera', { title: 'Express' });
});

router.get('/Recibo', function(req, res) {
  res.render('Drawer/Recibo/Recibo', { title: 'Express' });
});


router.get('/Editar/:id', async function(req, res) {
  const docId = req.params.id;  // Captura o ID do orçamento da URL
  console.log("ID do documento:", docId);  // Verifique o valor do docId

  if (!docId) {
    console.error("ID do orçamento não fornecido.");
    return res.status(400).send("ID do orçamento não fornecido");
  }

  try {
    // Referência ao documento principal da coleção 'servicos'
    const docRef = doc(db, 'servicos', docId);
    const docSnap = await getDoc(docRef);  // Obtemos o documento principal

    if (!docSnap.exists()) {
      console.log("Orçamento não encontrado:", docId);  // Log do erro com o docId
      return res.status(404).send("Orçamento não encontrado");
    }

    // Agora, acessamos a subcoleção 'subservicos' deste documento
    const subservicosRef = collection(docRef, 'subservicos');
    const subservicosSnap = await getDocs(subservicosRef);  // Obtemos os documentos da subcoleção

    if (subservicosSnap.empty) {
      console.log("Nenhum item encontrado na subcoleção 'subservicos'.");
      return res.status(404).send("Nenhum item encontrado na subcoleção 'subservicos'.");
    }

    // Vamos pegar o primeiro produto da subcoleção (supondo que tenha produtos)
    // Criar um array de produtos, incluindo seus índices
const produtosComIndex = subservicosSnap.docs.map((doc, index) => {
  return {
    index: index, // Índice do produto na lista
    produto: doc.data() // Dados do produto
  };
});

console.log("Produtos encontrados na subcoleção:", produtosComIndex);

// Renderizar a página com os produtos e seus índices
res.render('Drawer/Pedidos/Editar.ejs', {
  title: 'Editar Orçamento',
  produtos: produtosComIndex, // Passando o array de produtos com seus índices
  docId: docId
});

    
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    res.status(500).send("Erro ao buscar orçamento: " + error.message);
  }
});




module.exports = router;
