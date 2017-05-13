const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const routes = {
  statistics: require('./routes/statistics')
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/statistics', routes.statistics);

app.listen(3055, () => {
  console.log('App listening on port 3055!');
});
