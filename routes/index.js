var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/Orcamento', function(req, res) {
  res.render('Orcamento/OrcamentoMedida', { title: 'Express' });
});

router.get('/Visualizar', function(req, res) {
  res.render('Orcamento/visualizar', { title: 'Express' });
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
  res.render('Drawer/Cabecalho/Cabecalho.ejs', { title: 'Express' });
});

module.exports = router;
