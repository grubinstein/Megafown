const express = require('express');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const cors = require('cors');

const fs = require('fs');
const env = JSON.parse(fs.readFileSync('env.json', 'utf8'))
const routes = require('./routes/index');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const errorHandlers = require('./handlers/errorHandlers');

const castController = require('./controllers/castController');

const app = express();

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
app.use('/', routes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
