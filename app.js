const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var indexRoute = require('./routes/index');
var usersRoute = require('./routes/users');
const app = express();

// Configurações de views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares globais
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/clientesMandam', express.static(path.join(__dirname, 'public', 'images', 'clientesMandam')));
app.use('/modelosFixos', express.static(path.join(__dirname, 'public', 'images', 'modelosFixos')));

// Endpoints

app.use('/', indexRoute);
app.use('/users', usersRoute);

app.get('/listarModelos', (req, res) => {
  const dirPath = path.join(__dirname, 'public', 'images', 'clientesMandam');
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error('Erro ao ler a pasta:', err);
      return res.status(500).send('Erro ao ler a pasta.');
    }
    const images = files.map(file => `/clientesMandam/${file}`);
    res.json(images);
  });
});

app.get('/listarModelosFixos', (req, res) => {
  const dirPath = path.join(__dirname, 'public', 'images', 'modelosFixos');
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error('Erro ao ler a pasta:', err);
      return res.status(500).send('Erro ao ler a pasta.');
    }
    const images = files.map(file => `/modelosFixos/${file}`);
    res.json(images);
  });
});

// Exportando o app
module.exports = app;
