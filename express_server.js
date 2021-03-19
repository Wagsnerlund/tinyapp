const { request, response } = require('express');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helper');
const bcrypt = require('bcrypt');
const PORT = 8080;

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "user1": {
    id: "user1ID",
    email: "user1@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2": {
    id: "user2ID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = function () {
  return Math.random().toString(36).slice(2, 8);
};

const urlsForUser = function (id, database) {
  let filtered = {};
  for (const url in database) {
    if (database[url].userID === id) {
      filtered[url] = database[url];
    }
  }
  return filtered;
};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// urls Path
app.get('/urls', (request, response) => {
  const userId = request.session['user_id'];
  const filtered = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: filtered, user: users[userId] };
  response.render('urls_index', templateVars);
});

app.post('/urls', (request, response) => {
  let shortURL = generateRandomString();
  const userId = request.session['user_id'];
  urlDatabase[shortURL] = { longURL: request.body.longURL, userID: userId };
  response.redirect(`/urls/${shortURL}`);
});

// urls/new Route
app.get('/urls/new', (request, response) => {
  const userId = request.session['user_id'];

  if (!users[userId]) {
    response.redirect('/register');
  } else if (!userId) {
    response.redirect('/login');
  } else {
    response.render('urls_new', { user: users[userId] });
  }
});

// urls/shortURL Paths
app.get('/urls/:shortURL', (request, response) => {
  const shortURL = request.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user: users[request.session["user_id"]] };
  response.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL].longURL;
  response.redirect(longURL);
});

app.post('/urls/:shortURL/edit', (request, response) => {
  const url = request.params.shortURL
  const userId = request.session['user_id'];

  if (userId && urlDatabase[url].userID === userId) {
    urlDatabase[request.params.shortURL].longURL = request.body.longURL;
    response.redirect(`/urls`);
  } else {
    response.redirect('/urls')
  }
});

app.post('/urls/:shortURL/delete', (request, response) => {
  const url = request.params.shortURL
  const userId = request.session['user_id'];
  if (userId && urlDatabase[url].userID === userId) {
    delete urlDatabase[url];
    response.redirect('/urls');
  } else {
    response.redirect('/urls')
  }
});

app.post('/urls/:id', (request, response) => {
  const url = request.params.id
  response.redirect(`/urls/${url}`);
});

// Register Path
app.get("/register", (request, response) => {
  const templateVars = { user: users[request.session["user_id"]] };
  response.render('register', templateVars);
});

app.post('/register', (request, response) => {
  let userID = generateRandomString();
  const email = request.body.email;
  const password = request.body.password;

  if (!email || !password) {
    response.sendStatus(400);
  } else if (getUserByEmail(email, users)) {
    response.sendStatus(400)
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userID] = { id: userID, email: email, password: hashedPassword }
    response.redirect('/login');
  }
});

// Login Path
app.get("/login", (request, response) => {
  const templateVars = { user: users[request.session["user_id"]] };
  response.render('login', templateVars);
});

app.post('/login', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  if (!email || !password) {
    response.sendStatus(400);
  } else if (getUserByEmail(email, users) === undefined) {
    response.sendStatus(403);
  } else {
    const user = getUserByEmail(email, users);

    if (bcrypt.compareSync(password, user.password) === false) {
      response.sendStatus(403);
    } else {
      request.session.user_id = user.id;
      response.redirect('/urls');
    }
  }
});

// Logout Route
app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});