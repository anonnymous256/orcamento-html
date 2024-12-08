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

app.use(express.static(path.join(__dirname)));

app.use('/clientesMandam', express.static(path.join(__dirname, 'public', 'images', 'clientesMandam')));

app.use('/modelosFixos', express.static(path.join(__dirname, 'public', 'images', 'modelosFixos')));

app.get('/modelos', (req, res) => {
  const dirPath = path.join(__dirname, 'public','images','clientesMandam');
  console.log('Path:', dirPath); 
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error('Erro ao ler a pasta:', err); 
      return res.status(500).send('Erro ao ler a pasta.');
    }
    console.log('Arquivos encontrados:', files); 
    const images = files.map(file => `/clientesMandam/${file}`);
    res.json(images);
  });
});


app.get('/modelosFixos', (req, res) => {
  const dirPath = path.join(__dirname, 'public','images','modelosFixos');
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            return res.status(500).send('Erro ao ler a pasta.');
        }
        const images = files.map(file => `/modelosFixos/${file}`); 
        res.json(images);
    });
});

module.exports = router;
