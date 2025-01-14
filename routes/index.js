var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
const app = express();


const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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


router.get('/Editar/:id', async function(req, res) {
  const docId = req.params.id;  // Captura o ID do orçamento da URL
  console.log("ID do documento:", docId);  // Verifique o valor do docId

  try {
    // Referência ao documento usando o getDoc
    const docRef = doc(db, 'servicos', docId);
    const docSnap = await getDoc(docRef);  // Obtemos o documento

    if (!docSnap.exists()) {
      console.log("Orçamento não encontrado:", docId);  // Log do erro com o docId
      return res.status(404).send("Orçamento não encontrado");
    }

    const data = docSnap.data();
    const produto = data.produtos[0];  // Considerando que há apenas um produto no array

    // Renderizar a página de edição passando os dados do produto
    res.render('Drawer/Pedidos/Editar.ejs', {
      title: 'Editar Orçamento',
      produto: produto,
      docId: docId  // Passando o ID do orçamento para a página de edição
    });
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    res.status(500).send("Erro ao buscar orçamento");
  }
});



module.exports = router;
