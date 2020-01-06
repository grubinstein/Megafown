'use strict'

const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const cors = require('cors');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const env = JSON.parse(fs.readFileSync('env.json', 'utf8'))

const mongoose = require('mongoose');
const { catchErrors } = require('./handlers/errorHandlers');

mongoose.connect(process.env.DATABASE || env.database, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

require('./models/Cast')

const castController = require('./controllers/castController');

;(function () {
  // Environment

  // Create express application
  const app = express()
  // Load third party express middlewares
  app.use(bodyParser.json()) // Parse data sent to Express
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(expressSanitizer()) // Sanitizes input
  app.use(cors()) // Enable CORS

  // Enable webpack in development environment
  if (env.environment === 'development') {
    const webConfig = require('./webpack.config')
    const middlewareConfig = {
      publicPath: '/assets/',
      stats: {
        colors: true
      }
    }
    const webpackCompiler = webpack(webConfig)

    // Webpack middlewares
    app.use(webpackDevMiddleware(webpackCompiler, middlewareConfig))
    app.use(webpackHotMiddleware(webpackCompiler))
  }

  // Put your Express code here
  app.use((req, res, next) => {
    // This is an example middleware
    next()
  })

  // Frontend files such as index.html and webpack's bundle.js
  app.use(express.static('public'))

  // Route everything except /assets to index.html to be parsed by frontend router
  app.get(/^((?!\/assets\/).)*$/, (req, res) => {
    res.sendFile('/index.html', {
      root: 'public'
    })
  })
  
  app.post('/newcast', catchErrors(castController.newCast))

  // Start Express
  app.listen(process.env.PORT || env.port)
})()
