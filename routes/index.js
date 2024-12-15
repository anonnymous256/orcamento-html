var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
const app = express();

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
module.exports = router;
