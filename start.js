const fs = require('fs');
const mongoose = require('mongoose');

const env = JSON.parse(fs.readFileSync('env.json', 'utf8'))
require('dotenv').config({ path: 'variables.env' });

mongoose.connect(env.database, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});


require('./models/Cast');
require('babel-core/register');
require('babel-polyfill');

const app = require('./app');
app.set('port', env.port || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
