const { request, response } = require('express');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');

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
  const shortURL = request.params.shortURL;
  const longURL = urlDatabase[request.params.shortURL];
  const templateVars = { shortURL, longURL };
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
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = request.body.longURL;
  response.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (request, response) => {
  const url = request.params.shortURL
  delete urlDatabase[url];
  response.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (request, response) => {
  urlDatabase[request.params.shortURL] = request.body.longURL;
  response.redirect(`/urls`);
});

app.post('/urls/:id', (request, response) => {
  const url = request.params.id
  response.redirect(`/urls/${url}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// This activity will implement the Update operation using a POST request, which will allow us to edit existing shortened URLs in our application.

// This portion of the assignment requires changes on the client and the server. Once the user submits an Update request, it should modify the corresponding longURL, and then redirect the client back to "/urls".