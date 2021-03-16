const { request, response } = require('express');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.get('/urls', (request, response) => {
  const templateVars = { urls: urlDatabase};
  response.render('urls_index', templateVars);
});

app.get('/urls/new', (request, response) => {
  response.render('urls_new');
});

app.get('/urls/:shortURL', (request, response) => {
  const templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL]};
  response.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.post('/urls', (request, response) => {
  let short = generateRandomString();
  urlDatabase[short] = request.body.longURL;
  response.redirect(`/urls/${short}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});